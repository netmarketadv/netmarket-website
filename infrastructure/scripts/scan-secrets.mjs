import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((file) => !file.endsWith('pnpm-lock.yaml'));

const patterns = [
  /-----BEGIN (RSA|OPENSSH|EC|DSA)? ?PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[A-Za-z0-9_]{30,}/,
  /sk_live_[A-Za-z0-9]{20,}/,
  /password\s*=\s*['"][^'"]+['"]/i
];

const findings = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    if (pattern.test(content)) findings.push(file);
  }
}

if (findings.length > 0) {
  console.error(`Possibili segreti trovati in: ${[...new Set(findings)].join(', ')}`);
  process.exit(1);
}

console.log('Secret scan completata senza riscontri.');
