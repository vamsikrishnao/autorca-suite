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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/lib/**/*.{ts,tsx}', 'src/services/**/*.{ts,tsx}', 'src/utils/**/*.{ts,tsx}'],
      exclude: [
        'src/tests/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'scripts/**',
        'sdk/**',
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});


