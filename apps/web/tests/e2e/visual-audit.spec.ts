import { expect, test } from '@playwright/test';

for (const path of ['/', '/agenzia/', '/servizi/siti-web/']) {
  test(`project rail advances and resumes after returning to ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const rail = page.locator('[data-infinite-rail]').first();
    await rail.scrollIntoViewIfNeeded();
    await expect(rail).toHaveAttribute('data-infinite-rail-ready', 'true');
    await page.mouse.move(0, 0);
    const start = await rail.evaluate((el) => el.scrollLeft);
    await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(start + 5);
    const widths = await rail.locator('[data-infinite-rail-track]').evaluate((track) => {
      const children = Array.from(track.children);
      const half = children.length / 2;
      return children
        .slice(0, half)
        .map((el, i) =>
          Math.abs(
            el.getBoundingClientRect().width - children[i + half]!.getBoundingClientRect().width
          )
        );
    });
    expect(widths.every((difference) => difference < 1)).toBe(true);
    const newTab = page.context().waitForEvent('page');
    await rail.locator('a').first().click({ button: 'middle' });
    const projectTab = await newTab;
    await projectTab.waitForLoadState('domcontentloaded');
    await projectTab.close();
    await page.bringToFront();
    await page.mouse.move(0, 0);
    const returned = await rail.evaluate((el) => el.scrollLeft);
    await expect
      .poll(() => rail.evaluate((el) => el.scrollLeft), { timeout: 7000 })
      .toBeGreaterThan(returned + 5);
    await rail.locator('a').first().focus();
    await page.getByRole('link', { name: 'Netmarket home', exact: true }).first().focus();
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    const paused = await rail.evaluate((el) => el.scrollLeft);
    await expect
      .poll(() => rail.evaluate((el) => el.scrollLeft), { timeout: 7000 })
      .toBeGreaterThan(paused + 5);
  });
}

for (const width of [390, 768, 1280, 1728]) {
  test(`shared service content fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/servizi/seo/');
    const proof = page.locator('.service-x-proof__grid');
    await proof.scrollIntoViewIfNeeded();
    await expect.poll(() => proof.evaluate((el) => getComputedStyle(el).clipPath)).toBe('none');
    const overflow = await proof
      .locator('article')
      .evaluateAll((cards) => cards.map((card) => card.scrollWidth - card.clientWidth));
    expect(overflow.every((value) => value <= 1)).toBe(true);
    await page.locator('.service-x-system__list').scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.locator('.service-x-system__list').evaluate((el) => getComputedStyle(el).clipPath)
      )
      .toBe('none');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    ).toBeLessThanOrEqual(1);
  });
}

test('archive uses equal project cards, real destinations and one client heading', async ({
  page
}) => {
  await page.goto('/servizi/');
  const cards = page.locator('.project-rail > a');
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all())
    await expect(card).toHaveAttribute('href', /^\/progetti\/.+\/$/);
  const widths = await cards.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().width)
  );
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  await expect(page.getByRole('heading', { name: /Clienti e progetti seguiti/ })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Esplora i servizi' })).toHaveCount(0);
});

test('home presents contest category and editorial summaries', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.home-case-card:not([aria-hidden])');
  // Locate by destination because both the app and contest share the client name.
  await expect(
    page.locator('.home-case-card:not([aria-hidden])[href*="concorso-a-premi"]')
  ).toContainText('Concorsi a premi');
  expect(
    (await cards.locator('p').allTextContents()).every(
      (text) => !/^(scopri il )?caso studio/i.test(text.trim())
    )
  ).toBe(true);
});

test('brief contact form preserves email without placing it in the URL', async ({ page }) => {
  await page.goto('/servizi/');
  await page.locator('#inline-email').fill('audit@example.com');
  await page.locator('[data-inline-contact] button').click();
  await expect(page).toHaveURL(/\/contatti\/\??$/);
  await expect(page.locator('#contact-email')).toHaveValue('audit@example.com');
});

test('Sirene Blu uses the approved new app exports', async ({ page }) => {
  await page.goto('/progetti/app-mobile-programma-fedelta-sirene-blu/');
  const images = page.locator('.case-media img');
  await expect(images).toHaveCount(5);
  for (const img of await images.all()) {
    await expect(img).toHaveAttribute(
      'src',
      /^\/media\/case-studies\/sirene-blu-app\/0[1-5]\.webp$/
    );
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(900);
  }
});

for (const width of [430, 1024, 1440]) {
  test(`case study metrics and NOD title stay inside their columns at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/progetti/app-mobile-programma-fedelta-sirene-blu/');
    const metric = page.locator('.case-results__metrics article');
    await metric.scrollIntoViewIfNeeded();
    expect(await metric.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await page.goto('/nod/');
    const heading = page.locator('#nod-calendar-title');
    await heading.scrollIntoViewIfNeeded();
    expect(await heading.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  });
}
