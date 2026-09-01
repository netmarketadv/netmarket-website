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
- `ServiceProcess`;
- `ServiceTaxonomyList`;
- `ServiceRelatedContent`;
- `FAQBlock`;
- `ServiceCTA`.

Regola: se un gruppo dati è vuoto, la sezione non viene renderizzata.

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
- JSON-LD `Service` con `@id`, `serviceType`, `provider` verso Organization e `areaServed: Italy`.

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
