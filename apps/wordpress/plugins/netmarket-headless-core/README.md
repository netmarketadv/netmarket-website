# Netmarket Headless Core

Plugin proprietario per modellare contenuti Netmarket senza ACF o page builder.

## Funzioni iniziali

- CPT attivi: `nm_service`, `nm_case_study`, `nm_landing`.
- CPT predisposti ma non attivi: `nm_testimonial`, `nm_resource`.
- Tassonomie: `nm_sector`, `nm_capability`, `nm_technology`.
- Metabox accessibili con nonce, capability check, sanitizzazione e validazione.
- REST read-only namespace `netmarket/v1`.

I repeater salvano array sanitizzati compatibili con metadata WordPress; l'interfaccia iniziale accetta JSON normalizzato per evitare serializzazioni PHP incontrollate.

## Compatibilità

- PHP 8.2+.
- WordPress 6.6+.
- Multisite: documentato come compatibilità futura; non viene forzato supporto network-wide in questa fase.
