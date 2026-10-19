// Gerçek tarayıcıda duman testi: masaüstü + mobil, konsol hataları, temel akışlar.
// Kullanım:  php -S 127.0.0.1:8765 -t .   (ayrı terminalde)  →  node e2e/smoke.mjs
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8765';
const OUT = process.env.SHOT_DIR ?? 'test-results/shots';
mkdirSync(OUT, { recursive: true });

let failures = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${name}${!cond && extra ? ` → ${extra}` : ''}`);
  if (!cond) failures++;
};

async function run(label, contextOpts) {
  console.log(`\n${label}`);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...contextOpts, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(`${BASE}/demo/index.html`);
  await page.waitForSelector('.zoro-prose');
  ok('editör yüklendi', await page.locator('.zoro-root').count() === 1);
  await page.screenshot({ path: `${OUT}/${label}-1-ilk.png`, fullPage: false });

  // Yatay taşma yok
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('sayfada yatay taşma yok', overflow <= 1, `${overflow}px`);

  // Yazma + kalın (kelime üzerinde, seçimsiz)
  const prose = page.locator('.zoro-prose');
  await prose.click();
  await page.evaluate(() => window.editor.editor.commands.focus('end'));
  await page.keyboard.press('Enter');
  await page.keyboard.type('deneme kelimesi');
  await page.keyboard.press('ArrowLeft');
  await page.locator('[data-name="bold"]').click();
  ok('seçimsiz Kalın kelimeye uygulanır', (await page.locator('#out-html').textContent()).includes('<strong>kelimesi</strong>'));

  // Shift+Alt+2 başlık
  await page.keyboard.press('Shift+Alt+Digit2');
  ok('Shift+Alt+2 → H2', (await page.locator('#out-html').textContent()).includes('<h2>deneme <strong>kelimesi</strong></h2>'));

  // Bağlantı: Ctrl+K
  await page.keyboard.press('Control+k');
  await page.waitForSelector('.zoro-link-popover input');
  await page.keyboard.type('ornek.com');
  await page.keyboard.press('Enter');
  ok('Ctrl+K bağlantı ekler', (await page.locator('#out-html').textContent()).includes('href="https://ornek.com"'));

  // Preset değişimi
  await page.locator('[data-preset="minimal"]').click();
  ok('minimal preset: tablo düğmesi yok', await page.locator('[data-name="table"]').count() === 0);
  await page.locator('#groups input[value="table"]').check();
  ok('tek hamlede tablo grubu eklendi', await page.locator('[data-name="table"]').count() === 1);
  await page.locator('[data-preset="full"]').click();

  // Tablo seçici
  await page.evaluate(() => window.editor.editor.commands.focus('end'));
  await page.locator('[data-name="table"]').click();
  await page.waitForSelector('.zoro-table-picker');
  await page.locator('.zoro-table-cell').nth(8 + 2).click(); // 3 sütun × 2 satır
  ok('tablo eklendi (3×2)', await page.locator('.zoro-prose table tr').count() === 2 && await page.locator('.zoro-prose table tr:first-child > *').count() === 3);

  // Finder (imleç tablonun dışında, sonda)
  await page.evaluate(() => { const ed = window.editor.editor; ed.chain().focus('end').run(); });
  await page.locator('.zoro-add-media').click();
  await page.waitForSelector('.zoro-media-item');
  ok('Finder açıldı, 4 görsel', await page.locator('.zoro-media-item').count() === 4);
  await page.screenshot({ path: `${OUT}/${label}-2-finder.png` });
  await page.locator('.zoro-media-item[title="deniz.svg"]').click();
  await page.waitForSelector('.zoro-finder-details .zoro-details-preview');
  await page.screenshot({ path: `${OUT}/${label}-3-finder-detay.png` });
  const insert = page.locator('.zoro-finder-footer .zoro-btn-primary');
  ok('ALT varken ekle aktif', await insert.isEnabled());
  await insert.click();
  ok('görsel editöre eklendi', (await page.locator('#out-html').textContent()).includes('alt="Sea view"'));

  // Görsel seçimi + araç çubuğu
  await page.locator('.zoro-image-container img').first().click();
  ok('görsel araç çubuğu görünür', await page.locator('.zoro-image-toolbar').isVisible());
  await page.locator('.zoro-image-toolbar-btn').nth(1).click(); // ortala
  ok('görsel ortalandı', (await page.locator('#out-html').textContent()).includes('data-alignment="center"'));
  await page.screenshot({ path: `${OUT}/${label}-4-gorsel.png` });

  // Kaynak modu
  await page.locator('.zoro-tab-toggle button').nth(1).click();
  ok('kaynak modu', await page.locator('.zoro-source').isVisible());
  await page.locator('.zoro-tab-toggle button').nth(0).click();

  // Tam ekran
  await page.locator('[data-name="fullscreen"]').click();
  const fs = await page.locator('.zoro-fullscreen').boundingBox();
  const vp = page.viewportSize();
  ok('tam ekran tüm alanı kaplar', fs && Math.abs(fs.width - vp.width) < 2 && Math.abs(fs.height - vp.height) < 2, JSON.stringify(fs));
  await page.screenshot({ path: `${OUT}/${label}-5-tamekran.png` });
  // ESC önce açık açılır kutuyu (ör. bağlantı) kapatır, sonra tam ekrandan çıkar
  for (let i = 0; i < 3 && await page.locator('.zoro-fullscreen').count(); i++) await page.keyboard.press('Escape');
  ok('ESC tam ekrandan çıkar', await page.locator('.zoro-fullscreen').count() === 0);

  // Bağımsız Finder (öne çıkan görsel)
  await page.locator('#pick').click();
  await page.waitForSelector('.zoro-media-item');
  await page.locator('.zoro-media-item[title="orman.svg"]').dblclick();
  ok('bağımsız Finder ile öne çıkan görsel', await page.locator('#featured-img').isVisible());

  // Koyu tema
  await page.locator('#theme').click();
  ok('koyu tema sınıfı', await page.locator('.zoro-root.zoro-theme-dark').count() === 1);
  await page.screenshot({ path: `${OUT}/${label}-6-koyu.png` });

  // Araç çubuğu düğmeleri dokunmatikte ≥ 40px
  if (contextOpts.hasTouch) {
    const box = await page.locator('[data-name="bold"]').boundingBox();
    ok('dokunmatik hedef ≥ 40px', box.width >= 40 && box.height >= 40, `${box.width}×${box.height}`);
    const tb = await page.locator('.zoro-toolbar').boundingBox();
    ok('araç çubuğu ekrana sığar', tb.width <= vp.width, `${tb.width} > ${vp.width}`);
  }

  // Tablo hücresindeki küçük görselin araç çubuğu ekranda ve tıklanabilir
  await page.evaluate(() => {
    const ed = window.editor.editor;
    let cell = null;
    ed.state.doc.descendants((n, pos) => { if (!cell && n.type.name === 'tableCell') cell = pos + 2; });
    ed.chain().focus().setTextSelection(cell).run();
    window.editor.insertImage({ src: document.querySelector('.zoro-prose img').src, alt: 'hücre' });
  });
  await page.locator('.zoro-prose td img').first().click();
  const tbb = await page.locator('.zoro-image-toolbar').boundingBox();
  const vpp = page.viewportSize();
  ok('hücredeki görselin araç çubuğu ekranda', tbb && tbb.x >= 0 && tbb.x + tbb.width <= vpp.width && tbb.y >= 0 && tbb.y + tbb.height <= vpp.height, JSON.stringify(tbb));
  await page.locator('.zoro-image-toolbar-btn').nth(5).click(); // sil
  ok('hücredeki görsel araç çubuğundan silindi', await page.locator('.zoro-prose td img').count() === 0);

  ok('konsol hatası yok', errors.length === 0, errors.join(' | '));
  await browser.close();
}

async function runPhp() {
  console.log('\nphp-backend');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/examples/php/`);
  await page.waitForSelector('.zoro-prose');
  ok('PHP sayfasında editör (data-zoro-editor otomatik)', await page.locator('.zoro-root').count() === 1);

  // Tarayıcıda gerçek bir PNG üret
  const b64 = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 1600; c.height = 900;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 1600, 900);
    gr.addColorStop(0, '#2271b1'); gr.addColorStop(1, '#72aee6');
    g.fillStyle = gr; g.fillRect(0, 0, 1600, 900);
    g.fillStyle = '#fff'; g.font = '120px sans-serif'; g.fillText('Zoro ' + Date.now(), 120, 480);
    return c.toDataURL('image/png').split(',')[1];
  });

  await page.locator('.zoro-add-media').click();
  await page.waitForSelector('.zoro-finder');
  await page.locator('.zoro-tab').nth(1).click();
  await page.locator('.zoro-finder input[type=file]').setInputFiles({ name: 'mavi-gokyuzu.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') });
  ok('ALT dosya adından önerildi', await page.locator('.zoro-upload-item .zoro-input').inputValue() === 'Mavi gokyuzu');
  await page.locator('.zoro-upload-actions .zoro-btn').click();
  await page.waitForSelector('.zoro-media-item.selected', { timeout: 20000 });
  ok('PHP backend yükledi ve seçili getirdi', true);
  await page.locator('.zoro-finder-footer .zoro-btn-primary').click();
  await page.waitForSelector('.zoro-prose img');
  await page.locator('#yazi-formu button[type=submit]').click();
  await page.waitForSelector('#sonuc');
  const saved = await page.locator('#sonuc pre').textContent();
  ok('kaydedilen içerikte görsel + srcset (WebP varyantları)', /<img[^>]+srcset="[^"]*-md\.webp 768w/.test(saved), saved.slice(0, 300));
  ok('ALT korundu', saved.includes('alt="Mavi gokyuzu"'));
  const src = saved.match(/src="([^"]+)"/)?.[1];
  const res = await page.request.get(new URL(src, page.url()).toString());
  ok('yüklenen dosya sunuluyor', res.ok(), String(res.status()));
  ok('konsol hatası yok', errors.length === 0, errors.join(' | '));
  await browser.close();
}

await runPhp();
await run('masaustu', { viewport: { width: 1280, height: 860 } });
await run('mobil', { ...devices['iPhone 13'] });
await run('dar-android', { ...devices['Galaxy S9+'], viewport: { width: 360, height: 740 } });

console.log(failures ? `\n${failures} kontrol başarısız` : '\nTüm kontroller geçti');
process.exit(failures ? 1 : 0);
