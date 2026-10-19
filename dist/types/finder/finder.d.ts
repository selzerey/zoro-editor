import type { MediaAdapter, MediaItem, MediaOptions } from '../types';
import { type Locale, type Messages } from '../i18n';
export interface SelectedMedia extends MediaItem {
    /** Kullanıcının bu içerik için girdiği ALT metni. */
    insertAlt: string;
}
export interface FinderOptions {
    adapter?: MediaAdapter;
    /** Kısa yol: REST endpoint. */
    endpoint?: string;
    headers?: MediaOptions['headers'];
    credentials?: RequestCredentials;
    transform?: MediaOptions['transform'];
    locale?: Locale | Partial<Messages>;
    messages?: Messages;
    themeClass?: string;
    theme?: 'light' | 'dark' | 'auto';
    skin?: 'modern' | 'classic';
    /** Birden fazla dosya seçilebilsin mi. */
    multiple?: boolean;
    accept?: string[];
    maxSizeMB?: number;
    requireAlt?: boolean;
    folders?: boolean;
    title?: string;
    /** "Ekle" düğmesinin metni. */
    selectLabel?: string;
    /** Başlangıç sekmesi. */
    tab?: 'library' | 'upload';
    /** Yönetim modu: seçim düğmesi gizlenir (sadece kütüphane yönetimi). */
    manageOnly?: boolean;
    onSelect?: (items: SelectedMedia[]) => void;
    onClose?: () => void;
}
export declare function createAdapter(o: {
    adapter?: MediaAdapter;
    endpoint?: string;
    headers?: any;
    credentials?: RequestCredentials;
    transform?: any;
}): MediaAdapter | null;
/**
 * Zoro Finder — CKFinder benzeri medya yöneticisi.
 * Editörden bağımsız da kullanılabilir: `openFinder({ endpoint, onSelect })`.
 */
export declare class ZoroFinder {
    private opts;
    private t;
    private adapter;
    private dialog;
    private tabs;
    private themeClass;
    private items;
    private folders;
    private total;
    private hasMore;
    private loading;
    private error;
    private params;
    private selected;
    private focused;
    private insertAlts;
    private view;
    private reqSeq;
    private searchTimer;
    private queue;
    private uploading;
    private el;
    constructor(opts: FinderOptions);
    get canFolders(): boolean;
    private get accept();
    private get maxMB();
    private get requireAlt();
    open(): this;
    close(): void;
    private cleanup;
    private buildLibrary;
    private updateViewBtn;
    private toggleView;
    private reload;
    private load;
    private renderFolders;
    private renderGrid;
    private thumbOf;
    private renderItem;
    private moveFocus;
    private toggleSelect;
    private renderDetails;
    private toggleSelectRefresh;
    private renderFooter;
    private confirmSelection;
    private removeSelected;
    private createFolder;
    private deleteFolder;
    private buildUpload;
    private onPaste;
    /** Dışarıdan dosya ekle (editöre sürüklenen dosyalar için). */
    addFiles(files: File[]): void;
    private renderQueue;
    private renderUploadButton;
    private startUpload;
}
export declare function altFromFilename(name: string): string;
/** Editörden bağımsız Finder: öne çıkan görsel, avatar, galeri seçimi vb. */
export declare function openFinder(options: FinderOptions): ZoroFinder;
