// README screenshots: node scripts/screenshots.mjs → docs/images/*.png
import { chromium, devices } from '@playwright/test';
import { pathToFileURL } from 'node:url';
const url = pathToFileURL('test/ZoroEditor-Demo.html').href;
const OUT = 'docs/images';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1100, height: 820 }, deviceScaleFactor: 2 });
await p.goto(url); await p.waitForSelector('.zoro-prose');
await p.evaluate(() => localStorage.clear());
await p.addStyleTag({ content: '.zoro-tooltip{display:none!important}' });
const wrap = p.locator('.zoro-editor-wrapper');
await wrap.scrollIntoViewIfNeeded();
// text selected so the bubble menu shows
await p.evaluate(() => {
  const e = window.editor.editor;
  let from = 0;
  e.state.doc.descendants((n, pos) => { if (!from && n.isText && n.text.includes('multi-select')) from = pos + n.text.indexOf('multi-select'); });
  e.commands.focus();
  e.commands.setTextSelection({ from, to: from + 'multi-select'.length });
});
await p.waitForTimeout(400);
const box = await wrap.boundingBox();
const bub = await p.locator('.zoro-bubble').boundingBox();
const top = Math.min(box.y, bub ? bub.y : box.y) - 12;
await p.screenshot({ path: `${OUT}/modern.png`, clip: { x: box.x - 12, y: top, width: box.width + 24, height: Math.min(box.y + box.height, top + 560) - top + 12 } });
await p.mouse.click(5, 5);
// classic
await p.evaluate(() => window.editor.setSkin('classic'));
await p.waitForTimeout(300);
const box2 = await wrap.boundingBox();
await p.screenshot({ path: `${OUT}/classic.png`, clip: { x: box2.x - 12, y: box2.y - 12, width: box2.width + 24, height: Math.min(box2.height, 460) + 24 } });
await p.evaluate(() => window.editor.setSkin('modern'));
// Finder
await p.locator('.zoro-add-media').click(); await p.waitForSelector('.zoro-media-item');
await p.locator('.zoro-media-item[title="deniz.svg"]').click(); await p.waitForTimeout(400);
await p.locator('.zoro-dialog').screenshot({ path: `${OUT}/finder.png` });
await p.keyboard.press('Escape');
// table + slash
await p.evaluate(() => { window.editor.setContent('<h2>Price list</h2><table><tbody><tr><th><p>Product</p></th><th><p>Price</p></th><th><p>Stock</p></th></tr><tr><td><p>Apples</p></td><td style="background-color:#edfaef"><p>$2.40</p></td><td><p>120</p></td></tr><tr><td><p>Pears</p></td><td><p>$3.10</p></td><td><p>64</p></td></tr></tbody></table><p></p>'); });
await p.locator('.zoro-prose td p').first().click(); await p.waitForSelector('.zoro-context-bar'); await p.waitForTimeout(300);
const t = await p.locator('.zoro-prose table').boundingBox();
const cb = await p.locator('.zoro-context-bar').boundingBox();
await p.screenshot({ path: `${OUT}/table.png`, clip: { x: t.x - 16, y: cb.y - 12, width: t.width + 32, height: t.y + t.height - cb.y + 24 } });
await p.evaluate(() => window.editor.editor.commands.focus('end'));
await p.keyboard.type('/'); await p.waitForSelector('.zoro-slash'); await p.waitForTimeout(300);
await p.locator('.zoro-slash').screenshot({ path: `${OUT}/slash.png` });
await p.keyboard.press('Escape');
// mobile
const m = await b.newPage({ ...devices['iPhone 13'] });
await m.goto(url); await m.waitForSelector('.zoro-prose');
await m.evaluate(() => { const r = document.querySelector('.zoro-editor-wrapper').getBoundingClientRect(); scrollBy(0, r.top - 12); });
await m.waitForTimeout(400);
await m.screenshot({ path: `${OUT}/mobile.png` });
await b.close();
console.log('ok');
