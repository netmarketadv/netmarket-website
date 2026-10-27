import { fileURLToPath } from 'node:url';

export function assertProductionProtection(environment, branchPolicies) {
  const review = environment.protection_rules?.find((rule) => rule.type === 'required_reviewers');
  if (!review?.reviewers?.length)
    throw new Error('Production richiede almeno un required reviewer effettivo.');
  const policy = environment.deployment_branch_policy;
  if (!policy || !policy.custom_branch_policies) {
    throw new Error('Production deve limitare i branch autorizzati.');
  }
  if (
    !Array.isArray(branchPolicies) ||
    branchPolicies.length !== 1 ||
    branchPolicies[0].name !== 'main' ||
    branchPolicies[0].type !== 'branch'
  ) {
    throw new Error(
      'Production deve autorizzare esclusivamente il branch main, senza wildcard o tag.'
    );
  }
  if (environment.can_admins_bypass !== false) {
    throw new Error('Production deve impedire il bypass amministrativo delle approvazioni.');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (
    process.env.GITHUB_REPOSITORY !== 'netmarketadv/netmarket-website' ||
    process.env.GITHUB_REF !== 'refs/heads/main' ||
    !process.env.GH_TOKEN
  ) {
    throw new Error(
      'Controllo production consentito soltanto al workflow main del repository canonico.'
    );
  }
  const response = await fetch(
    'https://api.github.com/repos/netmarketadv/netmarket-website/environments/production',
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
    throw new Error('Impossibile verificare le protezioni production: HTTP ' + response.status);
  const branches = await fetch(
    'https://api.github.com/repos/netmarketadv/netmarket-website/environments/production/deployment-branch-policies',
    {
      headers: {
        Authorization: 'Bearer ' + process.env.GH_TOKEN,
        Accept: 'application/vnd.github+json'
      },
      redirect: 'error',
      signal: AbortSignal.timeout(30_000)
    }
  );
  if (!branches.ok)
    throw new Error('Impossibile verificare i branch production: HTTP ' + branches.status);
  assertProductionProtection(await response.json(), (await branches.json()).branch_policies);
  console.log('Production: reviewer obbligatorio, bypass disabilitato e solo main verificati.');
}
