import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Forces sequential processing inside a single process lifecycle
      },
    },
    fileParallelism: false,
    maxWorkers: 1,
  },
});
