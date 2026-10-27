import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';

const runtime = vi.hoisted(() => ({ authenticated: true }));
vi.mock('../src/lib/env', () => ({
  getPublicEnv: () => ({ PUBLIC_DEPLOY_ENV: 'production' }),
  getServerEnv: () => ({
    CMS_API_BASE_URL: 'https://cms.netmarket.it/wp-json/netmarket/v1/',
    CMS_BUILD_TOKEN: runtime.authenticated ? 'unit-test-token' : '',
    CMS_BASIC_AUTH_USER: '',
    CMS_BASIC_AUTH_PASSWORD: ''
  })
}));
import { fetchCms } from '../src/lib/api/client';

describe('actual CMS client provenance', () => {
  const roots: string[] = [];
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    runtime.authenticated = true;
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
  });
  function audit() {
    const root = mkdtempSync(join(tmpdir(), 'nm-cms-audit-'));
    roots.push(root);
    const output = join(root, 'access.jsonl');
    vi.stubEnv('CMS_AUDIT_PATH', output);
    return () =>
      readFileSync(output, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line) as Record<string, unknown>);
  }
  it('recovers transport failures with the same authenticated endpoint and records attempts', async () => {
    vi.useFakeTimers();
    const records = audit();
    const request = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('transport unit-test-token'))
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 'verified' })));
    vi.stubGlobal('fetch', request);
    const pending = fetchCms('/settings', z.object({ value: z.string() }));
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toEqual({ value: 'verified' });
    expect(request).toHaveBeenCalledTimes(3);
    for (const [url, options] of request.mock.calls) {
      expect(url).toBe('https://cms.netmarket.it/wp-json/netmarket/v1/settings');
      expect(options?.headers).toEqual({
        Accept: 'application/json',
        Authorization: 'Bearer unit-test-token'
      });
    }
    expect(records()).toMatchObject([
      { status: 'ok', authenticated: true, attempts: 3, retries: ['transport', 'transport'] }
    ]);
    expect(JSON.stringify(records())).not.toContain('unit-test-token');
  });
  it('recovers a server error but still requires schema-validated content', async () => {
    vi.useFakeTimers();
    const records = audit();
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 'verified' })));
    vi.stubGlobal('fetch', request);
    const pending = fetchCms('/settings', z.object({ value: z.string() }));
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toEqual({ value: 'verified' });
    expect(records()).toMatchObject([{ status: 'ok', attempts: 2, retries: [503] }]);
  });
  it.each([401, 403, 404, 429])(
    'does not retry denied/missing/rate-limited HTTP %i',
    async (status) => {
      const records = audit();
      const request = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status }));
      vi.stubGlobal('fetch', request);
      await expect(fetchCms('/settings', z.object({}))).rejects.toThrow(String(status));
      expect(request).toHaveBeenCalledTimes(1);
      expect(records()).toMatchObject([{ status: 'error', attempts: 1, retries: [] }]);
    }
  );
  it('fails closed after three server errors without a successful provenance record', async () => {
    vi.useFakeTimers();
    const records = audit();
    const request = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response('', { status: 503 }));
    vi.stubGlobal('fetch', request);
    const rejected = expect(fetchCms('/settings', z.object({}))).rejects.toThrow('503');
    await vi.runAllTimersAsync();
    await rejected;
    expect(request).toHaveBeenCalledTimes(3);
    expect(records()).toMatchObject([
      { status: 'error', authenticated: false, attempts: 3, retries: [503, 503] }
    ]);
  });
  it('fails closed after three timed out attempts and retains the failed provenance', async () => {
    vi.useFakeTimers();
    const records = audit();
    const request = vi.fn<typeof fetch>(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Timeout', 'AbortError')),
            { once: true }
          );
        })
    );
    vi.stubGlobal('fetch', request);
    const rejected = expect(fetchCms('/settings', z.object({}))).rejects.toThrow('Timeout');
    await vi.runAllTimersAsync();
    await rejected;
    expect(request).toHaveBeenCalledTimes(3);
    expect(records()).toMatchObject([{ status: 'error', authenticated: false, attempts: 3 }]);
  });
  it.each(['html', '{"value":42}'])(
    'does not retry malformed or invalid payload %s',
    async (body) => {
      const records = audit();
      const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(body));
      vi.stubGlobal('fetch', request);
      await expect(fetchCms('/settings', z.object({ value: z.string() }))).rejects.toThrow();
      expect(request).toHaveBeenCalledTimes(1);
      expect(records()).toMatchObject([{ status: 'error', attempts: 1 }]);
    }
  );
  it('records a hash of schema-validated data without credentials or payload', async () => {
    const records = audit();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ value: 'content' })))
    );
    await fetchCms('/settings', z.object({ value: z.string() }));
    expect(records()).toMatchObject([{ path: '/settings', status: 'ok', authenticated: true }]);
    expect(records()[0]?.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(records())).not.toContain('unit-test-token');
    expect(JSON.stringify(records())).not.toContain('content');
  });
  it('records the actual response origin instead of trusting a redirect', async () => {
    const records = audit();
    const response = new Response(JSON.stringify({ value: 'content' }));
    Object.defineProperty(response, 'url', { value: 'https://unexpected.example/settings' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    await fetchCms('/settings', z.object({ value: z.string() }));
    expect(records()).toMatchObject([
      { origin: 'https://unexpected.example', authenticated: false }
    ]);
  });

  it('records denied access even when a caller could catch the error', async () => {
    const records = audit();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })));
    await expect(fetchCms('/settings', z.object({}))).rejects.toThrow('403');
    expect(records()).toMatchObject([{ status: 'error' }]);
  });
  it('records skipped access and never fabricates authentication', async () => {
    const records = audit();
    runtime.authenticated = false;
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    await expect(fetchCms('/settings', z.object({}))).rejects.toThrow('credentials');
    expect(records()).toMatchObject([{ status: 'error', authenticated: false }]);
    expect(request).not.toHaveBeenCalled();
  });
});
