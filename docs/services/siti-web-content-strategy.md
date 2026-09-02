# Siti web Content Strategy

## Scope

Pagina pilota: `/servizi/siti-web/`.

Obiettivo: trasformare la pagina servizio in un modello editoriale-commerciale per le future pagine Netmarket, senza creare una landing SEO generica.

## Fonti Interne

- `docs/design-system.md`: pattern Service detail, tipografia, proof, ProjectCard, motion e immagini servizio.
- `docs/service-system.md`: source of truth `nm_service`, relazioni e fallback consentiti.
- `docs/content-architecture-v2.md`: campi `nm_service`, ownership CMS/frontend e relazioni.
- `docs/content-relations.md`: relazioni WordPress native come meta multiple.
- `docs/migration/case-study-migration-report.md`: case study reali mappati a `siti-web`.
- `docs/migration/insight-legacy-inventory.md`: articoli legacy pertinenti a siti web, WordPress, accessibilità e web agency.
- Pagina legacy read-only `https://netmarket.it/realizzazione-siti-web/`.

## Fonti Esterne

- Google Search Central, helpful content: contenuti creati per persone, descrizioni utili, esperienza e qualità.
- Google Search Central, breadcrumb structured data: breadcrumb visibile e JSON-LD coerente.
- Bing Webmaster Guidelines: contenuto chiaro, focused, verificabile, semantic HTML, structured data accurato.
- OpenAI Publisher FAQ: contenuto pubblico crawlable, non bloccato e citabile per Search.
- SERP italiana su query: `realizzazione siti web`, `sviluppo siti web`, `agenzia siti web`, `web agency Padova`, `realizzazione siti web Padova`, `sito web aziendale`, `sviluppo WordPress`, `siti web SEO`, `siti web professionali`.

## Intent

- Commerciale: capire se Netmarket è il partner giusto per realizzare o rifare un sito.
- Locale: Padova è rilevante, ma non deve trasformare la pagina in doorway.
- Comparison: WordPress, custom/headless, SEO, performance, tempi e costo sono dubbi naturali.
- Informational supporting: la pagina deve spiegare cosa viene considerato in un progetto serio senza diventare una guida enciclopedica.

## SERP Insight

La SERP italiana è molto concentrata su:

- promessa locale “Padova”;
- sito vetrina, sito aziendale, ecommerce e landing;
- velocità, SEO, responsive e supporto;
- preventivo/prezzo;
- garanzie o tempi rapidi.

Decisione Netmarket: evitare headline costruite per keyword e differenziarsi su regia integrata: contenuti, UX, sviluppo, CMS, SEO tecnica, performance, marketing e manutenzione.

## Topic Model

- siti web aziendali;
- architettura contenuti;
- UX/UI;
- frontend;
- WordPress;
- Astro/headless;
- SEO tecnica;
- performance e Core Web Vitals come criterio, senza inventare punteggi;
- accessibilità;
- analytics e lead generation;
- integrazioni;
- migrazione SEO;
- aggiornabilità CMS.

## Struttura

1. Hero con breadcrumb, H1 umano e visual servizio.
2. Posizionamento: sito come sistema tra contenuti, tecnologia e marketing.
3. Value proposition.
4. Esigenze/problemi reali.
5. Proof: esperienza, storico case study, sistema CMS+SEO+UX.
6. Processo operativo.
7. Focus tecnico: WordPress, headless, performance.
8. Capability e tecnologie.
9. Case study e insight correlati.
10. FAQ commerciali reali.
11. CTA finale.

## Copy Decisions

- H1: mantiene “Siti web” per chiarezza e coerenza menu.
- SEO title: `Siti web aziendali | Netmarket`.
- Meta description: include Padova in modo naturale e una sola volta.
- CTA: resta `Parliamone`.
- Nessun prezzo o tempo fisso: non esistono policy pubbliche approvate.
- Nessun dato Lighthouse o incremento conversioni: non ci sono metriche verificate.

## Evidence Used

Case study reali collegati a `siti-web`, ordinati per pertinenza:

- Albertini Allestimenti: sviluppo sito web e SEO.
- Progetto-e: sviluppo sito web per fotovoltaico aziendale.
- Rigomar: sviluppo sito web e shooting fotografico.
- BRB: strategia digitale e nuovo ecosistema web/ecommerce.
- Sirene Blu 2024: concorso con sviluppo web collegato.

Insight pertinenti:

- `wordpress-scelta-migliore-per-sito-web-aziendale`;
- `accessibilita-siti-web-obbligatoria-dal-2025`;
- `migliore-web-agency-padova`;
- `sfide-opportunita-vantaggi-sito-web`;
- `importanza-del-mobile-friendly-design`.

## Images

- Hero: asset servizio trasparente `sviluppo-realizzazione-siti-web_netmarket.png`, renderizzato su frame grigio come da design system.
- Case study: media reali da snapshot legacy quando il CMS non espone ancora dettaglio e media completi.
- Nessuna immagine stock.

## SEO / GEO / AI

- Contenuto principale SSR/static HTML, leggibile senza JavaScript.
- Canonical production-ready: `https://www.netmarket.it/servizi/siti-web/`.
- Breadcrumb visibile e JSON-LD.
- JSON-LD `Service` collegato a Organization.
- Entity chiare: Netmarket, Padova, WordPress, WooCommerce, Astro, REST API, servizio Siti web.
- Claim principali collegati a prove o ridotti a scelte metodologiche verificabili.

## CMS

Il modello `nm_service` ha già i campi necessari per questa pagina pilota:

- `subtitle`;
- `short_description`;
- `hero_image`;
- `value_props`;
- `problems`;
- `process`;
- `results`;
- `faq`;
- `related_services`;
- SEO.

La pagina usa un content pack frontend transitorio per arricchire `siti-web` finché il CMS non viene aggiornato con gli stessi campi. Questo non cambia il template: i componenti restano data-driven e opzionali.

## Limiti

- Il CMS detail dei case study su staging risponde ancora `404` per alcuni slug migrati; la pagina usa snapshot legacy reali come fallback.
- Il content pack pilota deve essere migrato in `nm_service` quando sarà disponibile una pipeline contenuti CMS sicura.
- Non sono stati aggiunti redirect produzione.
