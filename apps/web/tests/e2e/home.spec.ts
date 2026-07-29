import { expect, test } from '@playwright/test';

test('homepage exposes staging essentials', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Netmarket' })).toBeVisible();
  await expect(page).toHaveTitle(/Ambiente di sviluppo/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Salta al contenuto/ })).toBeFocused();
  expect(errors).toEqual([]);
});

test('404 page works', async ({ page }) => {
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { level: 1, name: 'Pagina non trovata' })).toBeVisible();
});
