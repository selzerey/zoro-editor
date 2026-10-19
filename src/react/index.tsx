/**
 * React / Next.js bileşeni.
 *
 *   import { ZoroEditor } from 'zoro-editor/react';
 *   import 'zoro-editor/style.css';
 *
 *   <ZoroEditor value={html} onChange={setHtml} preset="blog" media={{ endpoint: '/api/media' }} />
 *
 * SSR güvenli: editör yalnızca tarayıcıda (useEffect içinde) oluşturulur.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { ZoroEditor as Core } from '../core/editor';
import { ZoroFinder, type FinderOptions } from '../finder/finder';
import type { ZoroEditorOptions } from '../types';

export interface ZoroEditorProps extends Omit<ZoroEditorOptions, 'content' | 'onChange' | 'input' | 'onReady' | 'className'> {
  /** Kontrollü kullanım. */
  value?: string;
  /** Kontrolsüz kullanım (başlangıç değeri). */
  defaultValue?: string;
  onChange?: (html: string) => void;
  onReady?: (editor: Core) => void;
  /** Form / Server Action için gizli input adı. */
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Editör sarmalayıcısına eklenecek sınıf. */
  editorClassName?: string;
}

export interface ZoroEditorHandle {
  getHTML(): string;
  setContent(html: string, emit?: boolean): void;
  insertHTML(html: string): void;
  focus(): void;
  clearDraft(): void;
  /** Alttaki çekirdek örnek (gelişmiş kullanım). */
  getInstance(): Core | null;
}

/** Değişince editörün yeniden kurulmasını gerektiren ayarların imzası. */
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
  // En güncel callback'ler (editörü yeniden kurmadan)
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
    // extensions yalnızca ilk kurulumda okunur (satır içi dizi her render'da yeni referanstır);
    // değiştirmek için bileşene farklı bir `key` ver.
  }, [key]);

  // Dışarıdan gelen value değişimi (kendi yazdığımız değer değilse)
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
 * Editörden bağımsız Finder (öne çıkan görsel, avatar vb.):
 *
 *   const openFinder = useZoroFinder({ endpoint: '/api/media' });
 *   <button onClick={() => openFinder({ onSelect: ([img]) => setCover(img.url) })}>Görsel seç</button>
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
