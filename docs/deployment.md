# Deployment

Il deploy reale è attivo solo per ambienti non produttivi. `deploy-staging.yml` pubblica automaticamente staging a ogni push su `develop`. `main` è riservato al futuro deploy production e non pubblica staging.

Lo staging statico viene pubblicato con `infrastructure/scripts/deploy-staging.sh`, che richiede build Astro già generata, SSH con known hosts espliciti e path assoluto.

Il deploy usa `rsync -az --delete` senza `--checksum`, perché Astro produce asset fingerprinted e il confronto checksum rallenterebbe inutilmente il normale ciclo di sviluppo. Prima del deploy reale viene salvato uno snapshot `before-<sha>.tgz` della build online, esclusa `.well-known`, nella directory `.netmarket-backups` accanto al document root.

Il deploy staging è volutamente rapido: installa le dipendenze frontend, esegue i test unit essenziali di `@netmarket/web`, genera la build Astro, pubblica via rsync e poi lancia uno smoke test remoto. Non esegue Composer, PHPStan, PHPCS o Playwright E2E completo.

Prima dell'install e della build, `deploy-staging.yml` deve eseguire `infrastructure/scripts/pull-cms-cache.mjs`. Questo passaggio legge il CMS via SSH/WP-CLI e salva i payload REST proprietari in `apps/web/.cms-cache/netmarket/v1`. È obbligatorio perché `cms.netmarket.it` può essere protetto da Basic Auth e rispondere `401` agli endpoint pubblici non autenticati.

`CMS_API_CACHE_DIR` nei workflow deve essere assoluto:

```yaml
CMS_API_CACHE_DIR: ${{ github.workspace }}/apps/web/.cms-cache/netmarket/v1
```

Durante verifiche locali o CI, se la build deve usare il contenuto CMS reale, usare:

```sh
CMS_API_CACHE_DIR="$PWD/apps/web/.cms-cache/netmarket/v1" pnpm build
```

Warning come `CMS unavailable, using migration snapshot fallback` indicano che la build sta usando fallback/snapshot e non la cache CMS reale.

Ogni build pubblicata espone metadata verificabili:

- `meta[name="netmarket-build"]`
- `meta[name="netmarket-build-time"]`
- `meta[name="netmarket-environment"]`

Lo smoke test verifica che `https://staging.netmarket.it` serva lo stesso SHA della run GitHub appena pubblicata, evitando deploy stale o cache non aggiornate senza dipendere da testi editoriali fragili.

La QA completa vive in `quality.yml`: ESLint, TypeScript, Vitest, build Astro, PHP lint, PHPCS, PHPStan, secret scan e Playwright E2E completo sono separati in job paralleli. Può richiedere più tempo e viene eseguita su Pull Request verso `develop`/`main`, push diretti a `develop`/`main`, e manualmente. Non parte automaticamente a ogni push su `feature/*` o `fix/*`.

Rollback staging:

```sh
infrastructure/scripts/rollback-staging.sh --dry-run --host staging.netmarket.it --path "$SG_STAGING_DEPLOY_PATH"
infrastructure/scripts/rollback-staging.sh --execute --host staging.netmarket.it --path "$SG_STAGING_DEPLOY_PATH" --release latest
```

`latest` ripristina lo snapshot più recente. In alternativa si può passare il nome file del backup, ad esempio `before-<sha>.tgz`.

Il plugin proprietario del CMS viene pubblicato e attivato con `deploy-cms.yml`, che usa `infrastructure/scripts/bootstrap-wordpress.sh` su `cms.netmarket.it`, imposta `blog_public=0`, aggiorna i permalink e verifica `/wp-json/netmarket/v1/health`.

Il deploy del plugin CMS e il deploy del frontend staging sono separati. Dopo una modifica plugin che cambia endpoint, schema o metadati, eseguire prima `Deploy CMS Plugin`, poi `Deploy Staging` in modo che la cache venga generata con il codice CMS aggiornato.

Secret/variables richiesti per staging:

- `SG_SSH_HOST` hostname SSH SiteGround, ad esempio `itm13.siteground.biz`; se si usa un dominio deve essere `staging.netmarket.it`
- `SG_SSH_PORT`
- `SG_SSH_USER`
- `SG_SSH_PRIVATE_KEY`
- `SG_SSH_KNOWN_HOSTS`
- `SG_STAGING_DEPLOY_PATH`
- `CMS_BASIC_AUTH_USER`
- `CMS_BASIC_AUTH_PASSWORD`
- `SG_CMS_WORDPRESS_PATH`

Le credenziali Basic Auth del CMS sono usate solo durante il build Astro per leggere `cms.netmarket.it` quando il dominio e protetto a livello server. Non hanno prefisso `PUBLIC_` e non vengono esposte al browser.

`SG_CMS_WORDPRESS_PATH` punta al WordPress CMS, attualmente `/home/customer/www/cms.netmarket.it/public_html`, e serve al pull cache via WP-CLI. Non confonderlo con `SG_STAGING_DEPLOY_PATH`.

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
- `CMS_API_BASE_URL=https://cms.netmarket.it/wp-json/`
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

## Import Contenuti CMS

Gli import contenuti devono essere idempotenti e lavorare solo su `cms.netmarket.it`. Per gli insight legacy:

```sh
pnpm migration:insights:cms --dry-run --skip-media
pnpm migration:insights:cms
```

Opzioni disponibili:

- `--dry-run`: calcola create/update senza scrivere.
- `--skip-media`: aggiorna post e meta senza sideload media.
- `--force`: riapplica contenuti e meta anche se il checksum di migrazione coincide.

Dopo un import:

1. verificare via WP-CLI/API interna che il conteggio sia corretto;
2. mettere in bozza eventuali contenuti demo come `Hello world!`;
3. rigenerare cache CMS;
4. buildare con `CMS_API_CACHE_DIR` assoluto;
5. deployare staging;
6. controllare una pagina reale su `https://staging.netmarket.it`.
