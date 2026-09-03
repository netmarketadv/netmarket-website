import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors } from './helpers';

test.setTimeout(120_000);

test('siti web service page is editorial, crawlable, and conversion ready', async ({ page }) => {
  const errors = collectCriticalConsoleErrors(page);
  await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });

  await expect(
    page.getByRole('heading', { level: 1, name: 'Siti web che lavorano per la tua azienda.' })
  ).toBeVisible();
  await expect(page.locator('#page-title .nm-heading-marker')).toContainText('lavorano');
  await expect(page).toHaveTitle(/Realizzazione siti web a Padova/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Realizzazione siti web a Padova/i
  );
  await expect(page.getByRole('link', { name: 'Parliamone' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Guarda i progetti' }).first()).toBeVisible();

  await expect(page.getByRole('heading', { level: 2, name: 'Che tipo di sito possiamo realizzare.' })).toBeVisible();
  await expect(page.getByText('Alcuni siti che abbiamo progettato.')).toHaveCount(0);
  await expect(page.locator('[data-portfolio-card]')).toHaveCount(6);
  await expect(page.locator('.websites-portfolio-card[aria-hidden="true"]')).toHaveCount(6);
  await expect(page.locator('[data-portfolio-card]').first()).toHaveAttribute('href', /rigomar/);
  await expect(page.getByRole('heading', { level: 2, name: /modo in cui cerchiamo oggi/ })).toBeVisible();
  await expect(page.locator('body')).toContainText(/nuovi sistemi di ricerca basati sull’AI/);
  await expect(page.locator('body')).toContainText(/senza promettere risultati non controllabili/);

  const projectCards = page.locator('.websites-project-card');
  await expect(projectCards).toHaveCount(4);
  await expect(page.locator('.websites-project-showcase').getByRole('link', { name: /Albertini/i })).toBeVisible();
  await expect(page.locator('.websites-project-showcase').getByRole('link', { name: /Rigomar/i })).toBeVisible();
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

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/servizi/siti-web/', { waitUntil: 'domcontentloaded' });
  await page.locator('.websites-type-rail').scrollIntoViewIfNeeded();
  const mobileState = await page.evaluate(() => {
    const rail = document.querySelector<HTMLElement>('.websites-type-rail');
    const portfolioRail = document.querySelector<HTMLElement>('.websites-portfolio__viewport');
    const projectRail = document.querySelector<HTMLElement>('.websites-project-showcase');
    if (portfolioRail) portfolioRail.scrollLeft = 180;
    if (projectRail) projectRail.scrollLeft = 180;
    return {
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      typeRailColumns: rail ? window.getComputedStyle(rail).gridTemplateColumns : '',
      portfolioRailOverflow: portfolioRail ? window.getComputedStyle(portfolioRail).overflowX : '',
      portfolioRailScrollLeft: portfolioRail?.scrollLeft ?? 0,
      projectRailOverflow: projectRail ? window.getComputedStyle(projectRail).overflowX : '',
      projectRailScrollLeft: projectRail?.scrollLeft ?? 0
    };
  });

  expect(mobileState.bodyOverflow).toBeLessThanOrEqual(2);
  expect(mobileState.typeRailColumns.split(' ').length).toBe(1);
  expect(mobileState.portfolioRailOverflow).toBe('auto');
  expect(mobileState.portfolioRailScrollLeft).toBeGreaterThan(0);
  expect(mobileState.projectRailOverflow).toBe('auto');
  expect(mobileState.projectRailScrollLeft).toBeGreaterThan(0);
  expect(errors.filter((error) => !/Failed to load resource/i.test(error))).toEqual([]);
});
