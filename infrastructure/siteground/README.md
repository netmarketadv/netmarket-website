# SiteGround

Questa directory documenta la configurazione SiteGround consentita. Non contiene host, utenti, porte, path o chiavi reali.

Target consentiti:

- `staging.netmarket.it` per frontend statico.
- `cms.netmarket.it` per WordPress headless.

Il sito attuale `netmarket.it` non è un target di test o deploy.

Il frontend staging viene pubblicato da GitHub Actions con rsync diretto su `staging.netmarket.it`. Prima di ogni deploy reale viene salvato uno snapshot compresso della versione precedente nella directory `.netmarket-backups` accanto al document root, così `infrastructure/scripts/rollback-staging.sh` può ripristinare rapidamente l'ultima build nota.
