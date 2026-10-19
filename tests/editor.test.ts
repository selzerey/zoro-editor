import { Slice } from '@tiptap/pm/model';
import { ZoroEditor } from '../src/core/editor';

const mount = () => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
};
const tick = () => new Promise((r) => setTimeout(r, 30));

afterEach(() => { document.body.innerHTML = ''; });

describe('ZoroEditor', () => {
  it('içerik verir ve alır', () => {
    const ed = new ZoroEditor(mount(), { content: '<p>Merhaba <strong>dünya</strong></p>' });
    expect(ed.getHTML()).toBe('<p>Merhaba <strong>dünya</strong></p>');
    ed.setContent('<h2>Başlık</h2>');
    expect(ed.getHTML()).toBe('<h2>Başlık</h2>');
    ed.destroy();
  });

  it('boş editör "" döndürür', () => {
    const ed = new ZoroEditor(mount());
    expect(ed.getHTML()).toBe('');
    ed.destroy();
  });

  it('değişiklikte onChange çağrılır', () => {
    const onChange = vi.fn();
    const ed = new ZoroEditor(mount(), { onChange });
    ed.editor.commands.insertContent('Selam');
    expect(onChange).toHaveBeenLastCalledWith('<p>Selam</p>');
    ed.destroy();
  });

  it('preset düğmeleri çizer, tek hamlede grup eklenir/çıkarılır', () => {
    const ed = new ZoroEditor(mount(), { preset: 'minimal', media: false });
    const names = () => [...ed.root.querySelectorAll<HTMLElement>('.zoro-toolbar-btn')].map((b) => b.dataset.name);
    expect(names()).toContain('bold');
    expect(names()).not.toContain('table');
    ed.addGroups(['table', 'color']);
    expect(names()).toEqual(expect.arrayContaining(['table', 'textColor', 'bgColor']));
    ed.removeGroups(['table']);
    expect(names()).not.toContain('table');
    ed.setPreset('basic');
    expect(ed.getGroups()).toEqual(['block', 'format', 'list', 'link', 'history', 'view']);
    ed.destroy();
  });

  it('medya ayarı yoksa medya grubu ve "Ortam ekle" görünmez', () => {
    const ed = new ZoroEditor(mount(), { preset: 'full' });
    expect(ed.root.querySelector('.zoro-add-media')).toBeNull();
    ed.destroy();
    const ed2 = new ZoroEditor(mount(), { preset: 'full', onImageUpload: async () => '/x.jpg' });
    expect(ed2.root.querySelector('.zoro-add-media')).not.toBeNull();
    ed2.destroy();
  });

  it('textarea yerine geçer, değeri senkronlar, destroy geri getirir', () => {
    const form = document.createElement('form');
    const ta = document.createElement('textarea');
    ta.name = 'icerik';
    ta.value = '<p>İlk</p>';
    form.appendChild(ta);
    document.body.appendChild(form);
    const ed = new ZoroEditor(ta);
    expect(ta.style.display).toBe('none');
    expect(ed.getHTML()).toBe('<p>İlk</p>');
    ed.editor.commands.setContent('<p>Yeni</p>', { emitUpdate: true });
    expect(ta.value).toBe('<p>Yeni</p>');
    ed.destroy();
    expect(ta.style.display).toBe('');
    expect(form.querySelector('.zoro-root')).toBeNull();
  });

  it('kaynak moduna gidip gelince içerik korunur', () => {
    const ed = new ZoroEditor(mount(), { content: '<p>a</p>' });
    ed.setMode('code');
    expect(ed.mode).toBe('code');
    const ta = ed.root.querySelector<HTMLTextAreaElement>('.zoro-source')!;
    expect(ta.value).toBe('<p>a</p>');
    ta.value = '<p>b</p>';
    ta.dispatchEvent(new Event('input'));
    expect(ed.getHTML()).toBe('<p>b</p>');
    ed.setMode('visual');
    expect(ed.getHTML()).toBe('<p>b</p>');
    ed.destroy();
  });

  it('javascript: bağlantısını reddeder, güvenli bağlantıyı uygular', () => {
    const ed = new ZoroEditor(mount(), { content: '<p>tikla</p>' });
    const range = { from: 1, to: 6 };
    expect(ed.applyLink({ href: 'javascript:alert(1)' }, range)).toBe(false);
    expect(ed.getHTML()).not.toContain('javascript');
    expect(ed.applyLink({ href: 'ornek.com', nofollow: true }, range)).toBe(true);
    expect(ed.getHTML()).toMatch(/^<p><a [^>]*>tikla<\/a><\/p>$/);
    const link = ed.root.querySelector('.zoro-prose a')!;
    expect(link.getAttribute('href')).toBe('https://ornek.com');
    expect(link.getAttribute('rel')).toBe('nofollow');
    expect(link.hasAttribute('target')).toBe(false);
    ed.destroy();
  });

  it('yeni sekme bağlantısına noopener ekler', () => {
    const ed = new ZoroEditor(mount(), { content: '<p>tikla</p>' });
    ed.applyLink({ href: 'https://a.com', newTab: true, sponsored: true }, { from: 1, to: 6 });
    const a = ed.root.querySelector('.zoro-prose a')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer sponsored');
    ed.destroy();
  });

  it('bağlantılara kendiliğinden target/nofollow eklemez', () => {
    const ed = new ZoroEditor(mount(), { content: '<p><a href="https://a.com">x</a></p>' });
    expect(ed.getHTML()).toBe('<p><a href="https://a.com">x</a></p>');
    ed.destroy();
  });

  it('kayıtlı içerikteki javascript: bağlantısı temizlenir', () => {
    const ed = new ZoroEditor(mount(), { content: '<p><a href="javascript:alert(1)">x</a></p>' });
    expect(ed.getHTML()).not.toContain('javascript');
    ed.destroy();
  });

  it('görsel hizalaması WordPress sınıfı + satır içi stil ile yazılır', () => {
    const ed = new ZoroEditor(mount(), { content: '<img src="/a.jpg" alt="A" class="aligncenter">' });
    const html = ed.getHTML();
    expect(html).toContain('data-alignment="center"');
    expect(html).toContain('class="aligncenter"');
    expect(html).toMatch(/margin-left: ?auto/);
    expect(html).toContain('loading="lazy"');
    ed.destroy();
  });

  it('kısayollar sadece kendi editörünü etkiler (çoklu örnek)', async () => {
    const a = new ZoroEditor(mount(), { content: '<p>a</p>' });
    const b = new ZoroEditor(mount(), { content: '<p>b</p>' });
    a.editor.commands.focus('end');
    a.editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit2', key: '@', shiftKey: true, altKey: true, bubbles: true }));
    await tick();
    expect(a.getHTML()).toBe('<h2>a</h2>');
    expect(b.getHTML()).toBe('<p>b</p>');
    a.destroy();
    b.destroy();
  });

  it('destroy her şeyi temizler', () => {
    const host = mount();
    const ed = new ZoroEditor(host);
    ed.destroy();
    expect(host.innerHTML).toBe('');
    expect(ed.isDestroyed).toBe(true);
    expect(() => ed.destroy()).not.toThrow();
  });

  it('salt okunur mod', () => {
    const ed = new ZoroEditor(mount(), { readOnly: true });
    expect(ed.editor.isEditable).toBe(false);
    ed.setReadOnly(false);
    expect(ed.editor.isEditable).toBe(true);
    ed.destroy();
  });

  it('maxLength sınırı uygulanır', () => {
    const ed = new ZoroEditor(mount(), { maxLength: 5 });
    ed.editor.commands.insertContent('1234567890');
    expect(ed.getText().length).toBeLessThanOrEqual(5);
    ed.destroy();
  });

  it('taslak kaydedilir ve geri yükleme önerilir', async () => {
    localStorage.clear();
    const ed = new ZoroEditor(mount(), { autosave: { key: 't1', delay: 1 } });
    ed.editor.commands.insertContent('taslak');
    await tick();
    ed.destroy();
    const ed2 = new ZoroEditor(mount(), { autosave: 't1' });
    const bar = ed2.root.querySelector('.zoro-draft-bar');
    expect(bar).not.toBeNull();
    bar!.querySelector<HTMLButtonElement>('.zoro-link-action')!.click();
    expect(ed2.getHTML()).toBe('<p>taslak</p>');
    ed2.clearDraft();
    expect(localStorage.getItem('zoro-draft:t1')).toBeNull();
    ed2.destroy();
  });

  it('yapıştırılan görsel onImageUpload ile yüklenir (base64 gömülmez)', async () => {
    let resolveUpload!: (v: string) => void;
    const onImageUpload = vi.fn(() => new Promise<string>((r) => { resolveUpload = r; }));
    const ed = new ZoroEditor(mount(), { onImageUpload });
    const file = new File(['x'], 'kedi.png', { type: 'image/png' });
    expect(ed.handleFiles([file], null)).toBe(true);
    expect(onImageUpload).toHaveBeenCalledWith(file);
    expect(ed.getHTML()).toBe(''); // yüklenirken blob görsel çıktıya yazılmaz
    resolveUpload('/uploads/kedi.webp');
    await tick();
    expect(ed.getHTML()).toContain('src="/uploads/kedi.webp"');
    expect(ed.getHTML()).toContain('alt="Kedi"');
    ed.destroy();
  });

  it('Excel/Word: HTML içerik varsa panodaki önizleme resmi yüklenmez', () => {
    const onImageUpload = vi.fn(async () => '/x.png');
    const ed = new ZoroEditor(mount(), { onImageUpload });
    const file = new File(['x'], 'image.png', { type: 'image/png' });
    const data: Record<string, string> = { 'text/html': '<table><tr><td>Hücre</td></tr></table>' };
    const event = { clipboardData: { files: [file], getData: (t: string) => data[t] ?? '' } } as any;
    const handled = ed.editor.view.someProp('handlePaste', (f: any) => f(ed.editor.view, event, null));
    expect(handled).toBeFalsy();
    expect(onImageUpload).not.toHaveBeenCalled();
    // Sadece resim (ekran görüntüsü) → yüklenir
    const ev2 = { clipboardData: { files: [file], getData: () => '' } } as any;
    expect(ed.editor.view.someProp('handlePaste', (f: any) => f(ed.editor.view, ev2, null))).toBe(true);
    expect(onImageUpload).toHaveBeenCalledTimes(1);
    ed.destroy();
  });

  it('yükleme sonrası geri al → ileri al geçici görseli geri getirmez', async () => {
    const ed = new ZoroEditor(mount(), { content: '<p>a</p>', onImageUpload: async () => '/son.webp' });
    ed.editor.commands.focus('end');
    ed.handleFiles([new File(['x'], 'kedi.png', { type: 'image/png' })], null);
    await tick();
    expect(ed.getHTML()).toContain('/son.webp');
    ed.editor.commands.undo();
    expect(ed.getHTML()).not.toContain('<img');
    ed.editor.commands.redo();
    expect(ed.getHTML()).toContain('/son.webp');
    expect(ed.editor.getHTML()).not.toContain('blob:');
    ed.destroy();
  });

  it('görsel: sola hizalama metni sarar (float), altyazı figure olarak yazılır ve geri okunur', () => {
    const ed = new ZoroEditor(mount(), { content: '<p>önce</p>' });
    ed.editor.commands.setContent('<img src="/a.jpg" alt="Kedi" class="alignleft" width="300" height="200"><p>yanındaki metin</p>');
    let html = ed.getHTML();
    expect(html).toContain('class="alignleft"');
    expect(html).toMatch(/float: ?left/);
    const json = ed.editor.getJSON();
    json.content![0]!.attrs!.caption = 'Sevimli kedi';
    ed.editor.commands.setContent(json);
    html = ed.getHTML();
    expect(html).toMatch(/<figure[^>]*class="wp-caption alignleft"[^>]*style="[^"]*width: ?300px/);
    expect(html).toContain('<figcaption class="wp-caption-text">Sevimli kedi</figcaption>');
    // Kaydedilen HTML'i tekrar açınca altyazı ve hizalama korunur
    ed.setContent(html);
    const img = ed.editor.getJSON().content![0]!;
    expect(img.type).toBe('image');
    expect(img.attrs).toMatchObject({ src: '/a.jpg', alt: 'Kedi', caption: 'Sevimli kedi', alignment: 'left', width: 300 });
    ed.destroy();
  });

  it('dekoratif görsel: alt="" + role="presentation"', () => {
    const ed = new ZoroEditor(mount(), { content: '<img src="/susleme.png" alt="" role="presentation">' });
    expect(ed.editor.getJSON().content![0]!.attrs!.decorative).toBe(true);
    expect(ed.getHTML()).toMatch(/alt=""/);
    expect(ed.getHTML()).toContain('role="presentation"');
    ed.destroy();
  });

  it('WordPress [caption] çıktısı (figure.wp-caption) okunur', () => {
    const ed = new ZoroEditor(mount(), { content: '<figure class="wp-caption aligncenter" style="width:400px"><img src="/b.jpg" alt="B" width="400" height="300"><figcaption class="wp-caption-text">Açıklama</figcaption></figure>' });
    expect(ed.editor.getJSON().content![0]!.attrs).toMatchObject({ src: '/b.jpg', caption: 'Açıklama', alignment: 'center' });
    ed.destroy();
  });

  it('yükleme hatasında görsel silinmez; Yeniden dene ile tamamlanır, Kaldır ile silinir', async () => {
    let fail = true;
    const onImageUpload = vi.fn(async () => { if (fail) throw new Error('sunucu kapalı'); return '/tamam.webp'; });
    const ed = new ZoroEditor(mount(), { onImageUpload });
    ed.handleFiles([new File(['x'], 'deniz.png', { type: 'image/png' })], null);
    await tick();
    const overlay = ed.root.querySelector('.zoro-upload-overlay.error')!;
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain('sunucu kapalı');
    expect(ed.root.querySelectorAll('.zoro-prose img').length).toBe(1);
    fail = false;
    overlay.querySelector<HTMLButtonElement>('.zoro-btn-primary')!.click();
    await tick();
    expect(ed.getHTML()).toContain('/tamam.webp');
    expect(ed.root.querySelector('.zoro-upload-overlay:not([hidden])')).toBeNull();
    // Kaldır yolu
    fail = true;
    ed.handleFiles([new File(['y'], 'orman.png', { type: 'image/png' })], null);
    await tick();
    ed.root.querySelector<HTMLButtonElement>('.zoro-upload-overlay.error .zoro-btn-secondary')!.click();
    expect(ed.root.querySelectorAll('.zoro-prose img').length).toBe(1);
    ed.destroy();
  });

  it('tablo: hücre zemini HTML çıktısına yazılır ve geri okunur', () => {
    const ed = new ZoroEditor(mount(), { content: '<table><tbody><tr><td style="background-color: #fcf9e8"><p>a</p></td><td><p>b</p></td></tr></tbody></table>' });
    expect(ed.getHTML()).toMatch(/<td[^>]*style="background-color: (#fcf9e8|rgb\(252, 249, 232\))/);
    expect((ed.editor.getJSON() as any).content[0].content[0].content[0].attrs.backgroundColor).toBe('#fcf9e8');
    ed.editor.commands.setTextSelection(ed.editor.state.doc.content.size - 4);
    ed.editor.chain().setCellAttribute('backgroundColor', '#edfaef').run();
    expect(ed.getHTML()).toMatch(/#edfaef|rgb\(237, 250, 239\)/);
    ed.destroy();
  });

  it('akıllı yapıştırma: seçili metne URL bağlantı olur; boş satırda YouTube gömülür', () => {
    const ed = new ZoroEditor(mount(), { content: '<p>tikla</p>' });
    const paste = (text: string) => {
      const event = { clipboardData: { files: [], getData: (t: string) => (t === 'text/plain' ? text : '') } } as any;
      return ed.editor.view.someProp('handlePaste', (f: any) => f(ed.editor.view, event, Slice.empty));
    };
    ed.editor.commands.setTextSelection({ from: 1, to: 6 });
    expect(paste('https://ornek.com/sayfa')).toBe(true);
    expect(ed.getHTML()).toBe('<p><a href="https://ornek.com/sayfa">tikla</a></p>');
    ed.editor.commands.setContent('<p></p>');
    expect(paste('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(ed.getHTML()).toContain('youtube');
    // Düz metin içinde URL: normal yapıştırma
    expect(paste('bak https://a.com')).toBeFalsy();
    ed.destroy();
  });
});
