import type { Page } from '@playwright/test';

const ignorableConsoleErrors = [/status of 504 \(Outdated Optimize Dep\)/i];

export function collectCriticalConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (ignorableConsoleErrors.some((pattern) => pattern.test(text))) return;
    errors.push(text);
  });
  return errors;
}

export async function waitForInteractivePage(page: Page): Promise<void> {
  await page.waitForLoadState('load');
}
