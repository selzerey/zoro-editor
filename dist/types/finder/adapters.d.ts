import type { MediaAdapter, MediaItem, MediaListParams, MediaListResult, RestAdapterOptions, UploadOptions } from '../types';
/** Default normalizer that also accepts the old ZoroEditor PHP format (altText, originalFilename). */
export declare function normalizeMediaItem(raw: any): MediaItem;
export declare class MediaApiError extends Error {
    status: number;
    constructor(message: string, status: number);
}
/**
 * Adapter that connects to the Zoro PHP backend (php/public/media.php).
 * Works with any backend implementing the same JSON contract (see docs/media-api.md).
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
 * Fake in-browser backend (demo, tests, prototyping).
 * Files are kept as blob URLs and are lost on page reload.
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
/** Best URL + srcset to insert into the editor. */
export declare function pickInsertSource(item: MediaItem, variant?: string): {
    src: string;
    srcset: string | null;
    width: number | null;
    height: number | null;
};
