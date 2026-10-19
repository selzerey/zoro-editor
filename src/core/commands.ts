import type { Editor } from '@tiptap/core';

/** Bounds of the word under the cursor (when nothing is selected). Handles Turkish letters. */
export function getWordBoundaries(editor: Editor): { from: number; to: number } | null {
  const { state } = editor;
  const { from, empty } = state.selection;
  if (!empty) return null;
  const $from = state.doc.resolve(from);
  const parent = $from.parent;
  if (!parent.isTextblock) return null;
  const text = parent.textContent;
  const offset = from - $from.start();
  const re = /[\p{L}\p{N}_-]/u;
  let s = offset;
  let e = offset;
  while (s > 0 && re.test(text[s - 1]!)) s--;
  while (e < text.length && re.test(text[e]!)) e++;
  if (s === e) return null;
  return { from: $from.start() + s, to: $from.start() + e };
}

export type MarkCommand = 'toggleBold' | 'toggleItalic' | 'toggleStrike' | 'toggleUnderline' | 'toggleCode' | 'setColor' | 'toggleHighlight' | 'unsetColor' | 'unsetHighlight';

/**
 * WordPress behavior: pressing Bold with no selection bolds the word under the cursor.
 */
export function applyMark(editor: Editor | null | undefined, mark: MarkCommand, opts?: any): void {
  if (!editor) return;
  const { from, to } = editor.state.selection;
  const boundaries = getWordBoundaries(editor);
  const range = boundaries || { from, to };
  const chain = editor.chain().focus();
  if (boundaries) chain.setTextSelection(range);
  switch (mark) {
    case 'toggleBold': chain.toggleBold(); break;
    case 'toggleItalic': chain.toggleItalic(); break;
    case 'toggleStrike': chain.toggleStrike(); break;
    case 'toggleUnderline': chain.toggleUnderline(); break;
    case 'toggleCode': chain.toggleCode(); break;
    case 'setColor': if (opts) chain.setColor(opts); break;
    case 'unsetColor': chain.unsetColor(); break;
    case 'toggleHighlight': opts?.color ? chain.setHighlight({ color: opts.color }) : chain.toggleHighlight(); break;
    case 'unsetHighlight': chain.unsetHighlight(); break;
  }
  if (boundaries) chain.setTextSelection(boundaries.to);
  chain.run();
}

/**
 * If only part of a paragraph is selected, splits off just the selection and turns it into a heading.
 */
export function smartHeading(editor: Editor | null | undefined, level: 1 | 2 | 3 | 4 | 5 | 6): void {
  if (!editor) return;
  const { from, to, empty } = editor.state.selection;
  if (!empty) {
    const $from = editor.state.doc.resolve(from);
    const $to = editor.state.doc.resolve(to);
    if ($from.parent === $to.parent && $from.parent.type.name === 'paragraph') {
      const bs = $from.start($from.depth);
      const be = $from.end($from.depth);
      if (!(from <= bs + 1 && to >= be - 1)) {
        if (to < be) { editor.commands.setTextSelection(to); editor.commands.splitBlock(); }
        if (from > bs) { editor.commands.setTextSelection(from); editor.commands.splitBlock(); }
      }
    }
  }
  editor.chain().focus().toggleHeading({ level }).run();
}

/** Indent inside a list, otherwise do nothing. */
export function indent(editor: Editor, dir: 1 | -1): void {
  const item = editor.isActive('listItem') ? 'listItem' : null;
  if (!item) return;
  if (dir > 0) editor.chain().focus().sinkListItem(item).run();
  else editor.chain().focus().liftListItem(item).run();
}
