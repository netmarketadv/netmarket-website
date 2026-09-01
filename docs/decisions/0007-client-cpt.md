# 0007 Client CPT

## Stato

Accettata.

## Contesto

Il sito mostra loghi, progetti e clienti in piu sezioni. Mantenere nomi e loghi hardcoded produce duplicazioni e incoerenze.

## Decisione

Introduciamo `nm_client` come CPT editoriale non pubblico: `public: false`, `show_ui: true`, `show_in_rest: true`, `publicly_queryable: false`. Il Client e la fonte unica per logo, nome, sito ufficiale opzionale, priorita e presenza nella striscia clienti.

## Conseguenze

CaseStudy, Testimonial e componenti clienti possono riferirsi allo stesso record. Il frontend non genera pagine cliente pubbliche finche non esiste una decisione editoriale esplicita.
