/**
 * HTML girintileme (kaynak görünümü için).
 * Kurallar Monaco (MIT) ve Ace beautify (BSD-3) davranışından esinlenerek yeniden yazıldı:
 * blok öğeler kendi satırında ve girintili; satır içi içerik tek satırda; <pre> olduğu gibi.
 */

const BLOCK = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'table', 'thead', 'tbody', 'tfoot',
  'tr', 'td', 'th', 'colgroup', 'col', 'figure', 'figcaption', 'div', 'hr', 'details', 'summary', 'section', 'article',
]);
const VOID = new Set(['img', 'hr', 'br', 'col', 'input', 'source', 'wbr', 'embed']);
const INDENT = '  ';

export interface FormatResult {
  html: string;
  /** Her üst düzey öğenin metindeki başlangıç ofseti (imleç eşlemesi için). */
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

/** Öğenin yalnızca satır içi içeriği var mı (tek satırda yazılabilir)? */
function isInlineOnly(el: Element): boolean {
  for (const c of Array.from(el.childNodes)) {
    if (c.nodeType === 1 && (BLOCK.has((c as Element).tagName.toLowerCase()) || (c as Element).tagName === 'IFRAME')) return false;
  }
  return true;
}

/** <li><p>metin</p></li> gibi tek basit paragraflı liste/tablo hücresi: tek satır. */
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
    if (node.nodeType === 8) return; // yorum
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
      // Tek satır: <p>metin <strong>kalın</strong></p>, <pre> içeriği aynen
      push(pad + el.outerHTML, top);
      return;
    }
    push(pad + openTag(el), top);
    for (const c of Array.from(el.childNodes)) walk(c, depth + 1, false);
    push(`${pad}</${tag}>`);
  };

  // Üst düzeyde satır içi öğe (ör. tek başına <img>, <a>) kendi satırında
  const isInlineTop = (el: Element) => !['img', 'iframe'].includes(el.tagName.toLowerCase()) && !BLOCK.has(el.tagName.toLowerCase());

  // Bloklar arasındaki satır sonu boşluklarını at (pre hariç): girinti bunları yeniden üretir
  const tw = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT);
  const junk: Node[] = [];
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (/^\s*\n\s*$/.test(n.textContent!) && !n.parentElement?.closest('pre')) junk.push(n);
  }
  junk.forEach((n) => n.parentNode?.removeChild(n));
  for (const c of Array.from(tpl.content.childNodes)) walk(c, 0, true);
  return { html: lines.join('\n'), blockStarts };
}

/** Kaynak metindeki imleç ofsetinden üst düzey blok indeksini tahmin et. */
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
