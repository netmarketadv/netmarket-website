import { expect, test } from '@playwright/test';

for (const width of [390, 430, 768, 1024, 1280, 1440, 1728]) {
  test(`catalog foundations and controls fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/design-system/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main #exceptions-title')).toHaveCount(1);
    await expect(page.locator('main #ds-service option')).toHaveCount(4);
    await expect(page.locator('main #ds-service')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    for (const id of ['controls-title', 'fields-title', 'projects-title', 'ds-cta-title']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      ).toBeLessThanOrEqual(1);
    }
    const buttons = page.locator('main .nm-button');
    const heights = await buttons.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().height)
    );
    expect(heights.every((h) => h >= 44)).toBe(true);
    await expect(page.getByRole('button', { name: 'Non disponibile' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Invio in corso' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    await expect(page.locator('#ds-error')).toHaveAttribute('aria-describedby', 'ds-error-message');
    const cards = page.locator('.project-rail .project-card');
    expect(
      await cards.evaluateAll((els) =>
        els.every((el) => {
          const image = el.querySelector('.project-card__media')!.getBoundingClientRect();
          const category = el.querySelector('.project-card__category')!.getBoundingClientRect();
          return category.top >= image.bottom;
        })
      )
    ).toBe(true);
  });
}

test('buttons are safe by default and keyboard focus stays visible', async ({ page }) => {
  await page.goto('/design-system/');
  const disabled = page.getByRole('button', { name: 'Non disponibile' });
  await expect(disabled).toHaveAttribute('type', 'button');
  const email = page.locator('#ds-email');
  await email.focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#ds-error')).toBeFocused();
  const focus = await page.locator('#ds-error').evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(focus).toBe('solid');
});

test('real forms and CTA panels share their visual contracts', async ({ page }) => {
  const styles = [];
  for (const route of ['/contatti/', '/lavora-con-noi/']) {
    await page.goto(route);
    const input = page.locator('input[type="email"]').first();
    styles.push(
      await input.evaluate((el) => {
        const css = getComputedStyle(el);
        return [css.fontSize, css.borderRadius, css.borderColor, css.minHeight];
      })
    );
    await expect(page.locator('button[type="submit"]')).toHaveClass(/nm-button/);
  }
  expect(styles[0]).toEqual(styles[1]);
  for (const route of [
    '/agenzia/',
    '/progetti/',
    '/servizi/seo/',
    '/progetti/app-mobile-programma-fedelta-sirene-blu/'
  ]) {
    await page.goto(route);
    await expect(page.locator('.nm-cta')).toHaveCount(1);
    await expect(page.locator('.nm-cta .nm-button')).toHaveAttribute('href', '/contatti/');
  }
});
