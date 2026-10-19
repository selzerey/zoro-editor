import type { Editor, AnyExtension } from '@tiptap/core';
import type { Locale, Messages } from './i18n';
/** Built-in toolbar groups. */
export type BuiltinGroup = 'block' | 'format' | 'list' | 'align' | 'link' | 'table' | 'media' | 'embed' | 'color' | 'extra' | 'indent' | 'history' | 'help' | 'view';
export type GroupName = BuiltinGroup | (string & {});
/** Presets: a group list in a single word. */
export type PresetName = 'minimal' | 'basic' | 'blog' | 'full' | (string & {});
export type ThemeMode = 'light' | 'dark' | 'auto';
export type SkinName = 'modern' | 'classic';
/** Toolbar button definition. Also used when writing your own groups. */
export interface ToolbarButton {
    /** Unique key (e.g. "bold"). */
    name: string;
    /** SVG string. */
    icon: string;
    /** Title (tooltip + aria-label). Can also be a function that reads from the locale. */
    title: string | ((t: Messages) => string);
    /** Runs on click. */
    run: (ctx: ToolbarContext, event: MouseEvent) => void;
    /** Whether it is active (shown pressed). */
    isActive?: (ctx: ToolbarContext) => boolean;
    /** Whether it is enabled. */
    isEnabled?: (ctx: ToolbarContext) => boolean;
    /** Keep editor focus on click (selection is preserved). Default: true */
    keepFocus?: boolean;
    /** If it should sit on a different row than its group. */
    row?: 1 | 2;
}
/** Group = buttons placed side by side in the toolbar. */
export interface ToolbarGroup {
    name: GroupName;
    /** 1 = main row, 2 = second row shown by "Toggle toolbar". */
    row?: 1 | 2;
    /** Buttons, or a function that builds a custom element (e.g. the block picker). */
    items: ToolbarButton[] | ((ctx: ToolbarContext) => ToolbarWidget);
    /** Extra TipTap extensions this group needs, if any. */
    extensions?: AnyExtension[];
}
export interface ToolbarWidget {
    el: HTMLElement;
    /** Called when the selection changes (update active states). */
    update?: () => void;
    destroy?: () => void;
}
export interface ToolbarContext {
    editor: Editor;
    zoro: import('./core/editor').ZoroEditor;
    t: Messages;
}
/** Media item — the shared format of Zoro Finder and the PHP backend. */
export interface MediaItem {
    id: string | number;
    url: string;
    filename: string;
    alt?: string;
    caption?: string;
    title?: string;
    mime?: string;
    size?: number;
    width?: number | null;
    height?: number | null;
    folder?: string;
    srcset?: string | null;
    variants?: Record<string, {
        url: string;
        width?: number;
        height?: number;
        size?: number;
    }>;
    createdAt?: string;
    /** If the backend knows: how many places use this file. */
    usageCount?: number;
}
export interface MediaFolder {
    path: string;
    name: string;
    count?: number;
}
export interface MediaListParams {
    page: number;
    limit: number;
    search?: string;
    folder?: string;
    type?: 'image' | 'video' | 'document' | '';
    sort?: 'newest' | 'oldest' | 'name' | 'size';
    filter?: '' | 'unused';
}
export interface MediaListResult {
    items: MediaItem[];
    total: number;
    hasMore: boolean;
    folders?: MediaFolder[];
}
export interface UploadOptions {
    alt: string;
    folder?: string;
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
}
/**
 * Media backend. The built-in `RestMediaAdapter` connects to the PHP backend;
 * implement this interface to plug in your own API (Laravel, Next.js route, Supabase, S3...).
 */
export interface MediaAdapter {
    list(params: MediaListParams): Promise<MediaListResult>;
    upload(file: File, opts: UploadOptions): Promise<MediaItem>;
    update?(id: MediaItem['id'], data: Partial<Pick<MediaItem, 'alt' | 'caption' | 'title' | 'filename'>>): Promise<MediaItem>;
    remove?(ids: Array<MediaItem['id']>): Promise<void>;
    move?(ids: Array<MediaItem['id']>, folder: string): Promise<void>;
    createFolder?(path: string): Promise<void>;
    deleteFolder?(path: string): Promise<void>;
}
export interface RestAdapterOptions {
    /** E.g. "/zoro/php/public/media.php" */
    endpoint: string;
    /** CSRF token, Authorization, etc. */
    headers?: Record<string, string> | (() => Record<string, string>);
    /** Whether to send cookies ("include" for a different domain). Default: "same-origin" */
    credentials?: RequestCredentials;
    /** Normalize items if the backend returns different field names. */
    transform?: (raw: any) => MediaItem;
}
export interface MediaOptions {
    /** Shorthand: PHP endpoint URL. */
    endpoint?: string;
    headers?: RestAdapterOptions['headers'];
    credentials?: RequestCredentials;
    transform?: RestAdapterOptions['transform'];
    /** Or a fully custom backend. */
    adapter?: MediaAdapter;
    /** Accepted MIME types. Default: images. */
    accept?: string[];
    /** Maximum size in MB (client-side check). Default: 20 */
    maxSizeMB?: number;
    /** Whether ALT text is required. Default: true */
    requireAlt?: boolean;
    /** Which variant to insert into the editor. Default: "lg" (falls back to the original). */
    insertVariant?: string;
    /** Whether to show folder features (if the adapter supports them). Default: true */
    folders?: boolean;
}
export interface ZoroEditorOptions {
    /** Initial HTML content. */
    content?: string;
    /** Preset. Default: "full" */
    preset?: PresetName;
    /** Pick groups individually. Overrides the preset when given. */
    groups?: GroupName[];
    /** Groups added to the preset. */
    addGroups?: GroupName[];
    /** Groups removed from the preset. */
    removeGroups?: GroupName[];
    /** Editor height (px). Default: 400 */
    height?: number;
    /** Whether the height grows with the content (min = height). Default: true */
    autoGrow?: boolean;
    placeholder?: string;
    /** Language. Default: "tr" */
    locale?: Locale | Partial<Messages>;
    theme?: ThemeMode;
    /** Skin: "modern" (TinyMCE Premium style, default) or "classic" (WordPress Classic). */
    skin?: SkinName;
    /** Formatting menu shown above selected text. Default: on in modern, off in classic. */
    bubbleMenu?: boolean;
    /** "/" command menu. Default: on in modern, off in classic. */
    slashMenu?: boolean;
    readOnly?: boolean;
    /** Maximum number of characters. */
    maxLength?: number;
    /** The "Add Media" button at the top and image uploads. false = media disabled. */
    media?: MediaOptions | false;
    /** Simple upload hook: take a file, return a URL. (used for paste/drag when there is no adapter) */
    onImageUpload?: (file: File) => Promise<string | {
        url: string;
        alt?: string;
        width?: number;
        height?: number;
    }>;
    /** Keep the toolbar sticky while the page scrolls. Default: true. A number sets the top offset (px). */
    stickyToolbar?: boolean | number;
    /** Form integration: the value is written to this input/textarea (selector or element). */
    input?: string | HTMLInputElement | HTMLTextAreaElement;
    /** Word/character counter. Default: true */
    statusBar?: boolean;
    /** Extra TipTap extensions. */
    extensions?: AnyExtension[];
    /** Source (HTML) tab. Default: true */
    sourceMode?: boolean;
    /** Your own CSS class. */
    className?: string;
    /**
     * Draft autosave (in the browser). Pass a key, e.g. "post-42".
     * After the page is closed and reopened a "Restore" prompt appears. Call `clearDraft()` after saving.
     */
    autosave?: string | {
        key: string;
        delay?: number;
    };
    onChange?: (html: string) => void;
    onReady?: (editor: import('./core/editor').ZoroEditor) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export type { Locale, Messages };
