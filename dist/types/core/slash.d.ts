/**
 * "/" command menu. Opens when "/" is typed in an empty or non-empty paragraph.
 * Idea: Novel / BlockNote / Yoopta (every search word must match); the code is Zoro's own.
 */
import type { Editor } from '@tiptap/core';
import type { GroupName } from '../types';
import type { Messages } from '../i18n';
export interface SlashItem {
    id: string;
    title: (t: Messages) => string;
    hint?: (t: Messages) => string;
    keywords: string[];
    icon: string;
    /** The item is hidden if this group isn't in the editor. */
    group?: GroupName;
    run: (editor: Editor, api: SlashHost) => void;
}
export interface SlashHost {
    openMedia(): void;
    insertYoutube(): void;
    hasGroup(g: GroupName): boolean;
    readonly t: Messages;
    readonly themeClass: string;
}
/** Turkish folding: "Başlık" → "baslik", "IŞIK" → "isik" */
export declare function fold(s: string): string;
export declare const SLASH_ITEMS: SlashItem[];
export declare class SlashMenu {
    private editor;
    private host;
    private extra;
    private el;
    private items;
    private index;
    private range;
    private dismissedAt;
    constructor(editor: Editor, host: SlashHost, extra?: SlashItem[]);
    get isOpen(): boolean;
    /** Called after every transaction: is "/query" right before the cursor? */
    update(): void;
    private filter;
    private render;
    private highlight;
    private position;
    /** Called from the editor's keydown; true = event handled. */
    onKeyDown(e: KeyboardEvent): boolean;
    private choose;
    close(): void;
    reposition(): void;
}
