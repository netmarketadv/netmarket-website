# Service System

## Scope

Il dominio Services espone:

- archivio frontend `/servizi/`;
- dettaglio statico `/servizi/[slug]/`;
- fetch reale da `cms.netmarket.it/wp-json/netmarket/v1/services`;
- fallback locale validato per build e test quando il CMS non espone ancora servizi pubblicati;
- SEO, breadcrumb, JSON-LD `Service` e internal linking.

## Content Source

La sorgente ufficiale resta WordPress `nm_service`. Il frontend chiama:

- `GET /netmarket/v1/services?per_page=50&sort=priority`;
- `GET /netmarket/v1/services/{slug}` per il dettaglio quando disponibile;
- `GET /netmarket/v1/case-studies?service={slug}`;
- `GET /netmarket/v1/insights?service={slug}`;
- `GET /netmarket/v1/resources?service={slug}`.

Se il CMS risponde senza contenuti pubblicati o non è raggiungibile durante la build, Astro usa `apps/web/src/data/service-fallbacks.ts`. Il fallback contiene solo i nove servizi iniziali approvati per il progetto e deve essere rimosso o ridotto quando il CMS sarà completo.

Le immagini servizio caricate nel CMS sono normalizzate per slug dal frontend finche l'API non espone in modo definitivo tutti i media principali. Gli asset trasparenti vengono trattati come visual di servizio su fondo grigio, non come cover fotografiche.

## Initial Services

Ordine preliminare:

1. Siti web
2. Ecommerce
3. Software e integrazioni
4. SEO
5. Advertising
6. Social media
7. Branding e comunicazione
8. Content production
9. Concorsi a premi

Gli slug pubblici sono sempre sotto `/servizi/`.

## Archive

L'archivio non usa una griglia di card. La struttura è:

- hero editoriale;
- intro di posizionamento;
- service index a righe grandi con preview media;
- servizi featured;
- blocco integrazione;
- progetti selezionati come prova temporanea;
- client marquee;
- CTA con form.

Il componente principale è `ServiceIndex`, con righe data-driven e link crawlable.

## Detail

La pagina dettaglio è statica tramite `getStaticPaths`. Ogni sezione è opzionale:

- `ServiceDetailHero`;
- `ServiceIntro`;
- `ServiceProof`;
- `ServiceProcess`;
- `ServiceTaxonomyList`;
- `ServiceTechnicalFocus`;
- `ServiceRelatedContent`;
- `FAQBlock`;
- `ServiceCTA`.

Regola: se un gruppo dati è vuoto, la sezione non viene renderizzata.

### Esperienza canonica servizi

Ecommerce, Software e integrazioni, SEO, Advertising, Social media, Branding e comunicazione, Content production e Concorsi a premi usano `ServiceExperiencePage`. Il componente definisce una struttura comune affidabile, mentre `service-experiences.ts` assegna a ogni servizio una narrazione, una gerarchia, un colore di accento e un visual operativo distinti.

Il pattern canonico comprende:

- hero editoriale con beneficio, riferimento naturale a Padova e visual realizzato a codice;
- sintesi di valore e problemi espressi dal punto di vista del decisore aziendale;
- sistema del servizio, evidenze contestualizzate, metodo e perimetro delle competenze;
- progetti reali, insight e servizi collegati solo quando esistono fonti pubbliche;
- FAQ e CTA finale coerenti con il contenuto della pagina.

I visual non simulano risultati, dashboard cliente o metriche non documentate. Servono a spiegare un flusso: catalogo e checkout, integrazioni, ricerca, percorso advertising, piano social, sistema di marca, produzione multiformato o gestione del concorso. Sono HTML e CSS, restano leggibili senza JavaScript e non richiedono immagini above the fold.

Le differenze cromatiche sono accenti funzionali locali, non nuovi token globali del brand. Le pagine condividono griglia, tipografia, bordi, radius, CTA, motion e componenti Netmarket.

### Variante editoriale Siti web

`/servizi/siti-web/` usa una pagina editoriale dedicata, non il template generico. La pagina e progettata per imprenditori, responsabili marketing e decisori aziendali: parte dal valore del sito come asset aziendale, mostra progetti reali e traduce tecnologia, SEO e AI-readiness in benefici comprensibili.

Regole della variante:

- non duplicarla automaticamente sulle altre pagine servizio;
- usare sezioni e visual specifici solo quando il servizio ha contenuto reale sufficiente;
- mantenere contenuti essenziali nel DOM iniziale, senza dipendere da JavaScript;
- preferire prove reali e internal link contestuali a liste generiche;
- non promettere risultati non controllabili su AI Overview, ChatGPT o altri sistemi di risposta.
- il portfolio full-bleed e il bento delle tipologie sono pattern specifici della variante, non primitive da replicare automaticamente;
- il portfolio deve restare manualmente scorribile, fermarsi durante l'interazione e diventare statico con reduced motion;
- le card progetto sono link solo quando esiste un case study pubblico corrispondente.

## Related Content

Priorità:

1. relazioni già incluse nel payload service, come `relatedCaseStudies` e `relatedServices`;
2. query reverse/filtrate via API per case study, insight e resource;
3. nessun contenuto inventato come fallback.

Limiti frontend:

- case study: 3;
- insight: 3;
- resource: 3;
- related service: 4.

I link sono normali `<a>` e restano crawlable.

Quando il CMS non espone ancora relazioni complete, il dettaglio servizio puo usare snapshot reali gia validati come fallback per case study e insight, ordinati per pertinenza editoriale del servizio. Questo fallback non deve introdurre contenuti inventati e va sostituito da relazioni CMS appena disponibili.

## Service Content Packs

`/servizi/siti-web/` ha validato il modello pilota. Lo stesso approccio ora copre tutto il set iniziale dei servizi in `apps/web/src/data/service-pilots.ts`: ogni servizio ha copy, proof, FAQ, capability, tecnologie quando pertinenti, related service e priorità editoriali distinte. Il template resta generalizzabile: i componenti leggono solo dati strutturati e non contengono copy hardcoded del servizio.

I content pack devono essere migrati in `nm_service` quando il CMS dispone di una pipeline contenuti sicura o di editing manuale approvato. Finché `GET /services` non espone servizi pubblicati, restano fallback controllati per build e staging.

Schede strategiche:

- `docs/services/siti-web-content-strategy.md`;
- `docs/services/ecommerce-content-strategy.md`;
- `docs/services/software-e-integrazioni-content-strategy.md`;
- `docs/services/seo-content-strategy.md`;
- `docs/services/advertising-content-strategy.md`;
- `docs/services/social-media-content-strategy.md`;
- `docs/services/branding-e-comunicazione-content-strategy.md`;
- `docs/services/content-production-content-strategy.md`;
- `docs/services/concorsi-a-premi-content-strategy.md`.

## SEO

Archivio:

- title `Servizi | Netmarket`;
- description controllata;
- canonical assoluto verso `https://www.netmarket.it/servizi/`;
- breadcrumb `Home > Servizi`;
- `WebPage` globale dal layout.

Dettaglio:

- title da SEO override CMS, poi titolo servizio;
- meta description da SEO override, poi short description, excerpt, subtitle, fallback controllato;
- canonical assoluto verso `https://www.netmarket.it/servizi/[slug]/`;
- breadcrumb `Home > Servizi > Nome servizio`;
- JSON-LD `Service` con `@id`, `serviceType`, `provider` verso Organization e `areaServed`; tutte le pagine definitive dichiarano Padova come `City` e Italia come `Country`;
- JSON-LD `FAQPage` quando le domande sono presenti e visibili nella pagina;
- social title, description e immagine da un progetto reale collegato, con fallback al media del servizio.

Staging resta `noindex, nofollow, noarchive` tramite robots environment.

## Motion

Il sistema usa i data attribute già documentati:

- `line` per hero e heading editoriali;
- `up` per righe, liste e related content;
- `media` per immagini hero e preview;
- `scale` per CTA e blocchi di integrazione.

Nessun contenuto dipende da JavaScript. Con reduced motion le sezioni restano visibili senza animazioni.

## Accessibility

- breadcrumb con `aria-label`;
- heading hierarchy lineare;
- CTA e related content come link reali;
- FAQ tramite componente accordion esistente;
- preview media con alt dal CMS o fallback tecnico documentato nel dataset locale;
- layout mobile esplicito sotto 900px e 560px.

## CMS Gaps

I campi già supportati coprono hero, value props, problems, process, FAQ, tassonomie, CTA e related services/case studies.

Mancano ancora nel payload service:

- related insights manuali;
- related resources manuali;
- descrizione estesa per termini capability e technology;
- media dedicati oltre hero/featured image.

Per ora insight e resource arrivano tramite query filtrata `service={slug}`.
