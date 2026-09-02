# Insight System

## Stato

Il sistema Insight pubblica:

- archivio `/insight/`;
- paginazione statica `/insight/2/`, `/insight/3/`, ecc.;
- dettaglio `/insight/[slug]/`;
- RSS `/rss.xml`;
- sitemap con archivio, pagine paginated e dettagli articolo.

La fonte primaria e il CMS headless `GET /netmarket/v1/insights`. Quando le credenziali CMS non sono disponibili durante il build, il frontend usa lo snapshot read-only in `data/migrations/insights/insight-transform-dry-run.json`.

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

Sono stati rilevati 26 post pubblici legacy. La migrazione media verso il nuovo CMS non viene eseguita senza credenziali/autorizzazione di import: il frontend non renderizza immagini locali mancanti per evitare 404.

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

## SEO

Ogni dettaglio emette:

- title da override CMS o titolo articolo;
- meta description da override CMS o fallback normalizzato entro i limiti schema;
- canonical assoluto verso `https://netmarket.it`;
- breadcrumb `Home > Insight > Titolo`;
- JSON-LD `Article`.

Staging resta noindex tramite policy ambiente.
