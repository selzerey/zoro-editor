/**
 * "/" command menu. Opens when "/" is typed in an empty or non-empty paragraph.
 * Idea: Novel / BlockNote / Yoopta (every search word must match); the code is Zoro's own.
 */
import type { Editor } from '@tiptap/core';
import type { GroupName } from '../types';
import type { Messages } from '../i18n';
import { ICONS } from '../icons';
import { h } from '../ui/components';

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
export function fold(s: string): string {
  return s
    .toLocaleLowerCase('tr')
    .replace(/[ıİ]/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const sized = (svg: string) => svg.replace(/width="\d+" height="\d+"/, 'width="18" height="18"');

export const SLASH_ITEMS: SlashItem[] = [
  { id: 'p', title: (t) => t.paragraph, hint: (t) => t.slashParagraph, keywords: ['paragraf', 'metin', 'yazi', 'text', 'p'], icon: ICONS.removeFormat, group: 'block', run: (e) => e.chain().focus().setParagraph().run() },
  ...([1, 2, 3] as const).map((l): SlashItem => ({
    id: `h${l}`,
    title: (t) => `${t.heading} ${l}`,
    hint: (t) => t.slashHeading,
    keywords: [`h${l}`, 'baslik', 'heading', 'title', `#${'#'.repeat(l - 1)}`],
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><text x="15" y="19" font-size="10" font-weight="700" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">${l}</text></svg>`,
    group: 'block',
    run: (e) => e.chain().focus().setHeading({ level: l }).run(),
  })),
  { id: 'ul', title: (t) => t.slashBullet, hint: (t) => t.slashBulletHint, keywords: ['liste', 'madde', 'bullet', 'ul', 'list'], icon: ICONS.bulletList, group: 'list', run: (e) => e.chain().focus().toggleBulletList().run() },
  { id: 'ol', title: (t) => t.slashOrdered, hint: (t) => t.slashOrderedHint, keywords: ['numara', 'sirali', 'liste', 'ordered', 'ol', '1.'], icon: ICONS.orderedList, group: 'list', run: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: 'quote', title: (t) => t.slashQuote, hint: (t) => t.slashQuoteHint, keywords: ['alinti', 'quote', 'blockquote', 'soz'], icon: ICONS.quote, group: 'list', run: (e) => e.chain().focus().toggleBlockquote().run() },
  { id: 'code', title: (t) => t.slashCode, hint: (t) => t.slashCodeHint, keywords: ['kod', 'code', 'pre', 'blok'], icon: ICONS.code, group: 'block', run: (e) => e.chain().focus().toggleCodeBlock().run() },
  { id: 'table', title: (t) => t.tableMenu, hint: (t) => t.slashTableHint, keywords: ['tablo', 'table', 'cizelge', 'grid'], icon: ICONS.table, group: 'table', run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { id: 'image', title: (t) => t.slashImage, hint: (t) => t.slashImageHint, keywords: ['gorsel', 'resim', 'foto', 'image', 'img', 'medya'], icon: ICONS.image, group: 'media', run: (_e, api) => api.openMedia() },
  { id: 'youtube', title: () => 'YouTube', hint: (t) => t.slashYoutubeHint, keywords: ['youtube', 'video', 'gom', 'embed'], icon: ICONS.youtube, group: 'embed', run: (_e, api) => void api.insertYoutube() },
  { id: 'hr', title: (t) => t.hr, hint: (t) => t.slashHrHint, keywords: ['cizgi', 'ayirici', 'hr', 'divider', 'line', '---'], icon: ICONS.hr, group: 'extra', run: (e) => e.chain().focus().setHorizontalRule().run() },
];

export class SlashMenu {
  private el: HTMLDivElement | null = null;
  private items: SlashItem[] = [];
  private index = 0;
  private range: { from: number; to: number } | null = null;
  private dismissedAt = -1;

  constructor(private editor: Editor, private host: SlashHost, private extra: SlashItem[] = []) {}

  get isOpen(): boolean {
    return !!this.el;
  }

  /** Called after every transaction: is "/query" right before the cursor? */
  update(): void {
    const ed = this.editor;
    const { selection } = ed.state;
    if (!selection.empty || !ed.isEditable || !ed.view.hasFocus()) return this.close();
    const $pos = selection.$from;
    const parent = $pos.parent;
    if (parent.type.name !== 'paragraph' || $pos.depth > 3) return this.close();
    const before = parent.textBetween(0, $pos.parentOffset, undefined, '￼');
    const m = /(?:^|\s)\/([\p{L}\p{N}#.-]{0,24})$/u.exec(before);
    if (!m) return this.close();
    const from = selection.from - m[1]!.length - 1;
    if (from === this.dismissedAt) return this.close();
    this.range = { from, to: selection.from };
    this.filter(m[1]!);
    if (!this.items.length && m[1]!.length > 6) return this.close(); // meaninglessly long query: close the menu
    this.render();
  }

  private filter(query: string) {
    const words = fold(query).split(/\s+/).filter(Boolean);
    const all = [...SLASH_ITEMS, ...this.extra].filter((i) => !i.group || this.host.hasGroup(i.group));
    const t = this.host.t;
    const scored = all
      .map((item) => {
        const hay = [fold(item.title(t)), ...item.keywords.map(fold)];
        let score = 0;
        for (const w of words) {
          const pos = Math.min(...hay.map((x) => (x.startsWith(w) ? 0 : x.includes(w) ? 1 : 9)));
          if (pos === 9) return null; // every word must match
          score += pos;
        }
        return { item, score };
      })
      .filter(Boolean) as Array<{ item: SlashItem; score: number }>;
    scored.sort((a, b) => a.score - b.score);
    this.items = scored.map((s) => s.item);
    this.index = Math.min(this.index, Math.max(0, this.items.length - 1));
  }

  private render() {
    const t = this.host.t;
    if (!this.el) {
      this.el = h('div', { class: `zoro-root zoro-slash ${this.host.themeClass}`, role: 'listbox', 'aria-label': t.slashTitle });
      this.el.addEventListener('mousedown', (e) => e.preventDefault());
      document.body.append(this.el);
    }
    this.el.innerHTML = '';
    if (!this.items.length) {
      this.el.append(h('div', { class: 'zoro-slash-empty' }, t.noResults));
    } else {
      this.items.forEach((item, i) => {
        const row = h('div', {
          class: 'zoro-slash-item' + (i === this.index ? ' active' : ''),
          role: 'option',
          'aria-selected': String(i === this.index),
        },
          h('span', { class: 'zoro-slash-icon', html: sized(item.icon) }),
          h('span', { class: 'zoro-slash-text' }, h('strong', {}, item.title(t)), item.hint ? h('small', {}, item.hint(t)) : null),
        );
        row.addEventListener('mouseenter', () => { this.index = i; this.highlight(); });
        row.addEventListener('click', () => this.choose(i));
        this.el!.append(row);
      });
    }
    this.position();
  }

  private highlight() {
    this.el?.querySelectorAll('.zoro-slash-item').forEach((r, i) => {
      r.classList.toggle('active', i === this.index);
      r.setAttribute('aria-selected', String(i === this.index));
      if (i === this.index) (r as HTMLElement).scrollIntoView?.({ block: 'nearest' });
    });
  }

  private position() {
    if (!this.el || !this.range) return;
    const c = this.editor.view.coordsAtPos(this.range.from);
    const box = this.el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    let top = c.bottom + 6;
    if (top + box.height > window.innerHeight - 8 && c.top - box.height - 6 > 8) top = c.top - box.height - 6;
    this.el.style.top = `${Math.round(top)}px`;
    this.el.style.left = `${Math.round(Math.max(8, Math.min(c.left, vw - box.width - 8)))}px`;
  }

  /** Called from the editor's keydown; true = event handled. */
  onKeyDown(e: KeyboardEvent): boolean {
    if (!this.el) return false;
    const n = this.items.length;
    if (e.key === 'ArrowDown') { if (n) { this.index = (this.index + 1) % n; this.highlight(); } return true; }
    if (e.key === 'ArrowUp') { if (n) { this.index = (this.index - 1 + n) % n; this.highlight(); } return true; }
    if (e.key === 'Enter' || e.key === 'Tab') { if (n) { this.choose(this.index); return true; } this.close(); return false; }
    if (e.key === 'Escape') { this.dismissedAt = this.range?.from ?? -1; this.close(); return true; }
    return false;
  }

  private choose(i: number) {
    const item = this.items[i];
    const range = this.range;
    this.close();
    if (!item || !range) return;
    this.editor.chain().focus().deleteRange(range).run();
    item.run(this.editor, this.host);
  }

  close(): void {
    this.el?.remove();
    this.el = null;
    this.range = null;
    this.index = 0;
  }

  reposition(): void {
    if (this.el) this.position();
  }
}
