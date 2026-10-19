import type { Editor } from '@tiptap/core';
/** Bounds of the word under the cursor (when nothing is selected). Handles Turkish letters. */
export declare function getWordBoundaries(editor: Editor): {
    from: number;
    to: number;
} | null;
export type MarkCommand = 'toggleBold' | 'toggleItalic' | 'toggleStrike' | 'toggleUnderline' | 'toggleCode' | 'setColor' | 'toggleHighlight' | 'unsetColor' | 'unsetHighlight';
/**
 * WordPress behavior: pressing Bold with no selection bolds the word under the cursor.
 */
export declare function applyMark(editor: Editor | null | undefined, mark: MarkCommand, opts?: any): void;
/**
 * If only part of a paragraph is selected, splits off just the selection and turns it into a heading.
 */
export declare function smartHeading(editor: Editor | null | undefined, level: 1 | 2 | 3 | 4 | 5 | 6): void;
/** Indent inside a list, otherwise do nothing. */
export declare function indent(editor: Editor, dir: 1 | -1): void;
