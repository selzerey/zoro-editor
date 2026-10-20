/// <reference types="vite/client" />
import { locales, registerLocale, getLocale, detectLocale, localeDir, resolveMessages, type CompleteLocale } from '../src/i18n';
import { ZoroEditor } from '../src/core/editor';

const modules = import.meta.glob<{ default: CompleteLocale }>('../src/locales/*.ts', { eager: true });
const files = Object.keys(modules).map((p) => p.split('/').pop()!).sort();
const en = locales.en as Record<string, string>;
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
const shortcut = (s: string) => /\(([^()]*(?:Ctrl|Alt|Shift)\+[^()]*)\)\s*$/.exec(s)?.[1] ?? '';
const RTL = new Set(['ar', 'he', 'fa', 'ur', 'ps']);

describe('locale files', () => {
  it('there are many languages', () => {
    expect(files.length).toBeGreaterThanOrEqual(30);
  });

  for (const file of files) {
    it(file, () => {
      const def = modules[`../src/locales/${file}`]!.default;
      expect(def.code).toBe(file.replace(/\.ts$/, ''));
      expect(def.name.trim().length).toBeGreaterThan(1);
      expect(def.dir === 'rtl').toBe(RTL.has(def.code));
      const msgs = def.messages as Record<string, string>;
      expect(Object.keys(msgs).sort()).toEqual(Object.keys(en).sort());
      for (const [key, value] of Object.entries(en)) {
        const t = msgs[key]!;
        expect(typeof t, `${file}:${key}`).toBe('string');
        expect(t.trim().length, `${file}:${key} is empty`).toBeGreaterThan(0);
        expect(placeholders(t), `${file}:${key} placeholders`).toBe(placeholders(value));
        expect(shortcut(t), `${file}:${key} shortcut`).toBe(shortcut(value));
      }
    });
  }
});

describe('locale registry', () => {
  it('registers, matches region codes and falls back to English', async () => {
    const de = (await import('../src/locales/de')).default;
    registerLocale(de);
    expect(getLocale('de-AT')?.code).toBe('de');
    expect(resolveMessages('de').bold).toBe(de.messages.bold);
    expect(resolveMessages('xx').bold).toBe(en.bold);
    expect(resolveMessages({ bold: 'B!' }).bold).toBe('B!');
  });

  it('detects the page language when it is registered', async () => {
    const fr = (await import('../src/locales/fr')).default;
    registerLocale(fr);
    document.documentElement.lang = 'fr-CA';
    expect(detectLocale()).toBe('fr');
    document.documentElement.lang = 'qq';
    expect(detectLocale()).toBe('en');
    document.documentElement.lang = 'tr';
  });

  it('right-to-left languages flip the editor', async () => {
    const ar = (await import('../src/locales/ar')).default;
    registerLocale(ar);
    expect(localeDir('ar')).toBe('rtl');
    const el = document.createElement('div');
    document.body.appendChild(el);
    const ed = new ZoroEditor(el, { locale: 'ar' });
    expect(ed.root.getAttribute('dir')).toBe('rtl');
    expect(ed.root.classList.contains('zoro-rtl')).toBe(true);
    expect(ed.root.querySelector('[data-name="bold"]')!.getAttribute('aria-label')).toBe(ar.messages.bold.replace(/\s*\(.*\)$/, ''));
    ed.destroy();
    el.remove();
  });
});
