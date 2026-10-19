import type { MediaAdapter, MediaItem, MediaListParams, MediaListResult, RestAdapterOptions, UploadOptions } from '../types';
/** Eski ZoroEditor PHP formatını (altText, originalFilename) da kabul eden varsayılan dönüştürücü. */
export declare function normalizeMediaItem(raw: any): MediaItem;
export declare class MediaApiError extends Error {
    status: number;
    constructor(message: string, status: number);
}
/**
 * Zoro PHP backend'ine (php/public/media.php) bağlanan adaptör.
 * Aynı JSON sözleşmesini uygulayan her backend ile çalışır (bkz. docs/media-api.md).
 */
export declare class RestMediaAdapter implements MediaAdapter {
    private opts;
    private transform;
    constructor(opts: RestAdapterOptions);
    private url;
    private headers;
    private request;
    list(p: MediaListParams): Promise<MediaListResult>;
    upload(file: File, opts: UploadOptions): Promise<MediaItem>;
    update(id: MediaItem['id'], data: Partial<MediaItem>): Promise<MediaItem>;
    remove(ids: Array<MediaItem['id']>): Promise<void>;
    move(ids: Array<MediaItem['id']>, folder: string): Promise<void>;
    createFolder(path: string): Promise<void>;
    deleteFolder(path: string): Promise<void>;
}
/**
 * Tarayıcı içinde çalışan sahte backend (demo, test, prototip).
 * Dosyalar blob URL olarak tutulur; sayfa yenilenince kaybolur.
 */
export declare class MemoryMediaAdapter implements MediaAdapter {
    items: MediaItem[];
    folders: Set<string>;
    private seq;
    constructor(seed?: Array<Partial<MediaItem> & {
        url: string;
    }>);
    list(p: MediaListParams): Promise<MediaListResult>;
    upload(file: File, opts: UploadOptions): Promise<MediaItem>;
    update(id: MediaItem['id'], data: Partial<MediaItem>): Promise<MediaItem>;
    remove(ids: Array<MediaItem['id']>): Promise<void>;
    move(ids: Array<MediaItem['id']>, folder: string): Promise<void>;
    createFolder(path: string): Promise<void>;
    deleteFolder(path: string): Promise<void>;
}
export declare function formatBytes(n?: number): string;
/** Editöre eklenecek en uygun URL + srcset. */
export declare function pickInsertSource(item: MediaItem, variant?: string): {
    src: string;
    srcset: string | null;
    width: number | null;
    height: number | null;
};
