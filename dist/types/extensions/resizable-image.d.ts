import { Node } from '@tiptap/core';
import type { Messages } from '../i18n';
export type ImageAlignment = 'none' | 'left' | 'center' | 'right';
export interface ResizableImageOptions {
    /** Dil metinleri (ZoroEditor tarafından verilir). */
    messages: Messages | null;
    /** Dialoglara aktarılacak tema sınıfı. */
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
 * Hizalama, WordPress ile aynı anlamda:
 *  left/right → metin görselin yanından akar (float), center → ortada blok, none → normal akış.
 * Çıktıda data-alignment (Zoro), align* sınıfı (WordPress temaları) ve satır içi stil (CSS'siz siteler) birlikte yazılır.
 */
export interface UploadState {
    /** 0-100; null = belirsiz (ilerleme bilgisi yok) */
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
