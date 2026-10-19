import type { MediaAdapter, MediaItem, MediaOptions } from '../types';
import { type Locale, type Messages } from '../i18n';
export interface SelectedMedia extends MediaItem {
    /** ALT text the user entered for this content. */
    insertAlt: string;
}
export interface FinderOptions {
    adapter?: MediaAdapter;
    /** Shorthand: REST endpoint. */
    endpoint?: string;
    headers?: MediaOptions['headers'];
    credentials?: RequestCredentials;
    transform?: MediaOptions['transform'];
    locale?: Locale | Partial<Messages>;
    messages?: Messages;
    themeClass?: string;
    theme?: 'light' | 'dark' | 'auto';
    skin?: 'modern' | 'classic';
    /** Whether multiple files can be selected. */
    multiple?: boolean;
    accept?: string[];
    maxSizeMB?: number;
    requireAlt?: boolean;
    folders?: boolean;
    title?: string;
    /** Label of the "Insert" button. */
    selectLabel?: string;
    /** Initial tab. */
    tab?: 'library' | 'upload';
    /** Manage mode: the select button is hidden (library management only). */
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
 * Zoro Finder — a CKFinder-like media manager.
 * Can also be used without the editor: `openFinder({ endpoint, onSelect })`.
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
    /** Add files from outside (for files dragged into the editor). */
    addFiles(files: File[]): void;
    private renderQueue;
    private renderUploadButton;
    private startUpload;
}
export declare function altFromFilename(name: string): string;
/** Standalone Finder: featured image, avatar, gallery picking, etc. */
export declare function openFinder(options: FinderOptions): ZoroFinder;
