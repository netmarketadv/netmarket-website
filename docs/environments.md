# Ambienti

## Local

- `PUBLIC_SITE_URL=http://localhost:4321`
- Indicizzazione disattivata.

## Staging

- `PUBLIC_SITE_URL=https://staging.netmarket.it`
- `PUBLIC_CMS_URL=https://cms.netmarket.it`
- `PUBLIC_DEPLOY_ENV=staging`
- Robots: `noindex, nofollow, noarchive`.

## Production

Produzione futura. Non configurare deploy in questa fase.

Segreti previsti in GitHub:

- `SG_SSH_HOST`
- `SG_SSH_PORT`
- `SG_SSH_USER`
- `SG_SSH_PRIVATE_KEY`
- `SG_SSH_KNOWN_HOSTS`
- `SG_STAGING_DEPLOY_PATH`
