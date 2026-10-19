import type { MediaAdapter, MediaFolder, MediaItem, MediaListParams, MediaOptions } from '../types';
import { resolveMessages, fmt, type Locale, type Messages } from '../i18n';
import { ICONS } from '../icons';
import { ZoroDialog, ZoroSelect, ZoroTabs, h, toast, confirmDialog, promptDialog } from '../ui/components';
import { RestMediaAdapter, formatBytes } from './adapters';

export interface SelectedMedia extends MediaItem {
  /** ALT text the user entered for this content. */
  insertAlt: string;
}

export interface FinderOptions {
  adapter?: MediaAdapter;
  /** Shorthand: REST endpoint. */
  endpoint?: string;
  headers?: MediaOptions['headers'];
  credentials?: RequestCredentials;
  transform?: MediaOptions['transform'];
  locale?: Locale | Partial<Messages>;
  messages?: Messages;
  themeClass?: string;
  theme?: 'light' | 'dark' | 'auto';
  skin?: 'modern' | 'classic';
  /** Whether multiple files can be selected. */
  multiple?: boolean;
  accept?: string[];
  maxSizeMB?: number;
  requireAlt?: boolean;
  folders?: boolean;
  title?: string;
  /** Label of the "Insert" button. */
  selectLabel?: string;
  /** Initial tab. */
  tab?: 'library' | 'upload';
  /** Manage mode: the select button is hidden (library management only). */
  manageOnly?: boolean;
  onSelect?: (items: SelectedMedia[]) => void;
  onClose?: () => void;
}

const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const PAGE_SIZE = 40;

function readPref(key: string, fallback: string): string {
  try { return localStorage.getItem('zoro-finder-' + key) ?? fallback; } catch { return fallback; }
}
function writePref(key: string, v: string) {
  try { localStorage.setItem('zoro-finder-' + key, v); } catch { /* private tab */ }
}

export function createAdapter(o: { adapter?: MediaAdapter; endpoint?: string; headers?: any; credentials?: RequestCredentials; transform?: any }): MediaAdapter | null {
  if (o.adapter) return o.adapter;
  if (o.endpoint) return new RestMediaAdapter({ endpoint: o.endpoint, headers: o.headers, credentials: o.credentials, transform: o.transform });
  return null;
}

/**
 * Zoro Finder — a CKFinder-like media manager.
 * Can also be used without the editor: `openFinder({ endpoint, onSelect })`.
 */
export class ZoroFinder {
  private t: Messages;
  private adapter: MediaAdapter;
  private dialog: ZoroDialog | null = null;
  private tabs: ZoroTabs | null = null;
  private themeClass: string;

  // state
  private items: MediaItem[] = [];
  private folders: MediaFolder[] = [];
  private total = 0;
  private hasMore = false;
  private loading = false;
  private error: string | null = null;
  private params: MediaListParams;
  private selected = new Map<MediaItem['id'], MediaItem>();
  private focused: MediaItem | null = null;
  private insertAlts = new Map<MediaItem['id'], string>();
  private view: 'grid' | 'list';
  private reqSeq = 0;
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  // upload
  private queue: Array<{ file: File; preview: string; alt: string; progress?: number; error?: string }> = [];
  private uploading = false;

  // elements
  private el = {} as {
    root: HTMLDivElement; grid: HTMLDivElement; details: HTMLElement; footer: HTMLDivElement;
    folderSelect: ZoroSelect; search: HTMLInputElement; queue: HTMLDivElement; uploadBtn: HTMLDivElement;
    viewBtn: HTMLButtonElement; count: HTMLSpanElement;
  };

  constructor(private opts: FinderOptions) {
    this.t = opts.messages ?? resolveMessages(opts.locale);
    const adapter = createAdapter(opts);
    if (!adapter) throw new Error('ZoroFinder: an "adapter" or "endpoint" option is required.');
    this.adapter = adapter;
    this.themeClass = opts.themeClass ?? [`zoro-skin-${opts.skin === 'classic' ? 'classic' : 'modern'}`, opts.theme && opts.theme !== 'light' ? `zoro-theme-${opts.theme}` : ''].filter(Boolean).join(' ');
    this.view = readPref('view', 'grid') === 'list' ? 'list' : 'grid';
    this.params = { page: 1, limit: PAGE_SIZE, search: '', folder: '*', type: '', sort: 'newest', filter: '' };
  }

  get canFolders() {
    return this.opts.folders !== false && !!this.adapter.createFolder;
  }
  private get accept() {
    return this.opts.accept ?? DEFAULT_ACCEPT;
  }
  private get maxMB() {
    return this.opts.maxSizeMB ?? 20;
  }
  private get requireAlt() {
    return this.opts.requireAlt !== false;
  }

  open(): this {
    const t = this.t;
    this.dialog = new ZoroDialog({
      title: this.opts.title ?? t.finderTitle,
      size: 'xl',
      themeClass: `${this.themeClass} zoro-finder-dialog`,
      closeLabel: t.close,
      onClose: () => this.cleanup(),
    });
    this.tabs = new ZoroTabs({
      tabs: [
        { id: 'library', label: t.library, icon: ICONS.image.replace(/20/g, '16') },
        { id: 'upload', label: t.upload, icon: ICONS.upload },
      ],
      active: this.opts.tab ?? 'library',
      onChange: () => this.renderFooter(),
    });
    const tabsEl = this.tabs.render();
    tabsEl.classList.add('zoro-finder');
    this.dialog.open(tabsEl);
    this.buildLibrary(this.tabs.panel('library'));
    this.buildUpload(this.tabs.panel('upload'));
    this.el.footer = h('div', { class: 'zoro-finder-footer' });
    this.dialog.addFooter(this.el.footer);
    this.dialog.dialog?.addEventListener('paste', this.onPaste);
    this.renderFooter();
    void this.load();
    return this;
  }

  close(): void {
    this.dialog?.close();
  }

  private cleanup() {
    clearTimeout(this.searchTimer);
    for (const q of this.queue) URL.revokeObjectURL(q.preview);
    this.queue = [];
    this.opts.onClose?.();
  }

  // ───────────────────────── Library ─────────────────────────

  private buildLibrary(panel: HTMLDivElement) {
    const t = this.t;
    this.el.search = h('input', { type: 'search', placeholder: t.search, 'aria-label': t.search, enterkeyhint: 'search' });
    this.el.search.addEventListener('input', () => {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => this.reload({ search: this.el.search.value.trim() }), 300);
    });

    this.el.folderSelect = new ZoroSelect({
      variant: 'field',
      label: t.allFolders,
      icon: ICONS.folder,
      value: '*',
      items: [],
      onChange: (v) => this.reload({ folder: v }),
    });
    const folderEl = this.el.folderSelect.render();
    folderEl.classList.add('zoro-finder-folder');

    const sort = new ZoroSelect({
      variant: 'field',
      label: t.sortNewest,
      icon: ICONS.sort,
      value: 'newest',
      items: [
        { value: 'newest', label: t.sortNewest },
        { value: 'oldest', label: t.sortOldest },
        { value: 'name', label: t.sortName },
        { value: 'size', label: t.sortSize },
      ],
      onChange: (v) => this.reload({ sort: v as MediaListParams['sort'] }),
    });

    const filter = new ZoroSelect({
      variant: 'field',
      label: t.unused,
      icon: ICONS.filter,
      value: '',
      items: [
        { value: '', label: t.allMedia },
        { value: 'unused', label: t.unused },
      ],
      onChange: (v) => this.reload({ filter: v as MediaListParams['filter'] }),
    });
    const filterEl = filter.render();
    filterEl.classList.add('zoro-finder-usage');
    filterEl.hidden = true;

    this.el.viewBtn = h('button', { type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-icon', onclick: () => this.toggleView() });
    this.updateViewBtn();

    const newFolder = this.canFolders
      ? h('button', { type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-icon', title: t.newFolder, 'aria-label': t.newFolder, html: ICONS.folderPlus, onclick: () => this.createFolder() })
      : null;

    const bar = h('div', { class: 'zoro-finder-bar' },
      h('div', { class: 'zoro-media-search' }, h('span', { html: ICONS.search }), this.el.search),
      h('div', { class: 'zoro-finder-filters' },
        this.canFolders || this.adapter.move ? folderEl : null,
        newFolder,
        filterEl,
        sort.render(),
        this.el.viewBtn,
      ),
    );

    this.el.count = h('span', { class: 'zoro-finder-count' });
    this.el.grid = h('div', { class: 'zoro-finder-grid-wrap', tabindex: '-1' });
    this.el.grid.addEventListener('scroll', () => {
      const g = this.el.grid;
      if (this.hasMore && !this.loading && g.scrollTop + g.clientHeight > g.scrollHeight - 200) void this.load(true);
    });
    this.el.details = h('aside', { class: 'zoro-finder-details', 'aria-label': t.details });
    this.el.root = h('div', { class: 'zoro-finder-body' }, this.el.grid, this.el.details);
    panel.append(bar, this.el.root);
    this.renderFolders();
  }

  private updateViewBtn() {
    const t = this.t;
    const toList = this.view === 'grid';
    this.el.viewBtn.innerHTML = toList ? ICONS.list : ICONS.grid;
    this.el.viewBtn.title = toList ? t.listView : t.gridView;
    this.el.viewBtn.setAttribute('aria-label', this.el.viewBtn.title);
  }

  private toggleView() {
    this.view = this.view === 'grid' ? 'list' : 'grid';
    writePref('view', this.view);
    this.updateViewBtn();
    this.renderGrid();
  }

  private reload(patch: Partial<MediaListParams>) {
    this.params = { ...this.params, ...patch, page: 1 };
    this.el.grid.scrollTop = 0;
    void this.load();
  }

  private async load(more = false) {
    if (more) this.params.page++;
    const seq = ++this.reqSeq;
    this.loading = true;
    this.error = null;
    if (!more) this.renderGrid();
    try {
      const params = { ...this.params, folder: this.params.folder === '*' ? undefined : this.params.folder };
      const res = await this.adapter.list(params as MediaListParams);
      if (seq !== this.reqSeq) return; // stale request
      this.items = more ? [...this.items, ...res.items] : res.items;
      // Show the "Unused" filter if the backend provides usage info
      if (this.items.some((i) => i.usageCount !== undefined)) {
        const usage = this.dialog?.dialog?.querySelector<HTMLElement>('.zoro-finder-usage');
        if (usage) usage.hidden = false;
      }
      this.total = res.total;
      this.hasMore = res.hasMore;
      if (res.folders) { this.folders = res.folders; this.renderFolders(); }
    } catch (e: any) {
      if (seq !== this.reqSeq) return;
      this.error = e?.message || this.t.loadFailed;
      if (more) this.params.page--;
    } finally {
      if (seq === this.reqSeq) {
        this.loading = false;
        this.renderGrid();
      }
    }
  }

  private renderFolders() {
    const sel = this.el.folderSelect;
    if (!sel) return;
    const t = this.t;
    sel.setItems([
      { value: '*', label: t.allFolders, icon: ICONS.grid },
      { value: '', label: t.rootFolder, icon: ICONS.folder },
      ...this.folders.map((f) => ({
        value: f.path,
        label: f.name,
        icon: ICONS.folder,
        depth: f.path.split('/').length,
        meta: f.count != null ? String(f.count) : undefined,
      })),
    ]);
    sel.setValue(this.params.folder ?? '*');
  }

  private renderGrid() {
    const t = this.t;
    const g = this.el.grid;
    g.innerHTML = '';
    if (this.error && !this.items.length) {
      g.append(h('div', { class: 'zoro-media-empty', role: 'alert' },
        h('p', {}, this.error),
        h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary', onclick: () => this.load() }, t.retry),
      ));
      return;
    }
    if (!this.items.length) {
      if (this.loading) {
        const sk = h('div', { class: `zoro-media-grid zoro-view-${this.view}` });
        for (let i = 0; i < 12; i++) sk.append(h('div', { class: 'zoro-media-item zoro-skeleton' }));
        g.append(sk);
        return;
      }
      const isFiltered = !!(this.params.search || this.params.filter || (this.params.folder && this.params.folder !== '*'));
      g.append(h('div', { class: 'zoro-media-empty', html: ICONS.imageBig + `<p>${isFiltered ? t.noResults : t.emptyLibrary}</p>` }));
      if (this.canFolders && this.params.folder && this.params.folder !== '*' && !this.params.search) {
        g.append(h('div', { class: 'zoro-center' }, h('button', { type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-sm', onclick: () => this.deleteFolder(this.params.folder!) }, t.deleteFolder)));
      }
      return;
    }

    const grid = h('div', { class: `zoro-media-grid zoro-view-${this.view}`, role: 'listbox', 'aria-multiselectable': String(!!this.opts.multiple) });
    for (const m of this.items) grid.append(this.renderItem(m));
    g.append(grid);
    if (this.hasMore) {
      g.append(h('div', { class: 'zoro-center' },
        h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary', disabled: this.loading, onclick: () => this.load(true) }, this.loading ? t.loading : t.loadMore),
      ));
    }
    this.renderDetails();
  }

  private thumbOf(m: MediaItem) {
    return m.variants?.thumb?.url ?? m.variants?.sm?.url ?? m.url;
  }

  private renderItem(m: MediaItem): HTMLElement {
    const isSel = this.selected.has(m.id);
    const isImage = !m.mime || m.mime.startsWith('image/');
    const media = isImage
      ? h('img', { src: this.thumbOf(m), alt: m.alt || '', loading: 'lazy', decoding: 'async' })
      : h('span', { class: 'zoro-media-file', html: ICONS.file });
    const item = h('div', {
      class: 'zoro-media-item' + (isSel ? ' selected' : '') + (this.focused?.id === m.id ? ' focused' : ''),
      role: 'option',
      tabindex: '0',
      'aria-selected': String(isSel),
      title: m.filename,
    },
      h('div', { class: 'zoro-media-thumb' }, media),
      h('div', { class: 'zoro-media-meta' },
        h('span', { class: 'zoro-media-name' }, m.filename),
        h('span', { class: 'zoro-media-sub' }, [m.width && m.height ? `${m.width}×${m.height}` : '', formatBytes(m.size)].filter(Boolean).join(' · ')),
      ),
      h('span', { class: 'zoro-media-check', html: ICONS.check, 'aria-hidden': 'true' }),
    );
    const activate = (e: MouseEvent | KeyboardEvent) => {
      const additive = this.opts.multiple && (e.ctrlKey || e.metaKey || e.shiftKey || (e.target as HTMLElement).closest('.zoro-media-check') || this.selected.size > 0 && 'pointerType' in e && (e as PointerEvent).pointerType === 'touch');
      this.toggleSelect(m, !!additive);
    };
    item.addEventListener('click', activate);
    item.addEventListener('dblclick', () => { if (!this.opts.manageOnly) { this.selected.clear(); this.selected.set(m.id, m); this.confirmSelection(); } });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e); }
      else if (e.key.startsWith('Arrow')) this.moveFocus(item, e);
      else if (e.key === 'Delete' && this.adapter.remove) { e.preventDefault(); void this.removeSelected(); }
    });
    return item;
  }

  private moveFocus(item: HTMLElement, e: KeyboardEvent) {
    const all = Array.from(this.el.grid.querySelectorAll<HTMLElement>('.zoro-media-item'));
    const i = all.indexOf(item);
    let cols = 1;
    if (this.view === 'grid' && all.length > 1) {
      const top = all[0]!.offsetTop;
      cols = all.findIndex((x) => x.offsetTop !== top);
      if (cols <= 0) cols = all.length;
    }
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? cols : -cols;
    const next = all[i + delta];
    if (next) { e.preventDefault(); next.focus(); }
  }

  private toggleSelect(m: MediaItem, additive: boolean) {
    if (additive) {
      if (this.selected.has(m.id)) this.selected.delete(m.id);
      else this.selected.set(m.id, m);
    } else if (this.selected.size === 1 && this.selected.has(m.id) && this.focused?.id === m.id) {
      // tapping the same item again deselects it
      this.selected.clear();
    } else {
      this.selected.clear();
      this.selected.set(m.id, m);
    }
    this.focused = this.selected.has(m.id) ? m : [...this.selected.values()].pop() ?? null;
    // update classes without re-rendering (scroll position is kept)
    this.el.grid.querySelectorAll<HTMLElement>('.zoro-media-item').forEach((el, i) => {
      const it = this.items[i];
      if (!it) return;
      const s = this.selected.has(it.id);
      el.classList.toggle('selected', s);
      el.classList.toggle('focused', this.focused?.id === it.id);
      el.setAttribute('aria-selected', String(s));
    });
    this.renderDetails();
    this.renderFooter();
  }

  private renderDetails() {
    const t = this.t;
    const d = this.el.details;
    const m = this.focused && this.selected.has(this.focused.id) ? this.focused : null;
    d.innerHTML = '';
    this.el.root.classList.toggle('has-details', !!m);
    if (!m) return;

    const isImage = !m.mime || m.mime.startsWith('image/');
    const preview = h('div', { class: 'zoro-details-preview' },
      isImage ? h('img', { src: m.variants?.md?.url ?? m.variants?.sm?.url ?? m.url, alt: m.alt || '' }) : h('span', { html: ICONS.file }),
    );
    const meta = h('dl', { class: 'zoro-details-meta' });
    const row = (k: string, v?: string | number | null) => { if (v) meta.append(h('dt', {}, k), h('dd', {}, String(v))); };
    row(t.filename, m.filename);
    row(t.dimensions, m.width && m.height ? `${m.width} × ${m.height}` : null);
    row(t.fileSize, formatBytes(m.size));
    row(t.uploadedAt, m.createdAt ? new Date(m.createdAt).toLocaleDateString() : null);
    if (m.usageCount !== undefined) row(t.usage, m.usageCount ? fmt(t.usedIn, { n: m.usageCount }) : t.notUsed);

    const insertAlt = h('input', { type: 'text', class: 'zoro-input', value: this.insertAlts.get(m.id) ?? m.alt ?? '', placeholder: t.imageAltPlaceholder });
    insertAlt.addEventListener('input', () => { this.insertAlts.set(m.id, insertAlt.value); this.renderFooter(); });

    const fields = h('div', { class: 'zoro-form' });
    if (!this.opts.manageOnly) fields.append(h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.altForArticle), insertAlt));

    if (this.adapter.update) {
      const alt = h('input', { type: 'text', class: 'zoro-input', value: m.alt ?? '' });
      const caption = h('textarea', { class: 'zoro-input', rows: 2 });
      caption.value = m.caption ?? '';
      const fname = h('input', { type: 'text', class: 'zoro-input', value: m.filename.replace(/\.[^.]+$/, '') });
      const save = h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary zoro-btn-sm' }, t.save);
      save.addEventListener('click', async () => {
        save.disabled = true;
        try {
          const patch: Partial<MediaItem> = { alt: alt.value.trim(), caption: caption.value.trim() };
          const base = m.filename.replace(/\.[^.]+$/, '');
          if (fname.value.trim() && fname.value.trim() !== base) patch.filename = fname.value.trim();
          const updated = await this.adapter.update!(m.id, patch);
          Object.assign(m, updated);
          toast(t.saved, 'success', this.themeClass);
          this.renderGrid();
        } catch (e: any) {
          toast(e?.message || t.uploadFailed, 'error', this.themeClass);
        } finally {
          save.disabled = false;
        }
      });
      fields.append(
        h('details', { class: 'zoro-details-edit' },
          h('summary', {}, t.edit),
          h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.imageAlt), alt),
          h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.caption), caption),
          h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.filename), fname),
          save,
        ),
      );
    }

    const actions = h('div', { class: 'zoro-btn-row zoro-details-actions' },
      h('button', {
        type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-sm', html: `${ICONS.copy}<span>${t.copyUrl}</span>`,
        onclick: async () => {
          const abs = new URL(m.url, location.href).toString();
          try { await navigator.clipboard.writeText(abs); toast(t.copied, 'success', this.themeClass); }
          catch { void promptDialog({ title: t.copyUrl, label: 'URL', value: abs, ok: t.close, cancel: t.close, themeClass: this.themeClass }); }
        },
      }),
      this.adapter.remove ? h('button', {
        type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-sm zoro-text-danger', html: `${ICONS.trash}<span>${t.delete}</span>`,
        onclick: () => this.removeSelected([m]),
      }) : null,
    );
    const close = h('button', { type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-icon zoro-details-close', 'aria-label': t.close, html: ICONS.x, onclick: () => { this.selected.delete(m.id); this.focused = null; this.toggleSelectRefresh(); } });
    d.append(close, preview, meta, fields, actions);
  }

  private toggleSelectRefresh() {
    this.renderGrid();
    this.renderFooter();
  }

  private renderFooter() {
    const t = this.t;
    const f = this.el.footer;
    if (!f) return;
    f.innerHTML = '';
    const onLibrary = this.tabs?.active !== 'upload';
    const n = this.selected.size;
    const left = h('div', { class: 'zoro-finder-footer-left' });
    if (onLibrary && n > 0) {
      left.append(h('span', { class: 'zoro-finder-selected' }, fmt(t.selected, { n })));
      left.append(h('button', { type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-sm', onclick: () => { this.selected.clear(); this.focused = null; this.toggleSelectRefresh(); } }, t.clearSelection));
      if (this.adapter.move && (this.folders.length || this.canFolders)) {
        const mv = new ZoroSelect({
          variant: 'field',
          size: 'sm',
          label: t.moveTo,
          icon: ICONS.folderMove,
          placeholder: `${t.moveTo}…`,
          value: '__',
          resetAfterChange: true,
          items: [
            { value: '', label: t.rootFolder, icon: ICONS.folder },
            ...this.folders.map((x) => ({ value: x.path, label: x.name, icon: ICONS.folder, depth: x.path.split('/').length })),
          ],
          onChange: (target) => void moveTo(target),
        });
        const moveTo = async (target: string) => {
          try {
            await this.adapter.move!([...this.selected.keys()], target);
            this.selected.clear();
            this.focused = null;
            await this.load();
            this.renderFooter();
          } catch (e: any) { toast(e?.message || 'Hata', 'error', this.themeClass); }
        };
        left.append(mv.render());
      }
      if (this.adapter.remove && n > 1) left.append(h('button', { type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-sm zoro-text-danger', onclick: () => this.removeSelected() }, t.deleteSelected));
    } else if (onLibrary && this.total) {
      left.append(h('span', { class: 'zoro-finder-count' }, `${this.total}`));
    }
    const right = h('div', { class: 'zoro-btn-row' });
    right.append(h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary', onclick: () => this.close() }, t.close));
    if (!this.opts.manageOnly && onLibrary) {
      const missingAlt = this.requireAlt && [...this.selected.values()].some((m) => !(this.insertAlts.get(m.id) ?? m.alt ?? '').trim());
      const label = this.opts.selectLabel ?? (n > 1 ? fmt(t.insertImages, { n }) : t.insertImage);
      right.append(h('button', {
        type: 'button', class: 'zoro-btn zoro-btn-primary', disabled: n === 0 || missingAlt,
        title: missingAlt ? t.altRequired : '',
        onclick: () => this.confirmSelection(),
      }, label));
    }
    f.append(left, right);
  }

  private confirmSelection() {
    if (!this.selected.size) return;
    const list: SelectedMedia[] = [...this.selected.values()].map((m) => ({ ...m, insertAlt: (this.insertAlts.get(m.id) ?? m.alt ?? '').trim() }));
    if (this.requireAlt && list.some((m) => !m.insertAlt)) {
      toast(this.t.altRequired, 'error', this.themeClass);
      return;
    }
    this.opts.onSelect?.(list);
    this.close();
  }

  private async removeSelected(list?: MediaItem[]) {
    const t = this.t;
    const targets = list ?? [...this.selected.values()];
    if (!targets.length || !this.adapter.remove) return;
    const ok = await confirmDialog(fmt(t.deleteConfirm, { n: targets.length }), { title: t.delete, ok: t.delete, cancel: t.cancel, danger: true, themeClass: this.themeClass });
    if (!ok) return;
    try {
      await this.adapter.remove(targets.map((m) => m.id));
      for (const m of targets) this.selected.delete(m.id);
      this.focused = null;
      await this.load();
      this.renderFooter();
    } catch (e: any) {
      toast(e?.message || 'Hata', 'error', this.themeClass);
    }
  }

  private async createFolder() {
    const t = this.t;
    const parent = this.params.folder && this.params.folder !== '*' ? this.params.folder : '';
    const name = await promptDialog({
      title: t.newFolder, label: t.folderName, ok: t.save, cancel: t.cancel, themeClass: this.themeClass,
      validate: (v) => (!v || /[\\/:*?"<>|.]/.test(v) ? t.folderName : null),
    });
    if (!name) return;
    const path = parent ? `${parent}/${name}` : name;
    try {
      await this.adapter.createFolder!(path);
      this.params.folder = path;
      await this.load();
    } catch (e: any) { toast(e?.message || 'Hata', 'error', this.themeClass); }
  }

  private async deleteFolder(path: string) {
    const t = this.t;
    if (!this.adapter.deleteFolder) return;
    const ok = await confirmDialog(t.deleteFolderConfirm, { title: t.deleteFolder, ok: t.delete, cancel: t.cancel, danger: true, themeClass: this.themeClass });
    if (!ok) return;
    try {
      await this.adapter.deleteFolder(path);
      this.params.folder = '*';
      await this.load();
    } catch (e: any) { toast(e?.message || 'Hata', 'error', this.themeClass); }
  }

  // ───────────────────────── Upload ─────────────────────────

  private buildUpload(panel: HTMLDivElement) {
    const t = this.t;
    const input = h('input', { type: 'file', accept: this.accept.join(','), multiple: true, hidden: true });
    const types = this.accept.map((x) => x.split('/')[1]!.toUpperCase()).join(', ');
    const drop = h('div', {
      class: 'zoro-dropzone', role: 'button', tabindex: '0',
      html: `${ICONS.uploadBig}<p>${t.dropHere}</p><small>${fmt(t.dropHint, { types, max: this.maxMB })}</small>`,
    });
    drop.addEventListener('click', () => input.click());
    drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragging'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('dragging'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('dragging');
      this.addFiles(Array.from(e.dataTransfer?.files ?? []));
    });
    input.addEventListener('change', () => { this.addFiles(Array.from(input.files ?? [])); input.value = ''; });
    this.el.queue = h('div', { class: 'zoro-upload-list' });
    this.el.uploadBtn = h('div', { class: 'zoro-upload-actions' });
    panel.append(drop, input, this.el.queue, this.el.uploadBtn);
  }

  private onPaste = (e: ClipboardEvent) => {
    const files = Array.from(e.clipboardData?.files ?? []);
    if (!files.length) return;
    e.preventDefault();
    this.tabs?.setActive('upload');
    this.addFiles(files);
  };

  /** Add files from outside (for files dragged into the editor). */
  addFiles(files: File[]) {
    const t = this.t;
    for (const f of files) {
      if (!this.accept.includes(f.type)) { toast(`${f.name}: ${t.badType}`, 'error', this.themeClass); continue; }
      if (f.size > this.maxMB * 1048576) { toast(`${f.name}: ${fmt(t.tooLarge, { max: this.maxMB })}`, 'error', this.themeClass); continue; }
      this.queue.push({ file: f, preview: URL.createObjectURL(f), alt: altFromFilename(f.name) });
    }
    this.tabs?.setActive('upload');
    this.renderQueue();
  }

  private renderQueue() {
    const t = this.t;
    const list = this.el.queue;
    list.innerHTML = '';
    this.queue.forEach((q, idx) => {
      const alt = h('input', { type: 'text', class: 'zoro-input', value: q.alt, placeholder: t.imageAltPlaceholder, disabled: this.uploading, 'aria-label': t.altRequired });
      alt.addEventListener('input', () => { q.alt = alt.value; this.renderUploadButton(); });
      const row = h('div', { class: 'zoro-upload-item' + (q.error ? ' error' : '') },
        h('img', { src: q.preview, alt: '' }),
        h('div', { class: 'zoro-upload-item-info' },
          h('div', { class: 'zoro-upload-item-header' },
            h('span', { class: 'zoro-truncate' }, `${q.file.name} · ${formatBytes(q.file.size)}`),
            h('button', {
              type: 'button', class: 'zoro-btn zoro-btn-ghost zoro-btn-icon-sm', 'aria-label': t.delete, html: ICONS.x, disabled: this.uploading,
              onclick: () => { URL.revokeObjectURL(q.preview); this.queue.splice(idx, 1); this.renderQueue(); },
            }),
          ),
          h('label', { class: 'zoro-label' }, this.requireAlt ? t.altRequired : t.imageAlt),
          alt,
          q.progress !== undefined ? h('div', { class: 'zoro-progress' }, h('div', { class: 'zoro-progress-bar' + (q.error ? ' error' : ''), style: { width: `${Math.max(0, q.progress)}%` } })) : null,
          q.error ? h('p', { class: 'zoro-field-error' }, `${t.uploadFailed}: ${q.error}`) : null,
        ),
      );
      list.append(row);
    });
    this.renderUploadButton();
  }

  private renderUploadButton() {
    const t = this.t;
    const box = this.el.uploadBtn;
    box.innerHTML = '';
    if (!this.queue.length) return;
    const ready = !this.requireAlt || this.queue.every((q) => q.alt.trim());
    box.append(h('button', {
      type: 'button', class: 'zoro-btn zoro-btn-primary zoro-btn-block', disabled: !ready || this.uploading,
      html: this.uploading ? `<span class="zoro-spinner"></span> ${t.uploading}` : `${ICONS.upload} ${fmt(t.uploadFiles, { n: this.queue.length })}`,
      onclick: () => this.startUpload(),
    }));
  }

  private async startUpload() {
    this.uploading = true;
    this.renderQueue();
    const uploaded: MediaItem[] = [];
    const folder = this.params.folder && this.params.folder !== '*' ? this.params.folder : '';
    for (const q of [...this.queue]) {
      q.progress = 0;
      q.error = undefined;
      this.renderQueue();
      try {
        const item = await this.adapter.upload(q.file, {
          alt: q.alt.trim(),
          folder,
          onProgress: (p) => {
            q.progress = p;
            const bars = this.el.queue.querySelectorAll<HTMLDivElement>('.zoro-progress-bar');
            const bar = bars[this.queue.indexOf(q)];
            if (bar) bar.style.width = `${p}%`;
          },
        });
        uploaded.push(item);
        URL.revokeObjectURL(q.preview);
        this.queue.splice(this.queue.indexOf(q), 1);
      } catch (e: any) {
        q.progress = -1;
        q.error = e?.message || 'Hata';
      }
      this.renderQueue();
    }
    this.uploading = false;
    this.renderQueue();
    if (uploaded.length) {
      // uploaded files start out selected
      this.selected.clear();
      if (!this.opts.multiple) uploaded.splice(0, uploaded.length - 1);
      for (const u of uploaded) { this.selected.set(u.id, u); this.insertAlts.set(u.id, u.alt ?? ''); }
      this.focused = uploaded[uploaded.length - 1] ?? null;
      this.params.page = 1;
      this.tabs?.setActive('library');
      await this.load();
      this.renderFooter();
    }
  }
}

export function altFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  // Leave ALT empty for meaningless names like "IMG 2024 0102" (let the user write it)
  if (/^(img|image|dsc|pxl|screenshot|ekran görüntüsü|photo|whatsapp image)?\s*[\d\s.]*$/i.test(base)) return '';
  return base.charAt(0).toLocaleUpperCase('tr') + base.slice(1);
}

/** Standalone Finder: featured image, avatar, gallery picking, etc. */
export function openFinder(options: FinderOptions): ZoroFinder {
  return new ZoroFinder(options).open();
}
