import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors } from '../e2e/helpers';

const expectedBuildSha = process.env.EXPECTED_BUILD_SHA;
const expectedBuildEnv = process.env.EXPECTED_BUILD_ENV ?? 'staging';

test('staging critical path is published and crawlable', async ({ page }) => {
  const errors = collectCriticalConsoleErrors(page);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site-header')).toBeVisible();
  await expect(page.locator('.site-footer')).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Navigazione principale' }).locator('a[href="/servizi/"]')
  ).toHaveCount(1);

  if (expectedBuildSha) {
    await expect(page.locator('meta[name="netmarket-build"]')).toHaveAttribute(
      'content',
      expectedBuildSha
    );
    await expect(page.locator('meta[name="netmarket-environment"]')).toHaveAttribute(
      'content',
      expectedBuildEnv
    );
  }

  await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Siti web' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Servizi');

  await page.goto('/progetti/casi-studio-strategia-digitale-ecommerce-brb/', {
    waitUntil: 'domcontentloaded'
  });
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Un ecosistema digitale che accelera l’ecommerce.'
  );
  await expect(page.locator('.case-kicker')).toContainText('BRB');

  await page.goto('/contatti/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Raccontaci');
  await expect(page.getByLabel('Nome')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel(/Raccontaci brevemente il progetto/)).toBeVisible();

  await page.goto('/grazie/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Grazie.' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

  expect(errors).toEqual([]);

  await page.goto('/missing-page', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Pagina non trovata' })).toBeVisible();
});
