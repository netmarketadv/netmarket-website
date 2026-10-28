import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig(base, {
  testMatch: ['e2e/home.spec.ts', 'e2e/motion-restoration.spec.ts'],
  grep: /motion reveal never leaves|motion reveal handles a late|restored scroll reveals|late scroll restoration|late layout changes reveal|position-only layout/,
  projects: (['chromium', 'firefox', 'webkit'] as const).map((browserName) => ({
    name: browserName,
    use: { browserName }
  }))
});
