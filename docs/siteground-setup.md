# SiteGround Setup

Stato previsto per l'attivazione:

- Creare `cms.netmarket.it`.
- Installare WordPress moderno.
- Configurare SSL.
- Proteggere il CMS se necessario con HTTP Basic.
- Impostare noindex.
- Attivare plugin proprietario.
- Configurare permalink.
- Verificare `/wp-json/netmarket/v1/health`.
- Definire path deploy staging.
- Configurare backup e rollback.

Automazioni disponibili:

- `verify-siteground.yml`: verifica SSH read-only.
- `deploy-cms.yml`: copia e attiva `netmarket-headless-core` su `cms.netmarket.it`.
- `deploy-staging.yml`: pubblica `apps/web/dist` su `staging.netmarket.it`.

Hardening CMS:

- `cms.netmarket.it` è un'origine privata: Basic Auth protegge sito, REST API, admin e uploads.
- `robots.txt` resta pubblico con `Disallow: /`.
- `X-Robots-Tag: noindex, nofollow, noarchive` viene inviato dal CMS.
- I media non devono essere indicizzati dal dominio CMS; quando serviranno per SEO vanno esposti dal frontend pubblico o da un dominio/CDN pubblico dedicato.

Non usare `netmarket.it` come destinazione di test.
