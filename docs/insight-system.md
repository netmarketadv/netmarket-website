# Insight System

## Stato

Il sistema Insight pubblica:

- archivio `/insight/`;
- paginazione statica `/insight/2/`, `/insight/3/`, ecc.;
- archivi tematici `/insight/categoria/[slug]/` generati dalle categorie assegnate;
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

Sono stati rilevati 26 post pubblici legacy. Le 20 cover disponibili sono conservate nel frontend come fallback WebP responsive a 800, 1200 e 1600px; i sei articoli privi di featured image usano la superficie editoriale neutra. La migrazione dei media nel nuovo CMS non viene eseguita senza credenziali/autorizzazione di import.

## Archivio editoriale

L'archivio usa una gerarchia stabile: apertura con posizionamento e temi, cover story scelta dal flag `featured`, stream media-first asimmetrico e paginazione HTML numerata con URL persistenti. Le pagine categoria sono statiche, crawlable e presenti in sitemap; non dipendono da JavaScript.

La card canonica mostra categoria primaria, data, titolo, abstract breve e tempo di lettura. In assenza di immagine usa una superficie editoriale neutra, senza richieste rotte.

## Template articolo

La pagina comprende breadcrumb, categoria, H1 adattivo, deck, data, tempo di lettura, publisher/autore reale ed eventuale aggiornamento. La cover e prioritaria; le immagini successive restano lazy.

`prepareArticleContent()` usa `parse5` per aggiungere anchor deterministiche, evitare ID duplicati, correggere gli articoli legacy composti solo da H3 e generare un indice solo da quattro sezioni in su. Il corpo resta entro 44rem; l'indice e sticky su desktop e nativo/collassabile su mobile.

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

Il fallback legacy collega i servizi in modo conservativo dalle categorie pubbliche. Gli altri insight correlati sono limitati a 3 elementi, restano link crawlable e vengono ordinati per categorie e servizi condivisi. Le relazioni CMS esplicite verso progetti hanno priorita; in loro assenza il fallback usa i servizi comuni e non mostra progetti generici.

Il primo servizio correlato alimenta una CTA contestuale soft. In assenza di servizio, progetto, autore, related o cover, il relativo modulo non viene renderizzato e il layout resta valido.

## SEO

Ogni dettaglio emette:

- title da override CMS o titolo articolo;
- meta description da override CMS o fallback normalizzato entro i limiti schema;
- canonical assoluto verso `https://netmarket.it`;
- breadcrumb `Home > Insight > Titolo`;
- JSON-LD `Article` + `BlogPosting`, con `mainEntityOfPage`, publisher, lingua, immagine e date;
- `CollectionPage` + `ItemList` per archivio, pagine paginate e categorie;
- Open Graph e Twitter/X con override social del CMS e fallback sulla cover.

Staging resta noindex tramite policy ambiente.

## Performance e accessibilita

Gli stili del magazine sono route-specifici nei componenti Astro e non appesantiscono il CSS globale. Le immagini dichiarano dimensioni, `sizes`, `srcset` quando disponibile, decoding e priorita coerente con la posizione. Nessuna island o libreria client e richiesta.

Categorie, card, indice e paginazione sono navigabili da tastiera, usano landmark e `aria-current`. Il contenuto essenziale, le CTA e i correlati sono HTML statico e leggibile anche dai sistemi di retrieval.
