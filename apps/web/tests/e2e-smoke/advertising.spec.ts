import { expect, test } from '@playwright/test';

const endpoint = '**/wp-json/netmarket/v1/forms/contact';

test('advertising goals, FAQ and responsive layout remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Più valore');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('#contact-service')).toHaveValue('advertising');
  await expect(page.locator('#metodo')).toHaveCSS('background-color', 'rgb(8, 11, 22)');
  await expect(page.locator('#metodo h3').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.locator('#metodo .nm-section-heading > p').last()).toHaveCSS(
    'color',
    'rgb(255, 255, 255)'
  );
  await page.getByRole('link', { name: 'Voglio più contatti', exact: true }).click();
  await expect(page.locator('#contact-message')).toHaveValue(/Lead generation/);
  await page.locator('#contact-message').fill('Vorrei migliorare la qualità delle richieste.');
  await page.getByRole('link', { name: 'Voglio far crescere le vendite', exact: true }).click();
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
    expect(payload.service).toBe('advertising');
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
  const submit = page.getByRole('button', { name: 'Richiedi un primo confronto' });
  await submit.click();
  await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
  expect(count).toBe(0);
  await page.locator('#contact-name').fill('Mario Test');
  await page.locator('#contact-email').fill('mario@example.com');
  await page.locator('#contact-message').fill('Vorrei migliorare le campagne della mia azienda.');
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
  await page.locator('#contact-email').fill('mario@example.com');
  await page.locator('#contact-message').fill('Vorrei migliorare le campagne della mia azienda.');
  await page.locator('#contact-privacy').check();
  await page.getByRole('button', { name: 'Richiedi un primo confronto' }).click();
  await expect(page.locator('#contact-form-status')).toContainText('Non siamo riusciti');
  await expect(page.getByRole('button', { name: 'Richiedi un primo confronto' })).toBeEnabled();
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
  await page.getByRole('link', { name: 'Parliamo dei tuoi obiettivi' }).click();
  await expect(page).toHaveURL(/#consulenza$/);
  await expect(page.locator('#contact-name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Richiedi un primo confronto' })).toBeDisabled();
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

test('project slider and market choices keep the journey on the landing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  await page.locator('[data-project-next]').click();
  await expect
    .poll(() => page.locator('[data-project-rail]').evaluate((rail) => rail.scrollLeft))
    .toBeGreaterThan(0);
  await page.locator('.adv-project-rail a[href="#caso-pazzo"]').click();
  await expect(page.locator('#caso-pazzo')).toHaveAttribute('open');
  await expect(page).toHaveURL(/advertising\/#caso-pazzo$/);
  await page.locator('[data-market-choice="estero"]').click();
  await expect(page.locator('[data-market-choice="estero"]')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.locator('[data-market-map]')).toHaveAttribute('data-market-map', 'estero');
  await expect(page.locator('[data-market-copy="estero"]')).toBeVisible();
  await expect(page.locator('[data-market-copy="locale"]')).toBeHidden();
  await page.locator('[data-market-contact]').click();
  await expect(page.locator('#contact-message')).toHaveValue(/mercato/);
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

test('mobile market choices and dynamic map fit together above the floating CTA', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [
    { width: 375, height: 667 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(size);
    await page.goto('/advertising/#mercati');
    const section = page.locator('#mercati');
    const bounds = await section.boundingBox();
    expect(bounds!.height).toBeLessThanOrEqual(size.height - 74 - 72);
    await page.getByRole('button', { name: 'All’estero', exact: true }).click();
    const map = await page.locator('.adv-map > svg').boundingBox();
    expect(map!.y).toBeGreaterThanOrEqual(74);
    expect(map!.y + map!.height).toBeLessThan(size.height - 72);
    await expect(page.locator('[data-market-map]')).toHaveAttribute('data-market-map', 'estero');
    await expect(page.locator('[data-sticky-contact]')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)'
    );
  }
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
    'Scegli un ambito',
    'Google Ads e Meta Ads',
    'Landing page per le campagne',
    'Creatività e contenuti per gli annunci',
    'Campagne, landing e creatività'
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

test('BRB metrics stay inside the card and share the same baseline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/advertising/');
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const panel = page.locator('.adv-project-summary--metrics');
    await panel.scrollIntoViewIfNeeded();
    const numbers = panel.locator('strong');
    await expect(numbers).toHaveText(['+292%', '+206%']);
    const bounds = await panel.boundingBox();
    const first = await numbers.nth(0).boundingBox();
    const second = await numbers.nth(1).boundingBox();
    expect(first!.x).toBeGreaterThan(bounds!.x);
    expect(second!.x + second!.width).toBeLessThan(bounds!.x + bounds!.width);
    expect(first!.x + first!.width).toBeLessThan(second!.x);
    expect(Math.abs(first!.y - second!.y)).toBeLessThan(1);
    for (const number of await numbers.all()) {
      expect(await number.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
  }
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
    await page.locator('#contact-email').fill('qa@example.com');
    await page.locator('#contact-message').fill('Controllo automatico del modulo contatti.');
    await page.locator('#contact-privacy').check();
    await page.getByRole('button', { name: 'Richiedi un primo confronto' }).click();
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
  await page.locator('#contact-email').fill('qa@example.com');
  await page.locator('#contact-message').fill('Controllo automatico del modulo contatti.');
  await page.locator('#contact-privacy').check();
  await page.getByRole('button', { name: 'Richiedi un primo confronto' }).click();
  await expect(page.locator('#contact-form-status')).toContainText('Non siamo riusciti');
  expect(
    await page.evaluate(() => window.dataLayer?.some((event) => event.event === 'generate_lead'))
  ).toBe(false);
});
