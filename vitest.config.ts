import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    pool: 'vmThreads', 
    fileParallelism: false,
    maxWorkers: 1,
    server: {
      deps: {
        inline: ['html-encoding-sniffer', '@exodus/bytes'], // Forces Vitest to pre-transform the ESM/CJS collision
      },
    },
  },
});
