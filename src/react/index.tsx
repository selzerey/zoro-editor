/**
 * React / Next.js component.
 *
 *   import { ZoroEditor } from 'zoro-editor/react';
 *   import 'zoro-editor/style.css';
 *
 *   <ZoroEditor value={html} onChange={setHtml} preset="blog" media={{ endpoint: '/api/media' }} />
 *
 * SSR-safe: the editor is created only in the browser (inside useEffect).
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { ZoroEditor as Core } from '../core/editor';
import { ZoroFinder, type FinderOptions } from '../finder/finder';
import type { ZoroEditorOptions } from '../types';

export interface ZoroEditorProps extends Omit<ZoroEditorOptions, 'content' | 'onChange' | 'input' | 'onReady' | 'className'> {
  /** Controlled usage. */
  value?: string;
  /** Uncontrolled usage (initial value). */
  defaultValue?: string;
  onChange?: (html: string) => void;
  onReady?: (editor: Core) => void;
  /** Hidden input name for forms / Server Actions. */
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Class added to the editor wrapper. */
  editorClassName?: string;
}

export interface ZoroEditorHandle {
  getHTML(): string;
  setContent(html: string, emit?: boolean): void;
  insertHTML(html: string): void;
  focus(): void;
  clearDraft(): void;
  /** The underlying core instance (advanced usage). */
  getInstance(): Core | null;
}

/** Signature of the options that require rebuilding the editor when they change. */
function structuralKey(p: ZoroEditorProps): string {
  const media = p.media === false ? false : p.media ? { ...p.media, adapter: !!p.media.adapter, headers: typeof p.media.headers === 'function' ? 'fn' : p.media.headers } : undefined;
  return JSON.stringify({
    preset: p.preset, groups: p.groups, addGroups: p.addGroups, removeGroups: p.removeGroups,
    height: p.height, autoGrow: p.autoGrow, placeholder: p.placeholder, locale: p.locale, maxLength: p.maxLength,
    statusBar: p.statusBar, sourceMode: p.sourceMode, stickyToolbar: p.stickyToolbar, autosave: p.autosave, media,
    upload: !!p.onImageUpload, cls: p.editorClassName, skin: p.skin, bubble: p.bubbleMenu,
  });
}

export const ZoroEditor = forwardRef<ZoroEditorHandle, ZoroEditorProps>(function ZoroEditor(props, ref) {
  const { value, defaultValue, onChange, onReady, onFocus, onBlur, name, id, className, style, readOnly, theme } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const instRef = useRef<Core | null>(null);
  const lastHtml = useRef<string | undefined>(undefined);
  // Latest callbacks (without rebuilding the editor)
  const cb = useRef({ onChange, onReady, onFocus, onBlur, onImageUpload: props.onImageUpload });
  cb.current = { onChange, onReady, onFocus, onBlur, onImageUpload: props.onImageUpload };
  const valueRef = useRef(value ?? defaultValue ?? '');
  valueRef.current = value ?? valueRef.current;
  const propsRef = useRef(props);
  propsRef.current = props;

  const key = structuralKey(props);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const p = propsRef.current;
    const inst = new Core(host, {
      ...p,
      className: p.editorClassName,
      content: valueRef.current,
      input: inputRef.current ?? undefined,
      onImageUpload: p.onImageUpload ? (file) => cb.current.onImageUpload!(file) : undefined,
      onChange: (html) => {
        lastHtml.current = html;
        cb.current.onChange?.(html);
      },
      onFocus: () => cb.current.onFocus?.(),
      onBlur: () => cb.current.onBlur?.(),
      onReady: (ed) => cb.current.onReady?.(ed),
    });
    lastHtml.current = inst.getHTML();
    instRef.current = inst;
    return () => {
      inst.destroy();
      if (instRef.current === inst) instRef.current = null;
    };
    // extensions is read only on first setup (an inline array is a new reference on every render);
    // to change it, give the component a different `key`.
  }, [key]);

  // External value change (unless it is the value we wrote ourselves)
  useEffect(() => {
    const inst = instRef.current;
    if (!inst || value === undefined) return;
    if (value === lastHtml.current || value === inst.getHTML()) return;
    lastHtml.current = value;
    inst.setContent(value);
  }, [value]);

  useEffect(() => {
    instRef.current?.setReadOnly(!!readOnly);
  }, [readOnly, key]);

  useEffect(() => {
    if (theme) instRef.current?.setTheme(theme);
  }, [theme, key]);

  useImperativeHandle(ref, () => ({
    getHTML: () => instRef.current?.getHTML() ?? '',
    setContent: (html, emit) => instRef.current?.setContent(html, emit),
    insertHTML: (html) => instRef.current?.insertHTML(html),
    focus: () => instRef.current?.focus(),
    clearDraft: () => instRef.current?.clearDraft(),
    getInstance: () => instRef.current,
  }), []);

  return (
    <div id={id} className={className} style={style} data-zoro-react="">
      <div ref={hostRef} />
      {name ? <input ref={inputRef} type="hidden" name={name} defaultValue={value ?? defaultValue ?? ''} /> : null}
    </div>
  );
});

/**
 * Standalone Finder (featured image, avatar, etc.):
 *
 *   const openFinder = useZoroFinder({ endpoint: '/api/media' });
 *   <button onClick={() => openFinder({ onSelect: ([img]) => setCover(img.url) })}>Choose image</button>
 */
export function useZoroFinder(base: Omit<FinderOptions, 'onSelect'>) {
  const baseRef = useRef(base);
  baseRef.current = base;
  const current = useRef<ZoroFinder | null>(null);
  useEffect(() => () => current.current?.close(), []);
  return useCallback((opts: Partial<FinderOptions> = {}) => {
    current.current?.close();
    current.current = new ZoroFinder({ ...baseRef.current, ...opts }).open();
    return current.current;
  }, []);
}

export { Core as ZoroEditorCore };
export type { ZoroEditorOptions, MediaItem, MediaAdapter, MediaOptions } from '../types';
export type { SelectedMedia, FinderOptions } from '../finder/finder';
