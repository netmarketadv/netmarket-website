import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const scriptUrl = new URL('../../../infrastructure/scripts/smoke-cms-forms.mjs', import.meta.url)
  .href;
const denied = { name: 'invalid_name', privacyConsent: 'privacy_required' };

function runSmoke(status: number, bodies: string[], github = false) {
  return spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
      const bodies = ${JSON.stringify(bodies)};
      globalThis.fetch = async () => new Response(bodies.shift(), {
        status: ${status},
        headers: { 'access-control-allow-origin': 'https://netmarket.it' }
      });
      await import(${JSON.stringify(scriptUrl)});
    `
    ],
    {
      encoding: 'utf8',
      env: { ...process.env, GITHUB_ACTIONS: String(github), GITHUB_STEP_SUMMARY: '' }
    }
  );
}

describe('CMS form deployment smoke', () => {
  it('checks JSON and both multipart contracts', () => {
    const result = runSmoke(
      422,
      [denied, { ...denied, cv: 'cv_required' }, denied].map((fields) =>
        JSON.stringify({ code: 'validation_failed', fields })
      )
    );
    expect(result.status).toBe(0);
    expect(result.stdout.match(/PASS/g)).toHaveLength(3);
  });

  it('fails for an incompatible backend', () => {
    expect(runSmoke(400, ['{"code":"invalid_payload"}'], true).status).not.toBe(0);
  });

  it('explicitly defers only recognized SiteGround challenges on GitHub', () => {
    const result = runSmoke(202, ['<script src="/.well-known/sgcaptcha/check.js"></script>'], true);
    expect(result.status).toBe(0);
    expect(result.stderr).toContain('::warning::');
    expect(result.stderr).toContain('rete esterna');
    expect(result.stdout).not.toContain('PASS');
  });

  it('does not defer local challenges or unrelated 202 responses', () => {
    expect(runSmoke(202, ['/.well-known/sgcaptcha/']).status).not.toBe(0);
    expect(runSmoke(202, ['{"status":"pending"}'], true).status).not.toBe(0);
  });
});
