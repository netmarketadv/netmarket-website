import { expect, test } from '@playwright/test';

for (const path of ['/', '/servizi/siti-web/', '/agenzia/', '/lavora-con-noi/', '/nod/', '/design-system/']) {
  test(`heading accents use the blue token without highlight on ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await expect(page.locator('.nm-heading-marker')).toHaveCount(0);
    const accents = page.locator('main .nm-heading-accent');
    expect(await accents.count()).toBeGreaterThan(0);
    const styles = await accents.evaluateAll((elements) => {
      const reference = document.createElement('span');
      reference.style.color = 'var(--nm-color-blue)';
      document.body.append(reference);
      const blue = getComputedStyle(reference).color;
      reference.remove();
      return elements.map((element) => {
        const style = getComputedStyle(element);
        return {
          color: style.color,
          blue,
          background: style.backgroundColor,
          image: style.backgroundImage,
          before: getComputedStyle(element, '::before').content,
          after: getComputedStyle(element, '::after').content
        };
      });
    });
    for (const style of styles) {
      expect(style.color).toBe(style.blue);
      expect(style.background).toBe('rgba(0, 0, 0, 0)');
      expect(style.image).toBe('none');
      expect(['none', 'normal']).toContain(style.before);
      expect(['none', 'normal']).toContain(style.after);
    }
  });
}
