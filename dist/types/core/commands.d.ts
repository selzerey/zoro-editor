import type { Editor } from '@tiptap/core';
/** İmleç bir kelimenin içindeyse (seçim yoksa) o kelimenin sınırları. Türkçe harfleri tanır. */
export declare function getWordBoundaries(editor: Editor): {
    from: number;
    to: number;
} | null;
export type MarkCommand = 'toggleBold' | 'toggleItalic' | 'toggleStrike' | 'toggleUnderline' | 'toggleCode' | 'setColor' | 'toggleHighlight' | 'unsetColor' | 'unsetHighlight';
/**
 * WordPress davranışı: seçim yokken Kalın'a basınca imlecin olduğu kelime kalın olur.
 */
export declare function applyMark(editor: Editor | null | undefined, mark: MarkCommand, opts?: any): void;
/**
 * Paragrafın bir kısmı seçiliyken başlık yapılırsa sadece seçili kısmı ayırıp başlık yapar.
 */
export declare function smartHeading(editor: Editor | null | undefined, level: 1 | 2 | 3 | 4 | 5 | 6): void;
/** Liste içindeyse girinti, değilse hiçbir şey. */
export declare function indent(editor: Editor, dir: 1 | -1): void;
