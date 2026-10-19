export { ZoroEditor } from 'zoro-editor/react';
import { MemoryMediaAdapter } from 'zoro-editor';

// In-browser fake media backend (resets on page reload)
export const MemoryMediaAdapterForDemo = new MemoryMediaAdapter();
