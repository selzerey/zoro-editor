// Next.js App Router için React girişine "use client" ekler, CSS'leri kopyalar, sürümü yazar.
import { readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const { version } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

const reactFile = new URL('react.js', dist);
let src = readFileSync(reactFile, 'utf8');
if (!src.startsWith('"use client"')) writeFileSync(reactFile, '"use client";\n' + src);

for (const f of readdirSync(dist)) {
  if (!f.endsWith('.js')) continue;
  const p = new URL(f, dist);
  const s = readFileSync(p, 'utf8');
  if (s.includes('__ZORO_VERSION__')) writeFileSync(p, s.replaceAll('__ZORO_VERSION__', version));
}

copyFileSync(new URL('src/styles/zoro-editor.css', root), new URL('zoro-editor.css', dist));
copyFileSync(new URL('src/styles/zoro-content.css', root), new URL('zoro-content.css', dist));
console.log(`postbuild: tamam (v${version})`);
