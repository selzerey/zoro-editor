import type { GroupName, PresetName, ToolbarButton, ToolbarGroup } from '../types';
import { ICONS } from '../icons';
import { ZoroSelect } from '../ui/components';
import { applyMark, indent, smartHeading } from './commands';

const btn = (b: ToolbarButton) => b;

/** Yerleşik gruplar. Sıra = araç çubuğundaki sıra. */
export const BUILTIN_GROUPS: ToolbarGroup[] = [
  {
    name: 'block',
    row: 1,
    items: (ctx) => {
      const { t } = ctx;
      const items = [
        { value: 'p', label: t.paragraph, shortcut: 'Shift+Alt+7' },
        ...([1, 2, 3, 4, 5, 6] as const).map((l) => ({
          value: `h${l}`,
          label: `${t.heading} ${l}`,
          shortcut: `Shift+Alt+${l}`,
          style: { fontSize: `${[24, 20, 18, 16, 14, 13][l - 1]}px`, fontWeight: '600' } as Partial<CSSStyleDeclaration>,
        })),
        { value: 'pre', label: t.preformatted, shortcut: 'Shift+Alt+X', style: { fontFamily: 'monospace', fontSize: '13px' } as Partial<CSSStyleDeclaration> },
      ];
      const select = new ZoroSelect({
        items,
        value: 'p',
        label: t.paragraph,
        onChange: (v) => {
          const ed = ctx.zoro.editor;
          if (v === 'p') ed.chain().focus().setParagraph().run();
          else if (v === 'pre') ed.chain().focus().toggleCodeBlock().run();
          else smartHeading(ed, +v.slice(1) as 1);
        },
      });
      const el = select.render();
      return {
        el,
        update: () => {
          const ed = ctx.zoro.editor;
          let v = 'p';
          for (let l = 1; l <= 6; l++) if (ed.isActive('heading', { level: l })) v = `h${l}`;
          if (ed.isActive('codeBlock')) v = 'pre';
          select.setValue(v);
        },
        destroy: () => select.destroy(),
      };
    },
  },
  {
    name: 'format',
    row: 1,
    items: [
      btn({ name: 'bold', icon: ICONS.bold, title: (t) => t.bold, run: ({ editor }) => applyMark(editor, 'toggleBold'), isActive: ({ editor }) => editor.isActive('bold') }),
      btn({ name: 'italic', icon: ICONS.italic, title: (t) => t.italic, run: ({ editor }) => applyMark(editor, 'toggleItalic'), isActive: ({ editor }) => editor.isActive('italic') }),
      btn({ name: 'underline', row: 2, icon: ICONS.underline, title: (t) => t.underline, run: ({ editor }) => applyMark(editor, 'toggleUnderline'), isActive: ({ editor }) => editor.isActive('underline') }),
      btn({ name: 'strike', row: 2, icon: ICONS.strikethrough, title: (t) => t.strike, run: ({ editor }) => applyMark(editor, 'toggleStrike'), isActive: ({ editor }) => editor.isActive('strike') }),
      btn({ name: 'code', row: 2, icon: ICONS.code, title: (t) => t.code, run: ({ editor }) => applyMark(editor, 'toggleCode'), isActive: ({ editor }) => editor.isActive('code') }),
      btn({ name: 'superscript', row: 2, icon: ICONS.superscript, title: (t) => t.superscript, run: ({ editor }) => editor.chain().focus().toggleSuperscript().run(), isActive: ({ editor }) => editor.isActive('superscript') }),
      btn({ name: 'subscript', row: 2, icon: ICONS.subscript, title: (t) => t.subscript, run: ({ editor }) => editor.chain().focus().toggleSubscript().run(), isActive: ({ editor }) => editor.isActive('subscript') }),
    ],
  },
  {
    name: 'list',
    row: 1,
    items: [
      btn({ name: 'bulletList', icon: ICONS.bulletList, title: (t) => t.bulletList, run: ({ editor }) => editor.chain().focus().toggleBulletList().run(), isActive: ({ editor }) => editor.isActive('bulletList') }),
      btn({ name: 'orderedList', icon: ICONS.orderedList, title: (t) => t.orderedList, run: ({ editor }) => editor.chain().focus().toggleOrderedList().run(), isActive: ({ editor }) => editor.isActive('orderedList') }),
      btn({ name: 'blockquote', icon: ICONS.quote, title: (t) => t.blockquote, run: ({ editor }) => editor.chain().focus().toggleBlockquote().run(), isActive: ({ editor }) => editor.isActive('blockquote') }),
    ],
  },
  {
    name: 'align',
    row: 1,
    items: (['left', 'center', 'right', 'justify'] as const).map((a) =>
      btn({
        name: `align-${a}`,
        icon: ICONS[`align${a[0]!.toUpperCase()}${a.slice(1)}` as 'alignLeft'],
        title: (t) => t[`align${a[0]!.toUpperCase()}${a.slice(1)}` as 'alignLeft'],
        run: ({ editor }) => editor.chain().focus().setTextAlign(a).run(),
        isActive: ({ editor }) => editor.isActive({ textAlign: a }),
      }),
    ),
  },
  {
    name: 'link',
    row: 1,
    items: [
      btn({ name: 'link', icon: ICONS.link, title: (t) => t.link, run: ({ zoro }) => zoro.openLinkPopover(true), isActive: ({ editor }) => editor.isActive('link') }),
      btn({ name: 'unlink', row: 2, icon: ICONS.unlink, title: (t) => t.unlink, run: ({ editor }) => editor.chain().focus().extendMarkRange('link').unsetLink().run(), isEnabled: ({ editor }) => editor.isActive('link') }),
    ],
  },
  {
    name: 'table',
    row: 1,
    items: [
      btn({
        name: 'table',
        icon: ICONS.table,
        title: (t) => t.table,
        run: ({ zoro }, e) => zoro.openTableMenu(e.currentTarget as HTMLElement),
        isActive: ({ editor }) => editor.isActive('table'),
      }),
    ],
  },
  {
    name: 'media',
    row: 1,
    // Görsel düğmesi; ayrıca üstteki "Ortam ekle" düğmesini de bu grup açar.
    items: [btn({ name: 'image', icon: ICONS.image, title: (t) => t.image, run: ({ zoro }) => zoro.openMedia() })],
  },
  {
    name: 'embed',
    row: 2,
    items: [btn({ name: 'youtube', icon: ICONS.youtube, title: (t) => t.youtube, run: ({ zoro }) => zoro.insertYoutube() })],
  },
  {
    name: 'color',
    row: 2,
    items: [
      btn({ name: 'textColor', icon: ICONS.textColor('#50575e'), title: (t) => t.textColor, run: ({ zoro }, e) => zoro.openColorPicker(e.currentTarget as HTMLElement, 'text') }),
      btn({ name: 'bgColor', icon: ICONS.bgColor('#ffff00'), title: (t) => t.bgColor, run: ({ zoro }, e) => zoro.openColorPicker(e.currentTarget as HTMLElement, 'bg') }),
    ],
  },
  {
    name: 'extra',
    row: 2,
    items: [
      btn({ name: 'hr', icon: ICONS.hr, title: (t) => t.hr, run: ({ editor }) => editor.chain().focus().setHorizontalRule().run() }),
      btn({ name: 'removeFormat', icon: ICONS.removeFormat, title: (t) => t.removeFormat, run: ({ editor }) => editor.chain().focus().unsetAllMarks().clearNodes().run() }),
      btn({ name: 'specialChars', icon: ICONS.omega, title: (t) => t.specialChars, run: ({ zoro }, e) => zoro.openSpecialChars(e.currentTarget as HTMLElement) }),
    ],
  },
  {
    name: 'indent',
    row: 2,
    items: [
      btn({ name: 'outdent', icon: ICONS.outdent, title: (t) => t.outdent, run: ({ editor }) => indent(editor, -1), isEnabled: ({ editor }) => editor.can().liftListItem('listItem') }),
      btn({ name: 'indent', icon: ICONS.indent, title: (t) => t.indent, run: ({ editor }) => indent(editor, 1), isEnabled: ({ editor }) => editor.can().sinkListItem('listItem') }),
    ],
  },
  {
    name: 'history',
    row: 2,
    items: [
      btn({ name: 'undo', icon: ICONS.undo, title: (t) => t.undo, run: ({ editor }) => editor.chain().focus().undo().run(), isEnabled: ({ editor }) => editor.can().undo() }),
      btn({ name: 'redo', icon: ICONS.redo, title: (t) => t.redo, run: ({ editor }) => editor.chain().focus().redo().run(), isEnabled: ({ editor }) => editor.can().redo() }),
    ],
  },
  {
    name: 'help',
    row: 2,
    items: [btn({ name: 'help', icon: ICONS.help, title: (t) => t.help, run: ({ zoro }) => zoro.showHelp(), keepFocus: false })],
  },
  // "view" özel: Görsel/Kaynak + Tam ekran (editör sınıfı çizer)
  { name: 'view', row: 1, items: [] },
];

const ALL: GroupName[] = BUILTIN_GROUPS.map((g) => g.name);

export const PRESETS: Record<string, GroupName[]> = {
  /** Yorum kutusu, kısa açıklama */
  minimal: ['format', 'link', 'list'],
  /** Ürün açıklaması, basit sayfa */
  basic: ['block', 'format', 'list', 'link', 'history', 'view'],
  /** Blog / makale (WordPress Klasik) */
  blog: ['block', 'format', 'list', 'align', 'link', 'table', 'media', 'color', 'extra', 'indent', 'history', 'help', 'view'],
  /** Her şey */
  full: ALL,
};

const registry = new Map<GroupName, ToolbarGroup>(BUILTIN_GROUPS.map((g) => [g.name, g]));

export function registerGroup(group: ToolbarGroup): void {
  registry.set(group.name, group);
}

export function registerPreset(name: PresetName, groups: GroupName[]): void {
  PRESETS[name] = groups;
}

export function getGroup(name: GroupName): ToolbarGroup | undefined {
  return registry.get(name);
}

/**
 * preset + groups + addGroups + removeGroups → nihai grup listesi (yerleşik sıra korunur,
 * özel gruplar sona eklenir).
 */
export function resolveGroups(o: { preset?: PresetName; groups?: GroupName[]; addGroups?: GroupName[]; removeGroups?: GroupName[] }): GroupName[] {
  const base = o.groups ?? PRESETS[o.preset ?? 'full'] ?? PRESETS.full!;
  const set = new Set<GroupName>([...base, ...(o.addGroups ?? [])]);
  for (const r of o.removeGroups ?? []) set.delete(r);
  const known = [...set].filter((g) => registry.has(g));
  const order = [...registry.keys()];
  return known.sort((a, b) => {
    const ia = ALL.indexOf(a);
    const ib = ALL.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return order.indexOf(a) - order.indexOf(b);
  });
}

export const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
];

export const CELL_COLORS = [
  '#f6f7f7', '#f0f0f1', '#dcdcde', '#fcf0f1', '#fcf9e8', '#edfaef', '#e5f5fa', '#f0f6fc', '#f5effa', '#fff4e5',
  '#facfd2', '#f5e6ab', '#b8e6bf', '#9ec2e6', '#c5d9ed', '#d7c3e8', '#ffd8a8', '#ffe4e1', '#e8f5e9', '#e3f2fd',
];

export const SPECIAL_CHARS = ['©', '®', '™', '€', '£', '¥', '¢', '₺', '§', '†', '‡', '•', '…', '–', '—', '°', '±', '÷', '×', '¼', '½', '¾', '¹', '²', '³', 'Ω', 'π', '∞', '≠', '≤', '≥', '←', '→', '↑', '↓', '«', '»', '“', '”', '‘', '’', '✓', '✗', '★'];
