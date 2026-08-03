import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    pool: 'threads',
    fileParallelism: false,
    maxConcurrency: 1,
    server: {
      deps: {
        inline: [
          '@exodus/bytes',
          'html-encoding-sniffer',
          'jsdom',
          'data-urls',
          'whatwg-url',
          'whatwg-encoding',
          'whatwg-mimetype',
        ],
      },
    },
  },
});
