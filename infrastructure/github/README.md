# GitHub

Workflow predisposti:

- `quality.yml`: QA completa su Pull Request verso `develop`/`main`, push diretti a `develop`/`main` e avvio manuale. I job sono paralleli e includono Playwright E2E completo.
- `deploy-staging.yml`: fast path automatico su `develop`, manuale con dry-run predefinito, solo staging.
- `verify-siteground.yml`: manuale e read-only.
