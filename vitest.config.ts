import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: [],
    coverage: {
      enabled: false
    }
  }
});
