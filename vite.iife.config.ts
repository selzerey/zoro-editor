import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// PHP / düz HTML için tek dosya: <script src="zoro-editor.iife.js"> → window.ZoroEditor
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
