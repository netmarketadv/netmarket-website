# SiteGround Verification

Data audit: 2026-09-02

## Stato

Esito corrente: `VERIFIED`

L'accesso SSH e il deploy path staging risultano configurati e funzionanti nell'environment GitHub `staging`.

## Evidenze

Verify dedicato:

- Workflow: `Verify SiteGround`
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629193220`
- Stato: success.

Deploy staging:

- Workflow: `Deploy Staging`
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629259420`
- Stato: success.
- `Deploy`: success.
- `Smoke staging`: success.

Deploy CMS:

- Workflow: `Deploy CMS Plugin`
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629190214`
- Stato: success.
- `Deploy and activate CMS plugin`: success.
- `Harden CMS access and indexing`: success.
- `Health check`: success.

## Guardrails Confermati

- `TARGET_HOST` staging deve essere `staging.netmarket.it`.
- `TARGET_HOST` CMS deve essere `cms.netmarket.it`.
- `SG_CMS_WORDPRESS_PATH` non puo essere `/` e deve puntare a un path contenente `cms.netmarket.it`.
- `SG_STAGING_DEPLOY_PATH` viene verificato prima del deploy.
- Lo script deploy rifiuta path non assoluti o con `..`.
- Lo script deploy verifica read/execute/write prima di `rsync`.

## Note Operative

Il path remoto e mascherato da GitHub perche proviene da secret e non deve essere riportato nei log pubblici.

Se un futuro deploy fallisce, verificare in questo ordine:

1. `SG_STAGING_DEPLOY_PATH`
2. ownership della directory remota;
3. permessi della directory remota;
4. utente SSH associato al path;
5. coerenza tra host SiteGround, known hosts e porta SSH.
