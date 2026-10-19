import { Node } from '@tiptap/core';
import type { Messages } from '../i18n';
export type ImageAlignment = 'none' | 'left' | 'center' | 'right';
export interface ResizableImageOptions {
    /** Locale strings (provided by ZoroEditor). */
    messages: Messages | null;
    /** Theme class passed to dialogs. */
    themeClass: () => string;
    HTMLAttributes: Record<string, any>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        zoroImage: {
            setImage: (attrs: {
                src: string;
                alt?: string;
                title?: string;
                width?: number | null;
                height?: number | null;
                srcset?: string | null;
                sizes?: string | null;
                uploadId?: string | null;
            }) => ReturnType;
            updateImageByUploadId: (uploadId: string, attrs: Record<string, any> | null) => ReturnType;
        };
    }
}
/**
 * Alignment, with the same meaning as in WordPress:
 *  left/right → text flows beside the image (float), center → centered block, none → normal flow.
 * The output carries data-alignment (Zoro), an align* class (WordPress themes) and an inline style (sites without the CSS).
 */
export interface UploadState {
    /** 0-100; null = indeterminate (no progress info) */
    progress: number | null;
    error?: string;
    retry?: () => void;
    remove?: () => void;
}
export declare const uploadRegistry: {
    get: (id: string) => UploadState | undefined;
    set(id: string, patch: Partial<UploadState>): void;
    delete(id: string): void;
    subscribe(id: string, fn: () => void): () => void;
};
export declare const ResizableImage: Node<ResizableImageOptions, any>;
