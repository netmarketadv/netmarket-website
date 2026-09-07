import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors } from './helpers';

test.describe('projects', () => {
  test.setTimeout(120_000);

  test('renders project archive with crawlable project links', async ({ page }) => {
    const errors = collectCriticalConsoleErrors(page);

    await page.goto('/progetti/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('migliori progetti');
    await expect(
      page.getByRole('link', { name: /BRB|Sirene Blu|Albertini/i }).first()
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(errors).toEqual([]);
  });

  test('renders project detail with breadcrumb, services and images', async ({ page }) => {
    await page.goto('/progetti/casi-studio-strategia-digitale-ecommerce-brb/', {
      waitUntil: 'domcontentloaded'
    });

    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Progetti');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ecosistema digitale');
    await expect(
      page.getByLabel('Servizi applicati').getByRole('link', { name: 'Siti web' })
    ).toBeVisible();
    await expect(page.locator('.case-hero__media img')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'Cosa ha prodotto il progetto.' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Progetti con sfide affini.' })).toBeVisible();
    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    expect(structuredData).toContain('CreativeWork');
    expect(structuredData).toContain('BRB');
  });

  for (const slug of [
    'app-mobile-programma-fedelta-sirene-blu',
    'sviluppo-e-commerce-per-tavoli-e-sedie-per-la-casa',
    'sviluppo-sito-web-fotovoltaico-progetto-e',
    'sviluppo-sito-web-allestimenti-fieristici-albertini',
    'sviluppo-sito-web-e-shooting-fotografico-per-rigomar-una-presenza-digitale-piu-autorevole-per-il-mondo-della-produzione-moda',
    'sviluppo-crm-custom-venitaly'
  ]) {
    test(`${slug} stays inside a 390px viewport`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/progetti/${slug}/`, { waitUntil: 'networkidle' });

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('.case-hero__media img')).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
