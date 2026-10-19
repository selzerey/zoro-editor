import type { MediaAdapter, MediaItem, MediaListParams, MediaListResult, RestAdapterOptions, UploadOptions } from '../types';

/** Default normalizer that also accepts the old ZoroEditor PHP format (altText, originalFilename). */
export function normalizeMediaItem(raw: any): MediaItem {
  return {
    id: raw.id,
    url: raw.url,
    filename: raw.filename ?? raw.originalFilename ?? raw.original_filename ?? String(raw.url ?? '').split('/').pop() ?? '',
    alt: raw.alt ?? raw.altText ?? raw.alt_text ?? '',
    caption: raw.caption ?? '',
    title: raw.title ?? '',
    mime: raw.mime ?? raw.mimeType ?? raw.mime_type,
    size: raw.size ?? raw.fileSize ?? raw.file_size,
    width: raw.width ?? null,
    height: raw.height ?? null,
    folder: raw.folder ?? '',
    srcset: raw.srcset ?? null,
    variants: raw.variants ?? undefined,
    createdAt: raw.createdAt ?? raw.created_at,
    usageCount: raw.usageCount ?? raw.usage_count,
  };
}

export class MediaApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'MediaApiError';
  }
}

/**
 * Adapter that connects to the Zoro PHP backend (php/public/media.php).
 * Works with any backend implementing the same JSON contract (see docs/media-api.md).
 */
export class RestMediaAdapter implements MediaAdapter {
  private transform: (raw: any) => MediaItem;
  constructor(private opts: RestAdapterOptions) {
    this.transform = opts.transform ?? normalizeMediaItem;
  }

  private url(action: string, params: Record<string, string | number | undefined> = {}): string {
    const u = new URL(this.opts.endpoint, typeof location !== 'undefined' ? location.href : 'http://localhost/');
    u.searchParams.set('action', action);
    // folder="" (root folder) is meaningful and must be sent; undefined = all folders
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && (v !== '' || k === 'folder')) u.searchParams.set(k, String(v));
    return u.toString();
  }

  private headers(): Record<string, string> {
    const hd = this.opts.headers;
    return { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(typeof hd === 'function' ? hd() : hd ?? {}) };
  }

  private async request(action: string, init: RequestInit & { params?: Record<string, any> } = {}): Promise<any> {
    const { params, ...rest } = init;
    const res = await fetch(this.url(action, params), {
      credentials: this.opts.credentials ?? 'same-origin',
      ...rest,
      headers: { ...this.headers(), ...(rest.body && !(rest.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(rest.headers as any) },
    });
    let data: any = null;
    try { data = await res.json(); } catch { /* empty response */ }
    if (!res.ok || data?.error) throw new MediaApiError(data?.error || `HTTP ${res.status}`, res.status);
    return data;
  }

  async list(p: MediaListParams): Promise<MediaListResult> {
    const data = await this.request('list', { params: { ...p } });
    const items = (data.items ?? data.media ?? []).map(this.transform);
    return { items, total: data.total ?? items.length, hasMore: !!data.hasMore, folders: data.folders };
  }

  upload(file: File, opts: UploadOptions): Promise<MediaItem> {
    // XHR for progress info (fetch doesn't report upload progress)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.url('upload'));
      xhr.withCredentials = (this.opts.credentials ?? 'same-origin') === 'include';
      for (const [k, v] of Object.entries(this.headers())) xhr.setRequestHeader(k, v);
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 95)); };
      xhr.onload = () => {
        let data: any = null;
        try { data = JSON.parse(xhr.responseText); } catch { /* */ }
        if (xhr.status >= 200 && xhr.status < 300 && data && !data.error) {
          opts.onProgress?.(100);
          resolve(this.transform(data.item ?? data.image ?? data));
        } else reject(new MediaApiError(data?.error || `HTTP ${xhr.status}`, xhr.status));
      };
      xhr.onerror = () => reject(new MediaApiError('Network error', 0));
      xhr.onabort = () => reject(new MediaApiError('Aborted', 0));
      opts.signal?.addEventListener('abort', () => xhr.abort());
      const fd = new FormData();
      fd.append('file', file);
      fd.append('alt', opts.alt);
      if (opts.folder) fd.append('folder', opts.folder);
      xhr.send(fd);
    });
  }

  async update(id: MediaItem['id'], data: Partial<MediaItem>): Promise<MediaItem> {
    const res = await this.request('update', { method: 'POST', params: { id }, body: JSON.stringify(data) });
    return this.transform(res.item ?? res.image ?? res);
  }

  async remove(ids: Array<MediaItem['id']>): Promise<void> {
    await this.request('delete', { method: 'POST', body: JSON.stringify({ ids }) });
  }

  async move(ids: Array<MediaItem['id']>, folder: string): Promise<void> {
    await this.request('move', { method: 'POST', body: JSON.stringify({ ids, folder }) });
  }

  async createFolder(path: string): Promise<void> {
    await this.request('folder-create', { method: 'POST', body: JSON.stringify({ path }) });
  }

  async deleteFolder(path: string): Promise<void> {
    await this.request('folder-delete', { method: 'POST', body: JSON.stringify({ path }) });
  }
}

/**
 * Fake in-browser backend (demo, tests, prototyping).
 * Files are kept as blob URLs and are lost on page reload.
 */
export class MemoryMediaAdapter implements MediaAdapter {
  items: MediaItem[] = [];
  folders = new Set<string>();
  private seq = 1;

  constructor(seed: Array<Partial<MediaItem> & { url: string }> = []) {
    for (const s of seed) this.items.push({ id: this.seq++, filename: s.url.split('/').pop() || 'image', folder: '', createdAt: new Date().toISOString(), ...s } as MediaItem);
    for (const it of this.items) if (it.folder) this.folders.add(it.folder);
  }

  async list(p: MediaListParams): Promise<MediaListResult> {
    let list = [...this.items];
    if (p.folder !== undefined && p.folder !== '*') list = list.filter((i) => (i.folder ?? '') === p.folder);
    if (p.search) {
      const q = p.search.toLocaleLowerCase('tr');
      list = list.filter((i) => `${i.filename} ${i.alt ?? ''}`.toLocaleLowerCase('tr').includes(q));
    }
    if (p.filter === 'unused') list = list.filter((i) => !i.usageCount);
    const sort = p.sort ?? 'newest';
    list.sort((a, b) =>
      sort === 'name' ? a.filename.localeCompare(b.filename, 'tr')
        : sort === 'size' ? (b.size ?? 0) - (a.size ?? 0)
          : sort === 'oldest' ? String(a.createdAt).localeCompare(String(b.createdAt)) || +a.id - +b.id
            : String(b.createdAt).localeCompare(String(a.createdAt)) || +b.id - +a.id,
    );
    const start = (p.page - 1) * p.limit;
    const folders = [...this.folders].sort().map((path) => ({ path, name: path.split('/').pop()!, count: this.items.filter((i) => i.folder === path).length }));
    return { items: list.slice(start, start + p.limit), total: list.length, hasMore: start + p.limit < list.length, folders };
  }

  async upload(file: File, opts: UploadOptions): Promise<MediaItem> {
    for (const pct of [30, 70, 100]) {
      await new Promise((r) => setTimeout(r, 60));
      opts.onProgress?.(pct);
    }
    const url = URL.createObjectURL(file);
    const dims = await new Promise<{ w: number; h: number } | null>((resolve) => {
      const im = new Image();
      im.onload = () => resolve({ w: im.naturalWidth, h: im.naturalHeight });
      im.onerror = () => resolve(null);
      im.src = url;
      setTimeout(() => resolve(null), 1500);
    });
    const item: MediaItem = {
      id: this.seq++, url, filename: file.name, alt: opts.alt, mime: file.type, size: file.size,
      width: dims?.w ?? null, height: dims?.h ?? null, folder: opts.folder ?? '', createdAt: new Date().toISOString(), usageCount: 0,
    };
    this.items.push(item);
    return item;
  }

  async update(id: MediaItem['id'], data: Partial<MediaItem>): Promise<MediaItem> {
    const it = this.items.find((i) => i.id === id);
    if (!it) throw new MediaApiError('Not found', 404);
    Object.assign(it, data);
    return it;
  }

  async remove(ids: Array<MediaItem['id']>): Promise<void> {
    this.items = this.items.filter((i) => !ids.includes(i.id));
  }

  async move(ids: Array<MediaItem['id']>, folder: string): Promise<void> {
    for (const i of this.items) if (ids.includes(i.id)) i.folder = folder;
  }

  async createFolder(path: string): Promise<void> {
    this.folders.add(path);
  }

  async deleteFolder(path: string): Promise<void> {
    if (this.items.some((i) => i.folder === path)) throw new MediaApiError('Folder is not empty', 409);
    this.folders.delete(path);
  }
}

export function formatBytes(n?: number): string {
  if (!n && n !== 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

/** Best URL + srcset to insert into the editor. */
export function pickInsertSource(item: MediaItem, variant = 'lg'): { src: string; srcset: string | null; width: number | null; height: number | null } {
  const v = item.variants?.[variant];
  const src = v?.url ?? item.url;
  let srcset = item.srcset ?? null;
  if (!srcset && item.variants) {
    const parts = Object.entries(item.variants)
      .filter(([k, x]) => k !== 'thumb' && x.width)
      .map(([, x]) => `${x.url} ${x.width}w`);
    if (item.width) parts.push(`${item.url} ${item.width}w`);
    srcset = parts.length > 1 ? parts.join(', ') : null;
  }
  return { src, srcset, width: v?.width ?? item.width ?? null, height: v?.height ?? item.height ?? null };
}
