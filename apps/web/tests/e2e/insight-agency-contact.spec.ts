import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors } from './helpers';

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
    const errors = collectCriticalConsoleErrors(page);

    await page.goto('/contatti/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Raccontaci');
    await expect(page.getByLabel('Nome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Messaggio')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('submits contact form, records success and redirects to thank-you page', async ({ page }) => {
    const errors = collectCriticalConsoleErrors(page);
    let requestCount = 0;

    await page.route('**/wp-json/netmarket/v1/forms/contact', async (route) => {
      requestCount += 1;
      const payload = JSON.parse(route.request().postData() || '{}') as Record<string, unknown>;
      expect(payload.name).toBe('Mario Rossi');
      expect(payload.email).toBe('mario@example.com');
      expect(payload.privacyConsent).toBe(true);
      expect(payload.website).toBe('');
      expect(payload.sourceUrl).toContain('/contatti/');
      expect(payload.elapsedMs).toEqual(expect.any(Number));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/contatti/?utm_source=playwright&utm_campaign=contact-flow', {
      waitUntil: 'domcontentloaded'
    });
    await page.evaluate(() => {
      window.addEventListener('beforeunload', () => {
        sessionStorage.setItem(
          'nm_test_contact_events',
          JSON.stringify(window.dataLayer?.map((item) => item.event) ?? [])
        );
      });
    });
    await page.getByLabel('Nome').fill('Mario Rossi');
    await page.getByLabel('Email').fill('mario@example.com');
    await page.getByLabel('Azienda').fill('Netmarket Test');
    await page.getByLabel('Telefono').fill('+39 049 000000');
    await page.getByLabel('Interesse').selectOption('altro');
    await page.getByLabel('Messaggio').fill('Vorrei parlare di un progetto digitale per la mia azienda.');
    await page.getByRole('checkbox', { name: /informativa/i }).check();
    await page.getByRole('button', { name: 'Invia richiesta' }).click();

    await expect(page).toHaveURL(/\/grazie\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Grazie.' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(requestCount).toBe(1);
    expect(
      JSON.parse(
        await page.evaluate(() => sessionStorage.getItem('nm_test_contact_events') || '[]')
      ) as string[]
    ).toEqual(expect.arrayContaining(['contact_form_submit', 'contact_form_success']));
    expect(errors).toEqual([]);
  });

  test('keeps contact form data visible when backend rejects submission', async ({ page }) => {
    await page.route('**/wp-json/netmarket/v1/forms/contact', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'mail_failed', message: 'Invio non disponibile.' })
      });
    });

    await page.goto('/contatti/', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Nome').fill('Mario Rossi');
    await page.getByLabel('Email').fill('mario@example.com');
    await page.getByLabel('Messaggio').fill('Vorrei parlare di un progetto digitale.');
    await page.getByRole('checkbox', { name: /informativa/i }).check();
    await page.getByRole('button', { name: 'Invia richiesta' }).click();

    await expect(page).toHaveURL(/\/contatti\/$/);
    await expect(page.locator('#contact-form-status')).toContainText(
      'Non siamo riusciti a inviare il messaggio'
    );
    await expect(page.getByLabel('Messaggio')).toHaveValue(
      'Vorrei parlare di un progetto digitale.'
    );
    expect(await page.evaluate(() => window.dataLayer?.map((item) => item.event))).toEqual(
      expect.arrayContaining(['contact_form_submit', 'contact_form_error'])
    );
  });

  test('prevents duplicate contact submits while the first request is pending', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/wp-json/netmarket/v1/forms/contact', async (route) => {
      requestCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/contatti/', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Nome').fill('Mario Rossi');
    await page.getByLabel('Email').fill('mario@example.com');
    await page.getByLabel('Messaggio').fill('Vorrei parlare di un progetto digitale.');
    await page.getByRole('checkbox', { name: /informativa/i }).check();

    const button = page.locator('[data-contact-form] button[type="submit"]');
    await button.click();
    await button.click({ force: true });

    await expect(page).toHaveURL(/\/grazie\/$/);
    expect(requestCount).toBe(1);
  });

  test('renders NOD product page with CMS screenshots and crawlable SEO', async ({ page }) => {
    const errors = collectCriticalConsoleErrors(page);

    await page.goto('/nod/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('CRM operativo');
    await expect(page.getByAltText('NØD by Netmarket')).toBeVisible();
    await expect(page.getByAltText(/Dashboard NOD/)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.netmarket.it/nod/'
    );
    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    expect(structuredData).toContain('SoftwareApplication');
    expect(errors).toEqual([]);
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 }
  ]) {
    test(`keeps new pages usable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const path of ['/insight/', '/agenzia/', '/contatti/', '/grazie/', '/nod/']) {
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
