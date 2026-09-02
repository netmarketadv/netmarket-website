# 0006 Content Relationships

## Stato

Accettata.

## Contesto

Service, CaseStudy, Client, Person, Resource, Testimonial e Post devono essere collegabili dal CMS e consumabili da Astro durante la build statica. Le relazioni devono essere queryable e non devono dipendere da stringhe serializzate cercate con `LIKE`.

## Decisione

Usiamo meta multiple WordPress per relazioni multi-valore e meta interi singoli per relazioni one-to-one. La direzione proprietaria e documentata in `docs/content-relationship-map.md`.

## Conseguenze

La soluzione rimane WordPress-native, semplice da validare e sufficiente per il volume previsto. Se in futuro il volume o le query cresceranno molto, si potra migrare a una tabella relazione proprietaria con migration idempotente.
