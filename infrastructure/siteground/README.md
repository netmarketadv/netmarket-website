# SiteGround

Questa directory documenta la configurazione SiteGround consentita. Non contiene host, utenti, porte, path o chiavi reali.

Target consentiti:

- `staging.netmarket.it` per frontend statico.
- `cms.netmarket.it` per WordPress headless.
- `netmarket.it` esclusivamente per il go-live tramite pipeline production protetta.

Non sono consentiti upload production manuali. `deploy-production.sh` accetta soltanto
`netmarket.it`, richiede un path assoluto appartenente a `/netmarket.it/` e termina prima
di scrivere se artifact, environment o destinazione non sono conformi.

Il frontend staging viene pubblicato da GitHub Actions con rsync diretto su `staging.netmarket.it`. Prima di ogni deploy reale viene salvato uno snapshot compresso della versione precedente nella directory `.netmarket-backups` accanto al document root, così `infrastructure/scripts/rollback-staging.sh` può ripristinare rapidamente l'ultima build nota.

In production l'artifact viene invece caricato in una release separata e sostituisce il
document root tramite rename sullo stesso filesystem. La directory precedente resta in
`.netmarket-rollbacks/before-<sha>` e può essere ripristinata con
`rollback-production.sh`. La directory `.well-known` viene preservata.
