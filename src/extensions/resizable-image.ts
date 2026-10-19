import { Node, mergeAttributes, type NodeViewRendererProps } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import type { Node as PMNode } from '@tiptap/pm/model';
import { ICONS } from '../icons';
import { ZoroDialog, h } from '../ui/components';
import type { Messages } from '../i18n';

export type ImageAlignment = 'none' | 'left' | 'center' | 'right';

export interface ResizableImageOptions {
  /** Locale strings (provided by ZoroEditor). */
  messages: Messages | null;
  /** Theme class passed to dialogs. */
  themeClass: () => string;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    zoroImage: {
      setImage: (attrs: { src: string; alt?: string; title?: string; width?: number | null; height?: number | null; srcset?: string | null; sizes?: string | null; uploadId?: string | null }) => ReturnType;
      updateImageByUploadId: (uploadId: string, attrs: Record<string, any> | null) => ReturnType;
    };
  }
}

/**
 * Alignment, with the same meaning as in WordPress:
 *  left/right → text flows beside the image (float), center → centered block, none → normal flow.
 * The output carries data-alignment (Zoro), an align* class (WordPress themes) and an inline style (sites without the CSS).
 */
export interface UploadState {
  /** 0-100; null = indeterminate (no progress info) */
  progress: number | null;
  error?: string;
  retry?: () => void;
  remove?: () => void;
}

const uploadStates = new Map<string, UploadState>();
const uploadSubs = new Map<string, Set<() => void>>();

export const uploadRegistry = {
  get: (id: string) => uploadStates.get(id),
  set(id: string, patch: Partial<UploadState>) {
    uploadStates.set(id, { progress: null, ...uploadStates.get(id), ...patch });
    uploadSubs.get(id)?.forEach((fn) => fn());
  },
  delete(id: string) {
    uploadStates.delete(id);
    uploadSubs.get(id)?.forEach((fn) => fn());
    uploadSubs.delete(id);
  },
  subscribe(id: string, fn: () => void): () => void {
    if (!uploadSubs.has(id)) uploadSubs.set(id, new Set());
    uploadSubs.get(id)!.add(fn);
    return () => uploadSubs.get(id)?.delete(fn);
  },
};

const ALIGN_STYLE: Record<ImageAlignment, string> = {
  none: '',
  left: 'float:left;margin:0.25em 1.5em 1em 0',
  center: 'display:block;margin-left:auto;margin-right:auto',
  right: 'float:right;margin:0.25em 0 1em 1.5em',
};

function parseSize(v: string | null | undefined): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Find the actual <img> when matching a <figure> (attribute parsers receive the matched element). */
const imgOf = (el: HTMLElement): HTMLElement => (el.tagName === 'FIGURE' ? (el.querySelector('img') as HTMLElement) ?? el : el);
const attr = (name: string) => (el: HTMLElement) => imgOf(el).getAttribute(name);

function parseAlignment(el: HTMLElement): ImageAlignment {
  for (const e of [el, imgOf(el)]) {
    const data = e.getAttribute('data-alignment');
    if (data === 'left' || data === 'right' || data === 'center') return data;
    const cls = e.className || '';
    if (/\balignleft\b/.test(cls)) return 'left';
    if (/\baligncenter\b/.test(cls)) return 'center';
    if (/\balignright\b/.test(cls)) return 'right';
    const st = e.style;
    if (st.float === 'left') return 'left';
    if (st.float === 'right') return 'right';
    if (st.marginLeft === 'auto' && st.marginRight === 'auto') return 'center';
    if (st.marginLeft === 'auto') return 'right';
  }
  return 'none';
}

function alignAttrs(a: ImageAlignment): Record<string, string> {
  return a === 'none' ? {} : { 'data-alignment': a, class: `align${a}`, style: ALIGN_STYLE[a] };
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'image',
  group: 'block',
  inline: false,
  draggable: true,
  selectable: true,
  atom: true,

  addOptions() {
    return { messages: null, themeClass: () => '', HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null, parseHTML: attr('src') },
      alt: { default: null, parseHTML: attr('alt') },
      title: { default: null, parseHTML: attr('title') },
      srcset: { default: null, parseHTML: attr('srcset') },
      sizes: { default: null, parseHTML: attr('sizes') },
      /** Caption → <figure><figcaption> */
      caption: {
        default: null,
        parseHTML: (el) => (el.tagName === 'FIGURE' ? el.querySelector('figcaption')?.textContent?.trim() || null : null),
        rendered: false,
      },
      /** Decorative image: alt="" + role="presentation" (skipped by screen readers) */
      decorative: {
        default: false,
        parseHTML: (el) => imgOf(el).getAttribute('role') === 'presentation' || imgOf(el).getAttribute('alt') === '',
        rendered: false,
      },
      alignment: { default: 'none', parseHTML: (el) => parseAlignment(el), rendered: false },
      width: { default: null, parseHTML: (el) => parseSize(imgOf(el).getAttribute('width') || imgOf(el).style.width), rendered: false },
      height: { default: null, parseHTML: (el) => parseSize(imgOf(el).getAttribute('height') || imgOf(el).style.height), rendered: false },
      // Temporary ID during upload; not written to the HTML.
      uploadId: { default: null, rendered: false, parseHTML: () => null },
    };
  },

  parseHTML() {
    return [
      { tag: 'figure', priority: 60, getAttrs: (el) => ((el as HTMLElement).querySelector('img[src]') ? null : false) },
      { tag: 'img[src]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const a = node.attrs;
    const align = (a.alignment || 'none') as ImageAlignment;
    const img: Record<string, any> = mergeAttributes(this.options.HTMLAttributes, { loading: 'lazy', decoding: 'async' }, HTMLAttributes);
    if (a.width) img.width = a.width;
    if (a.height) img.height = a.height;
    if (a.decorative) {
      img.alt = '';
      img.role = 'presentation';
    }
    if (!a.caption) return ['img', { ...img, ...alignAttrs(align) }];
    // Captioned image: alignment moves to the figure (compatible with WordPress [caption] output)
    const fig = alignAttrs(align);
    const style = [fig.style, a.width ? `width:${a.width}px;max-width:100%` : ''].filter(Boolean).join(';');
    return [
      'figure',
      { ...fig, class: ['wp-caption', fig.class].filter(Boolean).join(' '), ...(style ? { style } : {}) },
      ['img', img],
      ['figcaption', { class: 'wp-caption-text' }, a.caption],
    ];
  },

  addCommands() {
    return {
      setImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
      updateImageByUploadId:
        (uploadId, attrs) =>
        ({ tr, state, dispatch }) => {
          let found = false;
          state.doc.descendants((node, pos) => {
            if (found) return false;
            if (node.type.name === this.name && node.attrs.uploadId === uploadId) {
              found = true;
              if (dispatch) {
                if (attrs === null) tr.delete(pos, pos + node.nodeSize);
                else tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs, uploadId: null });
                tr.setMeta('addToHistory', false);
              }
              return false;
            }
            return true;
          });
          return found;
        },
    };
  },

  addNodeView() {
    return (props) => createImageView(props, this.options);
  },
});

function createImageView(props: NodeViewRendererProps, options: ResizableImageOptions) {
  const { editor, getPos } = props;
  let node = props.node as PMNode;
  const t = options.messages!;

  const wrapper = h('div', { class: 'zoro-image-wrapper', 'data-drag-handle': '' });
  const container = h('div', { class: 'zoro-image-container' });
  const img = h('img', { draggable: false });
  const captionEl = h('div', { class: 'zoro-image-caption', contenteditable: 'false' });
  const overlay = h('div', { class: 'zoro-upload-overlay', contenteditable: 'false' });
  overlay.hidden = true;
  container.append(img, overlay, captionEl);
  let unsubscribe: (() => void) | null = null;
  let subscribedId: string | null = null;

  const RING = 2 * Math.PI * 18;
  const renderUpload = () => {
    const id = node.attrs.uploadId as string | null;
    const st = id ? uploadRegistry.get(id) : undefined;
    overlay.hidden = !id;
    if (!id) return;
    overlay.innerHTML = '';
    if (st?.error) {
      overlay.classList.add('error');
      overlay.append(
        h('div', { class: 'zoro-upload-error-text' }, `${t.uploadFailed}${st.error ? ': ' + st.error : ''}`),
        h('div', { class: 'zoro-upload-error-actions' },
          h('button', { type: 'button', class: 'zoro-btn zoro-btn-primary zoro-btn-sm', onmousedown: (e: Event) => e.preventDefault(), onclick: (e: Event) => { e.stopPropagation(); st.retry?.(); } }, t.retry),
          h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary zoro-btn-sm', onmousedown: (e: Event) => e.preventDefault(), onclick: (e: Event) => { e.stopPropagation(); st.remove?.(); } }, t.delete),
        ),
      );
      return;
    }
    overlay.classList.remove('error');
    const p = st?.progress;
    const ring = h('div', {
      class: 'zoro-upload-ring' + (p == null ? ' indeterminate' : ''),
      role: 'progressbar',
      'aria-label': t.uploading,
      ...(p != null ? { 'aria-valuenow': String(p), 'aria-valuemin': '0', 'aria-valuemax': '100' } : {}),
      html: `<svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true"><circle cx="22" cy="22" r="18" class="track"/><circle cx="22" cy="22" r="18" class="bar" stroke-dasharray="${RING}" stroke-dashoffset="${p == null ? RING * 0.7 : RING * (1 - p / 100)}"/></svg>${p != null ? `<span>${p}%</span>` : ''}`,
    });
    overlay.append(ring);
  };
  const watchUpload = () => {
    const id = node.attrs.uploadId as string | null;
    if (id === subscribedId) return;
    unsubscribe?.();
    unsubscribe = null;
    subscribedId = id;
    if (id) unsubscribe = uploadRegistry.subscribe(id, renderUpload);
  };
  wrapper.appendChild(container);

  let toolbar: HTMLDivElement | null = null;
  let handles: HTMLDivElement[] = [];
  let sizeInfo: HTMLDivElement | null = null;
  let selected = false;

  const sync = () => {
    const a = node.attrs;
    if (img.getAttribute('src') !== a.src) img.src = a.src || '';
    img.alt = a.alt || '';
    if (a.title) img.title = a.title; else img.removeAttribute('title');
    if (a.srcset) img.srcset = a.srcset; else img.removeAttribute('srcset');
    if (a.sizes) img.sizes = a.sizes; else img.removeAttribute('sizes');
    img.style.width = a.width ? `${a.width}px` : '';
    img.style.height = a.width && a.height ? 'auto' : '';
    container.style.width = a.width ? `${a.width}px` : 'fit-content';
    container.dataset.alignment = a.alignment || 'none';
    wrapper.dataset.alignment = a.alignment || 'none';
    if (a.decorative) img.alt = '';
    captionEl.textContent = a.caption || '';
    captionEl.hidden = !a.caption;
    container.classList.toggle('uploading', !!a.uploadId);
    watchUpload();
    renderUpload();
    if (sizeInfo) sizeInfo.textContent = a.width ? `${a.width} × ${a.height ?? ''}`.trim() : '';
  };

  const pos = () => (typeof getPos === 'function' ? getPos() : undefined);

  const updateAttrs = (attrs: Record<string, any>) => {
    const p = pos();
    if (p === undefined) return;
    editor.view.dispatch(editor.state.tr.setNodeMarkup(p, undefined, { ...node.attrs, ...attrs }));
  };

  const selectSelf = () => {
    const p = pos();
    if (p === undefined) return;
    editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, p)));
  };

  const removeSelf = () => {
    const p = pos();
    if (p === undefined) return;
    editor.chain().focus().deleteRange({ from: p, to: p + node.nodeSize }).run();
  };

  const buildToolbar = () => {
    toolbar?.remove();
    const current = (node.attrs.alignment || 'none') as ImageAlignment;
    // Fixed-positioned on the page layer (body): not clipped by tables/scroll containers, stays on screen
    toolbar = h('div', { class: `zoro-root zoro-image-toolbar ${options.themeClass()}`, role: 'toolbar', 'aria-label': t.imageSettings });
    const btn = (icon: string, title: string, onClick: () => void, extra = '') => {
      const b = h('button', { type: 'button', class: `zoro-image-toolbar-btn ${extra}`, 'data-tip': title, 'aria-label': title, html: icon });
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(); });
      return b;
    };
    const aligns: Array<[ImageAlignment, string, string]> = [
      ['left', ICONS.alignLeft, t.left],
      ['center', ICONS.alignCenter, t.center],
      ['right', ICONS.alignRight, t.right],
      ['none', ICONS.alignNone, t.alignNone],
    ];
    for (const [a, icon, title] of aligns) {
      toolbar.appendChild(btn(icon, title, () => {
        const patch: Record<string, any> = { alignment: a };
        // Leave room for text when floated: shrink a large unsized image to half the editor width
        if ((a === 'left' || a === 'right') && !node.attrs.width) {
          const max = Math.round(((editor.view.dom as HTMLElement).clientWidth || 800) * 0.5);
          const natural = img.naturalWidth || img.offsetWidth;
          if (natural > max) {
            const ratio = (img.naturalHeight || img.offsetHeight) / (natural || 1);
            patch.width = max;
            patch.height = Math.round(max * ratio);
          }
        }
        updateAttrs(patch);
        selectSelf();
      }, current === a ? 'active' : ''));
    }
    toolbar.appendChild(h('div', { class: 'zoro-image-toolbar-divider' }));
    toolbar.appendChild(btn(ICONS.pencil, t.edit, openSettings));
    toolbar.appendChild(btn(ICONS.x, t.delete, removeSelf, 'danger'));
    document.body.appendChild(toolbar);
    positionToolbar();
  };

  const positionToolbar = () => {
    if (!toolbar) return;
    const r = img.getBoundingClientRect();
    const tb = toolbar.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    // Above the image; if there's no room, inside it (top edge); if that's not visible either, below
    let top = r.top - tb.height - 8;
    if (top < 8) top = r.top + 8;
    if (top + tb.height > vh - 8 || r.bottom < 0) top = Math.min(vh - tb.height - 8, Math.max(8, r.bottom + 8));
    const left = Math.max(8, Math.min(r.left + r.width / 2 - tb.width / 2, vw - tb.width - 8));
    toolbar.style.top = `${Math.round(top)}px`;
    toolbar.style.left = `${Math.round(left)}px`;
    // Hide if the image isn't visible (scrolled away, switched to source mode)
    toolbar.style.visibility = r.bottom < 0 || r.top > vh || !img.offsetParent ? 'hidden' : '';
  };
  const onViewport = () => positionToolbar();
  // Hide the toolbar on outside click (like WordPress); show it again when the image is tapped
  const onOutside = (e: Event) => {
    if (!toolbar) return;
    const target = e.target as globalThis.Node;
    const inside = container.contains(target) || toolbar.contains(target);
    toolbar.hidden = !inside;
    if (inside) requestAnimationFrame(positionToolbar);
  };

  const showChrome = () => {
    if (!editor.isEditable) return;
    buildToolbar();
    for (const corner of ['nw', 'ne', 'sw', 'se'] as const) {
      const handle = h('div', { class: `zoro-resize-handle zoro-resize-${corner}`, contenteditable: 'false' });
      handle.addEventListener('pointerdown', (e) => startResize(e, corner));
      container.appendChild(handle);
      handles.push(handle);
    }
    sizeInfo = h('div', { class: 'zoro-resize-info' });
    container.appendChild(sizeInfo);
    window.addEventListener('scroll', onViewport, true);
    window.addEventListener('resize', onViewport);
    document.addEventListener('pointerdown', onOutside, true);
    sync();
  };

  const hideChrome = () => {
    window.removeEventListener('scroll', onViewport, true);
    window.removeEventListener('resize', onViewport);
    document.removeEventListener('pointerdown', onOutside, true);
    toolbar?.remove();
    toolbar = null;
    handles.forEach((x) => x.remove());
    handles = [];
    sizeInfo?.remove();
    sizeInfo = null;
  };

  function startResize(e: PointerEvent, corner: 'nw' | 'ne' | 'sw' | 'se') {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture?.(e.pointerId);
    container.classList.add('resizing');
    const startX = e.clientX;
    const startW = img.offsetWidth || 1;
    const ratio = startW / (img.offsetHeight || 1);
    const maxW = (editor.view.dom as HTMLElement).clientWidth || 4000;
    let w = startW;
    let hgt = Math.round(startW / ratio);

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      // A centered image grows on both sides: double the delta so the handle keeps pace with the pointer
      const factor = (node.attrs.alignment || 'none') === 'center' ? 2 : 1;
      w = Math.round(Math.min(maxW, Math.max(50, corner.endsWith('e') ? startW + dx * factor : startW - dx * factor)));
      hgt = Math.round(w / ratio);
      // Preview: set the style directly without recording history
      img.style.width = `${w}px`;
      container.style.width = `${w}px`;
      if (sizeInfo) sizeInfo.textContent = `${w} × ${hgt}`;
      positionToolbar();
    };
    const up = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      container.classList.remove('resizing');
      updateAttrs({ width: w, height: hgt }); // single undo step
      selectSelf();
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  }

  function openSettings() {
    const a = node.attrs;
    const alt = h('input', { type: 'text', class: 'zoro-input', value: a.alt || '', placeholder: t.imageAltPlaceholder });
    const caption = h('textarea', { class: 'zoro-input', rows: 2, placeholder: t.captionPlaceholder });
    caption.value = a.caption || '';
    const decorative = h('input', { type: 'checkbox', checked: !!a.decorative });
    const syncDecorative = () => { alt.disabled = decorative.checked; };
    decorative.addEventListener('change', syncDecorative);
    syncDecorative();
    let align = (a.alignment || 'none') as ImageAlignment;
    const alignRow = h('div', { class: 'zoro-segmented', role: 'group' });
    const alignOpts: Array<[ImageAlignment, string]> = [['left', t.left], ['center', t.center], ['right', t.right], ['none', t.alignNone]];
    const renderAlign = () => {
      alignRow.innerHTML = '';
      for (const [val, label] of alignOpts) {
        alignRow.appendChild(h('button', {
          type: 'button',
          class: 'zoro-segment' + (align === val ? ' active' : ''),
          'aria-pressed': String(align === val),
          onclick: () => { align = val; renderAlign(); },
        }, label));
      }
    };
    renderAlign();
    // Auto / Custom size: a segmented control instead of a bare <select>
    const mode = { value: a.width ? 'custom' : 'auto' };
    const modeRow = h('div', { class: 'zoro-segmented', role: 'group', 'aria-label': t.size });
    const renderMode = () => {
      modeRow.innerHTML = '';
      for (const [val, label] of [['auto', t.sizeAuto], ['custom', t.sizeCustom]] as const) {
        modeRow.append(h('button', {
          type: 'button',
          class: 'zoro-segment' + (mode.value === val ? ' active' : ''),
          'aria-pressed': String(mode.value === val),
          onclick: () => { mode.value = val; renderMode(); custom.style.display = val === 'custom' ? 'flex' : 'none'; },
        }, label));
      }
    };
    const wIn = h('input', { type: 'number', class: 'zoro-input', min: 10, value: a.width ?? '', placeholder: t.width, 'aria-label': t.width });
    const hIn = h('input', { type: 'number', class: 'zoro-input', min: 10, value: a.height ?? '', placeholder: t.height, 'aria-label': t.height });
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null;
    wIn.addEventListener('input', () => { if (ratio && wIn.value) hIn.value = String(Math.round(+wIn.value / ratio)); });
    hIn.addEventListener('input', () => { if (ratio && hIn.value) wIn.value = String(Math.round(+hIn.value * ratio)); });
    const custom = h('div', { class: 'zoro-size-row', style: { display: a.width ? 'flex' : 'none' } }, wIn, h('span', {}, '×'), hIn);
    renderMode();

    const body = h('div', { class: 'zoro-form' },
      h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.imageAlt), alt),
      h('label', { class: 'zoro-checkbox-group' }, decorative, h('span', {}, t.imageDecorative)),
      h('div', { class: 'zoro-field' }, h('label', { class: 'zoro-label' }, t.caption), caption),
      h('div', { class: 'zoro-field' }, h('span', { class: 'zoro-label' }, t.imageAlign), alignRow),
      h('div', { class: 'zoro-field' }, h('span', { class: 'zoro-label' }, t.size), modeRow, custom),
    );
    const dlg = new ZoroDialog({ title: t.imageSettings, size: 'sm', themeClass: options.themeClass(), closeLabel: t.close });
    dlg.open(body);
    dlg.addFooter(h('div', { class: 'zoro-btn-row' },
      h('button', { type: 'button', class: 'zoro-btn zoro-btn-secondary', onclick: () => dlg.close() }, t.cancel),
      h('button', {
        type: 'button',
        class: 'zoro-btn zoro-btn-primary',
        onclick: () => {
          const custom = mode.value === 'custom';
          updateAttrs({
            alt: decorative.checked ? null : alt.value.trim() || null,
            decorative: decorative.checked,
            caption: caption.value.trim() || null,
            alignment: align,
            width: custom ? parseSize(wIn.value) : null,
            height: custom ? parseSize(hIn.value) : null,
          });
          dlg.close();
          editor.commands.focus();
          selectSelf();
        },
      }, t.save),
    ));
  }

  img.addEventListener('dblclick', (e) => { e.preventDefault(); if (editor.isEditable) openSettings(); });
  sync();

  return {
    dom: wrapper,
    update(updated: PMNode) {
      if (updated.type !== node.type) return false;
      const alignChanged = updated.attrs.alignment !== node.attrs.alignment;
      node = updated;
      sync();
      if (selected && alignChanged) buildToolbar();
      else if (selected) requestAnimationFrame(positionToolbar);
      return true;
    },
    selectNode() {
      selected = true;
      container.classList.add('selected');
      showChrome();
    },
    deselectNode() {
      selected = false;
      container.classList.remove('selected');
      hideChrome();
    },
    stopEvent(e: Event) {
      // The toolbar and handles manage their own events
      const t = e.target as HTMLElement;
      return !!t.closest?.('.zoro-image-toolbar, .zoro-resize-handle');
    },
    ignoreMutation() {
      return true;
    },
    destroy() {
      hideChrome();
      unsubscribe?.();
    },
  };
}
