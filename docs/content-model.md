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

## Frontend Services

Il sistema frontend dei servizi è documentato in `docs/service-system.md`. Le pagine `/servizi/` e `/servizi/[slug]/` usano il CPT `nm_service` come fonte primaria e un fallback locale validato solo per build/staging quando il CMS non espone ancora servizi pubblicati.

I termini non vengono popolati automaticamente.

## Frontend Projects

Il sistema frontend dei progetti è documentato in `docs/project-system.md`. Le pagine `/progetti/` e `/progetti/[slug]/` usano `nm_case_study` come fonte primaria. Finche il CMS non contiene tutti i case study migrati e leggibili dal build, il frontend puo usare il fallback reale generato dagli snapshot legacy in `data/migrations/case-studies/`.

Il campo `additional_content` su `nm_case_study` conserva testo legacy non classificabile in modo affidabile dentro `context`, `challenge`, `approach` o `solution`.

## Frontend Insights

Il sistema Insight e documentato in `docs/insight-system.md`. Le pagine `/insight/`, `/insight/[page]/` e `/insight/[slug]/` usano i post WordPress come fonte primaria. Finche il CMS non espone contenuti importati e credenziali build, il frontend usa lo snapshot reale legacy in `data/migrations/insights/`.

Gli articoli supportano relazione opzionale con `nm_person` come autore editoriale e link reali verso servizi, progetti e risorse.

## Pagine Istituzionali

La pagina `/agenzia/` e documentata in `docs/agency-page.md`. La pagina `/contatti/` e documentata in `docs/contact-system.md`.

## Relazioni

Le relazioni multi-valore usano meta multiple WordPress, non array serializzati. La proprieta di ogni relazione e documentata in `docs/content-relationship-map.md`.
