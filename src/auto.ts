/**
 * Browser (IIFE) entry — for PHP / plain HTML:
 *   <script src="zoro-editor.iife.js"></script>
 *   <textarea name="content" data-zoro-editor data-preset="blog" data-media-endpoint="/zoro/media.php"></textarea>
 * CSS is injected automatically (to disable: window.ZORO_NO_CSS = true).
 */
import css from './styles/zoro-editor.css?inline';
import * as api from './index';
import { ZoroEditor } from './core/editor';
import type { ZoroEditorOptions } from './types';

declare global {
  interface Window { ZORO_NO_CSS?: boolean }
  interface HTMLElement { zoroEditor?: ZoroEditor }
}

function injectCss() {
  if (window.ZORO_NO_CSS || document.getElementById('zoro-editor-css')) return;
  const style = document.createElement('style');
  style.id = 'zoro-editor-css';
  style.textContent = css;
  document.head.prepend(style); // so the site's own CSS can override it
}

const list = (v?: string) => (v ? v.split(/[\s,]+/).filter(Boolean) : undefined);

function optionsFromDataset(el: HTMLElement): ZoroEditorOptions {
  const d = el.dataset;
  let json: ZoroEditorOptions = {};
  if (d.options) {
    try { json = JSON.parse(d.options); } catch (e) { console.error('ZoroEditor: data-options is not valid JSON', e); }
  }
  const o: ZoroEditorOptions = { ...json };
  if (d.preset) o.preset = d.preset;
  if (d.groups) o.groups = list(d.groups);
  if (d.addGroups) o.addGroups = list(d.addGroups);
  if (d.removeGroups) o.removeGroups = list(d.removeGroups);
  if (d.height) o.height = +d.height;
  if (d.placeholder) o.placeholder = d.placeholder;
  if (d.theme) o.theme = d.theme as ZoroEditorOptions['theme'];
  if (d.skin) o.skin = d.skin as ZoroEditorOptions['skin'];
  if (d.bubbleMenu) o.bubbleMenu = d.bubbleMenu !== 'false';
  if (d.locale) o.locale = d.locale as 'tr';
  if (d.maxLength) o.maxLength = +d.maxLength;
  if (d.autosave) o.autosave = d.autosave;
  if (d.readonly !== undefined) o.readOnly = d.readonly !== 'false';
  if (d.mediaEndpoint) {
    const csrf = d.csrfToken ?? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    o.media = { ...(json.media || {}), endpoint: d.mediaEndpoint, ...(csrf ? { headers: { 'X-CSRF-Token': csrf } } : {}) };
  }
  if (d.media === 'false') o.media = false;
  return o;
}

/** Initializes all [data-zoro-editor] elements on the page. Safe to call again. */
function init(root: ParentNode = document): ZoroEditor[] {
  injectCss();
  const out: ZoroEditor[] = [];
  root.querySelectorAll<HTMLElement>('[data-zoro-editor]').forEach((el) => {
    if (el.zoroEditor && !el.zoroEditor.isDestroyed) return;
    const ed = new ZoroEditor(el, optionsFromDataset(el));
    el.zoroEditor = ed;
    out.push(ed);
  });
  return out;
}

const Z = ZoroEditor as typeof ZoroEditor & typeof api & { init: typeof init; injectCss: typeof injectCss };
Object.assign(Z, api, { init, injectCss });

// Also inject CSS when the class is instantiated (for those not using data-*)

if (typeof document !== 'undefined') {
  injectCss();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
}

export default Z;
