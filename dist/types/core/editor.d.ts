import { Editor } from '@tiptap/core';
import type { GroupName, PresetName, ZoroEditorOptions } from '../types';
import { type Messages } from '../i18n';
import { ZoroFinder, type SelectedMedia } from '../finder/finder';
import { registerGroup, registerPreset } from './groups';
type Mode = 'visual' | 'code';
type EventName = 'change' | 'focus' | 'blur' | 'ready' | 'mode' | 'destroy';
/**
 * ZoroEditor — WordPress Klasik tarzı zengin metin editörü.
 *
 * ```js
 * const editor = new ZoroEditor('#icerik', { preset: 'blog', media: { endpoint: '/zoro/media.php' } });
 * ```
 */
export declare class ZoroEditor {
    static registerGroup: typeof registerGroup;
    static registerPreset: typeof registerPreset;
    static presets: Record<string, GroupName[]>;
    readonly id: string;
    readonly options: ZoroEditorOptions;
    readonly t: Messages;
    editor: Editor;
    root: HTMLDivElement;
    mode: Mode;
    private groups;
    private frame;
    private topBar;
    private toolbarEl;
    private row1;
    private row2;
    private contentEl;
    private sourceEl;
    private statusEl;
    private pathEl;
    private countsEl;
    private bubble;
    private tableBar;
    private slash;
    private tableBarButtons;
    private bubbleButtons;
    private draftBar;
    private buttons;
    private widgets;
    private viewEls;
    private showRow2;
    private fullscreen;
    private adapter;
    private inputEl;
    private replacedTextarea;
    private cleanups;
    private listeners;
    private linkPopover;
    private linkRange;
    private colorPopover;
    private rafId;
    private draftTimer;
    private sourceCursor;
    private sourceSnapshot;
    private lastColors;
    private destroyed;
    constructor(target: string | HTMLElement, options?: ZoroEditorOptions);
    /** Temizlenmiş HTML. Boş editörde "" döner. */
    getHTML(): string;
    getText(): string;
    isEmpty(): boolean;
    /** Sadece tek boş paragraf = boş. (TipTap isEmpty, boş hücreli tabloyu da boş sayar.) */
    private docIsEmpty;
    /** İçeriği değiştir. emit=true ise onChange tetiklenir. */
    setContent(html: string, emit?: boolean): void;
    /** İmlecin olduğu yere HTML ekle. */
    insertHTML(html: string): void;
    insertImage(img: {
        src: string;
        alt?: string;
        title?: string;
        srcset?: string | null;
        width?: number;
        height?: number;
    }): void;
    focus(): void;
    setReadOnly(readOnly: boolean): void;
    setTheme(theme: 'light' | 'dark' | 'auto'): void;
    /** Tek hamlede grup ekle: `editor.addGroups(['table', 'color'])` */
    addGroups(groups: GroupName[]): void;
    removeGroups(groups: GroupName[]): void;
    setPreset(preset: PresetName, extra?: {
        addGroups?: GroupName[];
        removeGroups?: GroupName[];
    }): void;
    setGroups(groups: GroupName[]): void;
    getGroups(): GroupName[];
    hasGroup(name: GroupName): boolean;
    on(event: EventName, fn: (arg?: any) => void): () => void;
    setMode(mode: Mode): void;
    toggleFullscreen(force?: boolean): void;
    /** Medya kütüphanesini aç (ya da sadece dosya seçici). */
    openMedia(): void;
    /** Bu editörün ayarlarıyla bir Finder aç. */
    finder(opts?: {
        multiple?: boolean;
        onSelect?: (items: SelectedMedia[]) => void;
        files?: File[];
    }): ZoroFinder | null;
    insertMedia(items: SelectedMedia[]): void;
    /** Taslağı sil (içerik kaydedildikten sonra çağır). */
    clearDraft(): void;
    destroy(): void;
    get isDestroyed(): boolean;
    /** Dialog/açılır kutulara da aktarılan görünüm sınıfları. */
    get themeClass(): string;
    get skin(): 'modern' | 'classic';
    setSkin(skin: 'modern' | 'classic'): void;
    private get mediaOpts();
    private get draftKey();
    private get mediaAvailable();
    private buildDom;
    private initEditor;
    private fireChange;
    private emit;
    private syncInput;
    private updateCounts;
    /** Durum çubuğunda imlecin bulunduğu öğe yolu: ul › li › p › strong */
    private updatePath;
    private get slashEnabled();
    private get bubbleEnabled();
    private bubbleDefs;
    private updateBubble;
    private tableDefs;
    private updateTableBar;
    private hideTableBar;
    /** Seçili hücre(ler)in zemin rengi. */
    openCellColor(anchor: HTMLElement): void;
    private hideBubble;
    private get ctx();
    private renderToolbar;
    private makeButton;
    private setupRovingTabindex;
    private onToolbarKey;
    focusToolbar(): void;
    toggleRow2(force?: boolean): void;
    private scheduleToolbarUpdate;
    private updateToolbarState;
    private bindEvents;
    private onKeyDown;
    private insertIntoSource;
    /** Uzun kaynakta imlecin olduğu satırı görünür yap. */
    private revealSourceCaret;
    private autosizeSource;
    private setupDraft;
    private scheduleDraft;
    /**
     * Akıllı yapıştırma (TinyMCE/BlockNote fikri): tek bir URL yapıştırılınca
     * seçili metin → bağlantı, boş satırda YouTube → video, görsel adresi → görsel.
     */
    private smartPaste;
    /** Dosyaları yükleyip editöre ekler. true = olay işlendi. */
    handleFiles(files: File[], pos: number | null): boolean;
    private uploadWithPlaceholder;
    /**
     * Yer tutucuyu geçmişe yazmadan kaldırır, gerçek görseli tek geri-al adımı olarak ekler
     * (geri al → ileri al süresi dolmuş blob görselini geri getirmesin).
     */
    private replaceUploadPlaceholder;
    /** explicit=true: Ctrl+K / düğme (giriş kutusu odaklanır). false: imleç bağlantıya girdi (odak editörde kalır). */
    openLinkPopover(explicit?: boolean): void;
    private syncLinkPopover;
    private openLinkDialog;
    /** Bağlantıyı uygula. false = URL geçersiz. */
    applyLink(o: {
        href: string;
        text?: string;
        title?: string | null;
        newTab?: boolean;
        nofollow?: boolean;
        sponsored?: boolean;
    }, range?: {
        from: number;
        to: number;
    } | null, originalText?: string): boolean;
    openColorPicker(anchor: HTMLElement, type: 'text' | 'bg'): void;
    openSpecialChars(anchor: HTMLElement): void;
    openTableMenu(anchor: HTMLElement): void;
    insertYoutube(): Promise<void>;
    showHelp(): void;
}
export {};
