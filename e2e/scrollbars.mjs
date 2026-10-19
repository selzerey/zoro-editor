// Gereksiz kaydırma çubuğu taraması: içerik sığdığı hâlde kaydırma çubuğu gösteren öğeleri bulur
import { chromium, devices } from '@playwright/test';
import { pathToFileURL } from 'node:url';
const url = pathToFileURL('test/ZoroEditor-Demo.html').href;
let bad = 0;
async function scan(page, where) {
  const found = await page.evaluate(() => [...document.querySelectorAll('.zoro-root, .zoro-root *')].filter((el) => {
    const cs = getComputedStyle(el);
    const vy = /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1 && el.scrollHeight - el.clientHeight < 12;
    const vx = /(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1 && el.scrollWidth - el.clientWidth < 12;
    return (vy || vx) && el.offsetParent !== null;
  }).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} (${el.scrollWidth}x${el.scrollHeight} / ${el.clientWidth}x${el.clientHeight})`));
  console.log(`${found.length ? '  ✗' : '  ✓'} ${where}${found.length ? ': ' + found.join(', ') : ''}`);
  bad += found.length;
}
const b = await chromium.launch();
for (const [label, opts] of [['masaüstü', { viewport: { width: 1280, height: 900 } }], ['mobil', devices['iPhone 13']]]) {
  console.log(label);
  const p = await b.newPage(opts);
  await p.goto(url); await p.waitForSelector('.zoro-prose');
  await p.evaluate(() => window.editor.setContent('<p>a</p><table><tbody><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>1</p></td><td><p>2</p></td></tr></tbody></table><p>b</p>'));
  await scan(p, 'editör + tablo');
  await p.locator('.zoro-add-media').click(); await p.waitForSelector('.zoro-media-item'); await p.waitForTimeout(300);
  await scan(p, 'Finder kütüphane');
  await p.locator('.zoro-tab').nth(1).click(); await p.waitForTimeout(200);
  await scan(p, 'Finder yükleme');
  await p.keyboard.press('Escape');
  await p.evaluate(() => window.editor.showHelp()); await p.waitForTimeout(250);
  await scan(p, 'kısayollar penceresi');
  await p.close();
}
await b.close();
console.log(bad ? `\n${bad} gereksiz kaydırma çubuğu` : '\nGereksiz kaydırma çubuğu yok');
process.exit(bad ? 1 : 0);
