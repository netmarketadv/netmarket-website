import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors } from './helpers';

test.setTimeout(120_000);

test('services archive renders the editorial index', async ({ page }) => {
  const errors = collectCriticalConsoleErrors(page);

  await page.goto('/servizi/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: /Servizi integrati/ })).toBeVisible();
  await expect(
    page.locator('.service-index').getByRole('link', { name: /Siti web/ })
  ).toHaveAttribute('href', /\/servizi\/siti-web\//);
  await expect(
    page.locator('.service-index').getByRole('link', { name: /Concorsi a premi/ })
  ).toHaveAttribute('href', /\/servizi\/concorsi-a-premi\//);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.netmarket.it/servizi/'
  );
  expect(errors).toEqual([]);
});

test('service detail renders SEO, breadcrumb and CTA', async ({ page }) => {
  await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Siti web che lavorano per la tua azienda.' })).toBeVisible();
  await expect(page.locator('#page-title .nm-heading-marker')).toContainText('lavorano');
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Servizi');
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .evaluate((element) => element.textContent ?? '');
  expect(jsonLd).toContain('"@type":"Service"');
  expect(jsonLd).toContain('https://www.netmarket.it/servizi/siti-web/#service');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.netmarket.it/servizi/siti-web/'
  );
  await expect(page.locator('#service-faq-title')).toBeVisible();
  await expect(page.locator('.faq-list__trigger').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Parliamone' }).first()).toBeVisible();
});

test('services remain visible without javascript', async ({ browser }) => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4321';
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/servizi/ecommerce/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Ecommerce' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Metodo operativo' })).toBeVisible();
  await context.close();
});
