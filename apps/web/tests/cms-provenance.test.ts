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
