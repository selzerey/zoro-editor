// Next.js örneği duman testi:  (examples/nextjs) npx next dev -p 3100  →  node e2e/nextjs.mjs
import { chromium } from '@playwright/test';

const BASE = process.env.NEXT_URL ?? 'http://localhost:3100';
let failures = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${name}${!cond && extra ? ` → ${extra}` : ''}`);
  if (!cond) failures++;
};

for (let i = 0; i < 60; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch { /* henüz açılmadı */ }
  await new Promise((r) => setTimeout(r, 1000));
}

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

console.log('nextjs');
const html = await (await fetch(BASE)).text();
ok('SSR çıktısı editör kabını içerir', html.includes('data-zoro-react'));
await page.goto(BASE);
await page.waitForSelector('.zoro-prose', { timeout: 60000 });
ok('istemcide tek editör (StrictMode dev)', await page.locator('.zoro-root').count() === 1);

const b64 = await page.evaluate(() => {
  const c = document.createElement('canvas');
  c.width = 800; c.height = 500;
  const g = c.getContext('2d');
  g.fillStyle = '#00a32a'; g.fillRect(0, 0, 800, 500);
  g.fillStyle = '#fff'; g.font = '60px sans-serif'; g.fillText('Next ' + Date.now(), 40, 260);
  return c.toDataURL('image/png').split(',')[1];
});
await page.locator('.zoro-add-media').click();
await page.waitForSelector('.zoro-finder');
await page.locator('.zoro-tab').nth(1).click();
await page.locator('.zoro-finder input[type=file]').setInputFiles({ name: 'yesil-alan.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') });
await page.locator('.zoro-upload-actions .zoro-btn').click();
await page.waitForSelector('.zoro-media-item.selected', { timeout: 20000 });
await page.locator('.zoro-finder-footer .zoro-btn-primary').click();
await page.waitForSelector('.zoro-prose img');
const hidden = await page.locator('input[name="content"]').inputValue();
ok('API route ile yüklendi, gizli alana yazıldı', /<img[^>]+src="\/uploads\/yesil-alan-[^"]+\.png"[^>]*alt="Yesil alan"/.test(hidden), hidden.slice(-200));

await page.locator('button', { hasText: 'Öne çıkan görsel seç' }).click();
await page.waitForSelector('.zoro-media-item');
await page.locator('.zoro-media-item').first().dblclick();
ok('useZoroFinder ile öne çıkan görsel', (await page.locator('input[name="cover"]').inputValue()).startsWith('/uploads/'));

ok('konsol/hydration hatası yok', errors.length === 0, errors.join(' | '));
await browser.close();
console.log(failures ? `\n${failures} kontrol başarısız` : '\nTüm kontroller geçti');
process.exit(failures ? 1 : 0);
