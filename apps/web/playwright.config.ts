import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4321';
const shouldStartWebServer = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  ...(shouldStartWebServer
    ? {
        webServer: {
        command: 'pnpm dev --host 127.0.0.1',
        url: baseURL,
        reuseExistingServer: true
      }
      }
    : {}),
  use: {
    baseURL
  }
});
