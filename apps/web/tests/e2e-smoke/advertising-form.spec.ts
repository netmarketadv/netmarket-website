import { expect, test, type Page } from '../e2e/fixtures';

const endpoint = '**/wp-json/netmarket/v1/forms/contact';
const url = '/advertising/';
const submit = (page: Page) =>
  page.locator('#consulenza').getByRole('button', { name: 'Richiedi confronto gratuito' });

async function fillVisitor(page: Page) {
  await page.locator('#contact-name').fill('QA Netmarket');
  await page.locator('#contact-phone').fill('3290000000');
  await page.locator('#contact-email').fill('qa@example.com');
  await page
    .locator('#contact-message')
    .fill('Vendiamo prodotti artigianali e cerchiamo nuovi clienti.');
  await page.locator('#contact-service').selectOption('contatti-preventivi');
  if (!(await page.locator('#contact-channel').inputValue())) {
    await page.locator('#contact-channel').selectOption('Meta Ads');
  }
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

for (const placement of ['hero-contact', 'contact']) {
  test(`${placement}: channel is mandatory and message is optional`, async ({ page }) => {
    let requests = 0;
    await page.route(endpoint, (route) => {
      requests++;
      expect(route.request().postDataJSON()).toMatchObject({ channel: 'Google Ads', message: '' });
      return route.fulfill({ json: { success: true } });
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url);
    await page.locator(`#${placement}-name`).fill('QA Netmarket');
    await page.locator(`#${placement}-email`).fill('qa@example.invalid');
    await page.locator(`#${placement}-phone`).fill('3290000000');
    await page.locator(`#${placement}-service`).selectOption('contatti-preventivi');
    await page.locator(`#${placement}-privacy`).check();
    const form = page.locator('form').filter({ has: page.locator(`#${placement}-name`) });
    await form.getByRole('button', { name: 'Richiedi confronto gratuito' }).click();
    await expect(page.locator(`#${placement}-channel`)).toBeFocused();
    await expect(page.locator(`#${placement}-channel-error`)).toContainText('Seleziona');
    expect(requests).toBe(0);
    await page.locator(`#${placement}-channel`).selectOption('Google Ads');
    await form.getByRole('button', { name: 'Richiedi confronto gratuito' }).click();
    await expect(page).toHaveURL(/\/grazie\/$/);
    expect(requests).toBe(1);
  });
}

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
    expect(body.channel).toBe('Meta Ads');
    expect(body.service).toBe('contatti-preventivi');
    expect(body.message).toBe('Vendiamo prodotti artigianali e cerchiamo nuovi clienti.');
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
    .locator('#consulenza [data-contact-form]')
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
    '65.100 €'
  ]);
  await expect(cases.locator('.project-card__evidence b')).toHaveText([
    '75,61 €',
    '15,66×',
    '20,09×',
    '8,68×'
  ]);
  const tappeti = cases.last();
  await expect(tappeti).toContainText('7.500 € di spesa Ads');
  await expect(tappeti).toContainText('271');
  await expect(tappeti).toContainText('93');
  const tappetiDetails = page.locator('#caso-tappeti');
  await tappetiDetails.locator('summary').click();
  await expect(tappetiDetails).toContainText('34,32%');
  await expect(tappetiDetails).toContainText('27,68 €');
  await expect(tappetiDetails).toContainText('80,65 €');
  await expect(tappetiDetails).toContainText('Scontrino medio: 700 € IVA esclusa');
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
    .locator('#consulenza [data-contact-form]')
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  expect(requests).toBe(1);
});

test('desktop hero form is independent, numeric phone is required and direct links are correct', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url);
  const hero = page.locator('.adv-hero__form');
  const final = page.locator('#consulenza');
  await expect(hero).toBeVisible();
  await expect(page.locator('.adv-hero__composition')).toBeHidden();
  const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
    const ids = elements.map((element) => element.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);
  const price = page.locator('.adv-hero__desktop-price');
  await price.hover();
  await expect(price).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(price).toContainText('Budget pubblicitario escluso');
  await hero.getByLabel('Nome', { exact: false }).fill('QA Netmarket');
  await hero.locator('[name="email"]').fill('qa@example.invalid');
  await hero.locator('[name="service"]').selectOption('contatti-preventivi');
  await hero.locator('[name="channel"]').selectOption('Google Ads');
  await hero
    .locator('[name="message"]')
    .fill('Vorrei acquisire nuovi contatti per la mia azienda.');
  await hero.locator('[name="privacyConsent"]').check();
  await hero.getByRole('button', { name: 'Richiedi confronto gratuito' }).click();
  await expect(hero.locator('[data-error-for="phone"]')).toContainText('Inserisci il tuo numero');
  await hero.locator('[name="phone"]').fill('+39 329abc0000000');
  await expect(hero.locator('[name="phone"]')).toHaveValue('393290000000');
  await expect(final.locator('[name="phone"]')).toHaveValue('');
  await expect(final.locator('[name="phone"]')).toHaveAttribute('required', '');
  await expect(hero.locator('[name="message"]')).toHaveAttribute(
    'placeholder',
    /e budget pubblicitario che vuoi investire mensilmente/
  );
  let requests = 0;
  await page.route(endpoint, async (route) => {
    requests++;
    expect(route.request().postDataJSON().phone).toBe('393290000000');
    await route.fulfill({ status: 503, json: { success: false } });
  });
  await hero.getByRole('button', { name: 'Richiedi confronto gratuito' }).click();
  await expect(hero.locator('[role="status"]')).toContainText('Non siamo riusciti');
  expect(requests).toBe(1);
  await expect(final.locator('[role="status"]')).toBeEmpty();
  await page.route(endpoint, (route) => route.fulfill({ json: { success: true } }));
  await hero.getByRole('button', { name: 'Richiedi confronto gratuito' }).click();
  await expect(page).toHaveURL(/\/grazie\/$/);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.dataLayer?.filter(
            (event) => event.event === 'generate_lead' && event.form_id === 'advertising-hero'
          ).length
      )
    )
    .toBe(1);
  await page.goto(url);
  const whatsapp = final.getByRole('link', { name: 'Scrivici su WhatsApp' });
  const whatsappUrl = new URL((await whatsapp.getAttribute('href'))!);
  expect(whatsappUrl.pathname).toBe('/393297576496');
  expect(whatsappUrl.searchParams.get('text')).toBe(
    "Ho visto l'annuncio su Google Ads e vorrei maggiori informazioni per pubblicizzare la mia azienda."
  );
  await expect(final.getByRole('link', { name: '329 7576496' })).toHaveAttribute(
    'href',
    'tel:+393297576496'
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(hero).toBeHidden();
  await expect(page.locator('.adv-hero__composition')).toBeVisible();
  await expect(page.locator('.adv-hero__desktop-price')).toBeHidden();
});
