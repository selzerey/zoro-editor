/**
 * "/" komut menüsü. Boş ya da metin içeren bir paragrafta "/" yazınca açılır.
 * Fikir: Novel / BlockNote / Yoopta (her arama kelimesi eşleşmeli); kod Zoro'ya özgü.
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
    /** Bu grup editörde yoksa öğe gösterilmez. */
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
/** Türkçe katlama: "Başlık" → "baslik", "IŞIK" → "isik" */
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
    /** Her işlemden sonra çağrılır: "/sorgu" imleçten hemen önce mi? */
    update(): void;
    private filter;
    private render;
    private highlight;
    private position;
    /** Editörün keydown'undan çağrılır; true = olay işlendi. */
    onKeyDown(e: KeyboardEvent): boolean;
    private choose;
    close(): void;
    reposition(): void;
}
