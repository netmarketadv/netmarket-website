import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors, expectEnvironmentRobots } from './helpers';

test.describe('projects', () => {
  test.setTimeout(120_000);

  test('renders project archive with crawlable project links', async ({ page }) => {
    const errors = collectCriticalConsoleErrors(page);

    await page.goto('/progetti/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('migliori progetti');
    await expect(
      page.getByRole('link', { name: /BRB|Sirene Blu|Albertini/i }).first()
    ).toBeVisible();
    await expectEnvironmentRobots(page);
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

  test('keeps every case study inside all supported viewports', async ({ page }) => {
    const slugs = [
      'app-mobile-programma-fedelta-sirene-blu',
      'sviluppo-crm-custom-venitaly',
      'sviluppo-sito-web-e-shooting-fotografico-per-rigomar-una-presenza-digitale-piu-autorevole-per-il-mondo-della-produzione-moda',
      'sviluppo-sito-web-allestimenti-fieristici-albertini',
      'sviluppo-sito-web-fotovoltaico-progetto-e',
      'sviluppo-e-commerce-per-tavoli-e-sedie-per-la-casa',
      'concorso-a-premi-sirene-blu-2024-ideazione-sviluppo-e-gestione-completa',
      'casi-studio-strategia-digitale-ecommerce-brb'
    ];
    const widths = [390, 430, 768, 1024, 1280, 1440, 1728];

    for (const width of widths) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      for (const slug of slugs) {
        await page.goto(`/progetti/${slug}/`, { waitUntil: 'domcontentloaded' });
        await expect(
          page.getByRole('heading', { level: 1 }),
          `${slug} at ${width}px`
        ).toBeVisible();
        await expect(
          page.locator('.case-hero__media img'),
          `${slug} cover at ${width}px`
        ).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow, `${slug} overflow at ${width}px`).toBeLessThanOrEqual(1);
      }
    }
  });
});
