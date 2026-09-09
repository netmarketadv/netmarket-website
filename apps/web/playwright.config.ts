import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4321';
const shouldStartWebServer = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: {
    timeout: 5_000
  },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'list',
  ...(shouldStartWebServer
    ? {
        webServer: {
          command: 'pnpm build && pnpm preview --host 127.0.0.1 --port 4321',
          url: baseURL,
          reuseExistingServer: false
        }
      }
    : {}),
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off'
  }
});
