import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { collectCriticalConsoleErrors, waitForInteractivePage } from './helpers';

test.setTimeout(120_000);

function testBaseUrl() {
  return process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4321';
}

async function hiddenRevealProblems(page: Page, scope: 'active' | 'passed' | 'all') {
  return page.evaluate((auditScope) => {
    const allowedHidden = (element: Element) =>
      element.closest(
        '.faq-list__panel[hidden], .site-header__mobile-panel, .mega-menu__panel, .mega-menu__scrim, [hidden]'
      );
    const viewportHeight = window.innerHeight;
    return Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
      .map((element, index) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const invisible =
          style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none';
        const relevant =
          auditScope === 'active'
            ? rect.top < viewportHeight && rect.bottom > 0
            : auditScope === 'passed'
              ? rect.top < viewportHeight
              : true;
        return {
          index,
          tag: element.tagName.toLowerCase(),
          className: String(element.className),
          state: element.getAttribute('data-motion-state'),
          opacity: style.opacity,
          text: (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
          problem: invisible && relevant && !allowedHidden(element)
        };
      })
      .filter((item) => item.problem);
  }, scope);
}

async function scrollToEndProgressively(page: Page) {
  const viewport = page.viewportSize();
  const step = Math.max(180, Math.round((viewport?.height ?? 900) * 0.45));
  const max = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  for (let y = 0; y <= max; y += step) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(450);
}

test('homepage exposes staging essentials', async ({ page }) => {
  const errors = collectCriticalConsoleErrors(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const homeHeading = page.locator('#page-title');
  await expect(homeHeading).toBeVisible();
  await expect(homeHeading).toContainText('Agenzia marketing');
  await expect(page).toHaveTitle(/Agenzia comunicazione/);
  await expect(page.getByRole('link', { name: 'Raccontaci il progetto' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Guarda i progetti' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Vedi tutti i servizi/ })).toBeVisible();
  await expect(page.locator('.home-case-slider')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tutti i casi studio' })).toBeVisible();
  await page.locator('.client-marquee').scrollIntoViewIfNeeded();
  await expect(
    page.locator('.client-marquee__group:not([aria-hidden]) img[alt]:not([alt=""])')
  ).toHaveCount(12);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Salta al contenuto/ })).toBeFocused();
  expect(errors.filter((error) => !/Failed to load resource/i.test(error))).toEqual([]);
});

test('design system page is internal and noindexed', async ({ page }) => {
  await page.goto('/design-system/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { level: 1, name: 'Netmarket design system' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Motion.' })).toBeVisible();
  await page.locator('.client-marquee').scrollIntoViewIfNeeded();
  await expect(
    page.locator('.client-marquee__group:not([aria-hidden]) img[alt]:not([alt=""])')
  ).toHaveCount(12);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('motion enhancement keeps content visible without javascript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: testBaseUrl() });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Agenzia marketing e siti web a Padova.'
    })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Raccontaci il progetto' }).first()).toBeVisible();
  await context.close();
});

test('interactive motion controls remain accessible', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForInteractivePage(page);

  const servicesSummary = page.locator('.mega-menu summary').filter({ hasText: 'Servizi' });
  const servicesMenu = page.locator('.mega-menu').first();
  await servicesSummary.click();
  await expect(servicesMenu).toHaveAttribute('open', '');
  await servicesSummary.click();
  await expect(servicesMenu).not.toHaveAttribute('open', '');

  const faqTrigger = page.getByRole('button', { name: 'Avete già un sito da rifare?' });
  await faqTrigger.click();
  await expect(faqTrigger).toHaveAttribute('aria-expanded', 'true');
  await expect(faqTrigger.locator('.faq-list__icon')).toBeVisible();
  await expect(faqTrigger.locator('.faq-list__icon')).toHaveCSS(
    'background-color',
    'rgb(14, 81, 254)'
  );
  const faqStyles = await faqTrigger.evaluate((element) => {
    const triggerStyle = window.getComputedStyle(element);
    const icon = element.querySelector('.faq-list__icon');
    const iconStyle = icon ? window.getComputedStyle(icon) : null;
    return {
      radius: Number.parseFloat(triggerStyle.borderTopLeftRadius),
      iconRadius: iconStyle?.borderRadius
    };
  });
  expect(faqStyles.radius).toBeGreaterThan(20);
  expect(faqStyles.iconRadius).toBe('50%');

  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByLabel('Apri menu').click();
  await expect(page.getByLabel('Chiudi menu')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Apri menu')).toHaveAttribute('aria-expanded', 'false');
});

test('header matches the clean responsive navigation model', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site-header')).toHaveCSS('border-bottom-width', '0px');
  await expect(page.locator('.site-header')).toHaveCSS('box-shadow', 'none');

  const servicesMenu = page.locator('.mega-menu').filter({ hasText: 'Servizi' }).first();
  await servicesMenu.locator('summary').click();
  await expect(servicesMenu.locator('.mega-menu__panel--wide')).toBeVisible();
  await expect(servicesMenu.locator('.mega-menu__scrim')).toHaveCSS('top', '0px');
  await expect(servicesMenu.getByRole('link', { name: /Concorsi a premi/ })).toBeVisible();

  const agencyMenu = page.locator('.mega-menu').filter({ hasText: 'Agenzia' }).first();
  await agencyMenu.locator('summary').click();
  await expect(agencyMenu.locator('.mega-menu__panel--compact')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByLabel('Apri menu').click();
  const panel = page.locator('.site-header__mobile-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS('position', 'fixed');
  await expect(panel).toHaveCSS('height', '900px');
  await expect(page.getByLabel('Chiudi menu')).toHaveCSS('position', 'fixed');
  await expect(panel.getByRole('link', { name: /Contattaci/ })).toHaveCSS(
    'background-color',
    'rgb(14, 81, 254)'
  );

  await panel.locator('.mobile-submenu summary').filter({ hasText: 'Servizi' }).click();
  await expect(panel.getByRole('link', { name: /Siti web/ }).first()).toBeVisible();
  await expect(panel.locator('.mobile-submenu--wide .icon-bubble')).toHaveCount(9);
});

test('footer exposes company details and trust banners', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
  await expect(page.getByRole('contentinfo')).toContainText('P.IVA e C.F. 03618730281');
  await expect(page.getByRole('contentinfo')).toContainText(
    'Viale della Navigazione Interna, 51/b'
  );
  await expect(page.getByRole('contentinfo')).toContainText('Lunedì-venerdì');
  await expect(page.getByRole('link', { name: /NOD new/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cookie' })).toBeVisible();
  await expect(page.locator('.site-footer__trust a')).toHaveCount(0);
  const iubenda = page.getByRole('img', { name: 'iubenda Gold Partner' });
  const brevo = page.getByRole('img', { name: 'Brevo Partner Pioneer 2025' });
  const woocommerce = page.getByRole('img', { name: 'WooCommerce ecommerce partner' });
  await iubenda.scrollIntoViewIfNeeded();
  await expect(iubenda).toBeVisible();
  await brevo.scrollIntoViewIfNeeded();
  await expect(brevo).toBeVisible();
  await woocommerce.scrollIntoViewIfNeeded();
  await expect(woocommerce).toBeVisible();
});

test('reviews layout stays compact and clean', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.reviews-section').scrollIntoViewIfNeeded();

  await expect(page.locator('.reviews-section__score')).toHaveCount(0);
  await expect(page.locator('.reviews-carousel__profile')).toHaveCount(0);
  await expect(page.locator('.review-card figcaption')).toHaveCount(0);

  const reviewState = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>('.review-card');
    const quote = document.querySelector<HTMLElement>('.review-card blockquote');
    const star = document.querySelector<HTMLElement>('.review-card__stars svg');
    const open = document.querySelector<HTMLElement>('[data-review-open]:not([hidden])');
    if (!card || !quote || !star) return null;

    const cardStyle = window.getComputedStyle(card);
    const quoteStyle = window.getComputedStyle(quote);
    const starStyle = window.getComputedStyle(star);
    return {
      cardHeight: card.getBoundingClientRect().height,
      backgroundImage: cardStyle.backgroundImage,
      transition: cardStyle.transitionDuration,
      transform: cardStyle.transform,
      quoteMaxHeight: Number.parseFloat(quoteStyle.maxHeight),
      starColor: starStyle.color,
      hasEyeButton: Boolean(open),
      openText: open?.textContent?.trim() ?? ''
    };
  });

  expect(reviewState).not.toBeNull();
  expect(reviewState?.cardHeight).toBeLessThanOrEqual(390);
  expect(reviewState?.backgroundImage).toBe('none');
  expect(reviewState?.transition).toBe('0s');
  expect(reviewState?.transform).toBe('none');
  expect(reviewState?.quoteMaxHeight).toBeLessThanOrEqual(140);
  expect(reviewState?.starColor).toBe('rgb(251, 188, 4)');
  expect(reviewState?.hasEyeButton).toBe(true);
  expect(reviewState?.openText).toBe('');

  await page.locator('[data-review-open]:not([hidden])').first().click();
  await expect(page.locator('[data-review-modal]')).toBeVisible();
  await expect(page.locator('[data-review-modal-link]')).toHaveCount(0);
});

test('team system renders people, portraits, links, and person schema', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.team-section').scrollIntoViewIfNeeded();

  await expect(
    page.getByRole('heading', { level: 2, name: 'Competenze diverse. Una sola direzione.' })
  ).toBeVisible();
  await expect(page.locator('.person-card')).toHaveCount(5);
  await expect(page.getByRole('img', { name: 'Ritratto di Enrico Paolo Toso' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Profilo LinkedIn di Enrico Paolo Toso' })
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/enricopaolotoso/');

  const teamState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.person-card'));
    const figures = Array.from(document.querySelectorAll<HTMLElement>('.person-card__figure'));
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.person-card__content a')
    );
    const jsonLd = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
    ).flatMap((script) => JSON.parse(script.textContent || '[]') as Array<Record<string, unknown>>);
    const people = jsonLd.filter((item) => item['@type'] === 'Person');
    const firstFigure = figures[0]?.getBoundingClientRect();
    const image = document.querySelector<HTMLImageElement>('.person-card__figure img');

    return {
      cardCount: cards.length,
      personIds: cards.map((card) => card.dataset.personId),
      figureCount: figures.length,
      linkCount: links.length,
      externalLinks: links.every(
        (link) =>
          link.target === '_blank' &&
          link.rel.includes('noopener') &&
          link.rel.includes('noreferrer')
      ),
      aspectRatio: firstFigure ? firstFigure.width / firstFigure.height : 0,
      objectFit: image ? window.getComputedStyle(image).objectFit : '',
      objectPosition: image ? window.getComputedStyle(image).objectPosition : '',
      imageWidth: image?.getAttribute('width'),
      imageHeight: image?.getAttribute('height'),
      imageSizes: image?.getAttribute('sizes') ?? '',
      personSchemaCount: people.length,
      enricoSchema: people.find((item) =>
        String(item['@id']).endsWith('/#person-enrico-paolo-toso')
      )
    };
  });

  expect(teamState.cardCount).toBe(5);
  expect(teamState.personIds).toEqual([
    'mattia-graziotti',
    'greta-negro',
    'enrico-paolo-toso',
    'giacomo-galanti',
    'marco-toso'
  ]);
  expect(teamState.figureCount).toBe(5);
  expect(teamState.linkCount).toBe(5);
  expect(teamState.externalLinks).toBe(true);
  expect(teamState.aspectRatio).toBeGreaterThan(0.74);
  expect(teamState.aspectRatio).toBeLessThan(0.76);
  expect(teamState.objectFit).toBe('cover');
  expect(teamState.objectPosition).toBe('50% 34%');
  expect(teamState.imageWidth).toBe('900');
  expect(teamState.imageHeight).toBe('1200');
  expect(teamState.imageSizes).toContain('84vw');
  expect(teamState.personSchemaCount).toBe(5);
  expect(teamState.enricoSchema).toMatchObject({
    name: 'Enrico Paolo Toso',
    jobTitle: 'Digital Developer',
    worksFor: expect.objectContaining({ '@id': expect.stringMatching(/\/#organization$/) }),
    sameAs: ['https://www.linkedin.com/in/enricopaolotoso/']
  });
});

test('team layout adapts deliberately across breakpoints', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('.team-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);

    const state = await page.evaluate(() => {
      const grid = document.querySelector<HTMLElement>('.team-section__grid');
      const cards = Array.from(document.querySelectorAll<HTMLElement>('.person-card'));
      const figures = Array.from(document.querySelectorAll<HTMLElement>('.person-card__figure'));
      const rects = cards.map((card) => card.getBoundingClientRect());
      const figureRatios = figures.map((figure) => {
        const rect = figure.getBoundingClientRect();
        return rect.width / rect.height;
      });
      const tops = new Set(rects.map((rect) => Math.round(rect.top)));
      const firstWidth = rects[0]?.width ?? 0;
      const gridStyle = grid ? window.getComputedStyle(grid) : null;
      const columnCount = gridStyle?.gridTemplateColumns.split(' ').filter(Boolean).length ?? 0;

      return {
        cardCount: cards.length,
        rows: tops.size,
        columnCount,
        firstWidth,
        overflowX: gridStyle?.overflowX,
        gridAutoFlow: gridStyle?.gridAutoFlow,
        ratiosOk: figureRatios.every((ratio) => ratio > 0.74 && ratio < 0.76),
        hasHorizontalOverflow: grid ? grid.scrollWidth > grid.clientWidth : false
      };
    });

    expect(state.cardCount).toBe(5);
    expect(state.ratiosOk).toBe(true);

    if (width <= 560) {
      expect(state.gridAutoFlow).toBe('column');
      expect(state.overflowX).toBe('auto');
      expect(state.hasHorizontalOverflow).toBe(true);
      expect(state.firstWidth).toBeGreaterThan(width * 0.72);
    } else if (width <= 900) {
      expect(state.columnCount).toBe(2);
    } else if (width <= 1180) {
      expect(state.columnCount).toBe(6);
    } else {
      expect(state.columnCount).toBe(5);
      expect(state.firstWidth).toBeGreaterThan(190);
    }
  }
});

test('client marquee is full width, continuous, and accessible', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const marquee = page.locator('.client-marquee');
  await marquee.scrollIntoViewIfNeeded();
  await expect(marquee).toBeVisible();

  const marqueeState = await page.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>('.client-marquee__viewport');
    const track = document.querySelector<HTMLElement>('.client-marquee__track');
    const groups = Array.from(document.querySelectorAll<HTMLElement>('.client-marquee__group'));
    const firstItems = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.client-marquee__group:not([aria-hidden]) .client-marquee__item'
      )
    );
    const firstItem = firstItems[0];
    const firstItemStyle = firstItem ? window.getComputedStyle(firstItem) : null;
    const viewportStyle = viewport ? window.getComputedStyle(viewport) : null;
    const trackStyle = track ? window.getComputedStyle(track) : null;
    const tops = firstItems.map((item) => Math.round(item.getBoundingClientRect().top));

    return {
      viewportWidth: viewport?.getBoundingClientRect().width ?? 0,
      windowWidth: window.innerWidth,
      groupCount: groups.length,
      cloneHidden: groups[1]?.getAttribute('aria-hidden') === 'true',
      semanticLogoCount: document.querySelectorAll(
        '.client-marquee__group:not([aria-hidden]) img[alt]:not([alt=""])'
      ).length,
      decorativeLogoCount: document.querySelectorAll(
        '.client-marquee__group[aria-hidden="true"] img[alt=""]'
      ).length,
      linkCount: document.querySelectorAll('.client-marquee__item a').length,
      rowCount: new Set(tops).size,
      itemBorder: firstItemStyle?.borderTopWidth,
      itemBackground: firstItemStyle?.backgroundColor,
      trackDisplay: trackStyle?.display,
      trackWrap: trackStyle?.flexWrap,
      animationName: trackStyle?.animationName,
      animationTiming: trackStyle?.animationTimingFunction,
      mask: viewportStyle?.maskImage
    };
  });

  expect(Math.abs(marqueeState.viewportWidth - marqueeState.windowWidth)).toBeLessThanOrEqual(1);
  expect(marqueeState.groupCount).toBe(2);
  expect(marqueeState.cloneHidden).toBe(true);
  expect(marqueeState.semanticLogoCount).toBe(12);
  expect(marqueeState.decorativeLogoCount).toBe(12);
  expect(marqueeState.linkCount).toBe(0);
  expect(marqueeState.rowCount).toBe(1);
  expect(marqueeState.itemBorder).toBe('0px');
  expect(marqueeState.itemBackground).toBe('rgba(0, 0, 0, 0)');
  expect(marqueeState.trackDisplay).toBe('flex');
  expect(marqueeState.trackWrap).toBe('nowrap');
  expect(marqueeState.animationName).toBe('nm-client-marquee');
  expect(marqueeState.animationTiming).toBe('linear');
  expect(marqueeState.mask).not.toBe('none');
});

test('client marquee respects reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', baseURL: testBaseUrl() });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const reducedState = await page.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>('.client-marquee__viewport');
    const track = document.querySelector<HTMLElement>('.client-marquee__track');
    const clone = document.querySelector<HTMLElement>('.client-marquee__group[aria-hidden="true"]');
    return {
      overflowX: viewport ? window.getComputedStyle(viewport).overflowX : '',
      animationName: track ? window.getComputedStyle(track).animationName : '',
      cloneDisplay: clone ? window.getComputedStyle(clone).display : ''
    };
  });

  expect(reducedState.overflowX).toBe('auto');
  expect(reducedState.animationName).toBe('none');
  expect(reducedState.cloneDisplay).toBe('none');
  await context.close();
});

test('header records scrolled state without layout overlap', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForInteractivePage(page);
  await expect(page.locator('.site-header')).toHaveAttribute('data-motion-header', 'ready');
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          window.scrollTo(0, 500);
          window.dispatchEvent(new Event('scroll'));
          return {
            scrollY: window.scrollY,
            scrolled: document.querySelector<HTMLElement>('.site-header')?.dataset.scrolled
          };
        }),
      { timeout: 5_000 }
    )
    .toMatchObject({ scrollY: expect.any(Number), scrolled: 'true' });
});

test('motion reveal never leaves normal content hidden during scroll states', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(950);
  expect(await hiddenRevealProblems(page, 'active')).toEqual([]);

  await scrollToEndProgressively(page);
  expect(await hiddenRevealProblems(page, 'all')).toEqual([]);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(950);
  expect(await hiddenRevealProblems(page, 'all')).toEqual([]);

  await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.5)));
  await page.waitForTimeout(80);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(950);
  expect(await hiddenRevealProblems(page, 'passed')).toEqual([]);
});

test('motion reveal uses the enhanced animation engine', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForInteractivePage(page);
  await page.waitForTimeout(900);

  const engine = await page.evaluate(() => document.documentElement.dataset.motionEngine ?? 'css');
  expect(['gsap', 'css']).toContain(engine);

  const visiblePreset = async (variant: string) =>
    page
      .locator(`[data-reveal="${variant}"].is-visible`)
      .first()
      .evaluate((element) => {
        const style = window.getComputedStyle(element);
        return {
          state: element.getAttribute('data-motion-state'),
          animationName: style.animationName,
          animationDuration: style.animationDuration
        };
      });

  await expect.poll(() => visiblePreset('down')).toMatchObject({ state: 'revealed' });
  await expect.poll(() => visiblePreset('up')).toMatchObject({ state: 'revealed' });
  await expect.poll(() => visiblePreset('scale')).toMatchObject({ state: 'revealed' });

  await page.locator('[data-reveal="media"]').first().scrollIntoViewIfNeeded();
  await expect.poll(() => visiblePreset('media')).toMatchObject({ state: 'revealed' });

  await page.locator('[data-reveal="line"]').first().scrollIntoViewIfNeeded();
  await expect.poll(() => visiblePreset('line')).toMatchObject({ state: 'revealed' });

  if (engine === 'gsap') {
    await expect.poll(() => page.locator('.nm-motion-word__inner').count()).toBeGreaterThan(8);
    await expect(page.locator('.home-case-slider__track')).toHaveCSS(
      'animation-name',
      'nm-case-slider'
    );
    await expect.poll(() => visiblePreset('up')).toMatchObject({ animationName: 'none' });
  } else {
    await expect.poll(() => visiblePreset('up')).toMatchObject({ animationName: 'nm-reveal-up' });
    await expect
      .poll(() => visiblePreset('media'))
      .toMatchObject({ animationName: 'nm-reveal-media' });
  }
});

test('motion reveal is robust on mobile and reduced motion', async ({ browser }) => {
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 1000 },
    baseURL: testBaseUrl()
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto('/', { waitUntil: 'domcontentloaded' });
  await scrollToEndProgressively(mobile);
  expect(await hiddenRevealProblems(mobile, 'all')).toEqual([]);
  await mobileContext.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 390, height: 1000 },
    reducedMotion: 'reduce',
    baseURL: testBaseUrl()
  });
  const reduced = await reducedContext.newPage();
  await reduced.goto('/', { waitUntil: 'domcontentloaded' });
  await reduced.waitForTimeout(250);
  expect(await hiddenRevealProblems(reduced, 'all')).toEqual([]);
  await reducedContext.close();
});

test('404 page works', async ({ page }) => {
  await page.goto('/missing-page', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Pagina non trovata' })).toBeVisible();
});
