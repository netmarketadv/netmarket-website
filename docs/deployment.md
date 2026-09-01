# Deployment

Il deploy reale è predisposto solo per ambienti non produttivi. `deploy-staging.yml` pubblica automaticamente staging a ogni push su `main` o sul branch di lavoro `chore/bootstrap-netmarket-platform`; resta disponibile anche l'avvio manuale con dry-run e rifiuta target diversi da `staging.netmarket.it`.

Lo staging statico viene pubblicato con `infrastructure/scripts/deploy-staging.sh`, che richiede build Astro già generata, SSH con known hosts espliciti e path assoluto.

Prima del deploy la workflow esegue install dipendenze, `pnpm validate`, installazione Chromium Playwright e `pnpm test:e2e`. Dopo il deploy l'health check verifica che la homepage pubblicata contenga i marker delle sezioni clienti, team e recensioni, così staging non può risultare verde se sta ancora servendo una build vecchia.

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
- `NODE_VERSION=22` o `24`

Ordine operativo:

1. Configurare GitHub Environment `staging`.
2. Aggiungere secret SSH e variables.
3. Eseguire `verify-siteground.yml`.
4. Eseguire `deploy-cms.yml` in dry-run.
5. Eseguire `deploy-cms.yml` con `dry_run=false`.
6. Eseguire `deploy-staging.yml` in dry-run.
7. Eseguire `deploy-staging.yml` con `dry_run=false`, oppure fare push su un branch abilitato al deploy staging.
8. Verificare health check staging e CMS.
