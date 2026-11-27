import { expect, test } from '@playwright/test';

const landing = '/gestione-social/';
const endpoint = '**/wp-json/netmarket/v1/forms/contact';
const cta = 'Richiedi l’analisi gratuita';
test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  contextOptions: { reducedMotion: 'reduce' }
});

for (const [query, opening, first] of [
  ['', 'più contatti', 'brb'],
  ['?settore=altro', 'più contatti', 'brb'],
  ['?settore=fitness', 'nuovi iscritti', 'fitness'],
  ['?settore=showroom', 'appuntamenti in showroom', 'brb']
]) {
  test(`mobile opening and cases ${query || 'default'}`, async ({ page }) => {
    await page.goto(landing + query);
    await expect(page.locator('[data-sector-opening]')).toContainText(opening!);
    await expect(page.locator('[data-project]').first()).toHaveAttribute('data-project', first!);
    const link = page.getByRole('link', { name: cta, exact: true }).first();
    await expect(link).toBeInViewport();
    await link.click();
    await expect(page).toHaveURL(/#analisi$/);
    await expect(page.locator('input[name="name"]')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  });
}

test('validates, keeps entries through failures and counts one confirmed acquisition', async ({
  page
}) => {
  let attempts = 0;
  const payloads: Record<string, unknown>[] = [];
  await page.route(endpoint, async (route) => {
    attempts++;
    payloads.push(route.request().postDataJSON());
    if (attempts === 1) return route.fulfill({ status: 422, json: { code: 'validation_failed' } });
    if (attempts === 2)
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html>Unavailable</html>'
      });
    if (attempts === 3) return route.abort('failed');
    await route.fulfill({ status: 200, json: { success: true } });
  });
  await page.goto(
    landing +
      '?settore=fitness&utm_source=instagram&utm_medium=organic_social&utm_campaign=gestione_social&utm_content=reel_fitness'
  );
  await page.getByRole('link', { name: cta }).first().click();
  const form = page.locator('[data-social-analysis]');
  const send = form.getByRole('button', { name: cta });
  await send.click();
  await expect(form.locator('input[name=name]')).toBeFocused();
  await form.getByLabel('Nome', { exact: true }).fill('Persona Tecnica');
  await form.getByLabel('Azienda o attività').fill('Impresa QA');
  await form.getByLabel('La tua email').fill('incompleta');
  await form.getByLabel('Cosa vorresti ottenere?').selectOption({ label: 'Più richieste' });
  await form.getByLabel('Sito o profilo social').fill('@profilo_qa');
  await form.getByRole('checkbox').check();
  await send.click();
  await expect(form.locator('[name=email]')).toBeFocused();
  expect(attempts).toBe(0);
  await form.getByLabel('La tua email').fill('social-qa@example.invalid');

  const conversions = () =>
    page.evaluate(() => (window.dataLayer || []).filter((e) => e.event === 'generate_lead').length);
  for (const count of [1, 2, 3]) {
    await send.click();
    await expect(form.getByRole('status')).toContainText('riprova');
    expect(attempts).toBe(count);
    await expect(form.getByLabel('La tua email')).toHaveValue('social-qa@example.invalid');
    await expect(form.getByRole('checkbox')).toBeChecked();
    expect(await conversions()).toBe(0);
  }
  await form.evaluate((element) => {
    const formElement = element as HTMLFormElement;
    formElement.requestSubmit();
    formElement.requestSubmit();
  });
  await expect(form.getByRole('status')).toContainText('Ti scriveremo');
  expect(attempts).toBe(4);
  expect(payloads[3]).toMatchObject({
    email: 'social-qa@example.invalid',
    company: 'Impresa QA',
    social: { sector: 'fitness', goal: 'Più richieste', profile: '@profilo_qa' },
    utm: { utm_campaign: 'gestione_social', utm_content: 'reel_fitness' },
    sourceUrl: expect.stringMatching(/\/gestione-social\/$/)
  });
  expect(await conversions()).toBe(1);
  const events = await page.evaluate(() => JSON.stringify(window.dataLayer));
  for (const privateValue of [
    'Persona Tecnica',
    'Impresa QA',
    'social-qa@example.invalid',
    '@profilo_qa'
  ])
    expect(events).not.toContain(privateValue);
  await page.reload();
  expect(await conversions()).toBe(0);
});
