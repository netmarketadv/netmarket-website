import { test as base, expect, type BrowserContext } from '@playwright/test';
export { expect };
export type { Page } from '@playwright/test';

export async function isolateExternalTracking(context: BrowserContext): Promise<void> {
  if (process.env.PLAYWRIGHT_ISOLATE_EXTERNALS !== 'true') return;
  const origin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4321');
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname)) {
    throw new Error('La suite con servizi simulati deve usare esclusivamente loopback.');
  }
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin.origin) return route.continue();
    if (
      request.method() === 'GET' &&
      request.resourceType() === 'image' &&
      ['cms.netmarket.it', 'netmarket.it', 'www.netmarket.it'].includes(url.hostname)
    ) {
      return route.continue();
    }
    if (request.method() !== 'GET') return route.abort('blockedbyclient');
    if (request.resourceType() === 'script') {
      const cmp = url.hostname === 'cdn.iubenda.com' && url.pathname === '/cs/iubenda_cs.js';
      return route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: cmp ? 'window._iub?.csConfiguration?.callback?.onConsentRead?.();' : ''
      });
    }
    return route.fulfill({ status: 204, body: '' });
  });
}

// Only the test environment changes: real CMP/tag services are not part of UI release tests.
// Explicit per-test form mocks retain precedence over this context-level safety boundary.
export const test = base.extend({
  context: async ({ context }, use) => {
    await isolateExternalTracking(context);
    await use(context);
  }
});
