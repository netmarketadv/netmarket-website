import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { auditCmsProvenance } from './audit-cms-provenance.mjs';

const digest = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
function safePath(name) {
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    !/[\\\x00-\x1f\x7f]/.test(name) &&
    !name.startsWith('/') &&
    name.split('/').every((part) => part && part !== '.' && part !== '..')
  );
}
function hashes(directory) {
  function walk(current) {
    return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
      const path = resolve(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlink non ammesso nel frontend.');
      return entry.isDirectory() ? walk(path) : [path];
    });
  }
  return Object.fromEntries(
    walk(directory).map((file) => [relative(directory, file), digest(file)])
  );
}
function sameFiles(actual, expected) {
  if (
    Object.keys(actual).length !== Object.keys(expected).length ||
    Object.entries(expected).some(([name, hash]) => actual[name] !== hash)
  ) {
    throw new Error('File frontend mancanti, inattesi o alterati.');
  }
}
export function verifyProductionCandidate({ directory, expectedSha, frontendDirectory }) {
  if (!/^[0-9a-f]{40}$/.test(expectedSha ?? '')) throw new Error('SHA verifica non valido.');
  const release = JSON.parse(readFileSync(resolve(directory, 'release.json'), 'utf8'));
  if (release.sha !== expectedSha) throw new Error('SHA artifact diverso dal candidate.');
  if (
    !release.files ||
    !Object.keys(release.files).length ||
    Object.entries(release.files).some(
      ([name, hash]) => !safePath(name) || !/^[0-9a-f]{64}$/.test(hash)
    )
  ) {
    throw new Error('Manifest frontend non valido.');
  }
  const inventory = JSON.parse(
    readFileSync(new URL('../../data/releases/stape-cms-inventory.json', import.meta.url), 'utf8')
  );
  const cms = auditCmsProvenance(release.cms?.entries ?? [], inventory.requiredSlugs);
  if (release.cms.source !== cms.source || release.cms.requests !== cms.requests)
    throw new Error('Provenienza CMS incoerente.');
  const archive = resolve(directory, 'frontend.tgz');
  if (digest(archive) !== release.archiveSha256)
    throw new Error('Hash archivio non corrispondente.');
  const members = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n');
  for (const name of members) {
    if (name === './' || name === '.') continue;
    const path = name.replace(/^\.\//, '').replace(/\/$/, '');
    if (!safePath(path)) throw new Error('Percorso archivio non sicuro.');
  }
  const types = execFileSync('tar', ['-tvzf', archive], { encoding: 'utf8' }).trim().split('\n');
  if (types.some((line) => !['-', 'd'].includes(line[0])))
    throw new Error('Tipo archivio non consentito: solo file e directory.');
  const temporary = mkdtempSync(join(tmpdir(), 'netmarket-integrity-'));
  try {
    execFileSync('tar', ['-xzf', archive, '-C', temporary]);
    sameFiles(hashes(temporary), release.files);
    for (const file of [
      'index.html',
      '.htaccess',
      'robots.txt',
      'sitemap-index.xml',
      'netmarket-release'
    ]) {
      if (!release.files[file]) throw new Error('File essenziale assente: ' + file);
    }
    const html = readFileSync(resolve(temporary, 'index.html'), 'utf8');
    if (
      readFileSync(resolve(temporary, 'netmarket-release'), 'utf8').trim() !== expectedSha ||
      !html.includes('name="netmarket-build" content="' + expectedSha + '"') ||
      !html.includes('name="netmarket-environment" content="production"')
    ) {
      throw new Error('Marcatori production non coerenti.');
    }
    if (frontendDirectory) sameFiles(hashes(frontendDirectory), release.files);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
  return { sha: expectedSha, files: Object.keys(release.files).length, cmsRequests: cms.requests };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sha = process.env.PUBLIC_BUILD_SHA;
  const result = verifyProductionCandidate({
    directory: resolve('artifacts/production-candidate-' + sha),
    expectedSha: sha,
    frontendDirectory: resolve('apps/web/dist')
  });
  console.log('Integrita candidate verificata: ' + result.sha + ', ' + result.files + ' file.');
}
