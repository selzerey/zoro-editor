// Builds every src/locales/<code>.ts into:
//   dist/locales/<code>.js         ESM  — import de from 'zoro-editor/locales/de'
//   dist/locales/<code>.global.js  <script> — registers itself on window.ZoroEditor (or queues until it loads)
//   dist/locales/index.json        list of { code, name, dir }
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const srcDir = resolve(root, 'src/locales');
const outDir = resolve(root, 'dist/locales');
mkdirSync(outDir, { recursive: true });

const index = [];
for (const file of readdirSync(srcDir).filter((f) => f.endsWith('.ts')).sort()) {
  const source = readFileSync(resolve(srcDir, file), 'utf8');
  const esm = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  // Evaluate to get the object (for the index and the global build)
  const cjs = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', cjs)(mod, mod.exports, () => ({}));
  const def = mod.exports.default;
  if (!def?.code || !def?.messages) throw new Error(`${file}: invalid locale file`);
  const code = def.code;
  writeFileSync(resolve(outDir, `${code}.js`), esm.replace(/^\s*export \{\};\s*$/m, ''));
  const json = JSON.stringify(def);
  writeFileSync(
    resolve(outDir, `${code}.global.js`),
    `/* ZoroEditor locale: ${def.name} (${code}) */\n(function(){var l=${json};var Z=window.ZoroEditor;if(Z&&Z.registerLocale)Z.registerLocale(l);else(window.ZoroEditorLocales=window.ZoroEditorLocales||[]).push(l);})();\n`,
  );
  writeFileSync(resolve(outDir, `${code}.d.ts`), `import type { CompleteLocale } from '../types/i18n';\ndeclare const locale: CompleteLocale;\nexport default locale;\n`);
  index.push({ code, name: def.name, dir: def.dir ?? 'ltr' });
}
writeFileSync(resolve(outDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`locales: ${index.length} languages`);
