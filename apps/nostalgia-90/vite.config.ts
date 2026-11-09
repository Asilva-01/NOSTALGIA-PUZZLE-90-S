import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const repo = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@puzzle-universe/shared-utils': resolve(repo, 'packages/shared-utils/src/index.ts'),
      '@puzzle-universe/puzzle-engine': resolve(repo, 'packages/puzzle-engine/src/index.ts'),
      '@puzzle-universe/content-manager': resolve(repo, 'packages/content-manager/src/index.ts'),
      '@puzzle-universe/shared-ui/base.css': resolve(repo, 'packages/shared-ui/src/base.css'),
      '@puzzle-universe/shared-ui': resolve(repo, 'packages/shared-ui/src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    fs: { allow: [repo] },
  },
  preview: {
    port: 4173,
    host: '127.0.0.1',
    strictPort: true,
  },
});
