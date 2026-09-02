# Insight System

## Stato

Il sistema Insight pubblica:

- archivio `/insight/`;
- paginazione statica `/insight/2/`, `/insight/3/`, ecc.;
- dettaglio `/insight/[slug]/`;
- RSS `/rss.xml`;
- sitemap con archivio, pagine paginated e dettagli articolo.

La fonte primaria e il CMS headless `GET /netmarket/v1/insights`. In staging la build deve usare la cache generata via SSH/WP-CLI da `infrastructure/scripts/pull-cms-cache.mjs`, perché `cms.netmarket.it` può rispondere `401` agli endpoint pubblici non autenticati.

Quando la cache o le credenziali CMS non sono disponibili durante il build, il frontend usa lo snapshot read-only in `data/migrations/insights/insight-transform-dry-run.json`. Questo fallback serve per sviluppo locale e resilienza, non deve essere la fonte attiva di staging.

## Migrazione legacy

Lo script `pnpm migration:validate:insights` valida lo snapshot acquisito via GET pubblici da `netmarket.it`.

Output principali:

- `data/migrations/insights/insight-inventory.json`;
- `data/migrations/insights/insight-transform-dry-run.json`;
- `data/migrations/insights/insight-url-map.json`;
- `data/migrations/insights/redirects-insights.json`;
- `docs/migration/insight-legacy-inventory.md`;
- `docs/migration/insight-url-map.md`;
- `docs/migration/insight-migration-report.md`.

Sono stati rilevati 26 post pubblici legacy. Al 2 settembre 2026 sono stati importati nel CMS staging/headless 26 articoli reali e il post demo WordPress `Hello world!` è stato messo in bozza.

Import CMS:

```sh
pnpm migration:insights:cms --dry-run --skip-media
pnpm migration:insights:cms
```

Opzioni:

- `--dry-run`: calcola create/update senza scrivere.
- `--skip-media`: aggiorna post e meta senza importare media.
- `--force`: riapplica contenuti e meta anche se il checksum coincide.

Lo script `infrastructure/migrations/insights/import-to-cms.mjs`:

- legge `data/migrations/insights/insight-transform-dry-run.json`;
- crea/aggiorna post WordPress `post` per slug;
- importa o riusa media WordPress tramite sideload;
- riscrive gli `img src` verso URL `cms.netmarket.it`;
- assegna categorie legacy;
- popola metadati `nmhc_*` per SEO, priority, featured e tracciamento migrazione;
- salva gli slug servizio legacy in `nmhc_migration_related_service_slugs`.

Nota tecnica: quando l'importer genera PHP dentro un template JavaScript, le regex PHP devono usare escape doppi nel template, ad esempio `\\s`. Un escape singolo può alterare il testo importato e corrompere meta description o contenuti.

## Authorship

Gli articoli legacy espongono come autore WordPress `NetAdmin`. Non viene creato automaticamente un legame Person se il CMS non fornisce `authorPerson`.

Quando `authorPerson` e presente:

- viene mostrato come autore visibile;
- puo alimentare `Article.author`;
- deve puntare a un contenuto `nm_person` pubblicato o comunque disponibile come summary API.

## Related Content

Le relazioni supportate dal payload Insight sono:

- `relatedServices`;
- `relatedCaseStudies`;
- `relatedResources`;

Il fallback legacy collega i servizi in modo conservativo dalle categorie pubbliche. Gli altri insight correlati sono limitati a 3 elementi e restano link crawlable.

Nel CMS attuale le relazioni `relatedServices` degli insight restano differite finché i servizi `nm_service` non sono pubblicati. L'importer tenta la risoluzione per slug e, quando non trova il servizio, mantiene gli slug in `nmhc_migration_related_service_slugs` per una successiva riconciliazione.

## SEO

Ogni dettaglio emette:

- title da override CMS o titolo articolo;
- meta description da override CMS o fallback normalizzato entro i limiti schema;
- canonical assoluto verso `https://netmarket.it`;
- breadcrumb `Home > Insight > Titolo`;
- JSON-LD `Article`.

Staging resta noindex tramite policy ambiente.

## Verifica Operativa

Dopo import o modifica massiva insight:

1. rigenerare cache CMS;
2. verificare `apps/web/.cms-cache/netmarket/v1/insights%3Fper_page%3D50%26sort%3Ddate.json`;
3. buildare con `CMS_API_CACHE_DIR="$PWD/apps/web/.cms-cache/netmarket/v1" pnpm build`;
4. assicurarsi che non compaiano warning di fallback sugli insight;
5. deployare staging;
6. controllare una pagina reale, ad esempio `/insight/black-friday-2025-tendenze-e-strategie-vincenti-per-le-pmi-italiane/`.
