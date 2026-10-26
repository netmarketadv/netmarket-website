import { fileURLToPath } from 'node:url';

export function assertProductionProtection(environment) {
  const review = environment.protection_rules?.find((rule) => rule.type === 'required_reviewers');
  if (!review?.reviewers?.length)
    throw new Error('Production richiede almeno un required reviewer effettivo.');
  const policy = environment.deployment_branch_policy;
  if (!policy || (!policy.protected_branches && !policy.custom_branch_policies)) {
    throw new Error('Production deve limitare i branch autorizzati.');
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
      redirect: 'error'
    }
  );
  if (!response.ok)
    throw new Error('Impossibile verificare le protezioni production: HTTP ' + response.status);
  assertProductionProtection(await response.json());
  console.log('Production: reviewer obbligatorio e limitazione branch verificati.');
}
