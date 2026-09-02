# Deployment

Il deploy reale è attivo solo per ambienti non produttivi. `deploy-staging.yml` pubblica automaticamente staging a ogni push su `develop`. `main` è riservato al futuro deploy production e non pubblica staging.

Lo staging statico viene pubblicato con `infrastructure/scripts/deploy-staging.sh`, che richiede build Astro già generata, SSH con known hosts espliciti e path assoluto.

Il deploy usa `rsync -az --delete` senza `--checksum`, perché Astro produce asset fingerprinted e il confronto checksum rallenterebbe inutilmente il normale ciclo di sviluppo. Prima del deploy reale viene salvato uno snapshot `before-<sha>.tgz` della build online, esclusa `.well-known`, nella directory `.netmarket-backups` accanto al document root.

Il deploy staging è volutamente rapido: installa le dipendenze, esegue `pnpm check:fast`, pubblica via rsync e poi lancia smoke test remoti. Non esegue Composer, PHPStan, PHPCS o Playwright E2E completo.

Ogni build pubblicata espone metadata verificabili:

- `meta[name="netmarket-build"]`
- `meta[name="netmarket-build-time"]`
- `meta[name="netmarket-environment"]`

Gli smoke test verificano che `https://staging.netmarket.it` serva lo stesso SHA della run GitHub appena pubblicata, evitando deploy stale o cache non aggiornate senza dipendere da testi editoriali fragili. Dopo lo smoke HTTP (`pnpm smoke:staging`) viene eseguito anche `pnpm test:e2e:smoke` contro lo staging reale.

`Quality Fast` vive in `quality-fast.yml`: gira su PR verso `develop` e manualmente. Usa path filtering, cancella run obsolete sullo stesso ref e include controlli rapidi proporzionati. Su push `develop`, `deploy-staging.yml` esegue direttamente `pnpm check:fast` prima del deploy per evitare una doppia installazione/build in workflow separati.

Misura del 2026-09-02: il deploy staging del commit `eece167d74da38772218ce02fea53c9e6e30ea7e` ha completato in 2m56s, includendo pull cache CMS, install, `pnpm check:fast`, deploy, smoke HTTP e Playwright smoke post deploy.

Misura successiva con cache browser Playwright già disponibile: il deploy staging del commit `b9d14e0e2a375d7d2e703178ef740e7ea044b89b` ha completato in 2m24s di run GitHub, con job principale da 2m19s.

La QA completa vive in `quality.yml`: ESLint, TypeScript, Vitest, build Astro, PHP lint, PHPCS, PHPStan, secret scan e Playwright E2E completo sono separati in job paralleli. Può richiedere più tempo e viene eseguita su Pull Request verso `main`, push diretti a `main`, e manualmente. Non parte automaticamente a ogni push su `develop`, `feature/*` o `fix/*`.

Rollback staging:

```sh
infrastructure/scripts/rollback-staging.sh --dry-run --host staging.netmarket.it --path "$SG_STAGING_DEPLOY_PATH"
infrastructure/scripts/rollback-staging.sh --execute --host staging.netmarket.it --path "$SG_STAGING_DEPLOY_PATH" --release latest
```

`latest` ripristina lo snapshot più recente. In alternativa si può passare il nome file del backup, ad esempio `before-<sha>.tgz`.

Il plugin proprietario del CMS viene pubblicato e attivato con `deploy-cms.yml`, che usa `infrastructure/scripts/bootstrap-wordpress.sh` su `cms.netmarket.it`, imposta `blog_public=0`, aggiorna i permalink e verifica `/wp-json/netmarket/v1/health`.

Secret/variables richiesti per staging:

- `SG_SSH_HOST` hostname SSH SiteGround, ad esempio `itm13.siteground.biz`; se si usa un dominio deve essere `staging.netmarket.it`
- `SG_SSH_PORT`
- `SG_SSH_USER`
- `SG_SSH_PRIVATE_KEY`
- `SG_SSH_KNOWN_HOSTS`
- `SG_STAGING_DEPLOY_PATH`
- `CMS_BASIC_AUTH_USER`
- `CMS_BASIC_AUTH_PASSWORD`

Le credenziali Basic Auth del CMS sono usate solo durante il build Astro per leggere `cms.netmarket.it` quando il dominio e protetto a livello server. Non hanno prefisso `PUBLIC_` e non vengono esposte al browser.

Secret richiesti per CMS:

- `SG_CMS_SSH_HOST` hostname SSH SiteGround, ad esempio `itm13.siteground.biz`; se si usa un dominio deve essere `cms.netmarket.it`
- `SG_CMS_SSH_PORT`
- `SG_CMS_SSH_USER`
- `SG_CMS_SSH_PRIVATE_KEY`
- `SG_CMS_SSH_KNOWN_HOSTS`
- `SG_CMS_WORDPRESS_PATH`
- `CMS_BASIC_AUTH_USER`
- `CMS_BASIC_AUTH_PASSWORD`

Variables richieste:

- `PUBLIC_SITE_URL=https://staging.netmarket.it`
- `PUBLIC_CMS_URL=https://cms.netmarket.it`
- `PUBLIC_DEPLOY_ENV=staging`
- `PUBLIC_BUILD_SHA` generato automaticamente dalla GitHub Action
- `PUBLIC_BUILD_TIME` generato automaticamente dalla GitHub Action
- `CMS_API_BASE_URL=https://cms.netmarket.it/wp-json/netmarket/v1/`
- `NODE_VERSION=22` o `24`

Ordine operativo:

1. Configurare GitHub Environment `staging`.
2. Aggiungere secret SSH e variables.
3. Eseguire `verify-siteground.yml`.
4. Eseguire `deploy-cms.yml` in dry-run.
5. Eseguire `deploy-cms.yml` con `dry_run=false`.
6. Eseguire `deploy-staging.yml` in dry-run.
7. Eseguire `deploy-staging.yml` con `dry_run=false`, oppure fare push su `develop`.
8. Verificare health check staging e CMS.
