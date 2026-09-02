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

Dry-run successivo dopo hardening:

- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33615147619`
- Branch/SHA: `chore/prelaunch-hardening`, `2c8c73b474ced6f4049cabf66de338eae14f2278`
- Esito: success.
- `Check CMS credentials`: success.
- `Dry-run deploy plan`: success.
- Nota: durante la build il CMS ha risposto `404` sugli endpoint contenuto `services` e `insights`; il frontend ha usato i fallback/snapshot previsti.

Deploy reale completato:

- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33615441326`
- Branch/SHA iniziale: `chore/prelaunch-hardening`, `2c8c73b474ced6f4049cabf66de338eae14f2278`
- Stato: annullato perche superato dal commit `4b3d77f8a7a45cbbd7ae1763a2c57776e79bf2c1`.

Deploy reale finale verificato:

- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33616676522`
- Branch/SHA: `chore/prelaunch-hardening`, `a1753b3e77f6e9c0de4cecc3f4b4616b2e0929bc`
- Esito: success.
- `Build Astro frontend`: success, 53 pagine generate.
- `Deploy`: success.
- `Smoke staging`: success.
- Smoke: `Smoke staging ok: build a1753b3e77f6e9c0de4cecc3f4b4616b2e0929bc su staging.`
- Warning contenuto: endpoint CMS `/services`, `/insights` e `/case-studies` rispondono `404`, quindi il frontend usa fallback/snapshot.

## Secret GitHub Rilevati

Repository secrets:

- `CMS_BASIC_AUTH_PASSWORD`
- `CMS_BASIC_AUTH_USER`
- `SG_STAGING_DEPLOY_PATH`

Environment `staging` secrets:

- `CMS_BASIC_AUTH_PASSWORD`
- `CMS_BASIC_AUTH_USER`
- `SG_SSH_HOST`
- `SG_SSH_PORT`
- `SG_SSH_USER`
- `SG_SSH_PRIVATE_KEY`
- `SG_SSH_KNOWN_HOSTS`
- `SG_STAGING_DEPLOY_PATH`

Workflow non ancora registrati su GitHub Actions perche presenti nel branch ma non nel default branch:

- `Deploy CMS Plugin`
- `Verify SiteGround`

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
- `pnpm --filter @netmarket/web typecheck`: success dopo cache fallback.
- `pnpm --filter @netmarket/web build`: success dopo cache fallback.
- `pnpm --filter @netmarket/web test`: success, 26 test passati.

## Hardening CI Applicato

- `deploy-staging.yml` blocca il deploy se mancano le credenziali Basic Auth CMS.
- `verify-siteground.yml` verifica anche `SG_STAGING_DEPLOY_PATH`.
- Lo script deploy esegue preflight remoto read/write prima di `rsync`.
- I loader contenuti evitano richieste dettaglio CMS ripetute quando l'archivio ha gia scelto fallback/snapshot.

## Comandi Utili

```bash
gh secret list --repo netmarketadv/netmarket-website
gh secret list --repo netmarketadv/netmarket-website --env staging
gh run list --branch develop --limit 8
```
