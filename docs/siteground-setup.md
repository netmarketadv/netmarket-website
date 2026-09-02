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
- `infrastructure/scripts/pull-cms-cache.mjs`: legge il CMS via SSH/WP-CLI e crea la cache REST usata dalla build Astro.

Hardening CMS:

- `cms.netmarket.it` è un'origine privata: Basic Auth protegge sito, REST API, admin e uploads.
- `robots.txt` resta pubblico con `Disallow: /`.
- `X-Robots-Tag: noindex, nofollow, noarchive` viene inviato dal CMS.
- I media non devono essere indicizzati dal dominio CMS; quando serviranno per SEO vanno esposti dal frontend pubblico o da un dominio/CDN pubblico dedicato.

Path CMS WordPress attuale:

```text
/home/customer/www/cms.netmarket.it/public_html
```

Questo path deve essere salvato come `SG_CMS_WORDPRESS_PATH` nel GitHub Environment `staging`. Non usare il document root staging per comandi WP-CLI CMS.

Il CMS può richiedere Basic Auth anche per REST e uploads. Per questo i workflow non devono dipendere da `curl` anonimo verso `cms.netmarket.it`, ma dal pull cache via SSH/WP-CLI.

Non usare `netmarket.it` come destinazione di test.
