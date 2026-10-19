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
import { type CSSProperties } from 'react';
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
export declare const ZoroEditor: import("react").ForwardRefExoticComponent<ZoroEditorProps & import("react").RefAttributes<ZoroEditorHandle>>;
/**
 * Editörden bağımsız Finder (öne çıkan görsel, avatar vb.):
 *
 *   const openFinder = useZoroFinder({ endpoint: '/api/media' });
 *   <button onClick={() => openFinder({ onSelect: ([img]) => setCover(img.url) })}>Görsel seç</button>
 */
export declare function useZoroFinder(base: Omit<FinderOptions, 'onSelect'>): (opts?: Partial<FinderOptions>) => ZoroFinder;
export { Core as ZoroEditorCore };
export type { ZoroEditorOptions, MediaItem, MediaAdapter, MediaOptions } from '../types';
export type { SelectedMedia, FinderOptions } from '../finder/finder';
