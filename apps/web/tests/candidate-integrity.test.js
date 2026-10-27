import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { stageProductionCandidate } from '../../../infrastructure/scripts/stage-production-candidate.mjs';
import { assertCandidateRun } from '../../../infrastructure/scripts/check-production-candidate-run.mjs';
import { verifyProductionCandidate } from '../../../infrastructure/scripts/verify-production-candidate.mjs';
const sha = 'a'.repeat(40);
const roots = [];
afterEach(() => {
  for (const path of roots.splice(0)) rmSync(path, { recursive: true, force: true });
});
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'nm-artifact-test-'));
  roots.push(root);
  const dist = join(root, 'dist'),
    output = join(root, 'output');
  mkdirSync(dist);
  mkdirSync(output);
  const files = {
    'index.html':
      '<meta name="netmarket-build" content="' +
      sha +
      '"><meta name="netmarket-environment" content="production">',
    'netmarket-release': sha + '\n',
    '.htaccess': 'fixture',
    'robots.txt': 'fixture',
    'sitemap-index.xml': '<urlset/>'
  };
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dist, name), text);
  const archive = join(output, 'frontend.tgz');
  execFileSync('tar', ['-czf', archive, '-C', dist, '.']);
  const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
  const inventory = JSON.parse(
    readFileSync(
      new URL('../../../data/releases/stape-cms-inventory.json', import.meta.url),
      'utf8'
    )
  );
  const entries = ['services', 'case-studies', 'insights'].map((name) => ({
    path: '/' + name,
    origin: 'https://cms.netmarket.it',
    status: 'ok',
    authenticated: true,
    sha256: 'b'.repeat(64),
    slugs: inventory.requiredSlugs[name] ?? ['fixture-insight'],
    count: (inventory.requiredSlugs[name] ?? ['fixture-insight']).length,
    pagination: { page: 1, totalPages: 1 }
  }));
  const manifest = {
    sha,
    runId: '123',
    archiveSha256: hash(archive),
    cms: { source: 'authenticated-https-cms', requests: 3, entries },
    files: Object.fromEntries(Object.keys(files).map((name) => [name, hash(join(dist, name))]))
  };
  const save = () => writeFileSync(join(output, 'release.json'), JSON.stringify(manifest));
  save();
  const verify = () =>
    verifyProductionCandidate({ directory: output, expectedSha: sha, frontendDirectory: dist });
  return { dist, output, archive, manifest, save, verify, hash };
}
describe('production artifact integrity on synthetic fixtures only', () => {
  it('checks both the archive payload and the exact frontend to publish', () => {
    const f = fixture();
    expect(f.verify()).toMatchObject({ sha, files: 5, cmsRequests: 3 });
    writeFileSync(join(f.dist, 'index.html'), 'tampered');
    expect(f.verify).toThrow('alterati');
  });
  it('stages the exact approved artifact without rebuilding or overwriting a directory', () => {
    const f = fixture();
    const destination = join(f.output, 'promoted');
    const options = { directory: f.output, expectedSha: sha, expectedRunId: '123', destination };
    expect(() => stageProductionCandidate({ ...options, expectedRunId: '456' })).toThrow(
      'Run artifact'
    );
    expect(stageProductionCandidate(options)).toMatchObject({ sha, files: 5 });
    expect(readFileSync(join(destination, 'index.html'), 'utf8')).toBe(
      readFileSync(join(f.dist, 'index.html'), 'utf8')
    );
    expect(() => stageProductionCandidate(options)).toThrow('sovrascrittura');
  });

  it('accepts only successful runs from the exact main workflow and a single unexpired artifact', () => {
    const run = {
      conclusion: 'success',
      status: 'completed',
      head_sha: sha,
      head_branch: 'main',
      event: 'workflow_dispatch',
      path: '.github/workflows/deploy-production.yml',
      head_repository: { full_name: 'netmarketadv/netmarket-website' }
    };
    const artifacts = [{ name: 'production-candidate-' + sha, expired: false, size_in_bytes: 100 }];
    expect(() => assertCandidateRun(run, artifacts, sha)).not.toThrow();
    for (const invalid of [
      { ...run, conclusion: 'failure' },
      { ...run, head_branch: 'develop' },
      { ...run, head_sha: 'b'.repeat(40) },
      { ...run, head_repository: { full_name: 'other/repo' } }
    ]) {
      expect(() => assertCandidateRun(invalid, artifacts, sha)).toThrow('Run candidate');
    }
    for (const invalid of [
      [],
      [...artifacts, ...artifacts],
      [{ ...artifacts[0], expired: true }]
    ]) {
      expect(() => assertCandidateRun(run, invalid, sha)).toThrow('Artifact candidate');
    }
  });

  it('rejects wrong SHA, corrupted archive and unsafe manifest paths', () => {
    const f = fixture();
    f.manifest.sha = 'c'.repeat(40);
    f.save();
    expect(f.verify).toThrow('SHA artifact');
    f.manifest.sha = sha;
    f.manifest.files['../escape'] = 'd'.repeat(64);
    f.save();
    expect(f.verify).toThrow('Manifest');
    delete f.manifest.files['../escape'];
    f.save();
    writeFileSync(f.archive, 'corrupted');
    expect(f.verify).toThrow('Hash archivio');
  });
  it('rejects symlink archive entries before extraction and incomplete CMS proof', () => {
    const f = fixture();
    symlinkSync('index.html', join(f.dist, 'symlink'));
    execFileSync('tar', ['-czf', f.archive, '-C', f.dist, '.']);
    f.manifest.archiveSha256 = f.hash(f.archive);
    f.save();
    expect(f.verify).toThrow('Tipo archivio');
    f.manifest.cms.entries[0].count = 0;
    f.save();
    expect(f.verify).toThrow('vuoto');
  });
});
