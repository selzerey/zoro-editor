/**
 * HTML indentation (for the source view).
 * Rules rewritten based on the behavior of Monaco (MIT) and Ace beautify (BSD-3):
 * block elements on their own indented lines; inline content on one line; <pre> as is.
 */

const BLOCK = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'table', 'thead', 'tbody', 'tfoot',
  'tr', 'td', 'th', 'colgroup', 'col', 'figure', 'figcaption', 'div', 'hr', 'details', 'summary', 'section', 'article',
]);
const VOID = new Set(['img', 'hr', 'br', 'col', 'input', 'source', 'wbr', 'embed']);
const INDENT = '  ';

export interface FormatResult {
  html: string;
  /** Start offset of each top-level element in the text (for cursor mapping). */
  blockStarts: number[];
}

function escAttr(v: string) {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function openTag(el: Element): string {
  let s = `<${el.tagName.toLowerCase()}`;
  for (const a of Array.from(el.attributes)) s += a.value === '' && /^(data-|allowfullscreen|hidden)/.test(a.name) ? ` ${a.name}` : ` ${a.name}="${escAttr(a.value)}"`;
  return s + '>';
}

/** Does the element have only inline content (can it be written on one line)? */
function isInlineOnly(el: Element): boolean {
  for (const c of Array.from(el.childNodes)) {
    if (c.nodeType === 1 && (BLOCK.has((c as Element).tagName.toLowerCase()) || (c as Element).tagName === 'IFRAME')) return false;
  }
  return true;
}

/** List item/table cell with a single simple paragraph, like <li><p>text</p></li>: one line. */
function isCompactCell(el: Element): boolean {
  if (!['li', 'td', 'th'].includes(el.tagName.toLowerCase())) return false;
  const kids = Array.from(el.childNodes).filter((c) => !(c.nodeType === 3 && !c.textContent!.trim()));
  return kids.length === 1 && kids[0]!.nodeType === 1 && (kids[0] as Element).tagName === 'P' && isInlineOnly(kids[0] as Element);
}

export function formatHTML(html: string): FormatResult {
  if (typeof document === 'undefined') return { html, blockStarts: [] };
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const lines: string[] = [];
  const blockStarts: number[] = [];
  let offset = 0;
  const push = (line: string, top = false) => {
    if (top) blockStarts.push(offset);
    lines.push(line);
    offset += line.length + 1;
  };

  const walk = (node: Node, depth: number, top: boolean) => {
    const pad = INDENT.repeat(depth);
    if (node.nodeType === 3) {
      const text = node.textContent!.replace(/\s+/g, ' ').trim();
      if (text) push(pad + text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), top);
      return;
    }
    if (node.nodeType === 8) return; // comment
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const isBlock = BLOCK.has(tag) || tag === 'iframe' || (top && !isInlineTop(el));
    if (!isBlock) {
      push(pad + el.outerHTML, top);
      return;
    }
    if (VOID.has(tag)) {
      push(pad + openTag(el), top);
      return;
    }
    if (tag === 'pre' || isInlineOnly(el) || isCompactCell(el)) {
      // One line: <p>text <strong>bold</strong></p>, <pre> content verbatim
      push(pad + el.outerHTML, top);
      return;
    }
    push(pad + openTag(el), top);
    for (const c of Array.from(el.childNodes)) walk(c, depth + 1, false);
    push(`${pad}</${tag}>`);
  };

  // Top-level inline element (e.g. a lone <img>, <a>) on its own line
  const isInlineTop = (el: Element) => !['img', 'iframe'].includes(el.tagName.toLowerCase()) && !BLOCK.has(el.tagName.toLowerCase());

  // Drop line-break whitespace between blocks (except pre): indentation recreates it
  const tw = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT);
  const junk: Node[] = [];
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (/^\s*\n\s*$/.test(n.textContent!) && !n.parentElement?.closest('pre')) junk.push(n);
  }
  junk.forEach((n) => n.parentNode?.removeChild(n));
  for (const c of Array.from(tpl.content.childNodes)) walk(c, 0, true);
  return { html: lines.join('\n'), blockStarts };
}

/** Estimate the top-level block index from the cursor offset in the source text. */
export function blockIndexAt(source: string, caret: number): number {
  let index = -1;
  let lineStart = 0;
  for (let i = 0; i <= Math.min(caret, source.length); i++) {
    if (i === source.length || source[i] === '\n') {
      const line = source.slice(lineStart, i);
      if (lineStart <= caret && /^<(?!\/)/.test(line)) index++;
      else if (lineStart <= caret && line && !/^\s/.test(line) && !/^<\//.test(line)) index++;
      lineStart = i + 1;
    }
  }
  return Math.max(0, index);
}
