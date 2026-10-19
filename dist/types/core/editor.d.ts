import { Editor } from '@tiptap/core';
import type { GroupName, PresetName, ZoroEditorOptions } from '../types';
import { type Messages } from '../i18n';
import { ZoroFinder, type SelectedMedia } from '../finder/finder';
import { registerGroup, registerPreset } from './groups';
type Mode = 'visual' | 'code';
type EventName = 'change' | 'focus' | 'blur' | 'ready' | 'mode' | 'destroy';
/**
 * ZoroEditor — a WordPress Classic-style rich text editor.
 *
 * ```js
 * const editor = new ZoroEditor('#content', { preset: 'blog', media: { endpoint: '/zoro/media.php' } });
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
    /** Cleaned HTML. Returns "" for an empty editor. */
    getHTML(): string;
    getText(): string;
    isEmpty(): boolean;
    /** Only a single empty paragraph counts as empty. (TipTap's isEmpty also treats a table with empty cells as empty.) */
    private docIsEmpty;
    /** Replace the content. emit=true fires onChange. */
    setContent(html: string, emit?: boolean): void;
    /** Insert HTML at the cursor. */
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
    /** Add groups in one call: `editor.addGroups(['table', 'color'])` */
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
    /** Open the media library (or just the file picker). */
    openMedia(): void;
    /** Open a Finder with this editor's settings. */
    finder(opts?: {
        multiple?: boolean;
        onSelect?: (items: SelectedMedia[]) => void;
        files?: File[];
    }): ZoroFinder | null;
    insertMedia(items: SelectedMedia[]): void;
    /** Delete the draft (call after the content is saved). */
    clearDraft(): void;
    destroy(): void;
    get isDestroyed(): boolean;
    /** Appearance classes also passed to dialogs/popovers. */
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
    /** Element path at the cursor, shown in the status bar: ul › li › p › strong */
    private updatePath;
    private get slashEnabled();
    private get bubbleEnabled();
    private bubbleDefs;
    private updateBubble;
    private tableDefs;
    private updateTableBar;
    private hideTableBar;
    /** Background color of the selected cell(s). */
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
    /** Scroll the cursor's line into view in long source. */
    private revealSourceCaret;
    private autosizeSource;
    private setupDraft;
    private scheduleDraft;
    /**
     * Smart paste (idea from TinyMCE/BlockNote): when a single URL is pasted,
     * selected text → link, YouTube on an empty line → video, image address → image.
     */
    private smartPaste;
    /** Uploads files and inserts them into the editor. true = event handled. */
    handleFiles(files: File[], pos: number | null): boolean;
    private uploadWithPlaceholder;
    /**
     * Removes the placeholder without recording history and inserts the real image as a single undo step
     * (so undo → redo doesn't bring back an expired blob image).
     */
    private replaceUploadPlaceholder;
    /** explicit=true: Ctrl+K / button (the input gets focus). false: the cursor entered a link (focus stays in the editor). */
    openLinkPopover(explicit?: boolean): void;
    private syncLinkPopover;
    private openLinkDialog;
    /** Apply the link. false = invalid URL. */
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
