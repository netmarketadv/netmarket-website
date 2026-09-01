# Architettura

La piattaforma usa un frontend Astro statico in `apps/web` e WordPress headless come CMS in `apps/wordpress`.

Build e validazioni passano da GitHub Actions. Il deploy frontend SiteGround è attivo solo per `staging.netmarket.it`; il deploy CMS è separato e limitato a `cms.netmarket.it`.

Decisioni:

- HTML statico generato in build.
- CMS su `cms.netmarket.it`.
- Staging frontend su `staging.netmarket.it`.
- Produzione futura su `netmarket.it`, non usata come target operativo in questa fase.
- `develop` è il branch stabile per staging; `main` resta riservato a una futura produzione protetta.
- La pipeline staging privilegia fast feedback, mentre `quality.yml` mantiene la QA completa prima dei rilasci.
