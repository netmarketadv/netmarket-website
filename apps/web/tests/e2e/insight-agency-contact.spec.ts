import { expect, test } from '@playwright/test';

test.describe('insight, agency and contact', () => {
  test.setTimeout(120_000);

  test('renders insight archive and article detail with crawlable links', async ({ page }) => {
    await page.goto('/insight/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Appunti utili');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    const firstArticle = page.locator('.insight-archive-card, .insight-featured').first();
    await expect(firstArticle).toBeVisible();
    const href = await firstArticle.getAttribute('href');
    expect(href).toMatch(/^\/insight\/.+\/$/);

    await page.goto(href!, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Insight');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    expect(structuredData).toContain('Article');
  });

  test('renders agency page with team and client systems', async ({ page }) => {
    await page.goto('/agenzia/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Esperienza');
    await expect(page.locator('#team')).toBeVisible();
    await expect(page.locator('.client-marquee')).toBeVisible();
  });

  test('renders contact form without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/contatti/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Raccontaci');
    await expect(page.getByLabel('Nome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Messaggio')).toBeVisible();
    expect(errors).toEqual([]);
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 }
  ]) {
    test(`keeps new pages usable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const path of ['/insight/', '/agenzia/', '/contatti/']) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        const horizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1
        );
        expect(horizontalOverflow).toBe(false);
      }
    });
  }
});
