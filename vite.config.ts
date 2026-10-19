import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import pkg from './package.json' with { type: 'json' };

// npm package: ESM, dependencies external (resolved by the user's bundler)
const deps = Object.keys((pkg as { dependencies?: Record<string, string> }).dependencies ?? {});
const external = (id: string) =>
  ['react', 'react-dom', 'react/jsx-runtime', ...deps].some((d) => id === d || id.startsWith(d + '/'));

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: {
        'zoro-editor': resolve(import.meta.dirname, 'src/index.ts'),
        react: resolve(import.meta.dirname, 'src/react/index.tsx'),
      },
      formats: ['es'],
      
    },
    rollupOptions: { external, output: { chunkFileNames: 'chunks/[name]-[hash].js' } },
  },
});
