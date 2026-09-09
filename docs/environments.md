# Ambienti

## Local

- `PUBLIC_SITE_URL=http://localhost:4321`
- Indicizzazione disattivata.

## Staging

- `PUBLIC_SITE_URL=https://staging.netmarket.it`
- `PUBLIC_CMS_URL=https://cms.netmarket.it`
- `PUBLIC_DEPLOY_ENV=staging`
- `PUBLIC_BUILD_SHA` impostato automaticamente dalla GitHub Action.
- `PUBLIC_BUILD_TIME` impostato automaticamente dalla GitHub Action.
- Robots: `noindex, nofollow, noarchive`.

Branch strategy:

- `develop` pubblica automaticamente `staging.netmarket.it`.
- `main` pubblica production soltanto tramite il GitHub Environment protetto `production`.

## Production

- `PUBLIC_SITE_URL=https://netmarket.it`
- `PUBLIC_CMS_URL=https://cms.netmarket.it`
- `PUBLIC_DEPLOY_ENV=production`
- Robots: `index, follow`; sitemap `https://netmarket.it/sitemap-index.xml`.
- Tracking: GTM `GTM-K782CJ46`, caricato solo in production con Consent Mode iniziale denied.

Il workflow `Deploy Production` usa esclusivamente il branch `main`, il GitHub Environment
`production`, avvio manuale con conferma esplicita e un document root dedicato. Non
riutilizza il path staging.

Segreti richiesti nel GitHub Environment `production`:

- `SG_SSH_HOST`
- `SG_SSH_PORT`
- `SG_SSH_USER`
- `SG_SSH_PRIVATE_KEY`
- `SG_SSH_KNOWN_HOSTS`
- `SG_PRODUCTION_DEPLOY_PATH`
- `SG_CMS_WORDPRESS_PATH`
- `CMS_BASIC_AUTH_USER`
- `CMS_BASIC_AUTH_PASSWORD`
