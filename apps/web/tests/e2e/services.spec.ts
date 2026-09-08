import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors, expectEnvironmentRobots } from './helpers';

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
  await expectEnvironmentRobots(page);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://netmarket.it/servizi/'
  );
  expect(errors).toEqual([]);
});

test('service detail renders SEO, breadcrumb and CTA', async ({ page }) => {
  await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Realizzazione siti web a Padova, progettati per lavorare.'
    })
  ).toBeVisible();
  await expect(page.locator('#page-title .nm-heading-marker')).toContainText('lavorare');
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Servizi');
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .evaluate((element) => element.textContent ?? '');
  expect(jsonLd).toContain('"@type":"Service"');
  expect(jsonLd).toContain('https://netmarket.it/servizi/siti-web/#service');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://netmarket.it/servizi/siti-web/'
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
    page.getByRole('heading', {
      level: 1,
      name: 'Siti ecommerce a Padova progettati per vendere.'
    })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /Dal prodotto al checkout/ })).toBeVisible();
  await context.close();
});

test('all definitive service experiences stay semantic and inside supported viewports', async ({
  page
}) => {
  const services = [
    ['ecommerce', 'Siti ecommerce a Padova progettati per vendere.'],
    ['software-e-integrazioni', 'Sviluppo software a Padova per processi che scorrono.'],
    ['seo', 'Consulenza SEO a Padova per farti trovare.'],
    ['advertising', 'Advertising e Google Ads a Padova, senza dispersioni.'],
    ['social-media', 'Social media marketing a Padova, con una direzione.'],
    ['branding-e-comunicazione', 'Branding e comunicazione a Padova per distinguersi.'],
    ['content-production', 'Produzione foto, video e contenuti a Padova.'],
    ['concorsi-a-premi', 'Concorsi a premi a Padova, gestiti dall’idea al lancio.']
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
    await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1_000);
    const websitesLayout = await page.evaluate(() => {
      const breadcrumb = document.querySelector<HTMLElement>('.service-page-breadcrumb')!;
      return {
        breadcrumbTop: Math.round(breadcrumb.getBoundingClientRect().top),
        breadcrumbHeight: Math.round(breadcrumb.getBoundingClientRect().height),
        iconBackground: getComputedStyle(
          document.querySelector<HTMLElement>('.websites-type-rail__icon')!
        ).backgroundColor,
        iconColor: getComputedStyle(
          document.querySelector<HTMLElement>('.websites-type-rail__icon')!
        ).color,
        iconRadius: getComputedStyle(
          document.querySelector<HTMLElement>('.websites-type-rail__icon')!
        ).borderRadius,
        clippedHeadings: Array.from(
          document.querySelectorAll<HTMLElement>('.websites-service-page :is(h1, h2, h3)')
        )
          .filter(
            (heading) =>
              heading.offsetParent !== null &&
              heading.scrollWidth - heading.clientWidth >
                Number.parseFloat(getComputedStyle(heading).fontSize) * 0.5
          )
          .map((heading) => heading.textContent?.trim() ?? heading.tagName)
      };
    });
    expect(websitesLayout.clippedHeadings, `siti-web headings at ${viewport.width}px`).toEqual([]);
    expect(websitesLayout.iconBackground).toBe('rgb(255, 255, 255)');
    expect(websitesLayout.iconColor).toBe('rgb(9, 10, 15)');
    expect(websitesLayout.iconRadius).toBe('50%');

    for (const [slug, heading] of services) {
      await page.goto(`/servizi/${slug}/`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('.service-x-visual')).toHaveCount(0);
      await expect(page.locator('.service-x-links')).toHaveCount(0);
      await expect(page.locator('.service-x-territory')).toContainText('Padova');
      await expect(page.locator('#service-faq-title')).toBeVisible();
      await expect(page).toHaveTitle(/Padova.+Netmarket|Netmarket.+Padova/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Padova/i);

      const schemas = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) =>
          nodes.flatMap((node) => {
            const parsed = JSON.parse(node.textContent ?? '[]');
            return Array.isArray(parsed) ? parsed : [parsed];
          })
        );
      expect(schemas.some((schema) => schema['@type'] === 'Service')).toBe(true);
      expect(schemas.some((schema) => schema['@type'] === 'FAQPage')).toBe(true);

      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        heroFontSize: Number.parseFloat(
          getComputedStyle(document.querySelector<HTMLElement>('.service-x-hero h1')!).fontSize
        ),
        accentColor: getComputedStyle(document.querySelector<HTMLElement>('.service-x')!)
          .getPropertyValue('--service-x-accent')
          .trim(),
        iconBackground: getComputedStyle(
          document.querySelector<HTMLElement>('.service-x-values article > span')!
        ).backgroundColor,
        iconRadius: getComputedStyle(
          document.querySelector<HTMLElement>('.service-icon-medallion')!
        ).borderRadius,
        breadcrumbTop: Math.round(
          document.querySelector<HTMLElement>('.service-page-breadcrumb')!.getBoundingClientRect()
            .top
        ),
        breadcrumbHeight: Math.round(
          document.querySelector<HTMLElement>('.service-page-breadcrumb')!.getBoundingClientRect()
            .height
        ),
        clippedHeadings: Array.from(
          document.querySelectorAll<HTMLElement>('.service-x :is(h1, h2, h3)')
        )
          .filter(
            (heading) =>
              heading.offsetParent !== null &&
              heading.scrollWidth - heading.clientWidth >
                Number.parseFloat(getComputedStyle(heading).fontSize) * 0.5
          )
          .map((heading) => heading.textContent?.trim() ?? heading.tagName),
        projectMediaHeights: Array.from(
          document.querySelectorAll<HTMLElement>('.service-x-project-grid .project-card__media')
        ).map((media) => Math.round(media.getBoundingClientRect().height)),
        invalidSections: Array.from(
          document.querySelectorAll<HTMLElement>('.service-x > section')
        ).filter((section) => {
          const rect = section.getBoundingClientRect();
          return rect.left < -2 || rect.right > document.documentElement.clientWidth + 2;
        }).length
      }));
      expect(layout.overflow, `${slug} at ${viewport.width}px`).toBeLessThanOrEqual(2);
      expect(layout.invalidSections, `${slug} section bounds at ${viewport.width}px`).toBe(0);
      expect(layout.heroFontSize, `${slug} hero size at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.width < 768 ? 62 : 108
      );
      expect(layout.accentColor).toBe('#0e51fe');
      expect(layout.iconBackground).toBe('rgb(255, 255, 255)');
      expect(layout.iconRadius).toBe('50%');
      expect(layout.breadcrumbHeight).toBe(websitesLayout.breadcrumbHeight);
      expect(layout.breadcrumbTop).toBe(websitesLayout.breadcrumbTop);
      expect(layout.clippedHeadings, `${slug} headings at ${viewport.width}px`).toEqual([]);
      expect(
        new Set(layout.projectMediaHeights).size,
        `${slug} project media heights at ${viewport.width}px`
      ).toBeLessThanOrEqual(1);
    }
  }
});
