import { expect, test, type BrowserContext } from '@playwright/test';

const loaderUrl =
  'https://web.netmarket.it/10ddffrvzl.js?433kq=BR5LNTIrSS9bQkQxLFJSQhpHRFxXQAAKURQTBgsHFg8JDlgbEg%3D%3D';
const noscriptUrl = 'https://web.netmarket.it/ns.html?id=GTM-K782CJ46';
const trackingExpected = process.env.STAPE_EXPECT_TRACKING === 'true';

// Exercise the built frontend without firing real tags or sending test conversions.
async function isolateExternalRequests(context: BrowserContext, baseURL: string) {
  const requests: string[] = [];
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    if (new URL(url).origin === new URL(baseURL).origin) return route.continue();
    requests.push(url);
    return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
  });
  return requests;
}

test.describe('Stape production build (external services mocked)', () => {
  test.skip(
    !trackingExpected,
    'Run against a production candidate with STAPE_EXPECT_TRACKING=true.'
  );

  test('loads the exact Stape URL once, preserves the queue and sets consent before GTM', async ({
    page,
    context,
    baseURL
  }) => {
    const requests = await isolateExternalRequests(context, baseURL!);
    await page.addInitScript('window.dataLayer = [{event: "existing_event"}];');
    await page.goto('/');
    await expect.poll(() => requests.filter((url) => url === loaderUrl).length).toBe(1);
    const state = await page.evaluate<{
      first: string;
      defaults: number;
      consent: Record<string, string>;
      gtm: number;
      contextCount: number;
      iubenda: boolean;
    }>(`(() => {
      const entries = window.dataLayer;
      const defaults = entries.findIndex(x => x[0] === 'consent' && x[1] === 'default');
      return {
        first: entries[0].event,
        defaults,
        consent: entries[defaults][2],
        gtm: entries.findIndex(x => x.event === 'gtm.js'),
        contextCount: entries.filter(x => x.event === 'page_context').length,
        iubenda: window._iub.csConfiguration.googleConsentMode
      };
    })()`);
    expect(state.first).toBe('existing_event');
    expect(state.defaults).toBeGreaterThan(-1);
    expect(state.defaults).toBeLessThan(state.gtm);
    expect(state.consent).toMatchObject({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    expect(state.iubenda).toBe(true);
    expect(state.contextCount).toBe(1);

    await page.evaluate(
      'loadTagManager(); loadTagManager(); document.dispatchEvent(new Event("DOMContentLoaded"));'
    );
    expect(await page.evaluate('window.dataLayer.filter(x => x.event === "gtm.js").length')).toBe(
      1
    );
    expect(
      await page.locator('script[src^="https://web.netmarket.it/10ddffrvzl.js"]').count()
    ).toBe(1);
    expect(requests.filter((url) => url === loaderUrl)).toHaveLength(1);
    expect(requests.some((url) => url.includes('googletagmanager.com/gtm.js'))).toBe(false);
    expect(requests).not.toContain(noscriptUrl);

    await page
      .locator('a.nm-button[href="/contatti/"]')
      .first()
      .evaluate((element) => {
        element.addEventListener('click', (event) => event.preventDefault(), { once: true });
        (element as HTMLAnchorElement).click();
      });
    expect(await page.evaluate('window.dataLayer.some(x => x.event === "cta_click")')).toBe(true);
  });

  test('keeps the CMP callback bridge and emits a pending lead only once', async ({
    page,
    context,
    baseURL
  }) => {
    await isolateExternalRequests(context, baseURL!);
    await page.addInitScript('sessionStorage.setItem("nm_generate_lead_pending", "contact-page");');
    await page.goto('/grazie/');
    expect(
      await page.evaluate('window.dataLayer.filter(x => x.event === "generate_lead").length')
    ).toBe(0);

    // Simulate the CMP contract; this does not validate Iubenda or downstream tags.
    for (const consent of ['denied', 'granted', 'denied']) {
      await page.evaluate(`(() => {
        window.__netmarketConsentReady = false;
        window.gtag('consent', 'update', {
          analytics_storage: '${consent}', ad_storage: '${consent}',
          ad_user_data: '${consent}', ad_personalization: '${consent}'
        });
        window._iub.csConfiguration.callback.onPreferenceExpressed();
      })()`);
      await expect.poll(() => page.evaluate('window.__netmarketConsentReady')).toBe(true);
      expect(
        await page.evaluate(
          'Array.from(window.dataLayer.filter(x => x[0] === "consent")).at(-1)[2].ad_storage'
        )
      ).toBe(consent);
    }
    await page.evaluate('window._iub.csConfiguration.callback.onConsentRead();');
    expect(
      await page.evaluate('window.dataLayer.filter(x => x.event === "generate_lead").length')
    ).toBe(1);
    expect(await page.evaluate('sessionStorage.getItem("nm_generate_lead_pending")')).toBeNull();
  });

  test('does not request GTM or a noscript fallback when JavaScript is disabled', async ({
    browser,
    baseURL
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const requests = await isolateExternalRequests(context, baseURL!);
      const page = await context.newPage();
      await page.goto(baseURL!);
      await expect(page.locator('noscript iframe')).toHaveCount(0);
      expect(requests).not.toContain(noscriptUrl);
      expect(requests).not.toContain(loaderUrl);
      expect(requests.some((url) => /googletagmanager\.com|googleadservices\.com/.test(url))).toBe(false);
    } finally {
      await context.close();
    }
  });
});

test('omits both GTM snippets from a local or staging build', async ({
  page,
  context,
  baseURL
}) => {
  test.skip(trackingExpected, 'This assertion targets local or staging builds.');
  const requests = await isolateExternalRequests(context, baseURL!);
  const response = await page.goto('/');
  const html = await response!.text();
  expect(html).not.toContain('10ddffrvzl.js');
  expect(html).not.toContain('ns.html?id=GTM-K782CJ46');
  expect(html).not.toContain('www.googletagmanager.com/gtm.js');
  expect(requests.some((url) => url.startsWith('https://web.netmarket.it/'))).toBe(false);
});
