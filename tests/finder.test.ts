import { ZoroFinder } from '../src/finder/finder';
import { MemoryMediaAdapter } from '../src/finder/adapters';

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));
afterEach(() => { document.body.innerHTML = ''; document.body.className = ''; });

function seed() {
  return new MemoryMediaAdapter([
    { url: '/a.jpg', filename: 'a.jpg', alt: 'Elma', width: 800, height: 600 },
    { url: '/b.jpg', filename: 'b.jpg', alt: '', width: 400, height: 300 },
  ]);
}

const item = (name: string) => [...document.querySelectorAll<HTMLElement>('.zoro-media-item')].find((i) => i.title === name)!;
const insertBtn = () => document.querySelector<HTMLButtonElement>('.zoro-finder-footer .zoro-btn-primary')!;

describe('ZoroFinder', () => {
  it('listeler, seçer, ALT ile döndürür', async () => {
    const onSelect = vi.fn();
    new ZoroFinder({ adapter: seed(), onSelect }).open();
    await tick();
    expect(document.querySelectorAll('.zoro-media-item').length).toBe(2);
    item('a.jpg').click();
    expect(insertBtn().disabled).toBe(false);
    insertBtn().click();
    expect(onSelect).toHaveBeenCalledWith([expect.objectContaining({ url: '/a.jpg', insertAlt: 'Elma' })]);
    expect(document.querySelector('.zoro-dialog-overlay')).toBeNull();
  });

  it('ALT yoksa ekleme düğmesi kapalı (requireAlt)', async () => {
    new ZoroFinder({ adapter: seed(), onSelect: () => {} }).open();
    await tick();
    item('b.jpg').click();
    expect(insertBtn().disabled).toBe(true);
    const altInput = document.querySelector<HTMLInputElement>('.zoro-finder-details .zoro-input')!;
    altInput.value = 'Armut';
    altInput.dispatchEvent(new Event('input'));
    expect(insertBtn().disabled).toBe(false);
  });

  it('çoklu seçim (Ctrl+tık)', async () => {
    const onSelect = vi.fn();
    new ZoroFinder({ adapter: seed(), multiple: true, requireAlt: false, onSelect }).open();
    await tick();
    item('a.jpg').click();
    item('b.jpg').dispatchEvent(new MouseEvent('click', { ctrlKey: true, bubbles: true }));
    insertBtn().click();
    expect(onSelect.mock.calls[0][0]).toHaveLength(2);
  });

  it('arama süzer', async () => {
    new ZoroFinder({ adapter: seed() }).open();
    await tick();
    const s = document.querySelector<HTMLInputElement>('.zoro-media-search input')!;
    s.value = 'elma';
    s.dispatchEvent(new Event('input'));
    await tick(350);
    expect(document.querySelectorAll('.zoro-media-item').length).toBe(1);
  });

  it('yükleme kuyruğu dosya adından ALT önerir ve yükler', async () => {
    const adapter = seed();
    const f = new ZoroFinder({ adapter, multiple: true }).open();
    await tick();
    f.addFiles([new File(['x'], 'deniz-manzarasi.png', { type: 'image/png' })]);
    const alt = document.querySelector<HTMLInputElement>('.zoro-upload-item .zoro-input')!;
    expect(alt.value).toBe('Deniz manzarasi');
    document.querySelector<HTMLButtonElement>('.zoro-upload-actions .zoro-btn')!.click();
    await tick(1900);
    expect(adapter.items.length).toBe(3);
    // yüklenen dosya seçili gelir
    expect(document.querySelector('.zoro-media-item.selected')).not.toBeNull();
  });

  it('desteklenmeyen tür reddedilir', () => {
    const f = new ZoroFinder({ adapter: seed() }).open();
    f.addFiles([new File(['x'], 'kotu.exe', { type: 'application/x-msdownload' })]);
    expect(document.querySelectorAll('.zoro-upload-item').length).toBe(0);
  });

  it('adapter/endpoint yoksa açık hata', () => {
    expect(() => new ZoroFinder({})).toThrow(/adapter/);
  });
});
