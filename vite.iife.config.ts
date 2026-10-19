import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Single file for PHP / plain HTML: <script src="zoro-editor.iife.js"> → window.ZoroEditor
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    minify: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/auto.ts'),
      name: 'ZoroEditor',
      formats: ['iife'],
      fileName: () => 'zoro-editor.iife.js',
      
    },
  },
});
