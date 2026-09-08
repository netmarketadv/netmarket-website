import { expect, test } from '@playwright/test';
import { collectCriticalConsoleErrors } from './helpers';

test.describe('insight, agency and contact', () => {
  test.setTimeout(120_000);

  test('renders insight archive and article detail with crawlable links', async ({ page }) => {
    await page.goto('/insight/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Appunti utili');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    const firstArticle = page
      .locator('.insight-cover-story > a, .insight-card-editorial > a')
      .first();
    await expect(firstArticle).toBeVisible();
    const href = await firstArticle.getAttribute('href');
    expect(href).toMatch(/^\/insight\/.+\/$/);

    await page.goto(href!, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Insight');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    expect(structuredData).toContain('Article');
    expect(structuredData).toContain('BlogPosting');
  });

  test('keeps the Insights archive and article readable across required viewports', async ({
    page
  }) => {
    const errors = collectCriticalConsoleErrors(page);
    for (const viewport of [390, 430, 768, 1024, 1280, 1440, 1728]) {
      await page.setViewportSize({ width: viewport, height: 900 });
      for (const path of [
        '/insight/',
        '/insight/black-friday-2025-tendenze-e-strategie-vincenti-per-le-pmi-italiane/'
      ]) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
          .toBeLessThanOrEqual(1);
        if (path === '/insight/' && viewport <= 430) {
          const cardWidths = await page
            .locator('.insight-card-editorial')
            .evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().width));
          expect(Math.min(...cardWidths)).toBeGreaterThan(320);
        }
      }
    }
    expect(errors).toEqual([]);
  });

  test('renders semantic related content and a contextual service path', async ({ page }) => {
    await page.goto('/insight/10-motivi-avere-e-commerce/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('navigation', { name: "Indice dell'articolo" })).toBeVisible();
    await expect(page.locator('.insight-article-cta')).toContainText('Ecommerce');
    await expect(page.locator('.insight-related-projects article')).toHaveCount(1);
    await expect(page.locator('.insight-related-reading .insight-card-editorial')).toHaveCount(3);
  });

  test('renders agency page with team and client systems', async ({ page }) => {
    await page.goto('/agenzia/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Padova');
    await expect(page.locator('#team')).toBeVisible();
    await expect(page.locator('.client-marquee')).toBeVisible();
    await expect(page.locator('.agency-project-card').first()).toBeVisible();
    await expect(page.locator('[data-agency-timeline-step]')).toHaveCount(4);
    await expect(page.getByRole('link', { name: 'Conosciamoci' })).toHaveAttribute(
      'href',
      '/lavora-con-noi/'
    );
    await page.setViewportSize({ width: 390, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
      .toBeLessThanOrEqual(1);
  });

  test('renders careers page and submits a spontaneous application', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/wp-json/netmarket/v1/forms/contact', async (route) => {
      requestCount += 1;
      expect(route.request().headers()['content-type']).toContain('multipart/form-data');
      const payload = route.request().postData() || '';
      expect(payload).toContain('Ada Lovelace');
      expect(payload).toContain('Candidatura spontanea');
      expect(payload).toContain('lavora-con-noi');
      expect(payload).toContain('Sviluppo web e software');
      expect(payload).toContain('https://example.com/ada');
      expect(payload).toContain('ada-cv.pdf');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/lavora-con-noi/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Il tuo lavoro conta');
    const structuredData =
      (await page.locator('script[type="application/ld+json"]').textContent()) || '';
    expect(structuredData).toContain('WebPage');
    expect(structuredData).not.toContain('JobPosting');
    await page.locator('#career-name').fill('Ada');
    await page.locator('#career-surname').fill('Lovelace');
    await page.locator('#career-email').fill('ada@example.com');
    await page.locator('#career-area').selectOption({ label: 'Sviluppo web e software' });
    await page.locator('#career-portfolio').fill('https://example.com/ada');
    await page.locator('#career-cv').setInputFiles({
      name: 'ada-cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test curriculum')
    });
    await page
      .locator('#career-message')
      .fill('Progetto interfacce e sistemi digitali accessibili, chiari e durevoli.');
    await page.getByRole('checkbox', { name: /informativa privacy/i }).check();
    await page.getByRole('button', { name: 'Invia candidatura' }).click();

    await expect(page).toHaveURL(/\/grazie\/$/);
    expect(requestCount).toBe(1);
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 900 },
    { width: 1280, height: 900 },
    { width: 1440, height: 1000 },
    { width: 1728, height: 1050 }
  ]) {
    test(`keeps agency and contact paths inside the ${viewport.width}px viewport`, async ({
      page
    }) => {
      await page.setViewportSize(viewport);
      for (const path of ['/agenzia/', '/lavora-con-noi/', '/contatti/']) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
          .toBeLessThanOrEqual(1);
      }
    });
  }

  test('renders contact form without console errors', async ({ page }) => {
    const errors = collectCriticalConsoleErrors(page);

    await page.goto('/contatti/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Raccontaci');
    await expect(page.getByLabel('Nome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel(/Raccontaci brevemente il progetto/)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('shows contextual contact errors and focuses the first invalid field', async ({ page }) => {
    await page.goto('/contatti/', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Invia la richiesta' }).click();

    await expect(page.getByLabel('Nome')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-name-error')).toContainText('Inserisci il tuo nome');
    await expect(page.locator('#contact-service-error')).toContainText(
      'Scegli l’ambito su cui vuoi lavorare'
    );
    await expect(page.locator('#contact-form-status')).toContainText(
      'Ci sono alcuni campi da controllare'
    );
    await expect(page.locator('#contact-name')).toBeFocused();
  });

  test('validates email and privacy while preserving a logical keyboard order', async ({
    page
  }) => {
    await page.goto('/contatti/', { waitUntil: 'domcontentloaded' });

    await page.locator('#contact-name').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#contact-email')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#contact-company')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#contact-phone')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#contact-service')).toBeFocused();

    await page.getByLabel('Nome').fill('Mario Rossi');
    await page.getByLabel('Email').fill('email-non-valida');
    await page.getByLabel(/Su cosa vuoi lavorare/).selectOption('nod');
    await page
      .getByLabel(/Raccontaci brevemente il progetto/)
      .fill('Vorrei organizzare meglio il processo commerciale.');
    await page.getByRole('button', { name: 'Invia la richiesta' }).click();

    await expect(page.locator('#contact-email-error')).toContainText(
      'Inserisci un indirizzo email valido'
    );
    await expect(page.locator('#contact-email')).toBeFocused();

    await page.getByLabel('Email').fill('mario@example.com');
    await page.getByRole('button', { name: 'Invia la richiesta' }).click();

    await expect(page.locator('#contact-privacy-error')).toContainText(
      'devi accettare l’informativa privacy'
    );
    await expect(page.locator('#contact-privacy')).toBeFocused();
    await expect(page.locator('#contact-service option')).toContainText([
      'Scegli un ambito',
      'Siti web',
      'Ecommerce',
      'Software e integrazioni',
      'SEO',
      'Advertising',
      'Social media',
      'Branding e comunicazione',
      'Content production',
      'Concorsi a premi',
      'NØD',
      'Progetto integrato',
      'Altro'
    ]);
  });

  test('submits contact form, records success and redirects to thank-you page', async ({
    page
  }) => {
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
    await page.getByLabel(/Su cosa vuoi lavorare/).selectOption('altro');
    await page
      .getByLabel(/Raccontaci brevemente il progetto/)
      .fill('Vorrei parlare di un progetto digitale per la mia azienda.');
    await page.getByRole('checkbox', { name: /informativa/i }).check();
    await page.getByRole('button', { name: 'Invia la richiesta' }).click();

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
    await page.getByLabel(/Su cosa vuoi lavorare/).selectOption('altro');
    await page
      .getByLabel(/Raccontaci brevemente il progetto/)
      .fill('Vorrei parlare di un progetto digitale.');
    await page.getByRole('checkbox', { name: /informativa/i }).check();
    await page.getByRole('button', { name: 'Invia la richiesta' }).click();

    await expect(page).toHaveURL(/\/contatti\/$/);
    await expect(page.locator('#contact-form-status')).toContainText(
      'Non siamo riusciti a inviare il messaggio'
    );
    await expect(page.getByLabel(/Raccontaci brevemente il progetto/)).toHaveValue(
      'Vorrei parlare di un progetto digitale.'
    );
    expect(await page.evaluate(() => window.dataLayer?.map((item) => item.event))).toEqual(
      expect.arrayContaining(['contact_form_submit', 'contact_form_error'])
    );
  });

  test('prevents duplicate contact submits while the first request is pending', async ({
    page
  }) => {
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
    await page.getByLabel(/Su cosa vuoi lavorare/).selectOption('altro');
    await page
      .getByLabel(/Raccontaci brevemente il progetto/)
      .fill('Vorrei parlare di un progetto digitale.');
    await page.getByRole('checkbox', { name: /informativa/i }).check();

    const button = page.locator('[data-contact-form] button[type="submit"]');
    await button.click();
    await button.click({ force: true });

    await expect(page).toHaveURL(/\/grazie\/$/);
    expect(requestCount).toBe(1);
  });

  test('renders NOD product page with coded UI demos and crawlable SEO', async ({ page }) => {
    const errors = collectCriticalConsoleErrors(page);

    await page.goto('/nod/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Marketing, vendite e AI');
    await expect(page.getByRole('img', { name: 'NØD by Netmarket' }).first()).toBeVisible();
    await expect(page.getByRole('img', { name: /Dashboard NØD/ })).toBeVisible();
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
