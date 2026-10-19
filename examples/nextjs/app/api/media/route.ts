/**
 * Zoro Finder backend as a Next.js route handler — no PHP needed (same JSON contract: docs/media-api.md).
 * Files go to public/uploads, metadata to .zoro/media.json.
 * Example only: add authorisation for production, resize images with sharp, store on S3 or similar.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const DATA_FILE = path.join(process.cwd(), '.zoro', 'media.json');
const ALLOWED: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif' };
const MAX = 20 * 1024 * 1024;

type Item = { id: number; url: string; filename: string; alt: string; caption: string; title: string; mime: string; size: number; folder: string; sha256: string; createdAt: string };
type Db = { seq: number; items: Item[]; folders: string[] };

async function read(): Promise<Db> {
  try { return JSON.parse(await readFile(DATA_FILE, 'utf8')); } catch { return { seq: 0, items: [], folders: [] }; }
}
async function write(db: Db) {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(db, null, 2));
}
const pub = ({ sha256: _s, ...i }: Item) => i;
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });
const slug = (s: string) => s.toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '') || 'gorsel';

// Example: only enabled in development. Write your own session check for production.
const authorized = () => process.env.NODE_ENV !== 'production';

export async function GET(req: NextRequest) {
  if (!authorized()) return err('Not authorised', 403);
  const q = req.nextUrl.searchParams;
  const db = await read();
  let items = db.items;
  const folder = q.get('folder');
  if (folder !== null) items = items.filter((i) => i.folder === folder);
  const search = q.get('search')?.toLocaleLowerCase('tr');
  if (search) items = items.filter((i) => `${i.filename} ${i.alt}`.toLocaleLowerCase('tr').includes(search));
  items = [...items].sort((a, b) => b.id - a.id);
  const page = Math.max(1, Number(q.get('page') ?? 1));
  const limit = Math.min(100, Number(q.get('limit') ?? 40));
  const slice = items.slice((page - 1) * limit, page * limit);
  return NextResponse.json({
    items: slice.map(pub), total: items.length, hasMore: page * limit < items.length,
    folders: db.folders.map((p) => ({ path: p, name: p.split('/').pop(), count: db.items.filter((i) => i.folder === p).length })),
  });
}

export async function POST(req: NextRequest) {
  if (!authorized()) return err('Not authorised', 403);
  const action = req.nextUrl.searchParams.get('action');
  const db = await read();

  if (action === 'upload') {
    const form = await req.formData();
    const file = form.get('file');
    const alt = String(form.get('alt') ?? '').trim();
    if (!(file instanceof File)) return err('No file received');
    if (!alt) return err('Alt text is required', 422);
    if (file.size > MAX) return err('File is too large', 413);
    const buf = Buffer.from(await file.arrayBuffer());
    const mime = sniff(buf);
    if (!mime) return err('Unsupported file type');
    const sha256 = createHash('sha256').update(buf).digest('hex');
    const dup = db.items.find((i) => i.sha256 === sha256);
    if (dup) return NextResponse.json({ item: { ...pub(dup), duplicate: true } });
    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${slug(file.name.replace(/\.[^.]+$/, ''))}-${Date.now().toString(36)}.${ALLOWED[mime]}`;
    await writeFile(path.join(UPLOAD_DIR, name), buf);
    const item: Item = { id: ++db.seq, url: `/uploads/${name}`, filename: name, alt, caption: '', title: '', mime, size: buf.length, folder: String(form.get('folder') ?? ''), sha256, createdAt: new Date().toISOString() };
    db.items.push(item);
    await write(db);
    return NextResponse.json({ item: pub(item) }, { status: 201 });
  }

  const body = await req.json().catch(() => ({}));
  if (action === 'update') {
    const it = db.items.find((i) => i.id === Number(req.nextUrl.searchParams.get('id')));
    if (!it) return err('Media not found', 404);
    for (const k of ['alt', 'caption', 'title'] as const) if (typeof body[k] === 'string') it[k] = body[k].slice(0, 500);
    await write(db);
    return NextResponse.json({ item: pub(it) });
  }
  if (action === 'delete') {
    const ids: number[] = (body.ids ?? []).map(Number);
    for (const it of db.items.filter((i) => ids.includes(i.id))) await unlink(path.join(UPLOAD_DIR, path.basename(it.filename))).catch(() => {});
    db.items = db.items.filter((i) => !ids.includes(i.id));
    await write(db);
    return NextResponse.json({ deleted: ids.length });
  }
  if (action === 'move') {
    const ids: number[] = (body.ids ?? []).map(Number);
    for (const it of db.items) if (ids.includes(it.id)) it.folder = String(body.folder ?? '');
    await write(db);
    return NextResponse.json({ success: true });
  }
  if (action === 'folder-create') {
    const p = String(body.path ?? '').split('/').map(slug).join('/');
    if (p && !db.folders.includes(p)) db.folders.push(p);
    await write(db);
    return NextResponse.json({ path: p });
  }
  if (action === 'folder-delete') {
    if (db.items.some((i) => i.folder === body.path)) return err('Folder is not empty', 409);
    db.folders = db.folders.filter((f) => f !== body.path);
    await write(db);
    return NextResponse.json({ success: true });
  }
  return err('Unknown action', 404);
}

/** Detect the type from the file content (never trust the MIME type sent by the client). */
function sniff(b: Buffer): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (b.subarray(0, 6).toString('ascii').startsWith('GIF8')) return 'image/gif';
  if (b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (b.subarray(4, 12).toString('ascii').startsWith('ftypavi')) return 'image/avif';
  return null;
}
