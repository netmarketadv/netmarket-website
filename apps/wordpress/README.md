# WordPress Headless

Questa directory contiene il codice WordPress proprietario per il CMS headless Netmarket.

- Dominio consentito per il CMS futuro: `cms.netmarket.it`.
- Non installare o modificare il sito WordPress esistente in produzione.
- Il plugin non richiede ACF, Elementor o page builder.

Installazione futura:

1. Installare WordPress manualmente su `cms.netmarket.it`.
2. Copiare `plugins/netmarket-headless-core` in `wp-content/plugins`.
3. Attivare `Netmarket Headless Core`.
4. Configurare permalink leggibili.
5. Verificare `/wp-json/netmarket/v1/health`.
