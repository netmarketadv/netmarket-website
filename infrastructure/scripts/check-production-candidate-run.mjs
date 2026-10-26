import { fileURLToPath } from 'node:url';

export function assertCandidateRun(run, artifacts, expectedSha) {
  if (
    run.conclusion !== 'success' ||
    run.status !== 'completed' ||
    run.head_sha !== expectedSha ||
    run.head_branch !== 'main' ||
    run.event !== 'workflow_dispatch' ||
    run.path !== '.github/workflows/deploy-production.yml' ||
    run.head_repository?.full_name !== 'netmarketadv/netmarket-website'
  ) {
    throw new Error('Run candidate non riuscita o non corrispondente al commit/main canonico.');
  }
  const matches = artifacts.filter(
    (artifact) => artifact.name === 'production-candidate-' + expectedSha
  );
  if (matches.length !== 1 || matches[0].expired || matches[0].size_in_bytes <= 0) {
    throw new Error('Artifact candidate univoco e non scaduto obbligatorio.');
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const id = process.env.CANDIDATE_RUN_ID;
  const sha = process.env.GITHUB_SHA;
  if (
    !/^[1-9][0-9]*$/.test(id ?? '') ||
    !/^[0-9a-f]{40}$/.test(sha ?? '') ||
    process.env.GITHUB_REPOSITORY !== 'netmarketadv/netmarket-website' ||
    process.env.GITHUB_REF !== 'refs/heads/main' ||
    !process.env.GH_TOKEN
  ) {
    throw new Error('Run ID, SHA e workflow main canonico obbligatori.');
  }
  async function get(path) {
    const response = await fetch(
      'https://api.github.com/repos/netmarketadv/netmarket-website/actions/runs/' + id + path,
      {
        headers: {
          Authorization: 'Bearer ' + process.env.GH_TOKEN,
          Accept: 'application/vnd.github+json'
        },
        redirect: 'error',
        signal: AbortSignal.timeout(30_000)
      }
    );
    if (!response.ok)
      throw new Error('Verifica run candidate non disponibile: HTTP ' + response.status);
    return response.json();
  }
  const run = await get('');
  const result = await get('/artifacts?per_page=100');
  assertCandidateRun(run, result.artifacts, sha);
  console.log('Run candidate riuscita e artifact immutabile verificati: ' + id);
}
