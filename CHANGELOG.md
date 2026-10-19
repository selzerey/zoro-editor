# Changelog

## 1.0.1 — 2026-10-19

- Published on npm: `npm install zoro-editor`; CDN via `cdn.jsdelivr.net/npm/zoro-editor` and unpkg
- PHP media API messages are now English by default; set `'locale' => 'tr'` in `php/config.php` for Turkish
- Code comments translated to English
- Smaller npm package (the IIFE source map is no longer published)

## 1.0.0 — 2026-10-19

First packaged release. The original `ZoroEditor` (vanilla JS loaded from a CDN) was rewritten in TypeScript.

### Added
- One package: ESM build with TypeScript types, React / Next.js component (`zoro-editor/react`), single-file `dist/zoro-editor.iife.js` for `<script>` tags (CSS included)
- Two skins: `modern` (TinyMCE-Premium-like: grouped toolbar, "⋯ more" row, element path, bubble menu, `/` command menu) and `classic` (WordPress Classic)
- Toolbar groups and presets (`minimal`, `basic`, `blog`, `full`), `addGroups` / `removeGroups` / `setPreset` at runtime, `registerGroup` / `registerPreset`
- Zoro Finder media manager: folders, grid/list view, search, sort, multi-select, bulk delete/move, details panel, "unused" filter, paste-to-upload, standalone use (`openFinder`, `useZoroFinder`)
- PHP backend: `Api`, `MediaStore` (locked JSON metadata, SHA-256 de-duplication, virtual folders, rename hook), `ImageProcessor` (EXIF orientation, re-encoding, WebP variants), `ImageServer` (allow-listed on-the-fly resizing), `Sanitizer`, `Editor::render()`
- Table contextual toolbar (rows, columns, merge/split, header row/column, cell background), table size picker
- Images: float left/right alignment that wraps text, `<figure>` captions, decorative images, upload progress ring, Retry / Remove on failed uploads, `srcset` + `sizes`
- DOM-based paste cleanup for Word (real lists from `mso-list`, headings, sub/superscript), Google Docs and Excel; local `file:///` images are dropped with a notice
- Smart paste (URL over a selection → link, YouTube / image URL → embed), recent colors and custom HEX colors, custom tooltips with shortcut hints (⌘⌥⇧ on macOS)
- Code view: indented HTML, cursor kept on the same block when switching, no reload (undo history kept) when unchanged
- YouTube embeds, superscript/subscript, draft autosave, character limit, read-only mode, light/dark/auto themes, English and Turkish (auto-detected from `<html lang>`)
- Mobile: container-query layout, one-row scrolling toolbar, 40px touch targets, bottom-sheet dialogs, touch image resizing
- Accessibility: Alt+F10 toolbar focus, roving tabindex, ARIA labels, focus trap in dialogs, `prefers-reduced-motion`
- PHP sanitizer uses PHP 8.4's HTML5 parser (`Dom\HTMLDocument`) against mutation-XSS, with libxml fallback

### Fixed (compared to the original ZoroEditor)
- Keyboard shortcuts listened on the whole document and were never removed (broke multiple editors and React)
- Backspace in the image settings dialog deleted the selected image
- Image resizing wrote every mouse move to the undo history and did not work on touch screens
- Clicking inside a link stole focus and broke typing
- TipTap was loaded at runtime from esm.sh
- The `placeholder` option was ignored
- The media API had no authorisation, used `Access-Control-Allow-Origin: *` and leaked internal error details
- On-the-fly resizing returned originals with the wrong `Content-Type` and accepted unlimited sizes
- Metadata could be corrupted by concurrent uploads (no lock around read-modify-write)
- A global `*` CSS reset leaked into host pages; there were no responsive rules
