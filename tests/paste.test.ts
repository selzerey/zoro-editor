import { cleanPasted, detectSource } from '../src/core/paste';
import { ZoroEditor } from '../src/core/editor';

// Örnekler elle hazırlandı (Word / Google Docs'un ürettiği yapıların sadeleştirilmiş hali)
const WORD = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta name=ProgId content=Word.Document><style><!--
@list l0:level1 { mso-level-number-format:bullet; mso-level-text:\\F0B7; }
@list l1:level1 { mso-level-start-at:3; }
@list l1:level2 { mso-level-number-format:alpha-lower; }
--></style></head>
<body lang=TR>
<!--StartFragment-->
<p class=MsoTitle>Rapor</p>
<p class=MsoListParagraphCxSpFirst style='mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;</span></span><![endif]>Elma</p>
<p class=MsoListParagraphCxSpLast style='mso-list:l0 level1 lfo1'><![if !supportLists]>·&nbsp;&nbsp;<![endif]>Armut</p>
<p class=MsoNormal style='margin-left:10pt;mso-bidi-font-weight:bold'>Ara&nbsp;&nbsp;&nbsp;metin <b>kalın</b> H<sub>2</sub>O<o:p></o:p></p>
<p class=MsoListParagraph style='mso-list:l1 level1 lfo2'><!--[if !supportLists]--><span style='mso-list:Ignore'>3.<span style='font:7.0pt "Times New Roman"'>&nbsp;</span></span><!--[endif]-->Üç</p>
<p class=MsoListParagraph style='mso-list:l1 level2 lfo2'><!--[if !supportLists]--><span style='mso-list:Ignore'>a.<span>&nbsp;</span></span><!--[endif]-->Alt madde</p>
<p class=MsoNormal><img width=100 height=50 src="file:///C:/Users/x/AppData/Local/Temp/msohtmlclip1/01/clip_image001.png"></p>
<!--EndFragment-->
</body></html>`;

const GDOCS = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-abc123"><p dir="ltr" style="line-height:1.38;margin-top:0pt"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;">Kalın</span><span style="font-size:11pt;color:#ff0000;background-color:transparent;font-weight:400;font-style:italic;">kırmızı eğik</span><span style="vertical-align:super;">2</span></p><ul style="margin-top:0"><li dir="ltr" style="list-style-type:disc"><p dir="ltr"><span style="color:#000000;background-color:#ffff00">vurgulu madde</span></p></li></ul></b><br class="Apple-interchange-newline">`;

const norm = (h: string) => h.replace(/\n\s*/g, '').trim();

describe('yapıştırma kaynağı tespiti', () => {
  it('Word / Docs / Excel / düz', () => {
    expect(detectSource(WORD)).toBe('word');
    expect(detectSource(GDOCS)).toBe('gdocs');
    expect(detectSource('<table xmlns:x="urn:schemas-microsoft-com:office:excel">')).toBe('excel');
    expect(detectSource('<p>merhaba</p>')).toBe('html');
  });
});

describe('Word yapıştırma', () => {
  const r = cleanPasted(WORD);
  const html = norm(r.html);

  it('başlık sınıfı → h1', () => {
    expect(html).toContain('<h1>Rapor</h1>');
  });
  it('madde imli liste gerçek <ul> olur, işaretçi metne sızmaz', () => {
    expect(html).toContain('<ul><li>Elma</li><li>Armut</li></ul>');
    expect(html).not.toMatch(/·|\u00b7/);
  });
  it('numaralı liste başlangıç numarası ve iç içe alt liste', () => {
    expect(html).toContain('<ol start="3"><li><p>Üç</p><ol><li>Alt madde</li></ol></li></ol>');
  });
  it('Word sınıf/stil/o:p temizlenir, alt simge ve kalın korunur, nbsp yığınları tek boşluk', () => {
    expect(html).toContain('<p>Ara metin <b>kalın</b> H<sub>2</sub>O</p>');
    expect(html).not.toMatch(/Mso|mso-|o:p|<style|StartFragment/);
  });
  it('yerel disk görselleri atılır ve sayılır', () => {
    expect(r.droppedLocalImages).toBe(1);
    expect(html).not.toContain('file:');
  });
  it('editöre yapıştırınca liste yapısı korunur', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const ed = new ZoroEditor(el);
    ed.setContent(r.html);
    const out = norm(ed.getHTML());
    expect(out).toContain('<ul><li><p>Elma</p></li><li><p>Armut</p></li></ul>');
    expect(out).toContain('<ol start="3">');
    expect(out).toContain('<sub>2</sub>');
    ed.destroy();
    el.remove();
  });
});

describe('Google Docs yapıştırma', () => {
  const html = norm(cleanPasted(GDOCS).html);
  it('her şeyi kalın yapan sarmalayıcı açılır, stiller etikete çevrilir', () => {
    expect(html).not.toContain('docs-internal-guid');
    expect(html).toContain('<strong>Kalın</strong>');
    expect(html).toContain('<span style="color: #ff0000"><em>kırmızı eğik</em></span>');
    expect(html).toContain('<sup>2</sup>');
  });
  it('siyah renk ve şeffaf zemin atılır; sarı zemin vurgu olur; li > p açılır', () => {
    expect(html).not.toMatch(/#000000|transparent/);
    expect(html).toContain('<li><mark data-color="#ffff00" style="background-color: #ffff00">vurgulu madde</mark></li>');
    expect(html).not.toContain('Apple-interchange-newline');
  });
});

describe('genel', () => {
  it('düz HTML bozulmaz', () => {
    expect(cleanPasted('<p>Merhaba <a href="https://a.com">dünya</a></p>').html).toBe('<p>Merhaba <a href="https://a.com">dünya</a></p>');
  });
  it('script/style atılır', () => {
    expect(cleanPasted('<style>p{color:red}</style><script>alert(1)</script><p>x</p>').html).toBe('<p>x</p>');
  });
  it('Excel tablosu: genişlikler ve x: öznitelikleri atılır', () => {
    const r = cleanPasted('<html xmlns:x="urn:schemas-microsoft-com:office:excel"><table border=0 width=200 style="width:150pt"><col width=64><tr height=20><td width=64 x:num="12" class=xl65>12</td></tr></table></html>');
    expect(norm(r.html)).toBe('<table><tbody><tr><td>12</td></tr></tbody></table>');
  });
});
