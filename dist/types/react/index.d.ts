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
import { type CSSProperties } from 'react';
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
export declare const ZoroEditor: import("react").ForwardRefExoticComponent<ZoroEditorProps & import("react").RefAttributes<ZoroEditorHandle>>;
/**
 * Standalone Finder (featured image, avatar, etc.):
 *
 *   const openFinder = useZoroFinder({ endpoint: '/api/media' });
 *   <button onClick={() => openFinder({ onSelect: ([img]) => setCover(img.url) })}>Choose image</button>
 */
export declare function useZoroFinder(base: Omit<FinderOptions, 'onSelect'>): (opts?: Partial<FinderOptions>) => ZoroFinder;
export { Core as ZoroEditorCore };
export type { ZoroEditorOptions, MediaItem, MediaAdapter, MediaOptions } from '../types';
export type { SelectedMedia, FinderOptions } from '../finder/finder';
