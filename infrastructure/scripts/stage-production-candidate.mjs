import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyProductionCandidate } from './verify-production-candidate.mjs';

export function stageProductionCandidate({ directory, expectedSha, expectedRunId, destination }) {
  const release = JSON.parse(readFileSync(resolve(directory, 'release.json'), 'utf8'));
  if (!/^[1-9][0-9]*$/.test(expectedRunId ?? '') || release.runId !== expectedRunId) {
    throw new Error('Run artifact diversa da quella approvata.');
  }
  verifyProductionCandidate({ directory, expectedSha });
  if (existsSync(destination))
    throw new Error('Destinazione candidate gia presente: nessuna sovrascrittura.');
  mkdirSync(destination, { recursive: true });
  execFileSync('tar', ['-xzf', resolve(directory, 'frontend.tgz'), '-C', destination]);
  return verifyProductionCandidate({ directory, expectedSha, frontendDirectory: destination });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (
    process.env.GITHUB_ACTIONS !== 'true' ||
    process.env.GITHUB_REF !== 'refs/heads/main' ||
    process.env.GITHUB_REPOSITORY !== 'netmarketadv/netmarket-website'
  ) {
    throw new Error('Promozione consentita soltanto nella pipeline production approvata.');
  }
  const sha = process.env.PUBLIC_BUILD_SHA;
  if (execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== sha)
    throw new Error('Checkout diverso dallo SHA approvato.');
  stageProductionCandidate({
    directory: resolve('artifacts/production-candidate-' + sha),
    expectedSha: sha,
    expectedRunId: process.env.CANDIDATE_RUN_ID,
    destination: resolve('apps/web/dist')
  });
  console.log('Stesso artifact approvato preparato per pubblicazione, senza rebuild.');
}
