import { spawnSync, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { auditCmsProvenance } from './audit-cms-provenance.mjs';

const sha = process.env.PUBLIC_BUILD_SHA;
if (
  process.env.GITHUB_ACTIONS !== 'true' ||
  process.env.GITHUB_REPOSITORY !== 'netmarketadv/netmarket-website' ||
  process.env.GITHUB_REF !== 'refs/heads/main'
) {
  throw new Error('Artifact valido producibile soltanto nella pipeline production protetta.');
}
if (
  !/^[0-9a-f]{40}$/.test(sha ?? '') ||
  execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== sha
) {
  throw new Error('SHA candidate assente o diverso dal checkout.');
}
if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) {
  throw new Error('Candidate non riproducibile: working tree modificato.');
}
if (!process.env.CMS_BASIC_AUTH_USER || !process.env.CMS_BASIC_AUTH_PASSWORD) {
  throw new Error('Credenziali CMS esistenti obbligatorie; nessun fallback consentito.');
}
const output = resolve('artifacts/production-candidate-' + sha);
mkdirSync(output, { recursive: true });
const auditPath = resolve(output, 'cms-access.jsonl');
writeFileSync(auditPath, '');
const build = spawnSync('pnpm', ['build'], {
  env: { ...process.env, CMS_AUDIT_PATH: auditPath },
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});
const log = (build.stdout ?? '') + (build.stderr ?? '');
writeFileSync(resolve(output, 'build.log'), log);
if (
  build.status !== 0 ||
  /CMS.*(?:unavailable|skipped)|using (?:local build|migration snapshot) fallback|trying .*fallback/i.test(
    log
  )
) {
  throw new Error(
    'Build candidate rifiutata: errore o fallback CMS. Consultare il log privato della run.'
  );
}
const entries = readFileSync(auditPath, 'utf8')
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const provenance = auditCmsProvenance(entries);
execFileSync(process.execPath, ['infrastructure/scripts/audit-production-build.mjs'], {
  stdio: 'inherit'
});
const dist = resolve('apps/web/dist');
writeFileSync(resolve(dist, 'netmarket-release'), sha + '\n');
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Symlink non ammesso nel candidate.');
    return entry.isDirectory() ? walk(path) : [path];
  });
}
const files = Object.fromEntries(
  walk(dist)
    .sort()
    .map((file) => [
      relative(dist, file),
      createHash('sha256').update(readFileSync(file)).digest('hex')
    ])
);
const archive = resolve(output, 'frontend.tgz');
execFileSync('tar', ['-czf', archive, '-C', dist, '.']);
writeFileSync(
  resolve(output, 'release.json'),
  JSON.stringify(
    {
      sha,
      base: '6b2e5524ba43e237229e0f56e86161edd87e1165',
      runId: process.env.GITHUB_RUN_ID,
      builtAt: process.env.PUBLIC_BUILD_TIME,
      archiveSha256: createHash('sha256').update(readFileSync(archive)).digest('hex'),
      cms: provenance,
      files
    },
    null,
    2
  ) + '\n'
);
console.log(
  'Candidate completo e autenticato: ' +
    sha +
    ', ' +
    provenance.requests +
    ' accessi CMS verificati.'
);
