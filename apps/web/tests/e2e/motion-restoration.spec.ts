import { expect, test } from './fixtures';

test('position-only layout recovery uses the bounded motion failsafe', async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        const copy = document.querySelector<HTMLElement>('.home-hero__copy');
        if (copy) {
          copy.style.position = 'relative';
          copy.style.top = '10000px';
        }
      },
      { once: true }
    );
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-engine', 'gsap');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
  });
  const actions = page.locator('.home-hero__actions');
  await expect(actions).toHaveAttribute('data-motion-state', 'ready');
  const sizes = await page.evaluate(() => {
    const before = document.body.getBoundingClientRect();
    document.querySelector<HTMLElement>('.home-hero__copy')!.style.top = '0px';
    const after = document.body.getBoundingClientRect();
    return { before: [before.width, before.height], after: [after.width, after.height] };
  });
  expect(sizes.after).toEqual(sizes.before);
  await expect(actions).toHaveAttribute('data-motion-state', 'revealed');
  await expect(actions).toHaveCSS('opacity', '1');
});

test('late layout changes reveal visible content without IntersectionObserver', async ({
  page
}) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        const spacer = document.createElement('div');
        spacer.id = 'motion-layout-spacer';
        spacer.style.height = '10000px';
        document.body.prepend(spacer);
      },
      { once: true }
    );
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-engine', 'gsap');
  await page.evaluate(() => document.fonts.ready);
  const actions = page.locator('.home-hero__actions');
  await expect(actions).toHaveAttribute('data-motion-state', 'ready');
  await page.evaluate(() => document.getElementById('motion-layout-spacer')?.remove());
  await expect(actions).toHaveAttribute('data-motion-state', 'revealed');
  await expect(actions).toHaveCSS('opacity', '1');
});

test('motion reveal handles a late enhancement module without leaving visible content hidden', async ({
  page
}) => {
  await page.route('**/*gsap-motion*.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-engine', 'gsap');
  // Force layout refresh while delayed entrance tweens are still pending.
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.top < innerHeight && rect.bottom > 0 && !element.closest('[hidden]');
          })
          .filter(
            (element) =>
              element.dataset.motionState !== 'revealed' ||
              getComputedStyle(element).opacity === '0'
          )
          .map((element) => element.className)
      )
    )
    .toEqual([]);
});

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 }
]) {
  test(`restored scroll reveals a heading already at the viewport edge (${viewport.width}px)`, async ({
    page
  }) => {
    await page.setViewportSize(viewport);
    // Reproduce restoration during startup without engine-dependent scroll anchoring.
    await page.addInitScript(() => {
      if (sessionStorage.getItem('motion-restoration-test') !== 'restore') return;
      history.scrollRestoration = 'manual';
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          void (async () => {
            await document.fonts.ready;
            const target = document.getElementById('reviews-title');
            if (!target) return;
            // Word splitting changes geometry in WebKit. Restore the intended position
            // after that layout is ready, rather than testing a heading outside the viewport.
            await new Promise<void>((resolve) => {
              const observer = new MutationObserver(() => {
                if (target.dataset.motionLineSplit !== 'ready') return;
                observer.disconnect();
                resolve();
              });
              if (target.dataset.motionLineSplit === 'ready') resolve();
              else
                observer.observe(target, {
                  attributes: true,
                  attributeFilter: ['data-motion-line-split']
                });
            });
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            window.scrollTo({
              top: target.getBoundingClientRect().top + scrollY - innerHeight * 0.97,
              behavior: 'instant'
            });
          })();
        },
        { once: true }
      );
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-motion-engine', 'gsap');
    await page.evaluate(() => document.fonts.ready);
    const heading = page.getByRole('heading', { name: 'Cosa resta dopo il progetto.' });
    await heading.evaluate((element) => {
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.97,
        behavior: 'instant'
      });
    });
    await expect
      .poll(() =>
        heading.evaluate((element) => element.getBoundingClientRect().top < window.innerHeight)
      )
      .toBe(true);
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    );
    await page.evaluate(() => sessionStorage.setItem('motion-restoration-test', 'restore'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-motion-engine', 'gsap');
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        heading.evaluate((element) => element.getBoundingClientRect().top < window.innerHeight)
      )
      .toBe(true);
    const position = await heading.evaluate((element) => ({
      top: element.getBoundingClientRect().top,
      viewport: window.innerHeight
    }));
    expect(position.top).toBeGreaterThan(position.viewport * 0.94);
    expect(position.top).toBeLessThan(position.viewport);
    await expect(heading).toHaveCSS('opacity', '1');
    await expect(heading).toHaveAttribute('data-motion-state', 'revealed');
    await expect
      .poll(() =>
        heading
          .locator('.nm-motion-word__inner')
          .evaluateAll(
            (words) =>
              words.length > 0 && words.every((word) => getComputedStyle(word).opacity === '1')
          )
      )
      .toBe(true);
  });
}

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 }
]) {
  test(`late scroll restoration reveals already passed content (${viewport.width}px)`, async ({
    page
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-motion-engine', 'gsap');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
      window.scrollTo({ top: document.body.scrollHeight * 0.7, behavior: 'instant' });
    });
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
            .filter(
              (element) =>
                element.getBoundingClientRect().bottom < 0 && !element.closest('[hidden]')
            )
            .filter(
              (element) =>
                getComputedStyle(element).opacity === '0' ||
                element.dataset.motionState !== 'revealed'
            )
            .map((element) => element.textContent?.trim().slice(0, 70))
        )
      )
      .toEqual([]);
  });
}
