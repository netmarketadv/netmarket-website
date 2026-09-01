# Modello Contenuti

Il modello attivo e definito in `docs/content-architecture-v2.md`, `docs/content-relationship-map.md` e `docs/content-relations.md`.

## CPT Attivi

- `nm_service`: servizi, esposti dal frontend come `/servizi/[slug]/`.
- `nm_case_study`: casi studio/progetti, esposti come `/progetti/[slug]/`.
- `nm_client`: clienti, entita CMS non pubblicamente queryable.
- `nm_person`: persone, team, autori e contributor.
- `nm_landing`: landing controllate per campagne.
- `nm_testimonial`: testimonianze editoriali.
- `nm_resource`: risorse e download futuri.

## Native WordPress

- `page`: homepage, agenzia, contatti, legal e pagine istituzionali.
- `post`: insight/articoli sotto `/insight/[slug]/`, con metadati custom solo per deck, Person autore, featured/priority e relazioni.

## Tassonomie

- `nm_sector`: verticali reali, associata a service, case study, client, post e resource.
- `nm_capability`: competenze/metodi, associata a service, case study, post e resource.
- `nm_technology`: tecnologie/prodotti/piattaforme, associata a service, case study, post e resource.

I termini non vengono popolati automaticamente.

## Relazioni

Le relazioni multi-valore usano meta multiple WordPress, non array serializzati. La proprieta di ogni relazione e documentata in `docs/content-relationship-map.md`.
