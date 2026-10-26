import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { assertProductionProtection } from '../../../infrastructure/scripts/check-production-protection.mjs';
import { auditCmsProvenance } from '../../../infrastructure/scripts/audit-cms-provenance.mjs';

describe('production approval and CMS provenance', () => {
  it('rejects branch protection without an actual approval requirement', () => {
    expect(() =>
      assertProductionProtection({ protection_rules: [{ type: 'branch_policy' }] })
    ).toThrow('reviewer');
    expect(() =>
      assertProductionProtection({
        protection_rules: [{ type: 'required_reviewers', reviewers: [{}] }],
        deployment_branch_policy: null
      })
    ).toThrow('branch');
    expect(() =>
      assertProductionProtection({
        protection_rules: [{ type: 'required_reviewers', reviewers: [{}] }],
        deployment_branch_policy: { custom_branch_policies: true }
      })
    ).not.toThrow();
  });

  const entries = () =>
    ['services', 'case-studies', 'insights'].map((name) => ({
      path: '/' + name + '?page=1&per_page=50',
      origin: 'https://cms.netmarket.it',
      status: 'ok',
      authenticated: true,
      sha256: 'a'.repeat(64),
      count: 1,
      pagination: { page: 1, totalPages: 1 }
    }));
  it('accepts only actual authenticated, nonempty and complete archives', () => {
    expect(auditCmsProvenance(entries()).requests).toBe(3);
  });
  it('rejects swallowed CMS errors and unauthenticated data', () => {
    expect(() =>
      auditCmsProvenance([...entries(), { path: '/services/missing', status: 'error' }])
    ).toThrow('CMS');
    const data = entries();
    data[0].authenticated = false;
    expect(() => auditCmsProvenance(data)).toThrow('autenticato');
  });
  it('rejects empty or missing primary archives and incomplete pagination', () => {
    expect(() => auditCmsProvenance(entries().slice(1))).toThrow('mancante');
    const empty = entries();
    empty[0].count = 0;
    expect(() => auditCmsProvenance(empty)).toThrow('vuoto');
    const partial = entries();
    partial[0].pagination.totalPages = 2;
    expect(() => auditCmsProvenance(partial)).toThrow('Paginazione');
  });
});

describe('manual production rollback against local synthetic fixtures only', () => {
  const remote = fileURLToPath(
    new URL('../../../infrastructure/scripts/manual-rollback-remote.sh', import.meta.url)
  );
  const current = 'a'.repeat(40),
    restore = 'b'.repeat(40);
  const roots = [];
  afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
  });
  function fixture() {
    const root = mkdtempSync(join(tmpdir(), 'nm-rollback-'));
    roots.push(root);
    const parent = join(root, 'netmarket.it'),
      target = join(parent, 'public_html');
    const snapshot = 'before-' + current;
    const saved = join(parent, '.netmarket-rollbacks', snapshot);
    for (const [directory, sha] of [
      [target, current],
      [saved, restore]
    ]) {
      mkdirSync(join(directory, 'assets'), { recursive: true });
      writeFileSync(
        join(directory, 'index.html'),
        '<meta name="netmarket-build" content="' +
          sha +
          '"><meta name="netmarket-environment" content="production"><script src="/assets/app.js"></script>'
      );
      writeFileSync(join(directory, 'netmarket-release'), sha + '\n');
      writeFileSync(join(directory, '.htaccess'), 'static');
      writeFileSync(
        join(directory, 'robots.txt'),
        'Sitemap: https://netmarket.it/sitemap-index.xml'
      );
      writeFileSync(join(directory, 'sitemap-index.xml'), '<urlset/>');
      writeFileSync(join(directory, 'assets/app.js'), sha);
    }
    const run = (mode = 'dry-run', digest = '-', wanted = restore, selected = snapshot) =>
      spawnSync('bash', [remote, target, selected, current, wanted, mode, digest], {
        encoding: 'utf8'
      });
    return { parent, target, saved, run };
  }
  it('plans without mutation and requires a digest before any switch', () => {
    const f = fixture(),
      plan = f.run();
    expect(plan.status, plan.stderr).toBe(0);
    expect(plan.stdout).toContain('nessuna scrittura');
    expect(readFileSync(join(f.target, 'netmarket-release'), 'utf8').trim()).toBe(current);
    expect(f.run('execute').status).not.toBe(0);
  });
  it('restores only the exact planned snapshot and preserves the removed frontend', () => {
    const f = fixture(),
      digest = f.run().stdout.match(/^digest=([0-9a-f]{64})$/m)[1];
    const result = f.run('execute', digest);
    expect(result.status, result.stderr + result.stdout).toBe(0);
    expect(readFileSync(join(f.target, 'netmarket-release'), 'utf8').trim()).toBe(restore);
    expect(result.stdout).toContain('Frontend rimosso conservato');
  });
  it('rejects a changed snapshot, wrong identity and latest selection without mutation', () => {
    const f = fixture(),
      digest = f.run().stdout.match(/^digest=([0-9a-f]{64})$/m)[1];
    writeFileSync(join(f.saved, 'assets/app.js'), 'tampered');
    expect(f.run('execute', digest).status).not.toBe(0);
    expect(f.run('dry-run', '-', 'c'.repeat(40)).status).not.toBe(0);
    expect(f.run('dry-run', '-', restore, 'latest').status).not.toBe(0);
    expect(readFileSync(join(f.target, 'netmarket-release'), 'utf8').trim()).toBe(current);
  });
  it('rejects missing assets and symlinks in snapshots', () => {
    const f = fixture();
    rmSync(join(f.saved, 'assets/app.js'));
    expect(f.run().status).not.toBe(0);
    symlinkSync(join(f.target, 'assets/app.js'), join(f.saved, 'assets/app.js'));
    expect(f.run().status).not.toBe(0);
  });
});
