/**
 * Yapıştırma temizliği — Word (masaüstü/Online), Google Docs, Google Sheets, Excel, LibreOffice.
 *
 * DOM üzerinde çalışır (regex iç içe span'larda bozulur). Kurallar; CKEditor, TinyMCE, Quill (BSD-3),
 * SunEditor (MIT) ve Jodit (MIT) incelenerek davranış tarifi olarak yeniden yazılmıştır, kod kopyalanmamıştır.
 * Word'ün `mso-list` / `@list` biçimi dosya formatı olgusudur.
 */

export type PasteSource = 'word' | 'gdocs' | 'sheets' | 'excel' | 'html';

export interface PasteResult {
  html: string;
  source: PasteSource;
  /** Word'ün yerel diskteki (file:///) görselleri: tarayıcı bunları okuyamaz. */
  droppedLocalImages: number;
}

export function detectSource(html: string): PasteSource {
  if (/docs-internal-guid/i.test(html)) return 'gdocs';
  if (/google-sheets-html-origin/i.test(html)) return 'sheets';
  if (/urn:schemas-microsoft-com:office:excel|ProgId\s+content=["']?Excel/i.test(html)) return 'excel';
  if (/urn:schemas-microsoft-com:office:word|class=["']?Mso|mso-list|ProgId\s+content=["']?Word/i.test(html)) return 'word';
  return 'html';
}

interface ListDef { ordered: boolean; start?: number }

/** `@list l0:level1 { mso-level-number-format: bullet; mso-level-start-at: 3 }` */
function parseListStyles(css: string): Map<string, ListDef> {
  const map = new Map<string, ListDef>();
  const re = /@list\s+l(\d+):level(\d+)\s*\{([^}]*)\}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const body = m[3]!;
    const fmt = /mso-level-number-format:\s*([\w-]+)/i.exec(body)?.[1]?.toLowerCase();
    const start = /mso-level-start-at:\s*(\d+)/i.exec(body)?.[1];
    // Biçim belirtilmemişse Word varsayılanı ondalık numaradır
    const ordered = fmt ? !['bullet', 'image', 'none'].includes(fmt) : true;
    map.set(`${m[1]}:${m[2]}`, { ordered, start: start ? +start : undefined });
  }
  return map;
}

const BULLET_RE = /^[\s ]*[•·§●○▪–o\-*][\s ]+/;
const NUMBER_RE = /^[\s ]*(\d{1,3}|[a-z]{1,2}|[ivxlcdm]{1,5})[.)][\s ]+/i;

function markerInfo(text: string): { ordered: boolean; start?: number } | null {
  const t = text.replace(/ /g, ' ');
  const n = NUMBER_RE.exec(t);
  if (n) return { ordered: true, start: /^\d+$/.test(n[1]!) ? +n[1]! : undefined };
  if (BULLET_RE.test(t) || /^\s*[•·§●○▪]/.test(t)) return { ordered: false };
  return null;
}

function unwrap(el: Element) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

function rename(el: Element, tag: string): Element {
  const n = el.ownerDocument.createElement(tag);
  for (const a of Array.from(el.attributes)) n.setAttribute(a.name, a.value);
  while (el.firstChild) n.appendChild(el.firstChild);
  el.replaceWith(n);
  return n;
}

function styleOf(el: Element): string {
  return (el.getAttribute('style') ?? '').toLowerCase();
}

function isBlackish(v: string): boolean {
  return /^(#000(000)?|black|windowtext|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|initial|inherit|auto)$/i.test(v.trim());
}
function isTransparent(v: string): boolean {
  return /^(transparent|#fff(fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\(.*,\s*0\s*\)|initial|inherit|auto|none)$/i.test(v.trim());
}

/** Word list paragraflarını gerçek ul/ol yapısına çevirir. */
function convertWordLists(doc: Document, defs: Map<string, ListDef>) {
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6, div')).filter((el) => {
    const st = styleOf(el);
    if (/mso-list:\s*l\d+/.test(st)) return true;
    // Yedek: Word Online / mso-list'siz çıktılar
    return /MsoListParagraph/i.test(el.className) && !!markerInfo(el.textContent ?? '');
  });
  if (!items.length) return;

  const processed = new Set<Element>();
  for (const first of items) {
    if (processed.has(first)) continue;
    // Ardışık kardeş liste paragraflarından bir "koşu" oluştur
    const run: HTMLElement[] = [];
    let cur: Element | null = first;
    while (cur && items.includes(cur as HTMLElement)) {
      run.push(cur as HTMLElement);
      processed.add(cur);
      let next: ChildNode | null = cur.nextSibling;
      while (next && next.nodeType === 3 && !next.textContent!.trim()) next = next.nextSibling;
      cur = next && next.nodeType === 1 ? (next as Element) : null;
    }

    const root = doc.createElement('div');
    first.before(root);
    const stack: Array<{ level: number; list: HTMLElement }> = [];
    for (const el of run) {
      const st = styleOf(el);
      const m = /mso-list:\s*l(\d+)\s+level(\d+)/.exec(st);
      const level = m ? +m[2]! : 1;
      const marker = el.querySelector('[style*="mso-list:ignore" i], [style*="mso-list: ignore" i]');
      const markerText = marker?.textContent ?? '';
      marker?.remove();
      let def: ListDef | undefined = m ? defs.get(`${m[1]}:${m[2]}`) : undefined;
      const fromMarker = markerInfo(markerText || (el.textContent ?? ''));
      if (!def) def = fromMarker ?? { ordered: false };
      if (!marker && !m && fromMarker) {
        // mso-list yoksa işaretçi metnin başında: sil
        const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const tn = walker.nextNode();
        if (tn) tn.textContent = tn.textContent!.replace(def.ordered ? NUMBER_RE : BULLET_RE, '').replace(/^[•·§●○▪]\s*/, '');
      }

      while (stack.length && stack[stack.length - 1]!.level > level) stack.pop();
      let top = stack[stack.length - 1];
      if (!top || top.level < level) {
        const list = doc.createElement(def.ordered ? 'ol' : 'ul');
        if (def.ordered && def.start && def.start > 1) list.setAttribute('start', String(def.start));
        const parentLi = top?.list.lastElementChild;
        (parentLi ?? root).appendChild(list);
        top = { level, list };
        stack.push(top);
      }
      const li = doc.createElement('li');
      const heading = /^H[1-6]$/.test(el.tagName);
      const p = doc.createElement(heading ? el.tagName.toLowerCase() : 'p');
      while (el.firstChild) p.appendChild(el.firstChild);
      li.appendChild(p);
      top.list.appendChild(li);
      el.remove();
    }
    unwrap(root);
  }
}

/** Satır içi stilleri anlamsal etiketlere çevir (Google Docs, Word, LibreOffice). */
function convertInlineStyles(doc: Document) {
  const spans = Array.from(doc.body.querySelectorAll<HTMLElement>('span, font'));
  // İçten dışa: iç içe span'lar doğru kapansın
  for (const el of spans.reverse()) {
    if (!el.isConnected) continue;
    const st = styleOf(el);
    const wrapIn: string[] = [];
    if (/font-weight:\s*(bold|[6-9]00)/.test(st) && !el.closest('h1,h2,h3,h4,h5,h6,th,strong,b')) wrapIn.push('strong');
    if (/font-style:\s*italic/.test(st)) wrapIn.push('em');
    if (/text-decoration[^;]*underline/.test(st)) wrapIn.push('u');
    if (/text-decoration[^;]*line-through/.test(st)) wrapIn.push('s');
    if (/vertical-align:\s*super/.test(st)) wrapIn.push('sup');
    if (/vertical-align:\s*sub\b/.test(st)) wrapIn.push('sub');

    const color = /(?:^|;)\s*color:\s*([^;]+)/.exec(st)?.[1]?.trim();
    const bg = /background(?:-color)?:\s*([^;]+)/.exec(st)?.[1]?.trim();
    const keep: string[] = [];
    if (color && !isBlackish(color)) keep.push(`color: ${color}`);
    if (bg && !isTransparent(bg)) keep.push(`background-color: ${bg}`);

    let inner: Node = doc.createDocumentFragment();
    while (el.firstChild) inner.appendChild(el.firstChild);
    for (const tag of wrapIn.reverse()) {
      const w = doc.createElement(tag);
      w.appendChild(inner);
      inner = w;
    }
    if (keep.length) {
      // Arka plan rengi editörde "vurgu" (mark) olarak tutulur
      let target: Node = inner;
      const fg = keep.find((k) => k.startsWith('color'));
      const back = keep.find((k) => k.startsWith('background'));
      if (fg) {
        const s = doc.createElement('span');
        s.setAttribute('style', fg);
        s.appendChild(target);
        target = s;
      }
      if (back) {
        const mark = doc.createElement('mark');
        mark.setAttribute('data-color', back.split(':')[1]!.trim());
        mark.setAttribute('style', back);
        mark.appendChild(target);
        target = mark;
      }
      el.replaceWith(target);
    } else {
      el.replaceWith(inner);
    }
  }
}

const KEEP_STYLE_BLOCK = /^(p|h[1-6]|li|td|th)$/i;

function cleanAttributes(doc: Document) {
  for (const el of Array.from(doc.body.querySelectorAll<HTMLElement>('*'))) {
    const tag = el.tagName.toLowerCase();
    for (const a of Array.from(el.attributes)) {
      const n = a.name.toLowerCase();
      if (n === 'style') {
        if (tag === 'span' || tag === 'mark') continue;
        if (KEEP_STYLE_BLOCK.test(tag)) {
          const align = /text-align:\s*(left|center|right|justify)/i.exec(a.value)?.[1];
          if (align && align !== 'left') el.setAttribute('style', `text-align: ${align}`);
          else el.removeAttribute('style');
        } else el.removeAttribute('style');
      } else if (n === 'class') {
        const keep = a.value.split(/\s+/).filter((c) => /^align(left|right|center)$/.test(c));
        if (keep.length) el.setAttribute('class', keep.join(' '));
        else el.removeAttribute('class');
      } else if (['id', 'lang', 'dir', 'width', 'height', 'align', 'valign', 'border', 'cellspacing', 'cellpadding', 'bgcolor', 'nowrap'].includes(n) && tag !== 'img') {
        el.removeAttribute(a.name);
      } else if (n.startsWith('x:') || n.startsWith('data-sheets') || n.startsWith('o:') || n.startsWith('v:')) {
        el.removeAttribute(a.name);
      }
    }
  }
}

/** Ana giriş: tarayıcıda DOM ile, DOM yoksa (SSR) regex yedeğiyle. */
export function cleanPasted(input: string): PasteResult {
  const source = detectSource(input);
  if (typeof DOMParser === 'undefined') return { html: cleanPastedRegex(input), source, droppedLocalImages: 0 };

  let html = input
    .replace(/<!--(Start|End)Fragment-->/gi, '')
    // "downlevel-revealed" koşullu bloklar: <![if !supportLists]>·&nbsp;<![endif]>
    .replace(/<!\[if !supportLists\]>/gi, '<span style="mso-list:Ignore">')
    .replace(/<!\[endif\]>/gi, '</span>')
    .replace(/<!\[if[^\]]*\]>/gi, '<span>')
    // Gizli koşullu yorumlar: liste işaretçisini (içerik) koru, diğerlerini sil
    .replace(/<!--\[if !supportLists\]-->/gi, '')
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/<!--\[endif\]-->/gi, '');

  const styleText = Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map((m) => m[1]).join('\n');
  const listDefs = parseListStyles(styleText);

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  // Gereksiz / tehlikeli öğeler
  body.querySelectorAll('style, meta, link, script, title, xml, template, noscript').forEach((n) => n.remove());
  body.querySelectorAll('[style*="mso-element:comment"], [style*="mso-element: comment"], .msocomtxt, .MsoCommentReference').forEach((n) => n.remove());
  // Ad alanlı Word öğeleri (o:p, w:sdt, v:shape...)
  for (const el of Array.from(body.getElementsByTagName('*'))) {
    if (!el.tagName.includes(':')) continue;
    const t = el.tagName.toLowerCase();
    if (t === 'o:p' || t.startsWith('w:')) unwrap(el);
    else el.remove();
  }
  body.querySelectorAll('br.Apple-interchange-newline').forEach((n) => n.remove());
  body.querySelectorAll('.Apple-converted-space').forEach((n) => n.replaceWith(doc.createTextNode(' ')));
  body.querySelectorAll('b[id^="docs-internal-guid"], google-sheets-html-origin').forEach((n) => unwrap(n));
  body.querySelectorAll('a[name]:not([href])').forEach((n) => unwrap(n)); // Word yer imleri (_Toc, _Hlk)

  // Yerel disk görselleri
  let droppedLocalImages = 0;
  body.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') ?? '';
    if (/^file:/i.test(src) || /^(cid|webkit-fake-url):/i.test(src)) {
      droppedLocalImages++;
      img.remove();
    }
  });

  if (source === 'word') {
    convertWordLists(doc, listDefs);
    body.querySelectorAll('p.MsoTitle').forEach((p) => rename(p, 'h1'));
    body.querySelectorAll('p.MsoSubtitle').forEach((p) => rename(p, 'h2'));
    for (let l = 1; l <= 6; l++) body.querySelectorAll(`p.MsoHeading${l}, p[class^="MsoHeading${l}"]`).forEach((p) => rename(p, `h${l}`));
  }

  // Google Docs: li > p sarmalayıcıları ve bloklar arası tek <br>
  body.querySelectorAll('li > p:only-child').forEach((p) => unwrap(p));
  if (source === 'gdocs') {
    for (const br of Array.from(body.children).filter((c) => c.tagName === 'BR')) br.replaceWith(doc.createElement('p'));
  }

  // Tablolar: sıfır genişlikler, colgroup, hizalama sarmalayıcıları
  body.querySelectorAll('colgroup, col').forEach((n) => n.remove());
  body.querySelectorAll('div[align] > table').forEach((t) => unwrap(t.parentElement!));
  body.querySelectorAll('td > p:only-child, th > p:only-child').forEach((p) => {
    if (!p.textContent?.trim()) p.innerHTML = '';
  });

  convertInlineStyles(doc);
  cleanAttributes(doc);

  // Boş span/font ve anlamsız sarmalayıcılar
  body.querySelectorAll('span:not([style]), font').forEach((n) => unwrap(n));

  // &nbsp; yığınları (Word her boşluğu nbsp yapar)
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.parentElement?.closest('pre, code')) continue;
    if (/ /.test(n.textContent!)) n.textContent = n.textContent!.replace(/ {2,}/g, ' ').replace(/(\S) (\S)/g, '$1 $2');
  }

  return { html: body.innerHTML.trim(), source, droppedLocalImages };
}

/** DOM olmayan ortam için (SSR, eski testler) basit regex temizliği. */
export function cleanPastedRegex(html: string): string {
  let h = html;
  h = h.replace(/<b[^>]*id="docs-internal-guid[^"]*"[^>]*>([\s\S]*?)<\/b>/gi, '$1');
  h = h.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '');
  h = h.replace(/<!\[if[^\]]*\]>[\s\S]*?<!\[endif\]>/gi, '');
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  h = h.replace(/<\/?(o|w|m|v):[^>]*>/gi, '');
  h = h.replace(/<xml[\s\S]*?<\/xml>/gi, '');
  h = h.replace(/<style[\s\S]*?<\/style>/gi, '');
  h = h.replace(/<meta[^>]*>/gi, '').replace(/<link[^>]*>/gi, '');
  h = h.replace(/\s*mso-[^:;"']+:[^;"']+;?/gi, '');
  h = h.replace(/\s+class="?Mso[^"\s>]*"?/gi, '');
  h = h.replace(/<img[^>]+src=["']?file:[^>]*>/gi, '');
  h = h.replace(/(&nbsp;\s*){2,}/g, ' ');
  return h;
}
