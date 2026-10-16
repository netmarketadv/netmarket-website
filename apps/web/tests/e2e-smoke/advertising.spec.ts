import { expect, test } from '@playwright/test';

const endpoint = '**/wp-json/netmarket/v1/forms/contact';

test('advertising goals, FAQ and responsive layout remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Google Ads e Meta Ads. Più contatti e più vendite.'
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('#contact-service')).toHaveValue('');
  await expect(page.locator('#metodo')).toHaveCSS('background-color', 'rgb(8, 11, 22)');
  await expect(page.locator('#metodo h3').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.locator('#metodo .nm-section-heading > p').last()).toHaveCSS(
    'color',
    'rgb(255, 255, 255)'
  );
  await page.getByRole('link', { name: 'Parliamo dei contatti', exact: true }).click();
  await expect(page.locator('#contact-message')).toHaveValue('');
  await expect(page.locator('#contact-service')).toHaveValue('contatti-preventivi');
  await page.locator('#contact-message').fill('Vorrei migliorare la qualità delle richieste.');
  await page.getByRole('link', { name: 'Parliamo delle vendite', exact: true }).click();
  await expect(page.locator('#contact-message')).toHaveValue(
    'Vorrei migliorare la qualità delle richieste.'
  );
  const faq = page.getByRole('button', { name: 'Quanto budget serve per iniziare?' });
  await faq.click();
  await expect(faq).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('region', { name: 'Quanto budget serve per iniziare?' })
  ).toBeVisible();
  for (const width of [390, 430, 768, 1024, 1280, 1440, 1728]) {
    await page.setViewportSize({ width, height: 960 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const images = page.locator('img[src^="/media/advertising/"]');
  for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        img.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
      )
      .toBe(true);
  }
});

test('advertising form validates, retains attribution and confirms one lead', async ({ page }) => {
  let count = 0;
  await page.route(endpoint, async (route) => {
    count += 1;
    const payload = route.request().postDataJSON();
    expect(payload.service).toBe('contatti-preventivi');
    expect(payload.sourceUrl).toContain('/advertising/');
    expect(payload.utm).toMatchObject({
      utm_source: 'google',
      utm_campaign: 'advertising-test',
      gclid: 'test-click'
    });
    expect(payload.privacyConsent).toBe(true);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await page.goto('/advertising/?utm_source=google&utm_campaign=advertising-test&gclid=test-click');
  const submit = page
    .locator('#consulenza')
    .getByRole('button', { name: 'Richiedi confronto gratuito' });
  await submit.click();
  await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
  expect(count).toBe(0);
  await page.locator('#contact-name').fill('Mario Test');
  await page.locator('#contact-phone').fill('3290000000');
  await page.locator('#contact-email').fill('mario@example.com');
  await page.locator('#contact-message').fill('Vorrei migliorare le campagne della mia azienda.');
  await page.locator('#contact-service').selectOption('contatti-preventivi');
  await page.locator('#contact-privacy').check();
  await submit.click();
  await expect(page).toHaveURL(/\/grazie\/$/);
  expect(count).toBe(1);
  await expect
    .poll(() =>
      page.evaluate(() => window.dataLayer?.filter((event) => event.event === 'generate_lead'))
    )
    .toEqual([expect.objectContaining({ form_id: 'advertising-landing', lead_type: 'contact' })]);
  await page.reload();
  expect(
    await page.evaluate(() => window.dataLayer?.filter((event) => event.event === 'generate_lead'))
  ).toEqual([]);
});

test('advertising form preserves data and restores CTA after a failed request', async ({
  page
}) => {
  await page.route(endpoint, (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: '{"message":"unavailable"}'
    })
  );
  await page.goto('/advertising/');
  await page.locator('#contact-name').fill('Mario Test');
  await page.locator('#contact-phone').fill('3290000000');
  await page.locator('#contact-email').fill('mario@example.com');
  await page.locator('#contact-message').fill('Vorrei migliorare le campagne della mia azienda.');
  await page.locator('#contact-service').selectOption('contatti-preventivi');
  await page.locator('#contact-privacy').check();
  await page
    .locator('#consulenza')
    .getByRole('button', { name: 'Richiedi confronto gratuito' })
    .first()
    .click();
  await expect(page.locator('#contact-form-status')).toContainText('Non siamo riusciti');
  await expect(
    page.locator('#consulenza').getByRole('button', { name: 'Richiedi confronto gratuito' })
  ).toBeEnabled();
  await expect(page.locator('#contact-email')).toHaveValue('mario@example.com');
});

test('campaign content and native links remain available without JavaScript', async ({
  browser
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/advertising/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#approfondimenti')).toHaveCount(0);
  await page.getByRole('link', { name: 'Richiedi confronto gratuito' }).first().click();
  await expect(page).toHaveURL(/#consulenza$/);
  await expect(page.locator('#contact-name')).toBeVisible();
  await expect(
    page.locator('#consulenza').getByRole('button', { name: 'Richiedi confronto gratuito' })
  ).toBeDisabled();
  await expect(
    page.getByRole('region', { name: 'Quanto budget serve per iniziare?' })
  ).toBeVisible();
  await context.close();
});

test('mobile landing navigation and fixed CTA follow the reading position', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  const sticky = page.locator('[data-sticky-contact]');
  await expect(sticky).toHaveAttribute('data-visible', 'false');
  await page.locator('#obiettivi').scrollIntoViewIfNeeded();
  await expect(sticky).toHaveAttribute('data-visible', 'true');
  await expect(sticky).not.toHaveAttribute('inert');
  const menu = page.getByLabel('Menu della landing', { exact: true });
  await menu.click();
  await expect(page.locator('.landing-menu__link').first()).toHaveCSS('display', 'grid');
  await expect(page.locator('.landing-menu__link').first()).toHaveCSS(
    'text-decoration-line',
    'none'
  );
  await expect(sticky).toHaveAttribute('data-visible', 'false');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(sticky).toHaveAttribute('data-visible', 'true');
  await menu.click();
  await page
    .getByRole('navigation', { name: 'Navigazione landing mobile', exact: true })
    .getByRole('link', { name: 'Team', exact: false })
    .click();
  await expect(page).toHaveURL(/#team$/);
  await expect(page.locator('[data-landing-menu]')).not.toHaveAttribute('open');
  expect(
    await sticky.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))
  ).toBeLessThanOrEqual(0.001);
  await page.locator('#consulenza').scrollIntoViewIfNeeded();
  await expect(sticky).toHaveAttribute('data-visible', 'false');
  await page.locator('#hero-contact').scrollIntoViewIfNeeded();
  await expect(sticky).toHaveAttribute('data-visible', 'false');
  for (const href of await page
    .locator('.landing-header a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    expect(href).toMatch(/^#/);
  }
});

test('project slider keep the journey on the landing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  await page.locator('[data-project-next]').click();
  await expect
    .poll(() => page.locator('[data-project-rail]').evaluate((rail) => rail.scrollLeft))
    .toBeGreaterThan(0);
  await page.locator('.adv-project-rail a[href="#caso-eventi"]').click();
  await expect(page.locator('#caso-eventi')).toHaveAttribute('open');
  await expect(page).toHaveURL(/advertising\/#caso-eventi$/);
  await expect(page.locator('#team a[href*="linkedin"]')).toHaveCount(0);
});

test('project rail passes vertical wheel scrolling through to the page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/#progetti');
  const rail = page.locator('[data-project-rail]');
  await rail.scrollIntoViewIfNeeded();
  const railBounds = await rail.boundingBox();
  const summaryBounds = await page.locator('.adv-project-summary').first().boundingBox();
  expect(summaryBounds!.y + summaryBounds!.height).toBeLessThanOrEqual(
    railBounds!.y + railBounds!.height
  );
  await rail.hover();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 200);
  expect(await rail.evaluate((element) => element.scrollTop)).toBe(0);
});

test('landing has a focused form, closed case details and a two-line contact title', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  await expect(page.locator('.adv-case-detail[open]')).toHaveCount(0);
  await expect(
    page.locator('#approfondimenti, .adv-hero__baseline, .adv-conversion-proof')
  ).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('#contact-service option')).toHaveText([
    'Seleziona il tuo obiettivo',
    'Contatti e preventivi',
    'Vendite ecommerce',
    'Notorietà del brand',
    'Da definire insieme'
  ]);
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('#consulenza').scrollIntoViewIfNeeded();
    const title = await page.locator('#consultation-title').evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      line: parseFloat(getComputedStyle(element).lineHeight)
    }));
    expect(title.height / title.line).toBeGreaterThanOrEqual(1.8);
    expect(title.height / title.line).toBeLessThan(2.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  }
});

test('mobile menu presents icon rows and a visible CTA without decorative arrows', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [
    { width: 375, height: 667 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(size);
    await page.goto('/advertising/');
    const toggle = page.getByLabel('Menu della landing', { exact: true });
    await expect(toggle).toHaveText('');
    await toggle.click();
    const nav = page.getByRole('navigation', { name: 'Navigazione landing mobile', exact: true });
    await expect(nav.locator('.landing-menu__number, .icon-tabler-arrow-up-right')).toHaveCount(0);
    const links = nav.locator('.landing-menu__link');
    await expect(links).toHaveCount(6);
    for (const link of await links.all()) {
      await expect(link).toHaveCSS('display', 'grid');
      await expect(link).toHaveCSS('text-decoration-line', 'none');
      await expect(link.locator('.landing-menu__icon svg')).toHaveCount(1);
      const icon = await link.locator('.landing-menu__icon').boundingBox();
      const text = await link.locator('.landing-menu__item').boundingBox();
      expect(icon!.x + icon!.width).toBeLessThan(text!.x);
      expect(Math.abs(icon!.y - text!.y)).toBeLessThan(12);
    }
    const cta = await nav.locator('.nm-button').boundingBox();
    expect(cta!.y + cta!.height).toBeLessThan(size.height);
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(nav).toBeHidden();
  }
});

test('case numbers remain legible within their cards at all breakpoints', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  await expect(page.locator('.adv-project-slide')).toHaveCount(4);
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const card of await page.locator('.adv-project-slide').all()) {
      await card.scrollIntoViewIfNeeded();
      const value = card.locator('.project-card__evidence > strong');
      const bounds = await card.boundingBox();
      const number = await value.boundingBox();
      expect(number!.x).toBeGreaterThan(bounds!.x);
      expect(number!.x + number!.width).toBeLessThan(bounds!.x + bounds!.width);
      expect(await value.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  }
});

test('partner and pricing stay on the conversion journey', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  const partner = page.locator('.adv-partner');
  const hero = await page.locator('.adv-hero').boundingBox();
  const badge = await partner.boundingBox();
  expect(Math.abs(badge!.y - (hero!.y + hero!.height))).toBeLessThan(2);
  await expect(partner.getByRole('img', { name: 'Google Partner', exact: true })).toBeVisible();
  await expect(page.locator('#costi .adv-price__amount strong')).toHaveText(['400 €', '400 €']);
  await expect(page.locator('#costi .adv-pricing__terms')).toContainText(
    'budget da investire su Google e Meta è escluso'
  );
  await expect(page.locator('#video, #mercati')).toHaveCount(0);
  await page.getByRole('link', { name: 'Parliamo di Meta Ads', exact: true }).click();
  await expect(page).toHaveURL(/#consulenza$/);
  await expect(page.locator('#contact-channel')).toHaveValue('Meta Ads');
  await expect(page.locator('#contact-message')).toHaveValue('');
  await page.locator('#contact-message').fill('Messaggio già scritto dal cliente.');
  await page.getByRole('link', { name: 'Parliamo di Google Ads', exact: true }).click();
  await expect(page.locator('#contact-message')).toHaveValue('Messaggio già scritto dal cliente.');
  const faqSchema = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(faqSchema.join('')).toContain('400 € al mese');
});

for (const storage of ['blocked', 'corrupt']) {
  test(`confirmed lead survives ${storage} session storage`, async ({ page }) => {
    await page.addInitScript((mode) => {
      if (mode === 'blocked')
        Object.defineProperty(window, 'sessionStorage', {
          get() {
            throw new DOMException('Denied', 'SecurityError');
          }
        });
      else sessionStorage.setItem('nm_contact_tracking', '{invalid');
    }, storage);
    let requests = 0;
    await page.route(endpoint, async (route) => {
      requests++;
      expect(route.request().postDataJSON().utm.fbclid).toBe('meta-test');
      await route.fulfill({ json: { success: true } });
    });
    await page.goto('/advertising/?utm_source=meta&fbclid=meta-test');
    await page.locator('#contact-name').fill('QA Netmarket');
    await page.locator('#contact-phone').fill('3290000000');
    await page.locator('#contact-email').fill('qa@example.com');
    await page.locator('#contact-message').fill('Controllo automatico del modulo contatti.');
    await page.locator('#contact-service').selectOption('contatti-preventivi');
    await page.locator('#contact-privacy').check();
    await page
      .locator('#consulenza')
      .getByRole('button', { name: 'Richiedi confronto gratuito' })
      .first()
      .click();
    if (storage === 'blocked')
      await expect(page.locator('#contact-form-status')).toContainText('Richiesta ricevuta');
    else await expect(page).toHaveURL(/\/grazie\/$/);
    expect(requests).toBe(1);
    await expect
      .poll(() =>
        page.evaluate(
          () => window.dataLayer?.filter((event) => event.event === 'generate_lead').length
        )
      )
      .toBe(1);
  });
}

test('an HTTP 200 challenge cannot become a lead', async ({ page }) => {
  await page.route(endpoint, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html>Checking your browser</html>'
    })
  );
  await page.goto('/advertising/');
  await page.locator('#contact-name').fill('QA Netmarket');
  await page.locator('#contact-phone').fill('3290000000');
  await page.locator('#contact-email').fill('qa@example.com');
  await page.locator('#contact-message').fill('Controllo automatico del modulo contatti.');
  await page.locator('#contact-service').selectOption('contatti-preventivi');
  await page.locator('#contact-privacy').check();
  await page
    .locator('#consulenza')
    .getByRole('button', { name: 'Richiedi confronto gratuito' })
    .first()
    .click();
  await expect(page.locator('#contact-form-status')).toContainText('Non siamo riusciti');
  expect(
    await page.evaluate(() => window.dataLayer?.some((event) => event.event === 'generate_lead'))
  ).toBe(false);
});

test('landing reviews are curated and the heading fits on two lines', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  await expect(page.locator('#recensioni')).not.toContainText(/paola malighetti/i);
  await expect(page.locator('#recensioni .review-card:not([aria-hidden="true"])')).toHaveCount(3);
  for (const width of [320, 390, 430, 768, 1024, 1440, 1728]) {
    await page.setViewportSize({ width, height: 900 });
    const lines = await page
      .locator('#reviews-title')
      .evaluate(
        (el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)
      );
    expect(lines).toBeLessThan(2.15);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  }
  await page.getByRole('button', { name: 'Leggi tutta la recensione di Pazzo Design' }).click();
  await expect(page.locator('[data-review-modal]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-review-modal]')).not.toBeVisible();
});

for (const objective of [
  'contatti-preventivi',
  'vendite-ecommerce',
  'notorieta-brand',
  'da-definire'
]) {
  test(`landing sends the selected objective: ${objective}`, async ({ page }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route(endpoint, async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ json: { success: true } });
    });
    await page.goto('/advertising/');
    await page.locator('#contact-name').fill('QA Netmarket');
    await page.locator('#contact-phone').fill('3290000000');
    await page.locator('#contact-email').fill('qa@example.com');
    await page.locator('#contact-message').fill('Vorrei parlare del mio progetto.');
    await page.locator('#contact-privacy').check();
    await page
      .locator('#consulenza')
      .getByRole('button', { name: 'Richiedi confronto gratuito' })
      .first()
      .click();
    await expect(page.locator('#contact-service-error')).toHaveText('Seleziona il tuo obiettivo.');
    expect(payload).toBeUndefined();
    await page.locator('#contact-service').selectOption(objective);
    await page
      .locator('#consulenza')
      .getByRole('button', { name: 'Richiedi confronto gratuito' })
      .first()
      .click();
    await expect(page).toHaveURL(/\/grazie\/$/);
    expect(payload?.service).toBe(objective);
  });
}
