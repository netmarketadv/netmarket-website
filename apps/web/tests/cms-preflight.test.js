import { describe, it, expect, vi } from 'vitest';
import { inspectProductionCms } from '../../../infrastructure/scripts/preflight-production-cms.mjs';
const baseUrl = 'https://cms.netmarket.it/wp-json/netmarket/v1/';
const credentials = { baseUrl, user: 'test-fixture-user', secret: 'test-fixture-value' };
const collection = {
  data: [{ slug: 'fixture' }],
  pagination: { page: 1, total: 1, totalPages: 1 }
};
function responses(archive = collection) {
  return vi.fn(
    async (url) =>
      new Response(JSON.stringify(url.endsWith('/health') ? { status: 'ok' } : archive), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  );
}
describe('authenticated CMS preflight', () => {
  it('refuses missing credentials and unauthorized targets before any network request', async () => {
    const request = responses();
    await expect(
      inspectProductionCms({ ...credentials, secret: '', fetchImpl: request })
    ).rejects.toThrow('mancanti');
    await expect(
      inspectProductionCms({ ...credentials, baseUrl: 'https://example.com/', fetchImpl: request })
    ).rejects.toThrow('autorizzata');
    expect(request).not.toHaveBeenCalled();
  });
  it('uses authenticated HTTPS without redirects and returns only metadata', async () => {
    const request = responses();
    const report = await inspectProductionCms({ ...credentials, fetchImpl: request });
    expect(report.complete).toBe(true);
    expect(request).toHaveBeenCalledTimes(4);
    expect(request.mock.calls[0][1]).toMatchObject({
      redirect: 'error',
      headers: { Authorization: expect.stringMatching(/^Basic /) }
    });
    const text = JSON.stringify(report);
    expect(text).not.toContain(credentials.secret);
    expect(text).not.toContain(credentials.user);
    expect(text).not.toContain('fixture');
  });
  it('rejects a partial import even when archives are nonempty', async () => {
    const report = await inspectProductionCms({
      ...credentials,
      fetchImpl: responses(),
      inventory: { services: ['approved-service'] }
    });
    expect(report.complete).toBe(false);
    expect(report.checks[1].missingSlugs).toEqual(['approved-service']);
  });

  it('reports all empty primary archives without accepting fallback data', async () => {
    const report = await inspectProductionCms({
      ...credentials,
      fetchImpl: responses({ data: [], pagination: { page: 1, total: 0, totalPages: 0 } })
    });
    expect(report.complete).toBe(false);
    expect(report.checks.filter((check) => check.count === 0)).toHaveLength(3);
  });
  it('rejects challenge HTML, denied access, malformed JSON and unavailable endpoints', async () => {
    for (const fetchImpl of [
      vi.fn(async () => new Response('<html>challenge</html>')),
      vi.fn(async () => new Response('', { status: 401 })),
      vi.fn(async () => {
        throw new Error('private detail must never be logged');
      })
    ]) {
      const report = await inspectProductionCms({ ...credentials, fetchImpl });
      expect(report.complete).toBe(false);
      expect(JSON.stringify(report)).not.toContain('private detail');
    }
  });
});
