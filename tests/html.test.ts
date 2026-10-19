import { cleanPastedHTML, isSafeUrl, normalizeUrl, cleanHTML, countWords } from '../src/core/html';
import { altFromFilename } from '../src/finder/finder';

describe('URL güvenliği', () => {
  it.each(['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'java\nscript:alert(1)', 'data:text/html,x', 'vbscript:x'])('reddeder: %s', (u) => {
    expect(isSafeUrl(u)).toBe(false);
  });
  it.each(['https://ornek.com', '/sayfa', '#baslik', 'mailto:a@b.co', 'tel:+905551112233', 'ornek.com/a'])('kabul eder: %s', (u) => {
    expect(isSafeUrl(u)).toBe(true);
  });
  it('normalizeUrl', () => {
    expect(normalizeUrl('ornek.com')).toBe('https://ornek.com');
    expect(normalizeUrl('ali@ornek.com')).toBe('mailto:ali@ornek.com');
    expect(normalizeUrl('/x')).toBe('/x');
  });
});

describe('yapıştırma temizliği', () => {
  it('Google Docs kalın sarmalayıcısını kaldırır', () => {
    const html = '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-abc"><p><span style="font-weight:700">Kalın</span> normal</p></b>';
    const out = cleanPastedHTML(html);
    expect(out).not.toContain('docs-internal-guid');
    expect(out).toContain('<strong>Kalın</strong>');
  });
  it('Word çöplerini atar', () => {
    const html = '<!--[if gte mso 9]><xml>x</xml><![endif]--><p class="MsoNormal" style="mso-line-height:1">Merhaba<o:p></o:p></p>';
    const out = cleanPastedHTML(html);
    expect(out).not.toMatch(/mso|o:p|xml/i);
    expect(out).toContain('Merhaba');
  });
});

describe('çıktı', () => {
  it('cleanHTML boş paragrafları atar, blokları satıra böler', () => {
    expect(cleanHTML('<p>a</p><p></p><h2>b</h2>')).toBe('<p>a</p>\n<h2>b</h2>');
  });
  it('kelime sayımı', () => {
    expect(countWords('<p>Bir iki</p><p>üç</p>')).toBe(3);
  });
  it('dosya adından ALT', () => {
    expect(altFromFilename('kırmızı-araba_2024.jpg')).toBe('Kırmızı araba 2024');
    expect(altFromFilename('IMG_20240102.jpg')).toBe('');
  });
});
