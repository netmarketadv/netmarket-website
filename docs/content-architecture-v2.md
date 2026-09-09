# Content Architecture V2

Questa architettura definisce il modello contenuti definitivo per il sito Netmarket headless. WordPress possiede contenuti, media, relazioni e metadati editoriali; Astro possiede template, layout, interazioni, SEO rendering e build statica.

## Principi

- Contenuto strutturato, template forti, sezioni opzionali controllate.
- Nessun page builder, nessun ACF, nessun clone generico di ACF.
- Dati reali separati dai mock temporanei.
- Relazioni salvate in modo queryable e validate per post type.
- API REST frontend-friendly, senza raw internals WordPress non necessari.
- Produzione `netmarket.it` mai usata come target operativo.

## Entità

| Entità               | Tipo             | Ruolo                                                         | URL frontend                 |
| -------------------- | ---------------- | ------------------------------------------------------------- | ---------------------------- |
| Homepage             | `page`           | Pagina iniziale, selezioni featured e contenuto istituzionale | `/`                          |
| Pagine istituzionali | `page`           | Agenzia, contatti, privacy, cookie, pagine editoriali uniche  | slug pagina                  |
| Insight              | `post`           | Articoli, guide, analisi, contenuti editoriali                | `/insight/[slug]/`           |
| Service              | `nm_service`     | Servizi strategici venduti da Netmarket                       | `/servizi/[slug]/`           |
| CaseStudy            | `nm_case_study`  | Progetti/casi studio                                          | `/progetti/[slug]/`          |
| Client               | `nm_client`      | Fonte unica per nome, logo e dati cliente                     | Nessun URL pubblico          |
| Person               | `nm_person`      | Team, autori e contributor                                    | Nessun URL pubblico iniziale |
| Testimonial          | `nm_testimonial` | Testimonianze editoriali curate                               | Nessun URL pubblico          |
| Resource             | `nm_resource`    | PDF, guide, template, checklist, futuri digital asset         | `/risorse/[slug]/`           |
| Landing              | `nm_landing`     | Landing controllate per campagne                              | Da definire per campagna     |

## Native WordPress

`page` resta la scelta per homepage, agenzia, contatti e pagine istituzionali. `post` resta la scelta per insight/articoli: titolo, contenuto, excerpt, immagine in evidenza, autore WP e date non vengono duplicati in campi custom.

Campi custom su `post`:

- subtitle/deck;
- Person autore opzionale;
- featured boolean;
- priority integer;
- related services;
- related case studies;
- related resources;
- SEO metadata.

## CPT

### Service

`nm_service` e pubblico nel CMS e nell'API. Il frontend usa `/servizi/[slug]/`; il rewrite WordPress rimane namespaced sotto `nm/servizi` per evitare conflitti nel CMS headless.

Campi principali:

- subtitle, short description, hero media;
- value proposition, problems, capabilities, process, technologies, results, FAQ;
- CTA;
- featured e priority;
- related services manuali;
- SEO.

Relazioni principali:

- Service -> related services;
- CaseStudy -> Service come fonte primaria per progetti correlati;
- Insight/Post -> Service;
- Resource -> Service;
- Testimonial -> Service.

### CaseStudy

`nm_case_study` e pubblico nell'API. Il frontend lo presenta come Progetto: `/progetti/[slug]/`.

Campi principali:

- client relation, eventuale nome cliente pubblico fallback;
- cover media, year, status, featured, priority;
- summary, context, challenge, objectives, approach, solution;
- metrics arbitrarie con label/value/context;
- gallery ordinata tramite Media Library, con alt e caption degli allegati;
- CTA;
- SEO.

### Client

`nm_client` e una entità editoriale non pubblicamente queryable: `public: false`, `show_ui: true`, `show_in_rest: true`. E la fonte unica per loghi clienti, nomi e strip loghi.

Campi:

- brand name;
- logo e logo inverso opzionale;
- official site opzionale;
- short description;
- visual scale;
- featured/marquee flag;
- priority;
- sectors.

### Person

`nm_person` diventa la strategia CMS definitiva per Team, autori e contributor. I dati statici TypeScript approvati restano fallback temporaneo finche il CMS non contiene le persone.

Campi:

- full name, display name, given name, family name;
- role;
- photo media;
- focal point/object position;
- LinkedIn;
- short bio;
- expertise;
- priority;
- visible in team;
- linked WP user ID opzionale.

### Testimonial

`nm_testimonial` gestisce testimonianze editoriali curate. Le recensioni Google restano dataset separato perché provengono da Google Business Profile/Places e hanno vincoli di fonte, rating e author profile.

Campi:

- quote;
- author name e role opzionale;
- client relation opzionale;
- source e source URL;
- rating;
- featured e priority;
- related case study;
- related service.

### Landing

`nm_landing` copre 3-4 landing iniziali con template controllati. Non contiene layout libero.

Campi:

- campaign ID;
- template variant;
- hero, lead, value proposition, proof;
- related service, case study, testimonial;
- CTA;
- form type/config;
- thank-you URL;
- tracking metadata;
- SEO/noindex.

### Resource

`nm_resource` prepara download e contenuti futuri, senza ecommerce.

Campi:

- description;
- cover media;
- resource type;
- file media;
- access type: `free`, `lead-gated`, `future-paid`;
- CTA;
- related services, posts, author Person;
- SEO.

## Tassonomie

| Tassonomia      | Uso                                                       | Associata a                                | Pubblica                   |
| --------------- | --------------------------------------------------------- | ------------------------------------------ | -------------------------- |
| `nm_sector`     | Verticali reali come Retail, Beauty, Food, B2B, Industria | Service, CaseStudy, Client, Post, Resource | predisposta, pagine future |
| `nm_capability` | Competenze/metodi trasversali                             | Service, CaseStudy, Post, Resource         | no archive iniziale        |
| `nm_technology` | Tecnologie, prodotti e piattaforme                        | Service, CaseStudy, Post, Resource         | no archive iniziale        |

Capability descrive cosa Netmarket sa fare; Technology descrive con quale strumento/piattaforma.

I termini `nm_sector` possono diventare pagine SEO future sotto `/settori/[slug]/`. Per ora restano tassonomia editoriale/API senza archive frontend.

## Global Settings

L'endpoint `settings` deve raggruppare semanticamente:

- company: ragione sociale, brand name, payoff, P.IVA;
- contact: telefono, email, indirizzo, orari;
- social: profili ufficiali;
- SEO defaults;
- navigation/footer representation;
- analytics e content defaults.

## API

Il namespace resta `netmarket/v1` per evitare breaking changes non necessari. Le response sono normalizzate, paginated negli archivi e detail-friendly nei singoli.

Gli archivi supportano `page`, `per_page`, `featured`, `sort` e filtri whitelisted pertinenti. Il massimo `per_page` e 50.

## SEO

- Organization e WebSite vengono generati globalmente.
- Service usa Schema.org `Service` solo per pagine servizio reali, con provider Organization.
- Person usa `Person` con `worksFor` Netmarket e `sameAs` LinkedIn quando presente.
- Article usa `Article`; se il post ha Person collegata, quella Person diventa autore.
- CaseStudy viene modellato come `CreativeWork` collegato alla pagina, non come finto tipo commerciale.
- Client non genera automaticamente Organization schema: solo quando viene realmente descritto e i dati sono sufficienti.

## Sitemap Proposta

```text
/
├── agenzia/
├── servizi/
│   └── [service]
├── progetti/
│   └── [case-study]
├── insight/
│   └── [article]
├── settori/
│   └── [sector] future/optional
├── risorse/
│   └── [resource]
├── contatti/
└── landing/ oppure slug campagna controllati
```
