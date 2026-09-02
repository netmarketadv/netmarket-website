import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    exclude: ['tests/e2e/**', 'tests/e2e-smoke/**', 'node_modules/**', 'dist/**']
  }
});
