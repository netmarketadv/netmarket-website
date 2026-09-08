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
  await expect(
    page.getByRole('heading', { level: 1, name: 'Uno store che vende. E resta governabile.' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /Dal prodotto al checkout/ })).toBeVisible();
  await context.close();
});

test('all definitive service experiences stay semantic and inside supported viewports', async ({
  page
}) => {
  const services = [
    ['ecommerce', 'Uno store che vende. E resta governabile.'],
    ['software-e-integrazioni', 'Meno passaggi manuali. Più lavoro che scorre.'],
    ['seo', 'Essere trovati quando la ricerca conta.'],
    ['advertising', 'Ogni campagna deve portare da qualche parte.'],
    ['social-media', 'Una presenza riconoscibile, non un feed da riempire.'],
    ['branding-e-comunicazione', 'Rendere visibile ciò che vi rende diversi.'],
    ['content-production', 'Contenuti nati per essere guardati. E usati.'],
    ['concorsi-a-premi', 'Un’idea promozionale, governata fino all’ultimo passaggio.']
  ] as const;
  const viewports = [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1728, height: 1117 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const [slug, heading] of services) {
      await page.goto(`/servizi/${slug}/`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('.service-x-visual')).toHaveClass(new RegExp(slug));
      await expect(page.locator('#service-faq-title')).toBeVisible();
      await expect(page).toHaveTitle(/Padova.+Netmarket|Netmarket.+Padova/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Padova/i);

      const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
        nodes.flatMap((node) => {
          const parsed = JSON.parse(node.textContent ?? '[]');
          return Array.isArray(parsed) ? parsed : [parsed];
        })
      );
      expect(schemas.some((schema) => schema['@type'] === 'Service')).toBe(true);
      expect(schemas.some((schema) => schema['@type'] === 'FAQPage')).toBe(true);

      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        invalidSections: Array.from(document.querySelectorAll<HTMLElement>('.service-x > section'))
          .filter((section) => {
            const rect = section.getBoundingClientRect();
            return rect.left < -2 || rect.right > document.documentElement.clientWidth + 2;
          }).length
      }));
      expect(layout.overflow, `${slug} at ${viewport.width}px`).toBeLessThanOrEqual(2);
      expect(layout.invalidSections, `${slug} section bounds at ${viewport.width}px`).toBe(0);
    }
  }
});
