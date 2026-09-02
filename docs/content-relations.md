# Content Relations ADR

## Stato

Accettata.

## Decisione

Le relazioni tra contenuti vengono salvate come meta multiple WordPress:

```text
nmhc_related_services = 123
nmhc_related_services = 456
```

I campi one-to-one usano un singolo intero. I campi many-to-many usano piu righe meta con la stessa chiave. Il valore source of truth resta solo nella direzione editoriale indicata in `docs/content-relationship-map.md`; le relazioni inverse vengono risolte dall'API con meta query controllate.

## Perche

Il volume previsto per Netmarket non giustifica una tabella relazionale proprietaria ora. Meta multiple sono WordPress-native, queryable senza `LIKE`, compatibili con cancellazione/revisioni/cache e semplici da migrare.

## Validazione

Ogni campo relazione dichiara:

- target post type ammessi;
- cardinality;
- duplicati rimossi;
- ID inesistenti rimossi;
- contenuti non pubblicabili esclusi dalle API pubbliche;
- capability `edit_post` richiesta in admin.

## Reverse Lookup

L'API puo risolvere esempi come Service -> CaseStudy cercando `nmhc_services = serviceId` sui CaseStudy pubblicati. Non viene salvata una copia inversa per evitare divergenze.

## Alternative Valutate

- Array serializzato: scartato perche fragile e interrogabile solo via pattern.
- Tabella proprietaria: valida in futuro, ma overengineering per il volume attuale.
- Tassonomie usate come relazioni: scartato perche Client, Person e CaseStudy non sono classificazioni.

## Migrazioni

Le future migration devono essere idempotenti, versionate e non distruttive. Non devono mai cancellare vecchi meta senza backup o istruzione esplicita.
