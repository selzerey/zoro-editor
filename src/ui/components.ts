// Bağımlılıksız arayüz bileşenleri: Dialog, Popover, Select, Tabs, Toast

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, any> = {},
  ...children: Array<Node | string | null | undefined | false>
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in el && typeof v !== 'string') (el as any)[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) {
    if (c == null || c === false) continue;
    el.append(c);
  }
  return el;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Açık dialog yığını: ESC sadece en üsttekini kapatır. */
const dialogStack: ZoroDialog[] = [];

export interface DialogOptions {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Tema/ölçek sınıfları (editör sarmalayıcısından aktarılır). */
  themeClass?: string;
  closeLabel?: string;
  onClose?: () => void;
}

export class ZoroDialog {
  overlay: HTMLDivElement | null = null;
  dialog: HTMLDivElement | null = null;
  bodyEl: HTMLDivElement | null = null;
  isOpen = false;
  private prevFocus: Element | null = null;
  constructor(private opts: DialogOptions) {}

  open(body: HTMLElement | string): this {
    if (this.isOpen) return this;
    this.isOpen = true;
    this.prevFocus = document.activeElement;
    const titleId = 'zoro-dlg-' + Math.random().toString(36).slice(2, 8);

    this.overlay = h('div', { class: `zoro-root zoro-dialog-overlay ${this.opts.themeClass ?? ''}` });
    this.overlay.addEventListener('mousedown', (e) => { if (e.target === this.overlay) this.close(); });

    this.dialog = h('div', {
      class: `zoro-dialog zoro-dialog-${this.opts.size ?? 'md'}`,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
    });
    const header = h('div', { class: 'zoro-dialog-header' },
      h('h3', { class: 'zoro-dialog-title', id: titleId }, this.opts.title),
      h('button', { type: 'button', class: 'zoro-dialog-close', 'aria-label': this.opts.closeLabel ?? 'Kapat', title: this.opts.closeLabel ?? 'Kapat', html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', onclick: () => this.close() }),
    );
    this.bodyEl = h('div', { class: 'zoro-dialog-body' });
    this.setBody(body);
    this.dialog.append(header, this.bodyEl);
    this.overlay.appendChild(this.dialog);
    document.body.appendChild(this.overlay);
    document.body.classList.add('zoro-scroll-lock');
    dialogStack.push(this);
    this.dialog.addEventListener('keydown', this.onKeyDown);
    requestAnimationFrame(() => {
      const first = this.bodyEl?.querySelector<HTMLElement>('input:not([type=hidden]),textarea,select') ??
        this.dialog?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });
    return this;
  }

  setBody(content: HTMLElement | string): void {
    if (!this.bodyEl) return;
    this.bodyEl.innerHTML = '';
    if (typeof content === 'string') this.bodyEl.innerHTML = content;
    else this.bodyEl.appendChild(content);
  }

  addFooter(el: HTMLElement): HTMLElement | undefined {
    if (!this.dialog) return;
    this.dialog.querySelector('.zoro-dialog-footer')?.remove();
    const footer = h('div', { class: 'zoro-dialog-footer' }, el);
    this.dialog.appendChild(footer);
    return footer;
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    const i = dialogStack.indexOf(this);
    if (i >= 0) dialogStack.splice(i, 1);
    if (!dialogStack.length) document.body.classList.remove('zoro-scroll-lock');
    this.overlay?.remove();
    this.overlay = this.dialog = this.bodyEl = null;
    if (this.prevFocus instanceof HTMLElement && document.contains(this.prevFocus)) this.prevFocus.focus({ preventScroll: true });
    this.opts.onClose?.();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (dialogStack[dialogStack.length - 1] !== this) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
      return;
    }
    if (e.key === 'Tab' && this.dialog) {
      const items = Array.from(this.dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
}

/** Sabit konumlu açılır kutu. Ekrandan taşmaz, dışarı tıklayınca / ESC ile kapanır. */
export class ZoroPopover {
  el: HTMLDivElement | null = null;
  isOpen = false;
  private anchor: Element | null = null;
  private listenTimer: ReturnType<typeof setTimeout> | undefined;
  constructor(private themeClass = '', private onClose?: () => void) {}

  open(content: HTMLElement, anchor: Element | DOMRect, extraClass = ''): HTMLDivElement {
    this.close();
    this.isOpen = true;
    this.anchor = anchor instanceof Element ? anchor : null;
    this.el = h('div', { class: `zoro-root zoro-popover ${extraClass} ${this.themeClass}`, role: 'dialog' }, content);
    document.body.appendChild(this.el);
    this.position(anchor instanceof Element ? anchor.getBoundingClientRect() : anchor);
    // Açan tıklamayı yakalamamak için bir sonraki turda dinle; o arada kapandıysa hiç ekleme
    clearTimeout(this.listenTimer);
    this.listenTimer = setTimeout(() => {
      if (!this.isOpen) return;
      document.addEventListener('pointerdown', this.onOutside, true);
      document.addEventListener('keydown', this.onKey, true);
      window.addEventListener('resize', this.onViewportChange);
      window.addEventListener('scroll', this.onViewportChange, true);
    }, 0);
    return this.el;
  }

  position(rect: DOMRect): void {
    if (!this.el) return;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const pr = this.el.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left + rect.width / 2 - pr.width / 2;
    if (rect.width < 60) left = rect.left; // küçük düğmelerde sola hizala
    left = Math.max(8, Math.min(left, vw - pr.width - 8));
    if (top + pr.height > vh - 8 && rect.top - pr.height - 6 > 8) top = rect.top - pr.height - 6;
    this.el.style.top = `${Math.max(8, top)}px`;
    this.el.style.left = `${left}px`;
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    clearTimeout(this.listenTimer);
    document.removeEventListener('pointerdown', this.onOutside, true);
    document.removeEventListener('keydown', this.onKey, true);
    window.removeEventListener('resize', this.onViewportChange);
    window.removeEventListener('scroll', this.onViewportChange, true);
    this.el?.remove();
    this.el = null;
    this.onClose?.();
  }

  private onOutside = (e: Event) => {
    const t = e.target as Node;
    if (this.el?.contains(t) || this.anchor?.contains(t)) return;
    this.close();
  };
  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(); }
  };
  private onViewportChange = (e: Event) => {
    if (e.type === 'scroll' && this.el?.contains(e.target as Node)) return;
    if (this.anchor && document.contains(this.anchor)) this.position(this.anchor.getBoundingClientRect());
  };
}

export interface SelectItem {
  value: string;
  label: string;
  shortcut?: string;
  style?: Partial<CSSStyleDeclaration>;
  /** Seçeneğin solunda SVG simge */
  icon?: string;
  /** Girinti düzeyi (klasör ağacı) */
  depth?: number;
  /** Sağda soluk ek bilgi (ör. dosya sayısı) */
  meta?: string;
}

export interface SelectOptions {
  items: SelectItem[];
  value: string;
  label: string;
  onChange: (v: string) => void;
  /** toolbar: araç çubuğu düğmesi; field: form alanı (Finder, dialoglar) */
  variant?: 'toolbar' | 'field';
  /** Değer listede yoksa gösterilen metin (eylem menüleri: "Taşı…") */
  placeholder?: string;
  /** Tetikleyicide etiketin solunda simge */
  icon?: string;
  size?: 'sm' | 'md';
  /** Seçim sonrası değeri yer tutucuya geri al (eylem menüsü) */
  resetAfterChange?: boolean;
}

const CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
const CHEVRON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

/** Klavye ile gezilebilen özel açılır liste (tarayıcının çıplak <select>'i yerine). */
export class ZoroSelect {
  wrapper!: HTMLDivElement;
  trigger!: HTMLButtonElement;
  private dropdown: HTMLDivElement | null = null;
  private activeIndex = -1;
  isOpen = false;

  constructor(private opts: SelectOptions) {}

  get value(): string {
    return this.opts.value;
  }

  render(): HTMLDivElement {
    const field = this.opts.variant === 'field';
    this.trigger = h('button', {
      type: 'button',
      class: field ? `zoro-select-field${this.opts.size === 'sm' ? ' sm' : ''}` : 'zoro-select-trigger',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
      'aria-label': this.opts.label,
    });
    if (!field) this.trigger.addEventListener('mousedown', (e) => e.preventDefault());
    this.trigger.addEventListener('click', () => (this.isOpen ? this.close() : this.open()));
    this.trigger.addEventListener('keydown', (e) => {
      if (!this.isOpen && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.open(); }
      else if (this.isOpen) this.onKey(e);
    });
    this.wrapper = h('div', { class: 'zoro-select-wrapper' + (field ? ' zoro-select-wrapper-field' : '') }, this.trigger);
    this.updateTrigger();
    return this.wrapper;
  }

  setValue(v: string): void {
    if (this.opts.value === v) return;
    this.opts.value = v;
    this.updateTrigger();
  }

  setItems(items: SelectItem[]): void {
    this.opts.items = items;
    this.updateTrigger();
    if (this.isOpen) { this.close(); this.open(); }
  }

  private current(): SelectItem | undefined {
    return this.opts.items.find((i) => i.value === this.opts.value);
  }

  private updateTrigger() {
    if (!this.trigger) return;
    const item = this.current();
    const field = this.opts.variant === 'field';
    this.trigger.innerHTML = '';
    const icon = item?.icon ?? this.opts.icon;
    if (field && icon) this.trigger.append(h('span', { class: 'zoro-select-icon', html: icon }));
    const text = item?.label ?? this.opts.placeholder ?? this.opts.items[0]?.label ?? '';
    this.trigger.append(h('span', { class: 'zoro-select-label' + (!item && this.opts.placeholder ? ' placeholder' : '') }, text));
    if (field) this.trigger.append(h('span', { class: 'zoro-select-chevron', html: CHEVRON }));
  }

  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    const field = this.opts.variant === 'field';
    this.trigger.setAttribute('aria-expanded', 'true');
    this.dropdown = h('div', { class: 'zoro-select-dropdown' + (field ? ' zoro-select-dropdown-field' : ''), role: 'listbox' });
    this.opts.items.forEach((item, i) => {
      const selected = item.value === this.opts.value;
      const label = h('span', { class: 'zoro-format-text' }, item.label);
      if (item.style) Object.assign(label.style, item.style);
      const opt = h('div', {
        class: 'zoro-select-option' + (selected ? ' active' : ''),
        role: 'option',
        'aria-selected': String(selected),
        style: item.depth ? { paddingLeft: `${10 + item.depth * 16}px` } : undefined,
      },
        item.icon ? h('span', { class: 'zoro-select-icon', html: item.icon }) : null,
        label,
        item.meta ? h('span', { class: 'zoro-select-meta' }, item.meta) : null,
        item.shortcut ? h('span', { class: 'zoro-select-shortcut' }, item.shortcut) : null,
        field ? h('span', { class: 'zoro-select-check', html: selected ? CHECK : '' }) : null,
      );
      opt.addEventListener('mousedown', (e) => e.preventDefault());
      opt.addEventListener('click', () => this.choose(i));
      opt.addEventListener('mouseenter', () => { this.activeIndex = i; this.highlight(false); });
      this.dropdown!.appendChild(opt);
    });
    this.wrapper.appendChild(this.dropdown);
    // Sabit konum: kaydırılabilir satırlar / dialoglar menüyü kırpmasın
    const r = this.trigger.getBoundingClientRect();
    const d = this.dropdown;
    d.style.position = 'fixed';
    if (field) d.style.minWidth = `${Math.max(r.width, 180)}px`;
    d.style.top = `${r.bottom + 4}px`;
    d.style.left = `${Math.max(8, Math.min(r.left, document.documentElement.clientWidth - d.offsetWidth - 8))}px`;
    const room = window.innerHeight - r.bottom - 12;
    if (room < Math.min(d.offsetHeight, 260) && r.top > room) {
      d.style.top = 'auto';
      d.style.bottom = `${window.innerHeight - r.top + 4}px`;
    }
    window.addEventListener('scroll', this.onScrollClose, true);
    window.addEventListener('resize', this.onScrollClose);
    this.activeIndex = Math.max(0, this.opts.items.findIndex((i) => i.value === this.opts.value));
    this.highlight();
    setTimeout(() => { if (this.isOpen) document.addEventListener('pointerdown', this.onOutside, true); }, 0);
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', this.onOutside, true);
    window.removeEventListener('scroll', this.onScrollClose, true);
    window.removeEventListener('resize', this.onScrollClose);
    this.dropdown?.remove();
    this.dropdown = null;
  }

  private choose(i: number) {
    const item = this.opts.items[i];
    if (!item) return;
    this.close();
    if (this.opts.resetAfterChange) {
      this.trigger.focus();
      this.opts.onChange(item.value);
      return;
    }
    this.opts.value = item.value;
    this.updateTrigger();
    this.opts.onChange(item.value);
  }

  private highlight(scroll = true) {
    this.dropdown?.querySelectorAll('.zoro-select-option').forEach((el, i) => {
      el.classList.toggle('focused', i === this.activeIndex);
      if (scroll && i === this.activeIndex) (el as HTMLElement).scrollIntoView?.({ block: 'nearest' });
    });
  }

  private onKey(e: KeyboardEvent) {
    const n = this.opts.items.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.activeIndex = (this.activeIndex + 1) % n; this.highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.activeIndex = (this.activeIndex - 1 + n) % n; this.highlight(); }
    else if (e.key === 'Home') { e.preventDefault(); this.activeIndex = 0; this.highlight(); }
    else if (e.key === 'End') { e.preventDefault(); this.activeIndex = n - 1; this.highlight(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.choose(this.activeIndex); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(); }
    else if (e.key === 'Tab') { this.close(); }
  }

  private onOutside = (e: Event) => {
    if (!this.wrapper.contains(e.target as Node)) this.close();
  };

  private onScrollClose = (e: Event) => {
    if (e.type === 'scroll' && this.dropdown?.contains(e.target as Node)) return;
    this.close();
  };

  destroy(): void {
    this.close();
  }
}

/** Sekmeler. */
export class ZoroTabs {
  container!: HTMLDivElement;
  private buttons: Record<string, HTMLButtonElement> = {};
  private panels: Record<string, HTMLDivElement> = {};
  constructor(private opts: { tabs: Array<{ id: string; label: string; icon?: string }>; active: string; onChange?: (id: string) => void }) {}

  render(): HTMLDivElement {
    const list = h('div', { class: 'zoro-tabs-list', role: 'tablist' });
    this.container = h('div', { class: 'zoro-tabs' }, list);
    for (const tab of this.opts.tabs) {
      const btn = h('button', {
        type: 'button',
        class: 'zoro-tab' + (tab.id === this.opts.active ? ' active' : ''),
        role: 'tab',
        'aria-selected': String(tab.id === this.opts.active),
        html: (tab.icon ?? '') + `<span>${tab.label}</span>`,
        onclick: () => this.setActive(tab.id),
      });
      this.buttons[tab.id] = btn;
      list.appendChild(btn);
      const panel = h('div', { class: 'zoro-tab-content' + (tab.id === this.opts.active ? ' active' : ''), role: 'tabpanel' });
      this.panels[tab.id] = panel;
      this.container.appendChild(panel);
    }
    return this.container;
  }

  setActive(id: string): void {
    if (!this.panels[id]) return;
    const changed = this.opts.active !== id;
    this.opts.active = id;
    for (const [k, b] of Object.entries(this.buttons)) {
      b.classList.toggle('active', k === id);
      b.setAttribute('aria-selected', String(k === id));
    }
    for (const [k, p] of Object.entries(this.panels)) p.classList.toggle('active', k === id);
    if (changed) this.opts.onChange?.(id);
  }

  get active(): string {
    return this.opts.active;
  }

  panel(id: string): HTMLDivElement {
    return this.panels[id]!;
  }
}

/** Kısa bildirim (ekranın altında). */
export function toast(message: string, type: 'info' | 'error' | 'success' = 'info', themeClass = '', ms = 2600): () => void {
  let host = document.querySelector<HTMLDivElement>('.zoro-toast-host');
  if (!host) {
    host = h('div', { class: 'zoro-root zoro-toast-host', 'aria-live': 'polite' });
    document.body.appendChild(host);
  }
  if (themeClass) host.className = `zoro-root zoro-toast-host ${themeClass}`;
  const el = h('div', { class: `zoro-toast zoro-toast-${type}`, role: type === 'error' ? 'alert' : 'status' }, message);
  host.appendChild(el);
  let done = false;
  const remove = () => {
    if (done) return;
    done = true;
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 200);
  };
  if (ms > 0) setTimeout(remove, ms);
  return remove;
}

/** Basit onay penceresi (window.confirm yerine; mobilde de düzgün görünür). */
export function confirmDialog(message: string, opts: { title: string; ok: string; cancel: string; danger?: boolean; themeClass?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    let result = false;
    const dlg = new ZoroDialog({ title: opts.title, size: 'sm', themeClass: opts.themeClass, closeLabel: opts.cancel, onClose: () => resolve(result) });
    dlg.open(h('p', { class: 'zoro-confirm-text' }, message));
    dlg.addFooter(h('div', { class: 'zoro-btn-row' },
      h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary', onclick: () => dlg.close() }, opts.cancel),
      h('button', { type: 'button', class: `zoro-btn ${opts.danger ? 'zoro-btn-danger' : 'zoro-btn-primary'}`, onclick: () => { result = true; dlg.close(); } }, opts.ok),
    ));
  });
}

/** Tek alanlı giriş penceresi (window.prompt yerine). */
export function promptDialog(opts: { title: string; label: string; value?: string; placeholder?: string; ok: string; cancel: string; themeClass?: string; validate?: (v: string) => string | null }): Promise<string | null> {
  return new Promise((resolve) => {
    let result: string | null = null;
    const input = h('input', { type: 'text', class: 'zoro-input', value: opts.value ?? '', placeholder: opts.placeholder ?? '' });
    const err = h('p', { class: 'zoro-field-error', role: 'alert' });
    const dlg = new ZoroDialog({ title: opts.title, size: 'sm', themeClass: opts.themeClass, closeLabel: opts.cancel, onClose: () => resolve(result) });
    const submit = () => {
      const v = input.value.trim();
      const msg = opts.validate?.(v) ?? null;
      if (msg) { err.textContent = msg; return; }
      result = v;
      dlg.close();
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    dlg.open(h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, opts.label), input, err));
    dlg.addFooter(h('div', { class: 'zoro-btn-row' },
      h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary', onclick: () => dlg.close() }, opts.cancel),
      h('button', { type: 'button', class: 'zoro-btn zoro-btn-primary', onclick: submit }, opts.ok),
    ));
  });
}

// ───────────────────────── İpuçları (tooltip) ─────────────────────────

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** "Kalın (Ctrl+B)" → { label: "Kalın", keys: "Ctrl+B" } ; Mac'te ⌘ ⌥ ⇧ */
export function splitShortcut(title: string): { label: string; keys: string } {
  const m = /^(.*?)\s*\(([^()]*(?:Ctrl|Alt|Shift|⌘)[^()]*)\)\s*$/.exec(title);
  if (!m) return { label: title, keys: '' };
  let keys = m[2]!;
  if (IS_MAC) keys = keys.replace(/Ctrl\+/g, '⌘').replace(/Shift\+/g, '⇧').replace(/Alt\+/g, '⌥');
  return { label: m[1]!, keys };
}

let tipEl: HTMLDivElement | null = null;
let tipTimer: ReturnType<typeof setTimeout> | undefined;
let lastHide = 0;
let tipTarget: HTMLElement | null = null;

function hideTip() {
  clearTimeout(tipTimer);
  if (tipEl) { tipEl.remove(); tipEl = null; lastHide = Date.now(); }
  tipTarget = null;
}

function showTip(target: HTMLElement) {
  const text = target.getAttribute('data-tip');
  if (!text || !target.isConnected) return;
  hideTip();
  tipTarget = target;
  const { label, keys } = splitShortcut(text);
  const root = target.closest('.zoro-root');
  const theme = root ? Array.from(root.classList).filter((c) => c.startsWith('zoro-skin-') || c.startsWith('zoro-theme-')).join(' ') : '';
  tipEl = h('div', { class: `zoro-root zoro-tooltip ${theme}`, role: 'tooltip' }, h('span', {}, label), keys ? h('kbd', {}, keys) : null);
  document.body.append(tipEl);
  const r = target.getBoundingClientRect();
  const b = tipEl.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  let top = r.bottom + 6;
  if (top + b.height > window.innerHeight - 4) top = r.top - b.height - 6;
  tipEl.style.top = `${Math.round(top)}px`;
  tipEl.style.left = `${Math.round(Math.max(4, Math.min(r.left + r.width / 2 - b.width / 2, vw - b.width - 4)))}px`;
}

/** Belge genelinde bir kez kurulur: .zoro-root içindeki [data-tip] öğeleri. */
export function installTooltips(): void {
  if (typeof document === 'undefined' || (document as any).__zoroTips) return;
  (document as any).__zoroTips = true;
  document.addEventListener('pointerover', (e) => {
    if ((e as PointerEvent).pointerType === 'touch') return;
    const t = (e.target as Element | null)?.closest?.('.zoro-root [data-tip]') as HTMLElement | null;
    if (!t || t === tipTarget) return;
    clearTimeout(tipTimer);
    // Butonlar arasında gezinirken bekleme yok (TinyMCE: 300 ms ilk, 60 ms sonraki)
    const delay = tipEl || Date.now() - lastHide < 400 ? 60 : 300;
    tipTimer = setTimeout(() => showTip(t), delay);
  });
  document.addEventListener('pointerout', (e) => {
    const t = (e.target as Element | null)?.closest?.('[data-tip]');
    const to = (e as PointerEvent).relatedTarget as Element | null;
    if (t && (!to || !t.contains(to))) hideTip();
  });
  document.addEventListener('focusin', (e) => {
    const t = (e.target as Element | null)?.closest?.('.zoro-root [data-tip]') as HTMLElement | null;
    if (t && t.matches(':focus-visible')) showTip(t);
  });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('pointerdown', hideTip, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); }, true);
  window.addEventListener('scroll', hideTip, true);
}
