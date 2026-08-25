import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@repo/component-library/styles': path.resolve(
        __dirname,
        '../../packages/component-library/lib/assets/scss/main.scss',
      ),
      '@repo/component-library': path.resolve(
        __dirname,
        '../../packages/component-library/lib/main.ts',
      ),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
