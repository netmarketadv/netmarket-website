import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors } from './helpers';

test.setTimeout(120_000);

test('siti web service page is editorial, crawlable, and conversion ready', async ({ page }) => {
  const errors = collectCriticalConsoleErrors(page);
  await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Realizzazione siti web a Padova, progettati per lavorare.'
    })
  ).toBeVisible();
  await expect(page.locator('#page-title .nm-heading-marker')).toContainText('lavorare');
  await expect(page).toHaveTitle(/Realizzazione siti web a Padova/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Realizzazione siti web a Padova/i
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://netmarket.it/servizi/siti-web/'
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://netmarket.it/media/rigomar.webp'
  );
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    'content',
    'Progetto del sito web Rigomar realizzato da Netmarket'
  );
  await expect(page.locator('.websites-hero__copy')).toContainText('Da Padova progettiamo');
  await expect(page.getByRole('link', { name: 'Parliamone' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Guarda i progetti' }).first()).toBeVisible();

  await expect(
    page.getByRole('heading', { level: 2, name: 'Che tipo di sito possiamo realizzare.' })
  ).toBeVisible();
  await expect(page.getByText('Alcuni siti che abbiamo progettato.')).toHaveCount(0);
  await expect(page.locator('[data-portfolio-card]')).toHaveCount(6);
  await expect(page.locator('.websites-portfolio__item[aria-hidden="true"]')).toHaveCount(6);
  await expect(page.locator('[data-portfolio-card]').first()).toHaveAttribute('href', /rigomar/);
  await expect(page.locator('[data-portfolio-card] img').first()).toHaveAttribute(
    'loading',
    'eager'
  );
  await expect(page.locator('[data-portfolio-card] img').first()).toHaveAttribute(
    'fetchpriority',
    'high'
  );
  await expect(page.locator('[data-portfolio-viewport]')).toHaveAttribute('role', 'region');
  await expect(page.locator('[data-portfolio-viewport]')).toHaveAttribute('tabindex', '0');
  await expect(
    page.getByRole('heading', { level: 2, name: /modo in cui cerchiamo oggi/ })
  ).toBeVisible();
  await expect(page.locator('body')).toContainText(/nuovi sistemi di ricerca basati\s+sull’AI/);
  await expect(page.locator('body')).toContainText(/senza promettere risultati non controllabili/);

  const projectCards = page.locator('.websites-project-card');
  await expect(projectCards).toHaveCount(4);
  await expect(
    page.locator('.websites-project-showcase').getByRole('link', { name: /Albertini/i })
  ).toBeVisible();
  await expect(
    page.locator('.websites-project-showcase').getByRole('link', { name: /Rigomar/i })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Guarda tutti i progetti/i })).toBeVisible();

  const connectedLinks = page.locator('.websites-connected__links');
  await expect(connectedLinks.getByRole('link', { name: /Ecommerce/i })).toHaveAttribute(
    'href',
    '/servizi/ecommerce/'
  );
  await expect(connectedLinks.getByRole('link', { name: /SEO/i })).toHaveAttribute(
    'href',
    '/servizi/seo/'
  );
  await expect(page.getByRole('heading', { level: 2, name: /FAQ sui siti web/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Quanto costa/ })).toBeVisible();

  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      const parsed = JSON.parse(node.textContent ?? '[]');
      return Array.isArray(parsed) ? parsed : [parsed];
    })
  );
  const serviceSchema = schemas.find((schema) => schema['@type'] === 'Service');
  expect(serviceSchema?.areaServed).toEqual([
    { '@type': 'City', name: 'Padova' },
    { '@type': 'Country', name: 'Italia' }
  ]);

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });
  await page.locator('.websites-type-rail').scrollIntoViewIfNeeded();
  const mobileState = await page.evaluate(() => {
    const rail = document.querySelector<HTMLElement>('.websites-type-rail');
    const portfolioRail = document.querySelector<HTMLElement>('.websites-portfolio__viewport');
    const projectRail = document.querySelector<HTMLElement>('.websites-project-showcase');
    const technology = document.querySelector<HTMLElement>('.websites-technology');
    const why = document.querySelector<HTMLElement>('.websites-why');
    if (portfolioRail) portfolioRail.scrollLeft = 180;
    if (projectRail) projectRail.scrollLeft = 180;
    return {
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      typeRailColumns: rail ? window.getComputedStyle(rail).gridTemplateColumns : '',
      portfolioRailOverflow: portfolioRail ? window.getComputedStyle(portfolioRail).overflowX : '',
      portfolioRailScrollLeft: portfolioRail?.scrollLeft ?? 0,
      projectRailOverflow: projectRail ? window.getComputedStyle(projectRail).overflowX : '',
      projectRailScrollLeft: projectRail?.scrollLeft ?? 0,
      technologyDisplay: technology ? window.getComputedStyle(technology).display : '',
      whyDisplay: why ? window.getComputedStyle(why).display : ''
    };
  });

  expect(mobileState.bodyOverflow).toBeLessThanOrEqual(2);
  expect(mobileState.typeRailColumns.split(' ').length).toBe(1);
  expect(mobileState.portfolioRailOverflow).toBe('auto');
  expect(mobileState.portfolioRailScrollLeft).toBeGreaterThan(0);
  expect(mobileState.projectRailOverflow).toBe('auto');
  expect(mobileState.projectRailScrollLeft).toBeGreaterThan(0);
  expect(mobileState.technologyDisplay).toBe('none');
  expect(mobileState.whyDisplay).toBe('none');

  await page.locator('[data-portfolio-viewport]').focus();
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => page.locator('[data-portfolio-viewport]').evaluate((rail) => rail.scrollLeft))
    .toBeGreaterThan(0);
  expect(errors.filter((error) => !/Failed to load resource/i.test(error))).toEqual([]);
});

test('siti web content remains semantic and readable without javascript', async ({ browser }) => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4321';
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Realizzazione siti web a Padova, progettati per lavorare.'
    })
  ).toBeVisible();
  await expect(page.locator('h1')).toHaveText(
    /Realizzazione siti web a Padova, progettati per\s+lavorare\./
  );
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main h2')).toHaveCount(11);
  await expect(page.locator('body')).toContainText('Da Padova progettiamo siti corporate');
  await context.close();
});

test('siti web layout stays inside every supported viewport', async ({ page }) => {
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
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForTimeout(900);

    const layout = await page.evaluate(() => {
      const pageWidth = document.documentElement.clientWidth;
      const title = document.querySelector<HTMLElement>('#page-title');
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('.websites-service-page > section')
      );
      return {
        overflow: document.documentElement.scrollWidth - pageWidth,
        titleClipped: title
          ? title.getBoundingClientRect().left < -2 ||
            title.getBoundingClientRect().right > pageWidth + 2 ||
            window.getComputedStyle(title).overflow === 'hidden'
          : true,
        invalidSections: sections.filter((section) => {
          const rect = section.getBoundingClientRect();
          return rect.left < -2 || rect.right > pageWidth + 2;
        }).length
      };
    });

    expect(layout.overflow, `${viewport.width}px horizontal overflow`).toBeLessThanOrEqual(2);
    expect(layout.titleClipped, `${viewport.width}px clipped H1`).toBe(false);
    expect(layout.invalidSections, `${viewport.width}px section bounds`).toBe(0);
  }
});
