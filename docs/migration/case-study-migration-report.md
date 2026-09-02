# Case Study Migration Report

Migration version: `case-study-migration-v1`

## Discovery

- Legacy CPT: `caso-studio`
- Legacy REST endpoint: `https://netmarket.it/wp-json/wp/v2/caso-studio`
- REST items discovered: 8
- Yoast sitemap: `https://netmarket.it/caso-studio-sitemap.xml`
- Sitemap items discovered: 6
- Difference: 2 REST items are published but `noindex, follow`, therefore absent from the Yoast sitemap.

## Current Status

The migration inventory, raw snapshots, transform dry-run, service map, URL map and redirect candidates have been generated.

The real import into `cms.netmarket.it` has not been executed in this local session because the CMS is protected by HTTP Basic Auth and no local write credentials/Application Password/WP-CLI session are available here. The frontend can build from the real migration snapshot fallback until the CMS import is executed by the secure pipeline.

## Case Studies

| Case Study | Legacy URL | New URL | Status | Client | Media | Services | Warnings |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| App mobile e programma fedeltà Sirene Blu | `https://netmarket.it/caso-studio/app-mobile-programma-fedelta-sirene-blu/` | `/progetti/app-mobile-programma-fedelta-sirene-blu/` | ready with warnings | Sirene Blu | 5 | software-e-integrazioni | legacy_noindex |
| Sviluppo CRM VENITALY | `https://netmarket.it/caso-studio/sviluppo-crm-custom-venitaly/` | `/progetti/sviluppo-crm-custom-venitaly/` | ready with warnings | VENITALY | 1 | software-e-integrazioni | legacy_noindex, unmapped_service, missing_alt |
| Rigomar | `https://netmarket.it/caso-studio/sviluppo-sito-web-e-shooting-fotografico-per-rigomar-una-presenza-digitale-piu-autorevole-per-il-mondo-della-produzione-moda/` | `/progetti/sviluppo-sito-web-e-shooting-fotografico-per-rigomar-una-presenza-digitale-piu-autorevole-per-il-mondo-della-produzione-moda/` | ready with warnings | Rigomar | 1 | siti-web, content-production | missing_alt |
| Albertini Allestimenti | `https://netmarket.it/caso-studio/sviluppo-sito-web-allestimenti-fieristici-albertini/` | `/progetti/sviluppo-sito-web-allestimenti-fieristici-albertini/` | ready | Albertini Allestimenti | 0 | seo, siti-web | - |
| Progetto-e | `https://netmarket.it/caso-studio/sviluppo-sito-web-fotovoltaico-progetto-e/` | `/progetti/sviluppo-sito-web-fotovoltaico-progetto-e/` | ready with warnings | Progetto-e | 2 | siti-web | unmapped_service, missing_alt |
| Pazzo Design | `https://netmarket.it/caso-studio/sviluppo-e-commerce-per-tavoli-e-sedie-per-la-casa/` | `/progetti/sviluppo-e-commerce-per-tavoli-e-sedie-per-la-casa/` | ready with warnings | Pazzo Design | 2 | ecommerce | unmapped_service, missing_alt |
| Sirene Blu 2024 | `https://netmarket.it/caso-studio/concorso-a-premi-sirene-blu-2024-ideazione-sviluppo-e-gestione-completa/` | `/progetti/concorso-a-premi-sirene-blu-2024-ideazione-sviluppo-e-gestione-completa/` | ready with warnings | Sirene Blu | 2 | siti-web, concorsi-a-premi | unmapped_service, missing_alt |
| BRB | `https://netmarket.it/caso-studio/casi-studio-strategia-digitale-ecommerce-brb/` | `/progetti/casi-studio-strategia-digitale-ecommerce-brb/` | ready with warnings | BRB | 2 | siti-web, social-media | unmapped_service, missing_alt |

## Client Migration

Clients identified conservatively from titles, logos and page context:

- Sirene Blu
- VENITALY
- Rigomar
- Albertini Allestimenti
- Progetto-e
- Pazzo Design
- BRB

No client deduplication ambiguity was found in the discovered dataset, except Sirene Blu appearing in two case studies and intentionally mapping to the same client.

## Media

- Media were copied into `apps/web/public/media/case-studies/legacy/` for staging fallback.
- This avoids runtime hotlinking to `netmarket.it`.
- Final CMS media import is still required.
- Missing alt warnings are preserved and not auto-generated.

## Services

Mapped labels:

- `Sviluppo app`, `Software custom`, `Programma fedeltà`, `Sviluppo software`, `Manutenzione` -> `software-e-integrazioni`
- `Sviluppo web`, `Sviluppo sito web` -> `siti-web`
- `Sviluppo E-commerce` -> `ecommerce`
- `SEO`, `Analisi strategica` -> `seo`
- `Shooting` -> `content-production`
- `Concorsi a premi`, `Gestione operativa` -> `concorsi-a-premi`
- `Social Media` -> `social-media`

Unmapped labels kept for manual review:

- `Studio`
- `Strategia`
- `Supporto documentale`

## SEO

- Yoast title and meta description were inventoried.
- Legacy `noindex` is preserved for the two noindex case studies.
- Legacy canonical is recorded in transform data but not reused as the new canonical.
- Redirect candidates are generated in `data/migrations/case-studies/redirects-case-studies.json`.

## Validation

Command:

```sh
pnpm migration:validate:case-studies
```

Checks currently covered:

- source snapshot exists;
- per-item REST and HTML raw snapshots exist;
- total source count;
- duplicate slug detection;
- service mapping extraction;
- client mapping presence;
- migration warning generation;
- URL map and redirect candidate generation.

## Manual Review

Review before final CMS import:

- VENITALY: `Supporto documentale` is unmapped and one media item has missing alt.
- Progetto-e: `Studio` is unmapped and media alt values are incomplete.
- Pazzo Design: `Studio` is unmapped and media alt values are incomplete.
- Sirene Blu 2024: `Strategia` is unmapped and media alt values are incomplete.
- BRB: `Strategia` is unmapped and media alt values are incomplete.
- App mobile Sirene Blu and VENITALY: both are legacy `noindex`; confirm whether they should remain noindex after migration.

## Next Required Step

Execute real CMS import using a secure authenticated channel:

- WP-CLI on `cms.netmarket.it`; or
- authenticated WordPress REST with Application Password; or
- a protected admin-only import endpoint in Netmarket Headless Core.

Do not apply production redirects yet.
