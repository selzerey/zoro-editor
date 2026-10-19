import { ZoroEditor } from '../src/core/editor';
import { fold } from '../src/core/slash';

const mount = () => { const el = document.createElement('div'); document.body.appendChild(el); return el; };
const key = (ed: ZoroEditor, k: string) => ed.editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
afterEach(() => { document.body.innerHTML = ''; });

function typeSlash(ed: ZoroEditor, q: string) {
  ed.editor.commands.focus('end');
  ed.editor.view.hasFocus = () => true; // jsdom odak bilgisi vermez
  ed.editor.commands.insertContent('/' + q);
}

describe('/ komut menüsü', () => {
  it('Türkçe katlama', () => {
    expect(fold('Başlık')).toBe('baslik');
    expect(fold('IŞIK Çiçek Ğ Ü Ö')).toBe('isik cicek g u o');
  });

  it('"/tab" tabloyu bulur, Enter ile ekler ve "/tab" metnini siler', () => {
    const ed = new ZoroEditor(mount(), { preset: 'full', media: false });
    typeSlash(ed, 'tab');
    const items = [...document.querySelectorAll('.zoro-slash-item strong')].map((x) => x.textContent);
    expect(items[0]).toBe('Tablo');
    key(ed, 'Enter');
    expect(document.querySelector('.zoro-slash')).toBeNull();
    expect(ed.getHTML()).toContain('<table');
    expect(ed.getText()).not.toContain('/tab');
    ed.destroy();
  });

  it('"/baslik 2" (aksansız) Başlık 2 yapar', () => {
    const ed = new ZoroEditor(mount(), { content: '<p>Merhaba</p>' });
    ed.editor.commands.setContent('<p></p>');
    typeSlash(ed, 'baslik');
    key(ed, 'ArrowDown'); // Başlık 1 → Başlık 2
    key(ed, 'Enter');
    expect(ed.getHTML()).toBe('<h2></h2>');
    expect(ed.editor.isActive('heading', { level: 2 })).toBe(true);
    ed.destroy();
  });

  it('grubu kapalı komut görünmez; Esc kapatır; classic görünümde varsayılan kapalı', () => {
    const ed = new ZoroEditor(mount(), { groups: ['format', 'list'] });
    typeSlash(ed, '');
    const names = [...document.querySelectorAll('.zoro-slash-item strong')].map((x) => x.textContent);
    expect(names).toContain('Madde listesi');
    expect(names).not.toContain('Tablo');
    key(ed, 'Escape');
    expect(document.querySelector('.zoro-slash')).toBeNull();
    ed.destroy();
    const c = new ZoroEditor(mount(), { skin: 'classic' });
    typeSlash(c, '');
    expect(document.querySelector('.zoro-slash')).toBeNull();
    c.destroy();
  });

  it('URL içindeki eğik çizgi menüyü açmaz', () => {
    const ed = new ZoroEditor(mount());
    ed.editor.commands.focus('end');
    ed.editor.view.hasFocus = () => true;
    ed.editor.commands.insertContent('https://ornek.com/yol');
    expect(document.querySelector('.zoro-slash')).toBeNull();
    ed.destroy();
  });
});
