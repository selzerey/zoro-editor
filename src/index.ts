export { ZoroEditor } from './core/editor';
export { ZoroFinder, openFinder, createAdapter, altFromFilename } from './finder/finder';
export type { FinderOptions, SelectedMedia } from './finder/finder';
export { RestMediaAdapter, MemoryMediaAdapter, MediaApiError, normalizeMediaItem, pickInsertSource, formatBytes } from './finder/adapters';
export { BUILTIN_GROUPS, PRESETS, registerGroup, registerPreset, resolveGroups, getGroup } from './core/groups';
export { applyMark, smartHeading, getWordBoundaries } from './core/commands';
export { cleanPasted, detectSource } from './core/paste';
export { cleanHTML, cleanPastedHTML, countWords, countChars, escapeHtml, isSafeUrl, normalizeUrl } from './core/html';
export { ResizableImage } from './extensions/resizable-image';
export { ICONS } from './icons';
export { locales, resolveMessages, detectLocale, registerLocale, getLocale, availableLocales, localeDir } from './i18n';
export type { LocaleDefinition, CompleteLocale } from './i18n';
export type * from './types';

export const version = '__ZORO_VERSION__';

import { ZoroEditor } from './core/editor';
import type { ZoroEditorOptions } from './types';

/** Shorthand: `createEditor('#content', { preset: 'blog' })` */
export function createEditor(target: string | HTMLElement, options?: ZoroEditorOptions): ZoroEditor {
  return new ZoroEditor(target, options);
}
