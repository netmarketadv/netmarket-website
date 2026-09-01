# Deployment

Il deploy reale è attivo solo per ambienti non produttivi. `deploy-staging.yml` pubblica automaticamente staging a ogni push su `develop`. Durante la transizione resta abilitato anche il branch `chore/bootstrap-netmarket-platform`, così il lavoro già avviato continua a pubblicare senza cambi forzati. `main` è riservato al futuro deploy production e non pubblica staging.

Lo staging statico viene pubblicato con `infrastructure/scripts/deploy-staging.sh`, che richiede build Astro già generata, SSH con known hosts espliciti e path assoluto.

Il deploy usa `rsync -az --delete` senza `--checksum`, perché Astro produce asset fingerprinted e il confronto checksum rallenterebbe inutilmente il normale ciclo di sviluppo. Prima del deploy reale viene salvato uno snapshot `before-<sha>.tgz` della build online, esclusa `.well-known`, nella directory `.netmarket-backups` accanto al document root.

Il deploy staging è volutamente rapido: installa le dipendenze frontend, esegue i test unit essenziali di `@netmarket/web`, genera la build Astro, pubblica via rsync e poi lancia uno smoke test remoto. Non esegue Composer, PHPStan, PHPCS o Playwright E2E completo.

Ogni build pubblicata espone metadata verificabili:

- `meta[name="netmarket-build"]`
- `meta[name="netmarket-build-time"]`
- `meta[name="netmarket-environment"]`

Lo smoke test verifica che `https://staging.netmarket.it` serva lo stesso SHA della run GitHub appena pubblicata, evitando deploy stale o cache non aggiornate senza dipendere da testi editoriali fragili.

La QA completa vive in `quality.yml`: ESLint, TypeScript, Vitest, build Astro, PHP lint, PHPCS, PHPStan, secret scan e Playwright E2E completo sono separati in job paralleli. Può richiedere più tempo e viene eseguita su PR, push verso branch stabili, branch `feature/*` e `fix/*`, e manualmente.

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
- `NODE_VERSION=22` o `24`

Ordine operativo:

1. Configurare GitHub Environment `staging`.
2. Aggiungere secret SSH e variables.
3. Eseguire `verify-siteground.yml`.
4. Eseguire `deploy-cms.yml` in dry-run.
5. Eseguire `deploy-cms.yml` con `dry_run=false`.
6. Eseguire `deploy-staging.yml` in dry-run.
7. Eseguire `deploy-staging.yml` con `dry_run=false`, oppure fare push su `develop` o sul branch di transizione abilitato.
8. Verificare health check staging e CMS.
