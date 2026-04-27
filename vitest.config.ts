import { defineConfig } from 'vitest/config';

const ci = process.env.CI === 'true';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    ...(ci
      ? {
          maxWorkers: 1,
          minWorkers: 1,
          fileParallelism: false,
          maxConcurrency: 1,
        }
      : {}),
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
    },
  },
});
