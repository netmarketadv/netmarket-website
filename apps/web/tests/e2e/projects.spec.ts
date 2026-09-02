import { expect, test } from '@playwright/test';

test.describe('projects', () => {
  test.setTimeout(60_000);

  test('renders project archive with crawlable project links', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/progetti/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('lavoro reale');
    await expect(page.getByRole('link', { name: /BRB|Sirene Blu|Albertini/i }).first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(errors).toEqual([]);
  });

  test('renders project detail with breadcrumb, services and images', async ({ page }) => {
    await page.goto('/progetti/casi-studio-strategia-digitale-ecommerce-brb/', {
      waitUntil: 'domcontentloaded'
    });

    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Progetti');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('BRB');
    await expect(
      page.getByLabel('Dati progetto').getByRole('link', { name: 'Siti web' })
    ).toBeVisible();
    await expect(page.locator('.project-hero-media img')).toHaveCount(1);
    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    expect(structuredData).toContain('CreativeWork');
  });
});
