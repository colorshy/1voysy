import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  server: {
    port: 5173,
    open: false,
    host: true,
    cors: true,
    fs: {
      strict: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        careers: resolve(__dirname, 'careers.html'),
        direction: resolve(__dirname, 'direction.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
});

