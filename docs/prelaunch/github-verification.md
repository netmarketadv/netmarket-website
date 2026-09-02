# GitHub Verification

Data audit: 2026-09-02

## Workflow Quality

Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33611336339`

Stato rilevato:

- `lint`: success
- `typecheck`: success
- `unit`: success
- `astro-build`: success
- `wordpress`: success
- `secrets`: success
- `e2e`: success

Nota: il job E2E usa Playwright e include 26 test distribuiti in 4 file. Durata rilevata dello step `pnpm test:e2e`: circa 10 minuti e 15 secondi.

## Workflow Deploy Staging

Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33611336296`

Stato rilevato:

- Build Astro: success, 53 pagine generate.
- Deploy: failure.
- Smoke staging: skipped.

Errore deploy:

```text
rsync: [Receiver] change_dir#1 "***/" failed: Permission denied (13)
```

## Secret GitHub Rilevati

Repository secrets:

- `SG_STAGING_DEPLOY_PATH`

Environment `staging` secrets:

- `SG_SSH_HOST`
- `SG_SSH_PORT`
- `SG_SSH_USER`
- `SG_SSH_PRIVATE_KEY`
- `SG_SSH_KNOWN_HOSTS`
- `SG_STAGING_DEPLOY_PATH`

Secret CMS mancanti:

- `CMS_BASIC_AUTH_USER`
- `CMS_BASIC_AUTH_PASSWORD`

## Local Verification

Esiti locali sul branch `chore/prelaunch-hardening`:

- `pnpm lint`: success.
- `pnpm typecheck`: success.
- `pnpm test`: success.
- `pnpm build`: success, 53 pagine generate.
- Production metadata simulation: success con `PUBLIC_SITE_URL=https://www.netmarket.it`, 53 pagine generate, robots production `Allow: /`.
- Scansione `dist` production-sim: nessun riferimento a `staging.netmarket.it`, `localhost` o `127.0.0.1`; canonical/schema critici normalizzati su `https://www.netmarket.it`.
- `pnpm php:lint`: success.
- `pnpm php:cs`: success.
- `pnpm php:stan`: success.
- `pnpm secrets:scan`: success.
- `pnpm --dir apps/web exec playwright test`: success, 26 test passati in circa 8 minuti.
- `pnpm content:validate`: failure atteso, CMS raggiungibile ma `401` senza Basic Auth.

## Hardening CI Applicato

- `deploy-staging.yml` blocca il deploy se mancano le credenziali Basic Auth CMS.
- `verify-siteground.yml` verifica anche `SG_STAGING_DEPLOY_PATH`.
- Lo script deploy esegue preflight remoto read/write prima di `rsync`.

## Comandi Utili

```bash
gh secret list --repo netmarketadv/netmarket-website
gh secret list --repo netmarketadv/netmarket-website --env staging
gh run list --branch develop --limit 8
```
