import { Editor, getMarkRange, type AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Youtube from '@tiptap/extension-youtube';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Placeholder, CharacterCount } from '@tiptap/extensions';

import type { GroupName, MediaAdapter, PresetName, ToolbarButton, ToolbarContext, ToolbarWidget, ZoroEditorOptions } from '../types';
import { resolveMessages, fmt, type Messages } from '../i18n';
import { ICONS } from '../icons';
import { ZoroDialog, ZoroPopover, h, toast, promptDialog, installTooltips, splitShortcut } from '../ui/components';
import { ResizableImage, uploadRegistry } from '../extensions/resizable-image';

const RECENT_KEY = 'zoro-recent-colors';
function recentColors(): string[] {
  try { return (JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]).filter((c) => /^#[0-9a-f]{3,6}$/i.test(c)).slice(0, 10); } catch { return []; }
}
function rememberColor(c: string) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([c, ...recentColors().filter((x) => x !== c)].slice(0, 10))); } catch { /* */ }
}

/** Tablo hücresi zemin rengi: <td style="background-color: …"> */
const cellBackground = {
  backgroundColor: {
    default: null,
    // Ham style'dan oku: tarayıcı #fcf9e8'i rgb(...)'e çevirmesin
    parseHTML: (el: HTMLElement) => /background(?:-color)?:\s*([^;]+)/i.exec(el.getAttribute('style') ?? '')?.[1]?.trim() || el.getAttribute('data-background-color') || null,
    renderHTML: (attrs: Record<string, any>) => (attrs.backgroundColor ? { style: `background-color: ${attrs.backgroundColor}` } : {}),
  },
};

/** Görseli indirip çöz (zaman aşımıyla); hata olursa da devam et. */
function preload(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined' || /jsdom/i.test(navigator.userAgent)) return resolve();
    const im = new Image();
    const done = () => resolve();
    const timer = setTimeout(done, 4000);
    im.onload = () => { clearTimeout(timer); (im.decode?.() ?? Promise.resolve()).then(done, done); };
    im.onerror = () => { clearTimeout(timer); done(); };
    im.src = src;
  });
}
import { ZoroFinder, createAdapter, altFromFilename, type SelectedMedia } from '../finder/finder';
import { pickInsertSource } from '../finder/adapters';
import { cleanPasted } from './paste';
import { SlashMenu } from './slash';
import { formatHTML, blockIndexAt } from './format';
import { TextSelection } from '@tiptap/pm/state';
import { cleanHTML, countChars, countWords, escapeHtml, isSafeUrl, isYoutubeUrl, normalizeUrl } from './html';
import { applyMark, getWordBoundaries, smartHeading } from './commands';
import { CELL_COLORS, COLORS, PRESETS, SPECIAL_CHARS, getGroup, registerGroup, registerPreset, resolveGroups } from './groups';

type Mode = 'visual' | 'code';
type EventName = 'change' | 'focus' | 'blur' | 'ready' | 'mode' | 'destroy';

const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
let uid = 0;

function readPref(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writePref(key: string, v: string | null) {
  try { if (v === null) localStorage.removeItem(key); else localStorage.setItem(key, v); } catch { /* */ }
}

/**
 * ZoroEditor — WordPress Klasik tarzı zengin metin editörü.
 *
 * ```js
 * const editor = new ZoroEditor('#icerik', { preset: 'blog', media: { endpoint: '/zoro/media.php' } });
 * ```
 */
export class ZoroEditor {
  static registerGroup = registerGroup;
  static registerPreset = registerPreset;
  static presets = PRESETS;

  readonly id = `zoro-${++uid}`;
  readonly options: ZoroEditorOptions;
  readonly t: Messages;
  editor!: Editor;
  root!: HTMLDivElement;
  mode: Mode = 'visual';

  private groups: GroupName[];
  private frame!: HTMLDivElement;
  private topBar!: HTMLDivElement;
  private toolbarEl!: HTMLDivElement;
  private row1!: HTMLDivElement;
  private row2!: HTMLDivElement;
  private contentEl!: HTMLDivElement;
  private sourceEl!: HTMLTextAreaElement;
  private statusEl!: HTMLDivElement;
  private pathEl!: HTMLDivElement;
  private countsEl!: HTMLDivElement;
  private bubble: HTMLDivElement | null = null;
  private tableBar: HTMLDivElement | null = null;
  private slash: SlashMenu | null = null;
  private tableBarButtons: Array<{ el: HTMLButtonElement; def: ToolbarButton }> = [];
  private bubbleButtons: Array<{ el: HTMLButtonElement; def: ToolbarButton }> = [];
  private draftBar: HTMLDivElement | null = null;
  private buttons: Array<{ el: HTMLButtonElement; def: ToolbarButton }> = [];
  private widgets: ToolbarWidget[] = [];
  private viewEls: { visual?: HTMLButtonElement; code?: HTMLButtonElement; fullscreen?: HTMLButtonElement; toggle?: HTMLButtonElement } = {};
  private showRow2: boolean;
  private fullscreen = false;
  private adapter: MediaAdapter | null;
  private inputEl: HTMLInputElement | HTMLTextAreaElement | null = null;
  private replacedTextarea: { el: HTMLTextAreaElement; display: string } | null = null;
  private cleanups: Array<() => void> = [];
  private listeners = new Map<EventName, Set<(arg?: any) => void>>();
  private linkPopover: ZoroPopover;
  private linkRange: { from: number; to: number } | null = null;
  private colorPopover: ZoroPopover;
  private rafId = 0;
  private draftTimer: ReturnType<typeof setTimeout> | undefined;
  private sourceCursor = { start: 0, end: 0 };
  private sourceSnapshot = '';
  private lastColors = { text: '#50575e', bg: '#ffff00' };
  private destroyed = false;

  constructor(target: string | HTMLElement, options: ZoroEditorOptions = {}) {
    if (typeof document === 'undefined') throw new Error('ZoroEditor yalnızca tarayıcıda çalışır (SSR için zoro-editor/react kullanın).');
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (!el) throw new Error(`ZoroEditor: hedef eleman bulunamadı (${String(target)})`);

    this.options = { height: 400, autoGrow: true, statusBar: true, sourceMode: true, stickyToolbar: true, theme: 'light', ...options };
    this.t = resolveMessages(this.options.locale);
    this.groups = resolveGroups(this.options);
    this.adapter = this.options.media === false ? null : createAdapter(this.options.media ?? {});
    this.showRow2 = readPref('zoro-kitchen-sink') === '1';
    this.linkPopover = new ZoroPopover('', () => { this.linkRange = null; });
    this.colorPopover = new ZoroPopover('');

    let initial = this.options.content;
    if (el instanceof HTMLTextAreaElement) {
      // <textarea> verildiyse onun yerine geç ve değeri ona yaz (TinyMCE gibi)
      initial ??= el.value;
      this.inputEl = el;
      this.replacedTextarea = { el, display: el.style.display };
      el.style.display = 'none';
      this.buildDom();
      el.insertAdjacentElement('afterend', this.root);
    } else {
      this.buildDom();
      el.appendChild(this.root);
    }
    if (!this.inputEl && this.options.input) {
      this.inputEl = typeof this.options.input === 'string' ? document.querySelector(this.options.input) : this.options.input;
      if (this.inputEl && initial == null) initial = this.inputEl.value;
    }

    this.initEditor(initial ?? '');
    installTooltips();
    this.slash = new SlashMenu(this.editor, this);
    this.renderToolbar();
    this.bindEvents();
    this.updateCounts();
    this.setupDraft(initial ?? '');
    this.syncInput();
    queueMicrotask(() => {
      if (this.destroyed) return;
      this.options.onReady?.(this);
      this.emit('ready', this);
    });
  }

  // ───────────────────────── Ortak API ─────────────────────────

  /** Temizlenmiş HTML. Boş editörde "" döner. */
  getHTML(): string {
    if (this.mode === 'code') return this.sourceEl.value.trim();
    if (!this.editor || this.docIsEmpty()) return '';
    const html = this.editor.getHTML().replace(/<img[^>]*src="blob:[^"]*"[^>]*>/g, ''); // yüklenmekte olan görseller
    return cleanHTML(html);
  }

  getText(): string {
    return this.editor?.getText() ?? '';
  }

  isEmpty(): boolean {
    return this.mode === 'code' ? !this.sourceEl.value.trim() : this.docIsEmpty();
  }

  /** Sadece tek boş paragraf = boş. (TipTap isEmpty, boş hücreli tabloyu da boş sayar.) */
  private docIsEmpty(): boolean {
    const doc = this.editor.state.doc;
    const first = doc.firstChild;
    return doc.childCount === 0 || (doc.childCount === 1 && !!first && first.type.name === 'paragraph' && first.content.size === 0);
  }

  /** İçeriği değiştir. emit=true ise onChange tetiklenir. */
  setContent(html: string, emit = false): void {
    if (this.destroyed) return;
    this.editor.commands.setContent(html || '', { emitUpdate: false });
    this.sourceEl.value = this.mode === 'code' ? cleanHTML(this.editor.getHTML()) : '';
    this.updateCounts();
    this.syncInput();
    if (emit) this.fireChange();
  }

  /** İmlecin olduğu yere HTML ekle. */
  insertHTML(html: string): void {
    if (this.mode === 'code') this.insertIntoSource(html);
    else this.editor.chain().focus().insertContent(html).run();
  }

  insertImage(img: { src: string; alt?: string; title?: string; srcset?: string | null; width?: number; height?: number }): void {
    if (this.mode === 'code') {
      this.insertIntoSource(`<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt ?? '')}"${img.srcset ? ` srcset="${escapeHtml(img.srcset)}"` : ''}>`);
      return;
    }
    this.editor.chain().focus().setImage({ ...img, srcset: img.srcset ?? null }).run();
  }

  focus(): void {
    if (this.mode === 'code') this.sourceEl.focus();
    else this.editor.commands.focus();
  }

  setReadOnly(readOnly: boolean): void {
    this.options.readOnly = readOnly;
    this.editor.setEditable(!readOnly);
    this.root.classList.toggle('zoro-readonly', readOnly);
    this.sourceEl.readOnly = readOnly;
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.options.theme = theme;
    this.root.classList.remove('zoro-theme-dark', 'zoro-theme-auto');
    if (theme !== 'light') this.root.classList.add(`zoro-theme-${theme}`);
    this.hideBubble();
  }

  /** Tek hamlede grup ekle: `editor.addGroups(['table', 'color'])` */
  addGroups(groups: GroupName[]): void {
    this.setGroups([...this.groups, ...groups]);
  }

  removeGroups(groups: GroupName[]): void {
    this.setGroups(this.groups.filter((g) => !groups.includes(g)));
  }

  setPreset(preset: PresetName, extra?: { addGroups?: GroupName[]; removeGroups?: GroupName[] }): void {
    this.groups = resolveGroups({ preset, ...extra });
    this.renderToolbar();
  }

  setGroups(groups: GroupName[]): void {
    this.groups = resolveGroups({ groups });
    this.renderToolbar();
  }

  getGroups(): GroupName[] {
    return [...this.groups];
  }

  hasGroup(name: GroupName): boolean {
    return this.groups.includes(name);
  }

  on(event: EventName, fn: (arg?: any) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  setMode(mode: Mode): void {
    if (mode === this.mode || (mode === 'code' && this.options.sourceMode === false)) return;
    if (mode === 'code') {
      // Girintili HTML + imleci aynı bloğa taşı
      const { html, blockStarts } = formatHTML(this.getHTML());
      const blockIndex = this.editor.state.selection.$from.index(0);
      this.sourceEl.value = html;
      this.sourceSnapshot = html;
      this.mode = 'code';
      this.contentEl.hidden = true;
      this.sourceEl.hidden = false;
      this.autosizeSource();
      const caret = blockStarts[Math.min(blockIndex, blockStarts.length - 1)] ?? 0;
      this.sourceCursor = { start: caret, end: caret };
      requestAnimationFrame(() => {
        this.sourceEl.setSelectionRange(caret, caret);
        this.revealSourceCaret(caret);
      });
    } else {
      const value = this.sourceEl.value;
      const caret = this.sourceEl.selectionStart ?? 0;
      // Kaynak değişmediyse yeniden yükleme: geri-al geçmişi ve seçim korunur
      if (value !== this.sourceSnapshot) {
        this.editor.commands.setContent(value, { emitUpdate: false });
        const doc = this.editor.state.doc;
        const index = Math.min(blockIndexAt(value, caret), doc.childCount - 1);
        let pos = 0;
        for (let i = 0; i < index; i++) pos += doc.child(i).nodeSize;
        try {
          this.editor.view.dispatch(this.editor.state.tr.setSelection(TextSelection.near(doc.resolve(Math.min(pos + 1, doc.content.size)))).scrollIntoView());
        } catch { /* */ }
      }
      this.mode = 'visual';
      this.sourceEl.hidden = true;
      this.contentEl.hidden = false;
    }
    this.root.classList.toggle('zoro-mode-code', this.mode === 'code');
    this.viewEls.visual?.classList.toggle('active', this.mode === 'visual');
    this.viewEls.code?.classList.toggle('active', this.mode === 'code');
    this.viewEls.visual?.setAttribute('aria-pressed', String(this.mode === 'visual'));
    this.viewEls.code?.setAttribute('aria-pressed', String(this.mode === 'code'));
    this.scheduleToolbarUpdate();
    this.emit('mode', this.mode);
    this.focus();
  }

  toggleFullscreen(force?: boolean): void {
    this.fullscreen = force ?? !this.fullscreen;
    this.root.classList.toggle('zoro-fullscreen', this.fullscreen);
    document.body.classList.toggle('zoro-scroll-lock', this.fullscreen || !!document.querySelector('.zoro-dialog-overlay'));
    const b = this.viewEls.fullscreen;
    if (b) {
      b.innerHTML = this.fullscreen ? ICONS.minimize : ICONS.maximize;
      const label = this.fullscreen ? this.t.exitFullscreen : this.t.fullscreen;
      b.setAttribute('data-tip', label);
      b.setAttribute('aria-label', label);
      b.setAttribute('aria-pressed', String(this.fullscreen));
    }
    this.focus();
  }

  /** Medya kütüphanesini aç (ya da sadece dosya seçici). */
  openMedia(): void {
    if (this.adapter) {
      this.finder({ multiple: true, onSelect: (items) => this.insertMedia(items) });
      return;
    }
    if (this.options.onImageUpload) {
      const input = h('input', { type: 'file', accept: (this.mediaOpts.accept ?? DEFAULT_ACCEPT).join(','), multiple: true });
      input.addEventListener('change', () => this.handleFiles(Array.from(input.files ?? []), null));
      input.click();
      return;
    }
    toast(this.t.uploadNotConfigured, 'error', this.themeClass);
  }

  /** Bu editörün ayarlarıyla bir Finder aç. */
  finder(opts: { multiple?: boolean; onSelect?: (items: SelectedMedia[]) => void; files?: File[] } = {}): ZoroFinder | null {
    if (!this.adapter) return null;
    const m = this.mediaOpts;
    const f = new ZoroFinder({
      adapter: this.adapter,
      messages: this.t,
      themeClass: this.themeClass,
      multiple: opts.multiple,
      accept: m.accept,
      maxSizeMB: m.maxSizeMB,
      requireAlt: m.requireAlt,
      folders: m.folders,
      onSelect: opts.onSelect,
      tab: opts.files?.length ? 'upload' : 'library',
      onClose: () => this.mode === 'visual' && this.editor.commands.focus(),
    }).open();
    if (opts.files?.length) f.addFiles(opts.files);
    return f;
  }

  insertMedia(items: SelectedMedia[]): void {
    const variant = this.mediaOpts.insertVariant ?? 'lg';
    if (this.mode === 'code') {
      for (const it of items) {
        const s = pickInsertSource(it, variant);
        this.insertIntoSource(`<img src="${escapeHtml(s.src)}" alt="${escapeHtml(it.insertAlt)}"${s.srcset ? ` srcset="${escapeHtml(s.srcset)}" sizes="(max-width: 768px) 100vw, 768px"` : ''}>`);
      }
      return;
    }
    const nodes = items.map((it) => {
      const s = pickInsertSource(it, variant);
      return { type: 'image', attrs: { src: s.src, alt: it.insertAlt || null, srcset: s.srcset, sizes: s.srcset ? '(max-width: 768px) 100vw, 768px' : null, caption: it.caption || null } };
    });
    this.editor.chain().focus().insertContent(nodes).run();
  }

  /** Taslağı sil (içerik kaydedildikten sonra çağır). */
  clearDraft(): void {
    const key = this.draftKey;
    if (key) writePref(key, null);
    this.draftBar?.remove();
    this.draftBar = null;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.draftTimer);
    this.linkPopover.close();
    this.colorPopover.close();
    this.hideBubble();
    this.hideTableBar();
    this.slash?.close();
    for (const w of this.widgets) w.destroy?.();
    for (const c of this.cleanups) c();
    this.cleanups = [];
    if (this.fullscreen) this.toggleFullscreen(false);
    this.editor?.destroy();
    this.root.remove();
    if (this.replacedTextarea) this.replacedTextarea.el.style.display = this.replacedTextarea.display;
    this.emit('destroy');
    this.listeners.clear();
  }

  get isDestroyed(): boolean {
    return this.destroyed;
  }

  // ───────────────────────── Kurulum ─────────────────────────

  /** Dialog/açılır kutulara da aktarılan görünüm sınıfları. */
  get themeClass(): string {
    const th = this.options.theme;
    return [`zoro-skin-${this.skin}`, th && th !== 'light' ? `zoro-theme-${th}` : ''].filter(Boolean).join(' ');
  }

  get skin(): 'modern' | 'classic' {
    return this.options.skin === 'classic' ? 'classic' : 'modern';
  }

  setSkin(skin: 'modern' | 'classic'): void {
    this.root.classList.remove(`zoro-skin-${this.skin}`);
    this.options.skin = skin;
    this.root.classList.add(`zoro-skin-${skin}`);
    this.hideBubble();
    this.renderToolbar();
  }

  private get mediaOpts() {
    return this.options.media || {};
  }

  private get draftKey(): string | null {
    const a = this.options.autosave;
    if (!a) return null;
    return 'zoro-draft:' + (typeof a === 'string' ? a : a.key);
  }

  private get mediaAvailable(): boolean {
    return this.options.media !== false && (!!this.adapter || !!this.options.onImageUpload);
  }

  private buildDom() {
    const t = this.t;
    this.root = h('div', {
      class: ['zoro-root', 'zoro-editor-wrapper', this.themeClass, this.options.readOnly ? 'zoro-readonly' : '', this.options.className ?? ''].filter(Boolean).join(' '),
      id: this.id,
    });
    const sticky = this.options.stickyToolbar;
    if (sticky !== false) {
      this.root.classList.add('zoro-sticky');
      if (typeof sticky === 'number') this.root.style.setProperty('--zoro-sticky-top', `${sticky}px`);
    }

    this.topBar = h('div', { class: 'zoro-topbar' });
    this.toolbarEl = h('div', { class: 'zoro-toolbar', role: 'toolbar', 'aria-label': t.toolbarLabel, 'aria-controls': `${this.id}-content` });
    this.row1 = h('div', { class: 'zoro-toolbar-row zoro-row1' });
    this.row2 = h('div', { class: 'zoro-toolbar-row zoro-row2' });
    this.toolbarEl.append(this.row1, this.row2);

    this.contentEl = h('div', { class: 'zoro-content', id: `${this.id}-content` });
    const height = this.options.height!;
    this.contentEl.style.setProperty('--zoro-height', `${height}px`);
    if (!this.options.autoGrow) this.contentEl.classList.add('zoro-fixed-height');

    this.sourceEl = h('textarea', {
      class: 'zoro-source',
      hidden: true,
      spellcheck: false,
      placeholder: t.sourcePlaceholder,
      'aria-label': t.source,
      autocapitalize: 'off',
      autocomplete: 'off',
    });
    this.sourceEl.style.minHeight = `${height}px`;
    this.sourceEl.readOnly = !!this.options.readOnly;

    this.statusEl = h('div', { class: 'zoro-status-bar', 'aria-live': 'off' });
    this.pathEl = h('div', { class: 'zoro-path', 'aria-label': t.path });
    this.countsEl = h('div', { class: 'zoro-counts' });
    this.statusEl.append(this.pathEl, this.countsEl);
    if (this.options.statusBar === false) this.statusEl.hidden = true;

    this.frame = h('div', { class: 'zoro-frame' }, this.toolbarEl, this.contentEl, this.sourceEl, this.statusEl);
    this.root.append(this.topBar, this.frame);
  }

  private initEditor(content: string) {
    const t = this.t;
    const groupExts = this.groups.flatMap((g) => getGroup(g)?.extensions ?? []);
    const LinkExt = Link.extend({
      addAttributes() {
        return { ...this.parent?.(), title: { default: null } };
      },
    }).configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      defaultProtocol: 'https',
      // v3 varsayılanı her bağlantıya target=_blank + nofollow ekler; SEO için kapatıyoruz.
      HTMLAttributes: { target: null, rel: null, class: null },
      isAllowedUri: (url, ctx) => isSafeUrl(url) && ctx.defaultValidate(url),
    });

    const extensions: AnyExtension[] = [
      StarterKit.configure({ link: false, heading: { levels: [1, 2, 3, 4, 5, 6] }, undoRedo: { depth: 200 } }),
      LinkExt,
      ResizableImage.configure({ messages: t, themeClass: () => this.themeClass }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Table.configure({ resizable: true, cellMinWidth: 48 }),
      TableRow,
      TableCell.extend({ addAttributes() { return { ...this.parent?.(), ...cellBackground }; } }),
      TableHeader.extend({ addAttributes() { return { ...this.parent?.(), ...cellBackground }; } }),
      Youtube.configure({ nocookie: true, modestBranding: true, width: 640, height: 360 }),
      Placeholder.configure({ placeholder: this.options.placeholder ?? t.placeholder }),
      CharacterCount.configure({ limit: this.options.maxLength ?? null }),
      ...groupExts,
      ...(this.options.extensions ?? []),
    ];

    this.editor = new Editor({
      element: this.contentEl,
      extensions,
      content,
      editable: !this.options.readOnly,
      injectCSS: false,
      editorProps: {
        attributes: {
          class: 'zoro-prose',
          'aria-label': t.editorLabel,
          role: 'textbox',
          'aria-multiline': 'true',
        },
        handleKeyDown: (_view, event) => (this.slashEnabled && this.slash ? this.slash.onKeyDown(event) : false),
        transformPastedHTML: (html) => {
          const r = cleanPasted(html);
          if (r.droppedLocalImages) toast(fmt(t.localImagesDropped, { n: r.droppedLocalImages }), 'info', this.themeClass, 5000);
          return r.html;
        },
        handlePaste: (_view, event) => {
          const cd = event.clipboardData;
          const files = Array.from(cd?.files ?? []);
          if (!files.length) return this.smartPaste(cd);
          // Excel/Word/Google Docs tabloyu hem HTML hem de resim olarak panoya koyar:
          // HTML'de görsel dışında gerçek içerik varsa resmi değil içeriği yapıştır.
          const html = cd?.getData('text/html') ?? '';
          if (html && html.replace(/<img[^>]*>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;|\s/g, '')) return false;
          return this.handleFiles(files, null);
        },
        handleDrop: (view, event, _slice, moved) => {
          if (moved) return false;
          const files = Array.from(event.dataTransfer?.files ?? []);
          if (!files.length) return false;
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? null;
          event.preventDefault();
          return this.handleFiles(files, pos);
        },
      },
      onUpdate: () => this.fireChange(),
      onSelectionUpdate: () => {
        this.scheduleToolbarUpdate();
        this.syncLinkPopover();
      },
      onTransaction: () => {
        this.scheduleToolbarUpdate();
        if (this.slash) {
          if (this.slashEnabled && this.mode === 'visual') this.slash.update();
          else this.slash.close();
        }
      },
      onFocus: () => {
        this.root.classList.add('zoro-focused');
        this.options.onFocus?.();
        this.emit('focus');
      },
      onBlur: () => {
        this.root.classList.remove('zoro-focused');
        // Baloncuk düğmesine tıklayınca odak editörde kalır; gerçekten çıkıldıysa gizle
        requestAnimationFrame(() => {
          if (this.editor?.view.hasFocus()) return;
          this.slash?.close();
          this.hideBubble();
          // Tablo araç çubuğundaki bir açılır kutu (hücre rengi) odak alırsa çubuğu koru
          if (!document.querySelector('.zoro-popover')) this.hideTableBar();
        });
        this.options.onBlur?.();
        this.emit('blur');
      },
    });
  }

  private fireChange() {
    if (this.destroyed) return;
    const html = this.getHTML();
    this.updateCounts();
    this.syncInput(html);
    this.scheduleDraft(html);
    this.options.onChange?.(html);
    this.emit('change', html);
  }

  private emit(event: EventName, arg?: any) {
    this.listeners.get(event)?.forEach((fn) => {
      try { fn(arg); } catch (e) { console.error(e); }
    });
  }

  private syncInput(html = this.getHTML()) {
    if (this.inputEl && this.inputEl.value !== html) {
      this.inputEl.value = html;
      this.inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private updateCounts() {
    if (this.options.statusBar === false) return;
    const t = this.t;
    // Görsel modda sayımı CharacterCount yapar (HTML üretmeden, her tuşta ucuz)
    const visual = this.mode === 'visual' && !!this.editor;
    const html = visual ? '' : this.sourceEl.value;
    const words = visual ? this.editor.storage.characterCount.words() : countWords(html);
    const chars = visual ? this.editor.storage.characterCount.characters() : countChars(html);
    const max = this.options.maxLength;
    this.countsEl.innerHTML = '';
    this.countsEl.append(
      h('span', {}, `${words} ${t.words}`),
      h('span', { class: max && chars >= max ? 'zoro-limit' : '' }, max ? `${chars} / ${max} ${t.chars}` : `${chars} ${t.chars}`),
    );
  }

  /** Durum çubuğunda imlecin bulunduğu öğe yolu: ul › li › p › strong */
  private updatePath() {
    if (this.options.statusBar === false || !this.editor) return;
    const NAMES: Record<string, string> = {
      paragraph: 'p', bulletList: 'ul', orderedList: 'ol', listItem: 'li', blockquote: 'blockquote', codeBlock: 'pre',
      table: 'table', tableRow: 'tr', tableCell: 'td', tableHeader: 'th', image: 'img', horizontalRule: 'hr', youtube: 'iframe',
    };
    const MARKS: Record<string, string> = { bold: 'strong', italic: 'em', underline: 'u', strike: 's', code: 'code', link: 'a', highlight: 'mark' };
    const { selection } = this.editor.state;
    const parts: string[] = [];
    if (this.mode === 'code') {
      parts.push('HTML');
    } else {
      const $from = selection.$from;
      for (let d = 1; d <= $from.depth; d++) {
        const n = $from.node(d);
        parts.push(n.type.name === 'heading' ? `h${n.attrs.level}` : NAMES[n.type.name] ?? n.type.name);
      }
      const sel = selection as any;
      if (sel.node) parts.push(NAMES[sel.node.type.name] ?? sel.node.type.name);
      else for (const m of $from.marks()) if (MARKS[m.type.name]) parts.push(MARKS[m.type.name]!);
    }
    const text = parts.join(' › ');
    if (this.pathEl.textContent !== text) this.pathEl.textContent = text;
  }

  // ───────────────────────── Baloncuk menü (metin seçilince) ─────────────────────────

  private get slashEnabled(): boolean {
    return this.options.slashMenu ?? this.skin === 'modern';
  }

  private get bubbleEnabled(): boolean {
    return this.options.bubbleMenu ?? this.skin === 'modern';
  }

  private bubbleDefs(): ToolbarButton[] {
    const pick = ['bold', 'italic', 'underline', 'strike', 'code', 'link'];
    const all = [...(getGroup('format')?.items as ToolbarButton[]), ...(getGroup('link')?.items as ToolbarButton[])];
    const defs = pick.map((n) => all.find((d) => d.name === n)).filter(Boolean) as ToolbarButton[];
    if (this.hasGroup('color')) {
      defs.push({ name: 'bubbleHighlight', icon: ICONS.bgColor('#ffe066'), title: (t) => t.bgColor, run: ({ editor }) => applyMark(editor, 'toggleHighlight', { color: '#ffe066' }), isActive: ({ editor }) => editor.isActive('highlight') });
    }
    return defs;
  }

  private updateBubble() {
    const ed = this.editor;
    if (ed?.view.composing) return;
    if (!this.bubbleEnabled || !ed || this.mode !== 'visual' || !ed.isEditable || this.destroyed) return this.hideBubble();
    const { selection } = ed.state;
    const isText = !selection.empty && !(selection as any).node && !ed.isActive('codeBlock');
    const text = isText ? ed.state.doc.textBetween(selection.from, selection.to, ' ').trim() : '';
    if (!text || !ed.view.hasFocus() || this.linkPopover.isOpen) return this.hideBubble();
    if (!this.bubble) {
      this.bubble = h('div', { class: `zoro-root zoro-bubble ${this.themeClass}`, role: 'toolbar', 'aria-label': this.t.formatMenu });
      this.bubbleButtons = this.bubbleDefs().map((def) => {
        const el = this.makeButton(def);
        el.classList.add('zoro-bubble-btn');
        this.bubble!.append(el);
        return { el, def };
      });
      document.body.append(this.bubble);
    }
    for (const { el, def } of this.bubbleButtons) {
      let on = false;
      try { on = !!def.isActive?.(this.ctx); } catch { /* */ }
      el.classList.toggle('zoro-toolbar-btn-active', on);
      el.setAttribute('aria-pressed', String(on));
    }
    const a = ed.view.coordsAtPos(selection.from);
    const b = ed.view.coordsAtPos(selection.to);
    const box = this.bubble.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    const c = this.contentEl.getBoundingClientRect();
    const mid = Math.abs(a.top - b.top) < 4 ? (a.left + b.right) / 2 : (c.left + c.right) / 2;
    // Seçim görünür içerik alanının dışındaysa (kaydırıldı / yapışık araç çubuğunun altında) gizle
    const toolbarBottom = this.options.stickyToolbar !== false ? this.toolbarEl.getBoundingClientRect().bottom : 0;
    const minTop = Math.max(8, toolbarBottom + 4, c.top);
    const maxBottom = Math.min(window.innerHeight, c.bottom);
    this.bubble.style.visibility = b.bottom < minTop || a.top > maxBottom ? 'hidden' : '';
    // Dokunmatikte sistemin kopyala/yapıştır menüsüyle çakışmasın diye seçimin altında
    let top = coarse ? b.bottom + 12 : a.top - box.height - 10;
    if (top < minTop) top = b.bottom + 12;
    this.bubble.style.top = `${Math.round(top)}px`;
    this.bubble.style.left = `${Math.round(Math.max(8, Math.min(mid - box.width / 2, vw - box.width - 8)))}px`;
  }

  // ───────────────────────── Tablo bağlam araç çubuğu ─────────────────────────

  private tableDefs(): ToolbarButton[] {
    const c = (fn: (ch: any) => any) => ({ editor }: ToolbarContext) => fn(editor.chain().focus()).run();
    const can = (fn: (ch: any) => any) => ({ editor }: ToolbarContext) => !!fn(editor.can().chain().focus()).run();
    return [
      { name: 'tRowBefore', icon: ICONS.rowAbove, title: (t) => t.tableAddRowBefore, run: c((x) => x.addRowBefore()) },
      { name: 'tRowAfter', icon: ICONS.rowBelow, title: (t) => t.tableAddRowAfter, run: c((x) => x.addRowAfter()) },
      { name: 'tRowDelete', icon: ICONS.rowDelete, title: (t) => t.tableDeleteRow, run: c((x) => x.deleteRow()) },
      { name: 'tColBefore', icon: ICONS.colLeft, title: (t) => t.tableAddColBefore, run: c((x) => x.addColumnBefore()) },
      { name: 'tColAfter', icon: ICONS.colRight, title: (t) => t.tableAddColAfter, run: c((x) => x.addColumnAfter()) },
      { name: 'tColDelete', icon: ICONS.colDelete, title: (t) => t.tableDeleteCol, run: c((x) => x.deleteColumn()) },
      { name: 'tMerge', icon: ICONS.merge, title: (t) => t.tableMerge, run: c((x) => x.mergeOrSplit()), isEnabled: can((x) => x.mergeOrSplit()) },
      { name: 'tHeaderRow', icon: ICONS.headerRow, title: (t) => t.tableToggleHeader, run: c((x) => x.toggleHeaderRow()) },
      { name: 'tHeaderCol', icon: ICONS.headerCol, title: (t) => t.tableToggleHeaderCol, run: c((x) => x.toggleHeaderColumn()) },
      { name: 'tCellBg', icon: ICONS.bgColor('#cfe2f3'), title: (t) => t.tableCellBg, run: ({ zoro }, e) => zoro.openCellColor(e.currentTarget as HTMLElement) },
      { name: 'tDelete', icon: ICONS.trash, title: (t) => t.tableDelete, run: c((x) => x.deleteTable()) },
    ];
  }

  private updateTableBar() {
    const ed = this.editor;
    const show = !!ed && this.hasGroup('table') && this.mode === 'visual' && ed.isEditable && ed.isActive('table') && ed.view.hasFocus() && !this.destroyed;
    if (!show) return this.hideTableBar();
    // İmlecin bulunduğu tablonun DOM'u
    const $pos = ed.state.selection.$from;
    let tablePos = -1;
    for (let d = $pos.depth; d > 0; d--) if ($pos.node(d).type.name === 'table') { tablePos = $pos.before(d); break; }
    const dom = tablePos >= 0 ? (ed.view.nodeDOM(tablePos) as HTMLElement | null) : null;
    if (!dom) return this.hideTableBar();
    if (!this.tableBar) {
      this.tableBar = h('div', { class: `zoro-root zoro-context-bar ${this.themeClass}`, role: 'toolbar', 'aria-label': this.t.tableToolbar });
      const groups = [[0, 3], [3, 6], [6, 7], [7, 10], [10, 11]];
      const defs = this.tableDefs();
      this.tableBarButtons = [];
      for (const [a, b] of groups) {
        const g = h('div', { class: 'zoro-group' });
        for (const def of defs.slice(a, b)) {
          const el = this.makeButton(def);
          if (def.name === 'tDelete') el.classList.add('zoro-danger-btn');
          this.tableBarButtons.push({ el, def });
          g.append(el);
        }
        this.tableBar.append(g);
      }
      document.body.append(this.tableBar);
    }
    for (const { el, def } of this.tableBarButtons) {
      try { el.disabled = def.isEnabled ? !def.isEnabled(this.ctx) : false; } catch { el.disabled = false; }
    }
    const r = dom.getBoundingClientRect();
    const box = this.tableBar.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const toolbarBottom = this.options.stickyToolbar !== false ? this.toolbarEl.getBoundingClientRect().bottom : 0;
    const content = this.contentEl.getBoundingClientRect();
    let top = r.top - box.height - 8;
    if (top < Math.max(8, toolbarBottom + 4)) top = r.bottom + 8; // üstte yer yoksa tablonun altına
    // Tablo görünür alanın dışındaysa gizle
    const visible = r.bottom > Math.max(toolbarBottom, content.top) && r.top < Math.min(window.innerHeight, content.bottom);
    this.tableBar.style.visibility = visible ? '' : 'hidden';
    this.tableBar.style.top = `${Math.round(Math.min(top, window.innerHeight - box.height - 8))}px`;
    this.tableBar.style.left = `${Math.round(Math.max(8, Math.min(r.left, vw - box.width - 8)))}px`;
  }

  private hideTableBar() {
    this.tableBar?.remove();
    this.tableBar = null;
    this.tableBarButtons = [];
  }

  /** Seçili hücre(ler)in zemin rengi. */
  openCellColor(anchor: HTMLElement): void {
    const t = this.t;
    const pop = new ZoroPopover(this.themeClass);
    const apply = (color: string | null) => {
      pop.close();
      this.editor.chain().focus().setCellAttribute('backgroundColor', color).run();
    };
    const grid = h('div', { class: 'zoro-color-grid' });
    for (const color of CELL_COLORS) {
      grid.append(h('button', { type: 'button', class: 'zoro-color-swatch', title: color, 'aria-label': color, style: { backgroundColor: color }, onmousedown: (e: Event) => e.preventDefault(), onclick: () => apply(color) }));
    }
    pop.open(h('div', {}, grid, h('button', { type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-sm zoro-btn-block', onmousedown: (e: Event) => e.preventDefault(), onclick: () => apply(null) }, t.removeColor)), anchor);
  }

  private hideBubble() {
    this.bubble?.remove();
    this.bubble = null;
    this.bubbleButtons = [];
  }

  // ───────────────────────── Araç çubuğu ─────────────────────────

  private get ctx(): ToolbarContext {
    return { editor: this.editor, zoro: this, t: this.t };
  }

  private renderToolbar() {
    const t = this.t;
    for (const w of this.widgets) w.destroy?.();
    this.widgets = [];
    this.buttons = [];
    this.viewEls = {};
    this.row1.innerHTML = '';
    this.row2.innerHTML = '';
    this.topBar.innerHTML = '';

    const r1 = h('div', { class: 'zoro-toolbar-controls' });
    const r2 = h('div', { class: 'zoro-toolbar-controls' });
    const r2end = h('div', { class: 'zoro-toolbar-end' });

    for (const name of this.groups) {
      if (name === 'view') continue;
      if (name === 'media' && !this.mediaAvailable) continue;
      const group = getGroup(name);
      if (!group) continue;
      const rowDefault = group.row ?? 1;
      const wrapper1 = h('div', { class: 'zoro-group', 'data-group': name });
      const wrapper2 = h('div', { class: 'zoro-group', 'data-group': name });
      if (typeof group.items === 'function') {
        const w = group.items(this.ctx);
        this.widgets.push(w);
        (rowDefault === 1 ? wrapper1 : wrapper2).append(w.el);
      } else {
        for (const def of group.items) {
          const el = this.makeButton(def);
          this.buttons.push({ el, def });
          ((def.row ?? rowDefault) === 1 ? wrapper1 : wrapper2).append(el);
        }
      }
      // geri al/ileri al/yardım ikinci satırın sağına
      const target2 = name === 'history' || name === 'help' ? r2end : r2;
      if (wrapper1.childElementCount) r1.append(wrapper1);
      if (wrapper2.childElementCount) target2.append(wrapper2);
    }

    const hasRow2 = r2.childElementCount + r2end.childElementCount > 0;
    if (hasRow2) {
      const toggle = this.makeButton({
        name: 'toolbarToggle',
        icon: this.skin === 'modern' ? ICONS.more : ICONS.toolbarToggle,
        title: this.skin === 'modern' ? t.more : t.toolbarToggle,
        run: () => this.toggleRow2(),
        isActive: () => this.showRow2,
      });
      this.buttons.push({ el: toggle, def: { name: 'toolbarToggle', icon: '', title: '', run: () => {}, isActive: () => this.showRow2 } });
      this.viewEls.toggle = toggle;
      r1.append(h('div', { class: 'zoro-group' }, toggle));
    }

    this.row1.append(r1);
    if (this.groups.includes('view')) {
      const end = h('div', { class: 'zoro-toolbar-end' });
      if (this.options.sourceMode !== false) {
        this.viewEls.visual = h('button', { type: 'button', class: 'active', 'aria-pressed': 'true', html: `${ICONS.eye}<span>${t.visual}</span>`, onclick: () => this.setMode('visual') });
        this.viewEls.code = h('button', { type: 'button', 'aria-pressed': 'false', html: `${ICONS.codeSmall}<span>${t.source}</span>`, onclick: () => this.setMode('code') });
        this.viewEls.visual.classList.toggle('active', this.mode === 'visual');
        this.viewEls.code.classList.toggle('active', this.mode === 'code');
        end.append(h('div', { class: 'zoro-tab-toggle', role: 'group' }, this.viewEls.visual, h('div', { class: 'zoro-tab-toggle-divider' }), this.viewEls.code));
      }
      this.viewEls.fullscreen = this.makeButton({ name: 'fullscreen', icon: this.fullscreen ? ICONS.minimize : ICONS.maximize, title: this.fullscreen ? t.exitFullscreen : t.fullscreen, run: () => this.toggleFullscreen(), keepFocus: false });
      end.append(this.viewEls.fullscreen);
      this.row1.append(end);
    }
    this.row2.append(r2, r2end);
    this.row2.hidden = !(hasRow2 && this.showRow2);
    this.toolbarEl.hidden = !this.row1.textContent && !r1.childElementCount && !this.groups.includes('view');

    if (this.groups.includes('media') && this.mediaAvailable) {
      this.topBar.append(h('button', {
        type: 'button',
        class: 'zoro-btn zoro-btn-secondary zoro-btn-sm zoro-add-media',
        html: `${ICONS.imagePlus}<span>${t.addMedia}</span>`,
        onclick: () => this.openMedia(),
      }));
    }
    this.topBar.hidden = !this.topBar.childElementCount;
    this.setupRovingTabindex();
    this.scheduleToolbarUpdate();
  }

  private makeButton(def: ToolbarButton): HTMLButtonElement {
    const title = typeof def.title === 'function' ? def.title(this.t) : def.title;
    // title yerine data-tip: özel ipucu (kısayol ayrı gösterilir); erişilebilir ad aria-label'da
    const b = h('button', { type: 'button', class: 'zoro-toolbar-btn', 'data-tip': title, 'aria-label': splitShortcut(title).label, 'aria-keyshortcuts': splitShortcut(title).keys || null, 'data-name': def.name, html: def.icon, tabindex: '-1' });
    if (def.isActive) b.setAttribute('aria-pressed', 'false');
    if (def.keepFocus !== false) b.addEventListener('mousedown', (e) => e.preventDefault());
    b.addEventListener('click', (e) => {
      if (b.disabled) return;
      def.run(this.ctx, e);
      this.scheduleToolbarUpdate();
    });
    return b;
  }

  private setupRovingTabindex() {
    const all = Array.from(this.toolbarEl.querySelectorAll<HTMLElement>('button, .zoro-select-trigger'));
    all.forEach((b, i) => b.setAttribute('tabindex', i === 0 ? '0' : '-1'));
  }

  private onToolbarKey = (e: KeyboardEvent) => {
    const all = Array.from(this.toolbarEl.querySelectorAll<HTMLElement>('button, .zoro-select-trigger')).filter((b) => b.offsetParent !== null && !(b as HTMLButtonElement).disabled);
    const i = all.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % all.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + all.length) % all.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = all.length - 1;
    else if (e.key === 'Escape') { e.preventDefault(); this.focus(); return; }
    if (next < 0) return;
    e.preventDefault();
    all[i]!.setAttribute('tabindex', '-1');
    all[next]!.setAttribute('tabindex', '0');
    all[next]!.focus();
  };

  focusToolbar(): void {
    const first = this.toolbarEl.querySelector<HTMLElement>('[tabindex="0"]') ?? this.toolbarEl.querySelector<HTMLElement>('button');
    first?.focus();
  }

  toggleRow2(force?: boolean): void {
    this.showRow2 = force ?? !this.showRow2;
    writePref('zoro-kitchen-sink', this.showRow2 ? '1' : '0');
    this.row2.hidden = !this.showRow2 || !this.row2.querySelector('button');
    this.scheduleToolbarUpdate();
  }

  private scheduleToolbarUpdate() {
    if (this.rafId || this.destroyed) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.updateToolbarState();
    });
  }

  private updateToolbarState() {
    if (this.destroyed || !this.editor) return;
    const ctx = this.ctx;
    const code = this.mode === 'code';
    for (const { el, def } of this.buttons) {
      const isView = def.name === 'toolbarToggle' || def.name === 'fullscreen' || def.name === 'help' || def.name === 'image';
      let enabled = true;
      try { enabled = !code || isView ? (def.isEnabled ? (!code ? def.isEnabled(ctx) : true) : true) : false; } catch { enabled = true; }
      el.disabled = !enabled;
      if (def.isActive) {
        let active = false;
        try { active = !code && def.isActive(ctx); } catch { /* */ }
        el.classList.toggle('zoro-toolbar-btn-active', active);
        el.setAttribute('aria-pressed', String(active));
      }
    }
    for (const w of this.widgets) {
      try { w.update?.(); } catch { /* */ }
    }
    this.updatePath();
    this.updateBubble();
    this.updateTableBar();
  }

  // ───────────────────────── Olaylar / kısayollar ─────────────────────────

  private bindEvents() {
    const onScroll = () => {
      if (this.options.stickyToolbar !== false && !this.fullscreen) {
        const stickyTop = parseFloat(getComputedStyle(this.root).getPropertyValue('--zoro-sticky-top')) || 0;
        const tb = this.toolbarEl.getBoundingClientRect();
        const frame = this.frame.getBoundingClientRect();
        this.root.classList.toggle('zoro-stuck', tb.top <= stickyTop + 1 && frame.top < stickyTop - 1);
      }
      if (this.bubble) this.updateBubble();
      if (this.tableBar) this.updateTableBar();
      this.slash?.reposition();
    };
    window.addEventListener('scroll', onScroll, true);
    this.cleanups.push(() => window.removeEventListener('scroll', onScroll, true));
    const onKey = (e: KeyboardEvent) => this.onKeyDown(e);
    this.root.addEventListener('keydown', onKey);
    this.toolbarEl.addEventListener('keydown', this.onToolbarKey);
    // Araç çubuğunda bir menü/açılır kutu açılırken baloncuk üstünde kalmasın
    this.toolbarEl.addEventListener('pointerdown', () => this.hideBubble());
    this.cleanups.push(() => this.root.removeEventListener('keydown', onKey));

    const onSourceInput = () => {
      this.autosizeSource();
      this.fireChange();
    };
    const trackCursor = () => { this.sourceCursor = { start: this.sourceEl.selectionStart, end: this.sourceEl.selectionEnd }; };
    this.sourceEl.addEventListener('input', onSourceInput);
    for (const ev of ['select', 'click', 'keyup', 'blur']) this.sourceEl.addEventListener(ev, trackCursor);

    // Form gönderilirken son değeri yaz (kaynak modundayken de)
    const form = (this.inputEl ?? this.root).closest('form');
    if (form) {
      const sync = () => this.syncInput();
      form.addEventListener('submit', sync, true);
      form.addEventListener('formdata', sync);
      this.cleanups.push(() => { form.removeEventListener('submit', sync, true); form.removeEventListener('formdata', sync); });
    }
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.isComposing || e.keyCode === 229) return; // IME birleştirmesi sürerken kısayol yok
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === 'F10' && e.altKey) { e.preventDefault(); this.focusToolbar(); return; }
    // Açık kutular ESC'yi kendileri yakalar (capture); buraya ulaştıysa tam ekrandan çık
    if (e.key === 'Escape' && this.fullscreen && !document.querySelector('.zoro-dialog-overlay')) {
      e.preventDefault();
      this.toggleFullscreen(false);
      return;
    }
    if (mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k' && this.mode === 'visual' && this.hasGroup('link')) {
      e.preventDefault();
      this.openLinkPopover(true);
      return;
    }
    if (!(e.shiftKey && e.altKey) || mod) return;
    // e.code: klavye düzeninden bağımsız (Türkçe Q/F, Mac Option karakterleri)
    const code = e.code;
    const ed = this.editor;
    const visual = this.mode === 'visual';
    const map: Record<string, () => void> = {
      KeyZ: () => this.toggleRow2(),
      KeyH: () => this.showHelp(),
      KeyM: () => this.mediaAvailable && this.openMedia(),
    };
    if (visual) {
      for (let l = 1; l <= 6; l++) map[`Digit${l}`] = () => smartHeading(ed, l as 1);
      Object.assign(map, {
        Digit7: () => ed.chain().focus().setParagraph().run(),
        KeyQ: () => ed.chain().focus().toggleBlockquote().run(),
        KeyD: () => applyMark(ed, 'toggleStrike'),
        KeyX: () => ed.chain().focus().toggleCodeBlock().run(),
        KeyC: () => ed.chain().focus().setTextAlign('center').run(),
        KeyR: () => ed.chain().focus().setTextAlign('right').run(),
        KeyL: () => ed.chain().focus().setTextAlign('left').run(),
        KeyJ: () => ed.chain().focus().setTextAlign('justify').run(),
        KeyU: () => ed.chain().focus().toggleBulletList().run(),
        KeyO: () => ed.chain().focus().toggleOrderedList().run(),
        KeyS: () => ed.chain().focus().extendMarkRange('link').unsetLink().run(),
      });
    }
    const fn = map[code];
    if (fn) { e.preventDefault(); fn(); }
  }

  private insertIntoSource(text: string) {
    const ta = this.sourceEl;
    const { start, end } = this.sourceCursor;
    ta.focus();
    ta.setSelectionRange(start, end);
    // execCommand textarea'nın geri alma (Ctrl+Z) geçmişini korur; desteklenmezse setRangeText
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch { /* */ }
    if (!ok) {
      ta.setRangeText(text, start, end, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const pos = start + text.length;
    this.sourceCursor = { start: pos, end: pos };
  }

  /** Uzun kaynakta imlecin olduğu satırı görünür yap. */
  private revealSourceCaret(caret: number) {
    const ta = this.sourceEl;
    const line = ta.value.slice(0, caret).split('\n').length - 1;
    const lh = parseFloat(getComputedStyle(ta).lineHeight) || 20;
    const y = line * lh;
    if (ta.scrollHeight > ta.clientHeight + 4) ta.scrollTop = Math.max(0, y - ta.clientHeight / 3);
    else {
      const top = ta.getBoundingClientRect().top + y;
      if (top < 0 || top > window.innerHeight - 40) window.scrollBy({ top: top - window.innerHeight / 3 });
    }
  }

  private autosizeSource() {
    if (!this.options.autoGrow) return;
    const ta = this.sourceEl;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(this.options.height!, ta.scrollHeight + 2)}px`;
  }

  // ───────────────────────── Taslak ─────────────────────────

  private setupDraft(initial: string) {
    const key = this.draftKey;
    if (!key) return;
    let draft: { html: string; at: number } | null = null;
    try { draft = JSON.parse(readPref(key) ?? 'null'); } catch { /* */ }
    if (!draft?.html || draft.html.trim() === cleanHTML(initial).trim()) return;
    const t = this.t;
    const when = new Date(draft.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    this.draftBar = h('div', { class: 'zoro-draft-bar', role: 'status' },
      h('span', { class: 'zoro-draft-icon', html: ICONS.info }),
      h('span', { class: 'zoro-draft-text' }, t.draftFound, ' ', h('small', {}, when)),
      h('button', { type: 'button', class: 'zoro-link-action', onclick: () => { this.setContent(draft!.html, true); this.draftBar?.remove(); this.draftBar = null; } }, t.restore),
      h('button', { type: 'button', class: 'zoro-icon-action', 'aria-label': t.dismiss, title: t.dismiss, html: ICONS.close, onclick: () => this.clearDraft() }),
    );
    this.frame.insertBefore(this.draftBar, this.contentEl);
  }

  private scheduleDraft(html: string) {
    const key = this.draftKey;
    if (!key) return;
    const a = this.options.autosave;
    const delay = typeof a === 'object' && a.delay ? a.delay : 800;
    clearTimeout(this.draftTimer);
    this.draftTimer = setTimeout(() => writePref(key, JSON.stringify({ html, at: Date.now() })), delay);
  }

  // ───────────────────────── Görsel yükleme (yapıştır / sürükle) ─────────────────────────

  /**
   * Akıllı yapıştırma (TinyMCE/BlockNote fikri): tek bir URL yapıştırılınca
   * seçili metin → bağlantı, boş satırda YouTube → video, görsel adresi → görsel.
   */
  private smartPaste(cd: DataTransfer | null): boolean {
    if (!cd || this.options.readOnly) return false;
    const text = (cd.getData('text/plain') ?? '').trim();
    if (!/^https?:\/\/\S+$/i.test(text) || !isSafeUrl(text)) return false;
    const html = cd.getData('text/html') ?? '';
    // HTML'de bağlantı metninden başka içerik varsa normal yapıştır
    if (html && html.replace(/<[^>]+>/g, '').trim() !== text) return false;
    const ed = this.editor;
    if (ed.isActive('codeBlock') || ed.isActive('code')) return false;
    const { empty, from, to } = ed.state.selection;
    if (!empty && this.hasGroup('link')) {
      this.applyLink({ href: text }, { from, to });
      return true;
    }
    const lineEmpty = empty && ed.state.selection.$from.parent.content.size === 0;
    if (lineEmpty && this.hasGroup('embed') && isYoutubeUrl(text)) {
      ed.chain().focus().setYoutubeVideo({ src: text }).run();
      return true;
    }
    if (lineEmpty && /\.(jpe?g|png|gif|webp|avif)(\?[^\s]*)?$/i.test(text)) {
      ed.chain().focus().setImage({ src: text, alt: '' }).run();
      return true;
    }
    return false;
  }

  /** Dosyaları yükleyip editöre ekler. true = olay işlendi. */
  handleFiles(files: File[], pos: number | null): boolean {
    const accept = this.mediaOpts.accept ?? DEFAULT_ACCEPT;
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return false;
    if (this.options.media === false || this.options.readOnly) return true; // base64 gömmeyi engelle
    const t = this.t;
    const maxMB = this.mediaOpts.maxSizeMB ?? 20;
    const valid = images.filter((f) => {
      if (!accept.includes(f.type)) { toast(`${f.name}: ${t.badType}`, 'error', this.themeClass); return false; }
      if (f.size > maxMB * 1048576) { toast(`${f.name}: ${fmt(t.tooLarge, { max: maxMB })}`, 'error', this.themeClass); return false; }
      return true;
    });
    if (!valid.length) return true;

    if (this.adapter) {
      const requireAlt = this.mediaOpts.requireAlt !== false;
      const needAlt = valid.filter((f) => requireAlt && !altFromFilename(f.name));
      const direct = valid.filter((f) => !needAlt.includes(f));
      // ALT türetilemeyenler için Finder açılır (kullanıcı ALT yazar)
      if (needAlt.length) {
        if (pos !== null) this.editor.commands.setTextSelection(pos);
        this.finder({ multiple: true, files: needAlt, onSelect: (items) => this.insertMedia(items) });
      }
      for (const f of direct) void this.uploadWithPlaceholder(f, pos, (file, alt, onProgress) => this.adapter!.upload(file, { alt, onProgress }).then((item) => {
        const s = pickInsertSource(item, this.mediaOpts.insertVariant ?? 'lg');
        return { src: s.src, srcset: s.srcset, alt: item.alt || alt };
      }));
      return true;
    }
    if (this.options.onImageUpload) {
      const hook = this.options.onImageUpload;
      for (const f of valid) void this.uploadWithPlaceholder(f, pos, async (file, alt) => {
        const r = await hook(file);
        return typeof r === 'string' ? { src: r, srcset: null, alt } : { src: r.url, srcset: null, alt: r.alt ?? alt };
      });
      return true;
    }
    toast(t.uploadNotConfigured, 'error', this.themeClass);
    return true;
  }

  private async uploadWithPlaceholder(
    file: File,
    pos: number | null,
    upload: (f: File, alt: string, onProgress: (p: number) => void) => Promise<{ src: string; srcset: string | null; alt: string }>,
  ) {
    const uploadId = `up-${++uid}`;
    const blobUrl = URL.createObjectURL(file);
    const alt = altFromFilename(file.name);
    const { state, view } = this.editor;
    // İlerleme bilgisi verebilen adaptörde halka %0'dan başlar; onImageUpload'da belirsiz döner
    uploadRegistry.set(uploadId, { progress: this.adapter ? 0 : null });
    const node = state.schema.nodes.image!.create({ src: blobUrl, alt, uploadId });
    const tr = pos !== null ? state.tr.insert(Math.min(pos, state.doc.content.size), node) : state.tr.replaceSelectionWith(node);
    view.dispatch(tr.setMeta('addToHistory', false));

    const attempt = async (): Promise<void> => {
      uploadRegistry.set(uploadId, { progress: this.adapter ? 0 : null, error: undefined });
      try {
        const r = await upload(file, alt, (p) => uploadRegistry.set(uploadId, { progress: Math.min(99, Math.round(p)) }));
        if (this.destroyed) return;
        uploadRegistry.set(uploadId, { progress: 100 });
        // Sunucudaki görseli önceden çöz: yer tutucudan geçişte boş kare görünmesin
        await preload(r.src);
        if (this.destroyed) return;
        this.replaceUploadPlaceholder(uploadId, { src: r.src, srcset: r.srcset, alt: r.alt || alt, sizes: r.srcset ? '(max-width: 768px) 100vw, 768px' : null });
        uploadRegistry.delete(uploadId);
        URL.revokeObjectURL(blobUrl);
      } catch (e: any) {
        if (this.destroyed) return;
        // Görseli silme: hata durumunda "Yeniden dene / Kaldır" göster
        uploadRegistry.set(uploadId, {
          error: e?.message || '',
          retry: () => void attempt(),
          remove: () => {
            this.replaceUploadPlaceholder(uploadId, null);
            uploadRegistry.delete(uploadId);
            URL.revokeObjectURL(blobUrl);
          },
        });
      }
    };
    await attempt();
  }

  /**
   * Yer tutucuyu geçmişe yazmadan kaldırır, gerçek görseli tek geri-al adımı olarak ekler
   * (geri al → ileri al süresi dolmuş blob görselini geri getirmesin).
   */
  private replaceUploadPlaceholder(uploadId: string, attrs: Record<string, any> | null) {
    const { state, view } = this.editor;
    let found: { pos: number; node: any } | null = null;
    state.doc.descendants((n, p) => {
      if (found) return false;
      if (n.type.name === 'image' && n.attrs.uploadId === uploadId) found = { pos: p, node: n };
      return !found;
    });
    if (!found) return;
    const { pos, node } = found as { pos: number; node: any };
    view.dispatch(state.tr.delete(pos, pos + node.nodeSize).setMeta('addToHistory', false));
    if (attrs) {
      const finalNode = view.state.schema.nodes.image!.create({ ...node.attrs, ...attrs, uploadId: null });
      view.dispatch(view.state.tr.insert(pos, finalNode));
    }
  }

  // ───────────────────────── Bağlantı ─────────────────────────

  /** explicit=true: Ctrl+K / düğme (giriş kutusu odaklanır). false: imleç bağlantıya girdi (odak editörde kalır). */
  openLinkPopover(explicit = false): void {
    if (this.mode !== 'visual' || this.options.readOnly) return;
    const ed = this.editor;
    const { state } = ed;
    const { from, to, empty } = state.selection;
    const linkType = state.schema.marks.link!;
    let range: { from: number; to: number } | null = null;
    if (ed.isActive('link')) range = getMarkRange(state.doc.resolve(from), linkType) ?? null;
    if (!range && !empty) range = { from, to };
    if (!range && explicit) range = getWordBoundaries(ed);
    if (!range && !explicit) return;
    this.linkRange = range ?? { from, to };

    const attrs = ed.getAttributes('link');
    const t = this.t;
    const input = h('input', { type: 'url', inputmode: 'url', placeholder: t.urlPlaceholder, value: attrs.href ?? '', 'aria-label': t.linkUrl, autocomplete: 'off' });
    const apply = () => this.applyLink({ href: input.value, title: attrs.title, newTab: attrs.target === '_blank', nofollow: /nofollow/.test(attrs.rel ?? ''), sponsored: /sponsored/.test(attrs.rel ?? '') });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); apply(); }
      if (e.key === 'Escape') { e.preventDefault(); this.linkPopover.close(); ed.commands.focus(); }
    });
    const iconBtn = (icon: string, title: string, onClick: () => void, extra = '') =>
      h('button', { type: 'button', class: `zoro-link-btn ${extra}`, title, 'aria-label': title, html: icon, onmousedown: (e: Event) => e.preventDefault(), onclick: onClick });
    const field = h('label', { class: 'zoro-link-field' }, h('span', { class: 'zoro-link-field-icon', html: ICONS.linkSmall }), input);
    const row = h('div', { class: 'zoro-link-row' }, field, iconBtn(ICONS.checkBig, t.apply, apply, 'zoro-link-apply'));
    const tools = h('div', { class: 'zoro-link-tools' });
    if (attrs.href) {
      tools.append(
        iconBtn(ICONS.external, t.openLink, () => { if (isSafeUrl(attrs.href)) window.open(attrs.href, '_blank', 'noopener'); }),
        iconBtn(ICONS.unlink, t.unlink, () => {
          if (this.linkRange) ed.chain().focus().setTextSelection(this.linkRange).unsetLink().run();
          this.linkPopover.close();
        }),
        h('span', { class: 'zoro-link-sep' }),
      );
    }
    tools.append(iconBtn(ICONS.settings, t.advanced, () => this.openLinkDialog(input.value)));
    row.append(h('span', { class: 'zoro-link-sep' }), tools);
    const content = h('div', { class: 'zoro-link-popover-inner' }, row);
    this.linkPopover.close();
    this.linkRange = range ?? { from, to };
    this.linkPopover = new ZoroPopover(this.themeClass, () => { this.linkRange = null; });
    const r = this.linkRange;
    const a = ed.view.coordsAtPos(r.from);
    const b = ed.view.coordsAtPos(r.to);
    const rect = new DOMRect(Math.min(a.left, b.left), a.top, Math.max(1, Math.abs(b.right - a.left)), b.bottom - a.top);
    this.linkPopover.open(content, rect, 'zoro-link-popover');
    // Hemen odakla: hızlı yazanların ilk harfleri editöre kaçmasın
    if (explicit) { input.focus({ preventScroll: true }); input.select(); }
  }

  private syncLinkPopover() {
    const inLink = this.editor.isActive('link');
    if (inLink && !this.linkPopover.isOpen) this.openLinkPopover(false);
    else if (!inLink && this.linkPopover.isOpen && !this.linkPopover.el?.contains(document.activeElement)) this.linkPopover.close();
  }

  private openLinkDialog(currentUrl: string) {
    const ed = this.editor;
    const t = this.t;
    const range = this.linkRange ?? { from: ed.state.selection.from, to: ed.state.selection.to };
    const attrs = ed.getAttributes('link');
    const text = ed.state.doc.textBetween(range.from, range.to, ' ');
    this.linkPopover.close();
    this.linkRange = range;

    const url = h('input', { type: 'url', inputmode: 'url', class: 'zoro-input', value: currentUrl || attrs.href || '', placeholder: 'https://ornek.com/sayfa' });
    const txt = h('input', { type: 'text', class: 'zoro-input', value: text });
    const title = h('input', { type: 'text', class: 'zoro-input', value: attrs.title ?? '' });
    const cb = (label: string, checked: boolean) => {
      const input = h('input', { type: 'checkbox', checked });
      return { input, el: h('label', { class: 'zoro-checkbox-group' }, input, h('span', {}, label)) };
    };
    const newTab = cb(t.linkNewTab, attrs.target === '_blank');
    const nofollow = cb(t.linkNofollow, /nofollow/.test(attrs.rel ?? ''));
    const sponsored = cb(t.linkSponsored, /sponsored/.test(attrs.rel ?? ''));
    const err = h('p', { class: 'zoro-field-error', role: 'alert' });
    const body = h('div', { class: 'zoro-form' },
      h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.linkUrl), url),
      h('div', { class: 'zoro-grid-2' },
        h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.linkText), txt),
        h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.linkTitleAttr), title),
      ),
      h('div', { class: 'zoro-field' }, newTab.el, nofollow.el, sponsored.el),
      err,
    );
    const dlg = new ZoroDialog({ title: t.linkTitle, size: 'md', themeClass: this.themeClass, closeLabel: t.close, onClose: () => { this.linkRange = null; } });
    dlg.open(body);
    const save = () => {
      const ok = this.applyLink({ href: url.value, text: txt.value, title: title.value, newTab: newTab.input.checked, nofollow: nofollow.input.checked, sponsored: sponsored.input.checked }, range, text);
      if (!ok) { err.textContent = t.linkInvalid; return; }
      dlg.close();
    };
    url.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
    dlg.addFooter(h('div', { class: 'zoro-btn-row' },
      h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary', onclick: () => dlg.close() }, t.cancel),
      h('button', { type: 'button', class: 'zoro-btn zoro-btn-primary', onclick: save }, t.linkTitle),
    ));
  }

  /** Bağlantıyı uygula. false = URL geçersiz. */
  applyLink(
    o: { href: string; text?: string; title?: string | null; newTab?: boolean; nofollow?: boolean; sponsored?: boolean },
    range = this.linkRange,
    originalText?: string,
  ): boolean {
    const ed = this.editor;
    const href = normalizeUrl(o.href);
    if (!href) {
      if (range && range.from !== range.to) ed.chain().focus().setTextSelection(range).unsetLink().run();
      this.linkPopover.close();
      return true;
    }
    if (!isSafeUrl(href)) {
      toast(this.t.linkInvalid, 'error', this.themeClass);
      return false;
    }
    const rel = [o.newTab ? 'noopener noreferrer' : '', o.nofollow ? 'nofollow' : '', o.sponsored ? 'sponsored' : ''].filter(Boolean).join(' ');
    const attrs = { href, title: o.title?.trim() || null, target: o.newTab ? '_blank' : null, rel: rel || null };
    const r = range ?? { from: ed.state.selection.from, to: ed.state.selection.to };
    const current = originalText ?? ed.state.doc.textBetween(r.from, r.to, ' ');
    const text = o.text ?? current;
    const chain = ed.chain().focus();
    if (r.from === r.to || (o.text !== undefined && o.text !== current)) {
      chain.insertContentAt(r, { type: 'text', text: text || href, marks: [{ type: 'link', attrs }] });
    } else {
      chain.setTextSelection(r).setLink(attrs as any).setTextSelection(r.to);
    }
    chain.run();
    this.linkPopover.close();
    return true;
  }

  // ───────────────────────── Renk / özel karakter / tablo / YouTube ─────────────────────────

  openColorPicker(anchor: HTMLElement, type: 'text' | 'bg'): void {
    const t = this.t;
    const apply = (color: string) => {
      this.colorPopover.close();
      this.lastColors[type] = color;
      anchor.innerHTML = type === 'text' ? ICONS.textColor(color) : ICONS.bgColor(color);
      applyMark(this.editor, type === 'text' ? 'setColor' : 'toggleHighlight', type === 'text' ? color : { color });
      rememberColor(color);
    };
    const swatch = (color: string) => h('button', {
      type: 'button', class: 'zoro-color-swatch', title: color, 'aria-label': color, style: { backgroundColor: color },
      onmousedown: (e: Event) => e.preventDefault(),
      onclick: () => apply(color),
    });
    const grid = h('div', { class: 'zoro-color-grid', role: 'listbox', 'aria-label': type === 'text' ? t.textColor : t.bgColor });
    for (const color of COLORS) grid.append(swatch(color));
    const recent = recentColors();
    const recentRow = recent.length
      ? h('div', { class: 'zoro-color-section' }, h('span', { class: 'zoro-color-label' }, t.recentColors), h('div', { class: 'zoro-color-grid' }, ...recent.map(swatch)))
      : null;
    // Özel renk: sistem seçici + HEX alanı
    const picker = h('input', { type: 'color', value: this.lastColors[type], 'aria-label': t.customColor });
    const hex = h('input', { type: 'text', class: 'zoro-input zoro-input-sm', value: this.lastColors[type], maxlength: 7, spellcheck: false, 'aria-label': 'HEX' });
    picker.addEventListener('input', () => { hex.value = picker.value; });
    const applyHex = () => {
      const v = hex.value.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) apply(v.toLowerCase());
      else hex.classList.add('zoro-invalid');
    };
    hex.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyHex(); } });
    const custom = h('div', { class: 'zoro-color-custom' }, picker, hex, h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary zoro-btn-sm', onclick: applyHex }, t.apply));
    const remove = h('button', {
      type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-sm zoro-btn-block', onmousedown: (e: Event) => e.preventDefault(),
      onclick: () => { this.colorPopover.close(); applyMark(this.editor, type === 'text' ? 'unsetColor' : 'unsetHighlight'); },
    }, t.removeColor);
    this.colorPopover.close();
    this.colorPopover = new ZoroPopover(this.themeClass);
    this.colorPopover.open(h('div', { class: 'zoro-color-panel' }, grid, recentRow, custom, remove), anchor);
  }

  openSpecialChars(anchor: HTMLElement): void {
    const pop = new ZoroPopover(this.themeClass);
    const grid = h('div', { class: 'zoro-char-grid' });
    for (const ch of SPECIAL_CHARS) {
      grid.append(h('button', {
        type: 'button', class: 'zoro-char-btn', 'aria-label': ch,
        onmousedown: (e: Event) => e.preventDefault(),
        onclick: () => { pop.close(); this.editor.chain().focus().insertContent(ch).run(); },
      }, ch));
    }
    pop.open(grid, anchor);
  }

  openTableMenu(anchor: HTMLElement): void {
    const ed = this.editor;
    const t = this.t;
    const pop = new ZoroPopover(this.themeClass);
    if (ed.isActive('table')) {
      const item = (label: string, run: () => void, danger = false) =>
        h('button', { type: 'button', class: 'zoro-menu-item' + (danger ? ' danger' : ''), onmousedown: (e: Event) => e.preventDefault(), onclick: () => { pop.close(); run(); } }, label);
      pop.open(h('div', { class: 'zoro-menu', role: 'menu' },
        item(t.tableAddRowAfter, () => ed.chain().focus().addRowAfter().run()),
        item(t.tableAddColAfter, () => ed.chain().focus().addColumnAfter().run()),
        item(t.tableDeleteRow, () => ed.chain().focus().deleteRow().run()),
        item(t.tableDeleteCol, () => ed.chain().focus().deleteColumn().run()),
        item(t.tableToggleHeader, () => ed.chain().focus().toggleHeaderRow().run()),
        item(t.tableMerge, () => ed.chain().focus().mergeOrSplit().run()),
        item(t.tableDelete, () => ed.chain().focus().deleteTable().run(), true),
      ), anchor);
      return;
    }
    // Boyut seçici (TinyMCE tarzı): üzerine gel / dokun
    const N = 8;
    const label = h('div', { class: 'zoro-table-picker-label' }, '1 × 1');
    const grid = h('div', { class: 'zoro-table-picker', style: { gridTemplateColumns: `repeat(${N}, 1fr)` } });
    const cells: HTMLButtonElement[] = [];
    const paint = (r: number, c: number) => {
      cells.forEach((cell, i) => cell.classList.toggle('on', Math.floor(i / N) < r && (i % N) < c));
      label.textContent = `${c} × ${r}`;
    };
    for (let r = 1; r <= N; r++) {
      for (let c = 1; c <= N; c++) {
        const cell = h('button', {
          type: 'button', class: 'zoro-table-cell', 'aria-label': `${c} × ${r}`,
          onmousedown: (e: Event) => e.preventDefault(),
          onpointerenter: () => paint(r, c),
          onfocus: () => paint(r, c),
          onclick: () => { pop.close(); ed.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run(); },
        });
        cells.push(cell);
        grid.append(cell);
      }
    }
    pop.open(h('div', {}, grid, label), anchor);
    paint(1, 1);
  }

  async insertYoutube(): Promise<void> {
    const t = this.t;
    const url = await promptDialog({
      title: t.youtube, label: t.youtubePrompt, placeholder: 'https://www.youtube.com/watch?v=...', ok: t.insert, cancel: t.cancel, themeClass: this.themeClass,
      validate: (v) => (isYoutubeUrl(v) ? null : t.youtubeInvalid),
    });
    if (url) this.editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }

  showHelp(): void {
    const t = this.t;
    const sections: Array<[string, Array<[string, string]>]> = [
      [t.shortcutsCtrl, [['b', t.bold], ['i', t.italic], ['u', t.underline], ['k', t.link], ['z', t.undo], ['y', t.redo]]],
      [t.shortcutsShiftAlt, [
        ['1–6', `${t.heading} 1–6`], ['7', t.paragraph], ['q', t.blockquote], ['d', t.strike], ['x', t.preformatted],
        ['l', t.alignLeft], ['c', t.alignCenter], ['r', t.alignRight], ['j', t.alignJustify],
        ['u', t.bulletList], ['o', t.orderedList], ['s', t.unlink], ['m', t.addMedia], ['z', t.toolbarToggle], ['h', t.help],
      ]],
      [t.shortcutsMarkdown, [['*', t.bulletList], ['-', t.bulletList], ['1.', t.orderedList], ['>', t.blockquote], ['##', `${t.heading} 2`], ['###', `${t.heading} 3`], ['---', t.hr]]],
      ['Alt + F10', [['F10', t.toolbarLabel]]],
    ];
    const body = h('div', { class: 'zoro-form' });
    for (const [title, list] of sections) {
      const grid = h('div', { class: 'zoro-shortcuts-grid' });
      for (const [k, d] of list) grid.append(h('div', { class: 'zoro-shortcut-row' }, h('kbd', {}, k), h('span', {}, d.replace(/\s*\(.*\)$/, ''))));
      body.append(h('h4', { class: 'zoro-shortcuts-title' }, title), grid);
    }
    const dlg = new ZoroDialog({ title: t.shortcutsTitle, size: 'lg', themeClass: this.themeClass, closeLabel: t.close });
    dlg.open(body);
    dlg.addFooter(h('div', { class: 'zoro-btn-row' }, h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary', onclick: () => dlg.close() }, t.close)));
  }
}
