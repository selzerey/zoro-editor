# Contributing

Thanks for helping! Bug reports, ideas and pull requests are welcome.

## Reporting bugs

Please include:

- What you did, what you expected and what happened
- Browser and OS (and PHP version for backend issues)
- How ZoroEditor is loaded (`<script>`, npm/React, Next.js…) and your options
- For paste problems: where the content was copied from (Word, Google Docs, a website…)

## Development setup

```bash
git clone https://github.com/selzerey/zoro-editor.git
cd zoro-editor
npm install
npm run build
```

Checks to run before opening a pull request:

```bash
npm run typecheck
npm test                # Vitest unit tests
npm run test:php        # needs PHP 8.1+ with gd, fileinfo, mbstring, dom
php -S 127.0.0.1:8765 -t .   # in another terminal
npm run test:e2e        # Playwright browser tests (npx playwright install chromium once)
```

## Guidelines

- Keep the editor framework-agnostic: the core (`src/core`) must not depend on React.
- Do not touch `window` / `document` at module load time — the package must import cleanly during SSR.
- All CSS lives under `.zoro-root` and uses the `--zoro-*` variables; both skins (`modern`, `classic`) and dark mode should look right.
- New UI strings go into both languages in `src/i18n.ts`.
- Add a test for every bug fix.
- Commit the rebuilt `dist/` folder (`npm run build`) together with source changes, because users install straight from GitHub.
- Do not copy code from GPL or commercially licensed editors (TinyMCE 6+, CKEditor, Froala…). Ideas are fine; code must be written from scratch or come from permissively licensed projects with attribution.
