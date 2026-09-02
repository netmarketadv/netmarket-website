# Red Team Report

Data audit: 2026-09-02
Branch: `chore/prelaunch-hardening`

## Scope

Verifica prelaunch del nuovo sito Netmarket su target consentiti:

- `staging.netmarket.it`
- `cms.netmarket.it`

`netmarket.it` rimane escluso da deploy, login, test distruttivi e modifiche. Eventuali verifiche sul dominio production sono consentite solo come richieste `GET`/`HEAD` read-only per migrazione o confronto.

## Stato Sintetico

Stato corrente: `NOT READY`

Motivi:

- Deploy staging fallito su GitHub Actions con `rsync: change_dir#1 ... Permission denied (13)`.
- `CMS_BASIC_AUTH_USER` e `CMS_BASIC_AUTH_PASSWORD` non risultano configurati nei secret GitHub letti dai workflow.
- La Quality GitHub del commit `53b5a99` e completata con successo, E2E incluso.
- `staging.netmarket.it` e raggiungibile ma serve ancora la build `6117c244cd3c1159f901c149c94e178f36bde8f0`, quindi e stale rispetto a `53b5a99`.

## Findings

### Critical

- **Deploy staging non operativo**  
  Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33611336296`  
  Esito: failure nello step `Deploy`.  
  Evidenza: `rsync: [Receiver] change_dir#1 "***/" failed: Permission denied (13)`.  
  Impatto: le modifiche su `develop` non arrivano su `staging.netmarket.it`.

### High

- **CMS Basic Auth non configurata nei workflow**  
  Evidenza: nei log del workflow `Deploy Staging`, `CMS_BASIC_AUTH_USER` e `CMS_BASIC_AUTH_PASSWORD` sono vuoti. `gh secret list --repo netmarketadv/netmarket-website` mostra solo `SG_STAGING_DEPLOY_PATH`; `gh secret list --repo netmarketadv/netmarket-website --env staging` mostra gli SSH secret ma non i due secret CMS.  
  Impatto: la build usa fallback/snapshot invece dei contenuti reali quando il CMS e protetto da Basic Auth.

- **Staging remoto stale**  
  Evidenza: health check read-only su `https://staging.netmarket.it` valido, ma meta `netmarket-build` uguale a `6117c244cd3c1159f901c149c94e178f36bde8f0`.  
  Impatto: le ultime modifiche presenti su `develop` non sono verificabili online.

### Medium

- **Node locale fuori engine**  
  Evidenza: comandi locali riportano `Unsupported engine`, richiesto `>=22 <25`, locale `v26.7.0`.  
  Impatto: le verifiche locali restano utili, ma non sono perfettamente allineate al runtime CI.

## Hardening Applicato

- `deploy-staging.sh` ora verifica prima di `rsync` che il path remoto esista e sia leggibile, attraversabile e scrivibile dall'utente SSH.
- `deploy-staging.sh` usa quoting piu robusto per il path remoto.
- `deploy-staging.sh` ora esegue un probe temporaneo `touch/rm` e usa `--rsync-path "cd <deploy-path> && rsync"` per evitare problemi di `chdir` su path assoluti SiteGround.
- `deploy-staging.yml` ora fallisce esplicitamente se mancano `CMS_BASIC_AUTH_USER` o `CMS_BASIC_AUTH_PASSWORD`.
- `verify-siteground.yml` passa `SG_STAGING_DEPLOY_PATH` allo script di verifica.
- `verify-siteground-connection.sh` verifica anche accesso read/write al path staging quando il secret e presente.
- Le canonical e gli URL JSON-LD hardcoded nelle pagine editoriali sono stati normalizzati su `https://www.netmarket.it`, coerenti con homepage, servizi e sitemap production.
- `content-validate.mjs` e `health-check.sh` ora producono errori leggibili quando il CMS protetto richiede Basic Auth.

## Secret CMS Da Configurare

Usare valori reali, non placeholder:

```bash
gh auth status
gh secret set CMS_BASIC_AUTH_USER --repo netmarketadv/netmarket-website --body "USERNAME_BASIC_AUTH_CMS"
gh secret set CMS_BASIC_AUTH_PASSWORD --repo netmarketadv/netmarket-website --body "PASSWORD_BASIC_AUTH_CMS"
```

Opzionale ma consigliato se si vuole duplicare anche nello scope `staging`:

```bash
gh secret set CMS_BASIC_AUTH_USER --repo netmarketadv/netmarket-website --env staging --body "USERNAME_BASIC_AUTH_CMS"
gh secret set CMS_BASIC_AUTH_PASSWORD --repo netmarketadv/netmarket-website --env staging --body "PASSWORD_BASIC_AUTH_CMS"
```

## Prossime Verifiche

- Rilanciare `Verify SiteGround` dopo il push dell'hardening per avere un controllo diretto sul deploy path.
- Rilanciare `Deploy Staging` dopo configurazione secret CMS e correzione permessi/path.
- Eseguire smoke remoto su `staging.netmarket.it` e verificare meta `netmarket-build` uguale allo SHA atteso.
