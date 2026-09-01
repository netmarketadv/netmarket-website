# GitHub

Workflow predisposti:

- `quality.yml`: QA completa su pull request, push verso branch stabili e avvio manuale. I job sono paralleli e includono Playwright E2E completo.
- `deploy-staging.yml`: fast path automatico su `develop` e temporaneamente su `chore/bootstrap-netmarket-platform`, manuale con dry-run predefinito, solo staging.
- `verify-siteground.yml`: manuale e read-only.
