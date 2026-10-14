import { expect, test, type Page } from '@playwright/test';

const endpoint = '**/wp-json/netmarket/v1/forms/contact';
const url = '/advertising/';
const submit = (page: Page) => page.getByRole('button', { name: 'Richiedi confronto gratuito' });

async function fillVisitor(page: Page) {
  await page.locator('#contact-name').fill('QA Netmarket');
  await page.locator('#contact-email').fill('qa@example.com');
  await page
    .locator('#contact-message')
    .fill('Vendiamo prodotti artigianali e cerchiamo nuovi clienti.');
  await page.locator('#contact-service').selectOption('contatti-preventivi');
  await page.locator('#contact-privacy').check();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // No test may create a real lead, even after a navigation or unexpected retry.
  await page.route(endpoint, (route) => route.fulfill({ status: 503, json: { success: false } }));
});

test('new CTA choices replace automatic selections without overwriting visitor choices or message', async ({
  page
}) => {
  await page.goto(url);
  await page.locator('[data-advertising-objective="contatti-preventivi"]').click();
  await expect(page.locator('#contact-service')).toHaveValue('contatti-preventivi');
  await page.locator('[data-advertising-objective="vendite-ecommerce"]').click();
  await expect(page.locator('#contact-service')).toHaveValue('vendite-ecommerce');
  await expect(page.locator('#contact-message')).toHaveValue('');

  await page.locator('[data-advertising-channel="Google Ads"]').click();
  await page.locator('[data-advertising-channel="Meta Ads"]').click();
  await expect(page.locator('#contact-channel')).toHaveValue('Meta Ads');
  await expect(page.locator('#contact-service')).toHaveValue('vendite-ecommerce');
  await page
    .locator('#contact-message')
    .fill('Il nostro obiettivo: vendere prodotti realizzati su misura.');
  await page.locator('#contact-service').selectOption('da-definire');
  await page.locator('#contact-channel').selectOption('Google Ads');
  await page.locator('[data-advertising-objective="notorieta-brand"]').click();
  await page.locator('[data-advertising-channel="Google Ads e Meta Ads"]').click();
  await expect(page.locator('#contact-service')).toHaveValue('da-definire');
  await expect(page.locator('#contact-channel')).toHaveValue('Google Ads');
  await expect(page.locator('#contact-message')).toHaveValue(
    'Il nostro obiettivo: vendere prodotti realizzati su misura.'
  );
  await page.locator('#contact-channel').selectOption('');
  await page.locator('[data-advertising-channel="Meta Ads"]').click();
  await expect(page.locator('#contact-channel')).toHaveValue('Meta Ads');
});

test('automatic choices cannot satisfy the required project description', async ({ page }) => {
  let requests = 0;
  await page.route(endpoint, (route) => {
    requests++;
    return route.fulfill({ json: { success: true } });
  });
  await page.goto(url);
  await fillVisitor(page);
  await page.locator('[data-advertising-channel="Meta Ads"]').click();
  for (const text of ['', '     ', 'poche']) {
    await page.locator('#contact-message').fill(text);
    await submit(page).click();
    await expect(page.locator('#contact-message')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-message')).toBeFocused();
  }
  expect(requests).toBe(0);
  expect(
    await page.evaluate(() => window.dataLayer?.some((event) => event.event === 'generate_lead'))
  ).toBe(false);
});

test('confirmed success sends the channel separately from the objective and generates one anonymous event', async ({
  page
}) => {
  let requests = 0;
  let release: (() => void) | undefined;
  const responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(endpoint, async (route) => {
    requests++;
    const body = route.request().postDataJSON();
    expect(body.service).toBe('contatti-preventivi');
    expect(body.message).toBe(
      'Canale di interesse: Meta Ads\n\nVendiamo prodotti artigianali e cerchiamo nuovi clienti.'
    );
    expect(body.sourceUrl).toContain('/advertising/');
    expect(body.utm).toMatchObject({ utm_source: 'meta', fbclid: 'comparison-test' });
    await responseGate;
    await route.fulfill({ json: { success: true } });
  });
  await page.goto(`${url}?utm_source=meta&fbclid=comparison-test`);
  await page.locator('[data-advertising-channel="Meta Ads"]').click();
  expect(
    await page.evaluate(() => window.dataLayer?.some((event) => event.event === 'cta_click'))
  ).toBe(true);
  expect(
    await page.evaluate(() => window.dataLayer?.some((event) => event.event === 'generate_lead'))
  ).toBe(false);
  await fillVisitor(page);
  await submit(page).click();
  await expect(page.getByRole('button', { name: 'Invio in corso' })).toBeDisabled();
  await page
    .locator('[data-contact-form]')
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  expect(requests).toBe(1);
  release?.();
  await expect(page).toHaveURL(/\/grazie\/$/);
  await expect
    .poll(() =>
      page.evaluate(() => window.dataLayer?.filter((event) => event.event === 'generate_lead'))
    )
    .toEqual([{ event: 'generate_lead', form_id: 'advertising-landing', lead_type: 'contact' }]);
  const events = await page.evaluate(() => JSON.stringify(window.dataLayer));
  expect(events).not.toMatch(/qa@example|QA Netmarket|prodotti artigianali/);
  await page.reload();
  expect(
    await page.evaluate(() => window.dataLayer?.some((event) => event.event === 'generate_lead'))
  ).toBe(false);
});

for (const failure of ['network', 'challenge']) {
  test(`${failure} failure preserves visitor input and can retry safely`, async ({ page }) => {
    await page.route(endpoint, (route) =>
      failure === 'network'
        ? route.abort('failed')
        : route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: '<html>Checking your browser</html>'
          })
    );
    await page.goto(url);
    await fillVisitor(page);
    await submit(page).click();
    await expect(page.locator('#contact-form-status')).toContainText('Non siamo riusciti');
    await expect(submit(page)).toBeEnabled();
    await expect(page.locator('#contact-message')).toHaveValue(
      'Vendiamo prodotti artigianali e cerchiamo nuovi clienti.'
    );
    expect(
      await page.evaluate(() => window.dataLayer?.some((event) => event.event === 'generate_lead'))
    ).toBe(false);
  });
}

test('all four cases are reachable by keyboard on mobile, with readable amounts and no scroll trap', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await expect(page.locator('#video, #mercati')).toHaveCount(0);
  await expect(page.locator('.adv-case-detail[open]')).toHaveCount(0);
  const first = page.locator('.adv-project-rail a').first();
  await first.focus();
  for (const id of ['pilates', 'eventi', 'pergole', 'tappeti']) {
    const card = page.locator(`.adv-project-rail a[href="#caso-${id}"]`);
    await expect(card).toBeFocused();
    const bounds = await card.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(-1);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(391);
    await page.keyboard.press('Tab');
  }
  await expect(page.locator('#caso-pilates summary')).toBeFocused();
  for (const id of ['pilates', 'eventi', 'pergole', 'tappeti']) {
    await page.keyboard.press('Enter');
    await expect(page.locator(`#caso-${id}`)).toHaveAttribute('open');
    await page.keyboard.press('Tab');
  }
  const rail = page.locator('[data-project-rail]');
  await rail.hover();
  const y = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 450);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y + 150);
  expect(await rail.evaluate((el) => el.scrollTop)).toBe(0);
  for (const width of [320, 390, 768, 1024, 1440, 1728]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    for (const metric of await page.locator('.project-card__evidence > strong').all()) {
      expect(await metric.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#obiettivi').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-sticky-contact]')).toHaveAttribute('data-visible', 'true');
  await page.getByLabel('Menu della landing', { exact: true }).click();
  await expect(page.locator('[data-sticky-contact]')).toHaveAttribute('data-visible', 'false');
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Menu della landing', { exact: true })).toBeFocused();
  await page.locator('#contact-message').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-sticky-contact]')).toHaveAttribute('data-visible', 'false');
});

test('case hierarchy distinguishes estimated CLV from attributed revenue and schema matches FAQ', async ({
  page
}) => {
  await page.goto(url);
  const cases = page.locator('.adv-project-slide');
  await expect(cases.locator('.project-card__evidence > strong')).toHaveText([
    '41',
    '84.550 €',
    '88.400 €',
    '106.400 €'
  ]);
  await expect(cases.locator('.project-card__evidence b')).toHaveText([
    '75,61 €',
    '15,66×',
    '20,09×',
    '14,19×'
  ]);
  await expect(cases.first()).toContainText('CLV totale stimato');
  await expect(cases.first()).not.toContainText('ROAS');
  await expect(page.locator('.adv-results-note')).toContainText('compenso di gestione escluso');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/advertising\/$/);
  const data = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!
  );
  const faq = data.find((item: { '@type': string }) => item['@type'] === 'FAQPage');
  for (const item of faq.mainEntity) {
    await expect(page.locator('#domande')).toContainText(item.name);
    await expect(page.locator('#domande')).toContainText(item.acceptedAnswer.text);
  }
});

test('storage-denied success waits for consent readiness and cannot submit twice', async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new DOMException('Denied', 'SecurityError');
      }
    });
    window.__netmarketConsentReady = false;
  });
  let requests = 0;
  await page.route(endpoint, (route) => {
    requests++;
    return route.fulfill({ json: { success: true } });
  });
  await page.goto(url);
  await fillVisitor(page);
  await submit(page).click();
  await expect(page.locator('#contact-form-status')).toContainText('Richiesta ricevuta');
  expect(
    await page.evaluate(() => window.dataLayer?.filter((event) => event.event === 'generate_lead'))
  ).toEqual([]);
  await page.evaluate(() => {
    window.__netmarketConsentReady = true;
    window.dispatchEvent(new Event('netmarket:consent-ready'));
    window.dispatchEvent(new Event('netmarket:consent-ready'));
  });
  expect(
    await page.evaluate(() => window.dataLayer?.filter((event) => event.event === 'generate_lead'))
  ).toEqual([{ event: 'generate_lead', form_id: 'advertising-landing', lead_type: 'contact' }]);
  await page
    .locator('[data-contact-form]')
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  expect(requests).toBe(1);
});
