# GitHub Verification

Data audit: 2026-09-02

## Branch E Commit

- Branch: `chore/prelaunch-hardening`
- Commit verificato: `99d79ffcfb38449a864d1e1f1b59c437e382098a`
- Commit pushati in questo passaggio:
  - `573dad1 feat: add NOD product landing`
  - `c4612ba chore: add final audit tooling and reports`
  - `99d79ff ci: harden staging checks and homepage canonical`

## Workflow Registrati

`gh workflow list` mostra:

- `Deploy CMS Plugin`
- `Deploy Staging`
- `Quality`
- `Verify SiteGround`
- `Dependabot Updates`

## Quality

Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33627611115`

Stato:

- `lint`: success.
- `typecheck`: success.
- `unit`: success.
- `astro-build`: success.
- `wordpress`: success.
- `secrets`: success.
- `e2e`: success, durata circa 17 minuti.

Nota: GitHub segnala una deprecazione Node 20 per alcune Actions. Non blocca il workflow; conviene aggiornare le Actions quando saranno disponibili versioni native Node 24.

## Deploy CMS Plugin

Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629190214`

Stato:

- `Guard CMS target`: success.
- `Check SSH secrets`: success.
- `Deploy and activate CMS plugin`: success.
- `Harden CMS access and indexing`: success.
- `Health check`: success.

## Verify SiteGround

Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629193220`

Stato: success.

## Deploy Staging

Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629259420`

Stato:

- `Guard staging target`: success.
- `Check SSH secrets`: success.
- `Check CMS credentials`: success.
- `Pull CMS API cache`: success.
- `Fast frontend tests`: success.
- `Build Astro frontend`: success.
- `Deploy`: success.
- `Smoke staging`: success.

## Secret GitHub Rilevati

Repository secrets:

- `CMS_BASIC_AUTH_PASSWORD`
- `CMS_BASIC_AUTH_USER`
- `SG_STAGING_DEPLOY_PATH`

Environment `staging` secrets:

- `CMS_BASIC_AUTH_PASSWORD`
- `CMS_BASIC_AUTH_USER`
- `SG_CMS_WORDPRESS_PATH`
- `SG_SSH_HOST`
- `SG_SSH_PORT`
- `SG_SSH_USER`
- `SG_SSH_PRIVATE_KEY`
- `SG_SSH_KNOWN_HOSTS`
- `SG_STAGING_DEPLOY_PATH`

## Local Verification

- `pnpm validate`: success.
- `pnpm test:e2e`: success, 26 test passati.
- Production metadata simulation: success con `PUBLIC_SITE_URL=https://www.netmarket.it`, 54 pagine generate.
- Scansione `dist` production-sim: nessun riferimento critico a staging/localhost; i match `placeholder` residui sono attributi input e CSS `::placeholder`.

## Stato Main

La PR precedente `#14` risulta gia mergiata in `main`, ma il branch contiene commit successivi al merge. Prima di considerare `main` aggiornato, creare/aggiornare una PR dal branch e mergiarla dopo i check richiesti.
