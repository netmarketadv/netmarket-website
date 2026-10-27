import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig(base, {
  testMatch: ['e2e/home.spec.ts', 'e2e/motion-restoration.spec.ts'],
  grep: /motion reveal never leaves|restored scroll reveals|late scroll restoration/,
  projects: (['chromium', 'firefox', 'webkit'] as const).map((browserName) => ({
    name: browserName,
    use: { browserName }
  }))
});
