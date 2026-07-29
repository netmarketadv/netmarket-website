# Architettura

La piattaforma usa un frontend Astro statico in `apps/web` e WordPress headless come CMS in `apps/wordpress`.

Build e validazioni passano da GitHub Actions. Il deploy SiteGround è predisposto ma non attivo.

Decisioni:

- HTML statico generato in build.
- CMS su `cms.netmarket.it`.
- Staging frontend su `staging.netmarket.it`.
- Produzione futura su `netmarket.it`, non usata come target operativo in questa fase.
