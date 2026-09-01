# Content Relationship Map

Questa mappa descrive chi possiede ogni dato e come le relazioni devono essere risolte dall'API.

## Source Of Truth

| Dato                       | Owner                           |
| -------------------------- | ------------------------------- |
| Logo cliente               | Client                          |
| Nome cliente               | Client                          |
| Scala visiva logo cliente  | Client                          |
| Foto persona               | Person                          |
| LinkedIn persona           | Person                          |
| Ruolo persona              | Person                          |
| Excerpt servizio           | Service                         |
| Metriche progetto          | CaseStudy                       |
| Cover progetto             | CaseStudy                       |
| Contenuto articolo         | Post                            |
| Autore editoriale articolo | Person relation su Post         |
| Dati aziendali Netmarket   | Global Settings                 |
| Recensioni Google          | Dataset Google Reviews separato |
| Testimonianze editoriali   | Testimonial                     |

## Relazioni Editoriali

| Source      | Relation             | Target      | Cardinality           | Owner       | Reverse lookup            |
| ----------- | -------------------- | ----------- | --------------------- | ----------- | ------------------------- |
| Service     | related_services     | Service     | many-to-many          | Service     | meta query su Service     |
| CaseStudy   | client               | Client      | many-to-one           | CaseStudy   | meta query su CaseStudy   |
| CaseStudy   | services             | Service     | many-to-many          | CaseStudy   | meta query su CaseStudy   |
| CaseStudy   | contributors         | Person      | many-to-many          | CaseStudy   | meta query su CaseStudy   |
| CaseStudy   | related_insights     | Post        | many-to-many          | CaseStudy   | meta query su CaseStudy   |
| Post        | author_person        | Person      | many-to-one           | Post        | meta query su Post        |
| Post        | related_services     | Service     | many-to-many          | Post        | meta query su Post        |
| Post        | related_case_studies | CaseStudy   | many-to-many          | Post        | meta query su Post        |
| Post        | related_resources    | Resource    | many-to-many          | Post        | meta query su Post        |
| Resource    | related_services     | Service     | many-to-many          | Resource    | meta query su Resource    |
| Resource    | related_posts        | Post        | many-to-many          | Resource    | meta query su Resource    |
| Resource    | author_person        | Person      | many-to-one           | Resource    | meta query su Resource    |
| Testimonial | client               | Client      | many-to-one           | Testimonial | meta query su Testimonial |
| Testimonial | case_study           | CaseStudy   | many-to-one           | Testimonial | meta query su Testimonial |
| Testimonial | service              | Service     | many-to-one           | Testimonial | meta query su Testimonial |
| Landing     | service              | Service     | many-to-one           | Landing     | meta query su Landing     |
| Landing     | case_study           | CaseStudy   | many-to-one           | Landing     | meta query su Landing     |
| Landing     | testimonial          | Testimonial | many-to-one           | Landing     | meta query su Landing     |
| Person      | linked_wp_user       | WP User     | many-to-one opzionale | Person      | user lookup via meta      |

## Related Content

La selezione manuale ha priorita. Se manca, l'API puo produrre fallback automatici semplici:

1. stesso Service;
2. stesso Sector;
3. stessa Capability;
4. `featured` e `priority`.

Non viene introdotto un algoritmo complesso. Ogni relazione automatica deve restare spiegabile editorialmente.
