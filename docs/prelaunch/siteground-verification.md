# SiteGround Verification

Data audit: 2026-09-02

## Stato

Esito corrente: `NOT READY`

L'accesso SSH risulta configurato nei secret dell'environment `staging`, ma il deploy path remoto non e accessibile dall'utente SSH usato dal workflow.

## Evidenza

Workflow `Deploy Staging`, run `33611336296`:

```text
rsync: [Receiver] change_dir#1 "***/" failed: Permission denied (13)
```

Il valore del path e mascherato da GitHub perche proviene da secret, quindi non va riportato nei log.

## Hardening Applicato

`infrastructure/scripts/verify-siteground-connection.sh` ora verifica, quando `SG_STAGING_DEPLOY_PATH` e disponibile:

- path assoluto;
- assenza di `..`;
- directory esistente;
- permessi read;
- permessi execute;
- permessi write.

`infrastructure/scripts/deploy-staging.sh` esegue lo stesso preflight prima di backup e `rsync`.

Il deploy script ora sincronizza con:

```text
--rsync-path "cd <deploy-path> && rsync"
```

In questo modo il processo remoto entra prima nel document root e poi riceve i file su `.`, riducendo i casi in cui SiteGround consente `cd` via shell ma `rsync` fallisce il `change_dir` sul path assoluto.

## Azione Richiesta

Rilanciare `Verify SiteGround` dopo il push dell'hardening.

Se fallisce ancora, correggere uno di questi elementi in GitHub Environment `staging`:

- `SG_STAGING_DEPLOY_PATH`;
- ownership della directory remota;
- permessi della directory remota;
- utente SSH associato al path.

Il path deve puntare al document root effettivamente scrivibile di `staging.netmarket.it`, non a una directory di produzione.
