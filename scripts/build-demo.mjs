// Single-file demo: demo/index.html + dist (JS, CSS) → test/ZoroEditor-Demo.html
// No server needed, just double-click to open. Usage: node scripts/build-demo.mjs [target.html]
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => readFileSync(resolve(root, p), 'utf8');
let html = read('demo/index.html');
const js = read('dist/zoro-editor.iife.js')
  .replace(/\/\/# sourceMappingURL=.*$/m, '')
  .replace(/<\/script/gi, '<\\/script'); // keep the embedded script from closing early
const css = read('dist/zoro-content.css');

html = html.replace('<link rel="stylesheet" href="../dist/zoro-content.css">', () => `<style>\n${css}\n</style>`);
html = html.replace('<script src="../dist/zoro-editor.iife.js"></script>', () => `<script>\n${js}\n</script>`);
if (html.includes('../dist/')) throw new Error('a ../dist/ reference is left in the demo');

const out = process.argv[2] ? resolve(process.argv[2]) : resolve(root, 'test/ZoroEditor-Demo.html');
writeFileSync(out, html);
console.log(`demo: ${out} (${(html.length / 1024).toFixed(0)} KB)`);
