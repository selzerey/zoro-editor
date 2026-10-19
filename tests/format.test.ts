import { formatHTML, blockIndexAt } from '../src/core/format';
import { ZoroEditor } from '../src/core/editor';

describe('HTML girintileme', () => {
  it('bloklar girintili, satır içi tek satır, pre aynen', () => {
    const { html, blockStarts } = formatHTML('<h2>Başlık</h2><ul><li><p>Bir <strong>iki</strong></p></li><li><p>üç</p><ul><li><p>dört</p></li></ul></li></ul><pre><code>a\n  b</code></pre><p>son</p>');
    expect(html).toBe([
      '<h2>Başlık</h2>',
      '<ul>',
      '  <li><p>Bir <strong>iki</strong></p></li>',
      '  <li>',
      '    <p>üç</p>',
      '    <ul>',
      '      <li><p>dört</p></li>',
      '    </ul>',
      '  </li>',
      '</ul>',
      '<pre><code>a\n  b</code></pre>',
      '<p>son</p>',
    ].join('\n'));
    expect(blockStarts.length).toBe(4);
    expect(html.slice(blockStarts[3]!)).toBe('<p>son</p>');
  });

  it('cleanHTML çıktısındaki satır sonları girintiyi bozmaz', () => {
    const { html } = formatHTML('<ul>\n<li><p>Bir</p>\n</li>\n<li><p>İki</p>\n</li>\n</ul>\n<p>son</p>');
    expect(html).toBe('<ul>\n  <li><p>Bir</p></li>\n  <li><p>İki</p></li>\n</ul>\n<p>son</p>');
  });

  it('imleç ofsetinden blok indeksi', () => {
    const src = '<h2>A</h2>\n<ul>\n  <li>x</li>\n</ul>\n<p>son</p>';
    expect(blockIndexAt(src, 0)).toBe(0);
    expect(blockIndexAt(src, src.indexOf('x'))).toBe(1);
    expect(blockIndexAt(src, src.length)).toBe(2);
  });
});

describe('kaynak modu', () => {
  it('kaynak değişmediyse geri dönünce geçmiş korunur (yeniden yüklenmez)', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const ed = new ZoroEditor(el, { content: '<p>bir</p>' });
    ed.editor.commands.insertContent(' iki');
    ed.setMode('code');
    expect(ed.root.querySelector<HTMLTextAreaElement>('.zoro-source')!.value).toContain('<p>');
    ed.setMode('visual');
    ed.editor.commands.undo();
    expect(ed.getHTML()).toBe('<p>bir</p>');
    ed.destroy();
  });
});
