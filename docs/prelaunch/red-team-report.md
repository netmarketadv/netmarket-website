# Red Team Report

Data audit: 2026-09-02
Branch: `chore/prelaunch-hardening`

## Scope

Verifica prelaunch del nuovo sito Netmarket su target consentiti:

- `staging.netmarket.it`
- `cms.netmarket.it`

`netmarket.it` rimane escluso da deploy, login, test distruttivi e modifiche. Eventuali verifiche sul dominio production sono consentite solo come richieste `GET`/`HEAD` read-only per migrazione o confronto.

## Stato Sintetico

Stato corrente: `STAGING READY WITH WARNINGS`

Motivi:

- Il dry-run del deploy staging sul branch `chore/prelaunch-hardening` e verde e conferma che il problema `rsync change_dir` e stato risolto.
- Il deploy reale staging e stato rilanciato dalla run `https://github.com/netmarketadv/netmarket-website/actions/runs/33615441326`; durante l'audit risultava ancora in build sul commit precedente alla cache fallback.
- `CMS_BASIC_AUTH_USER` e `CMS_BASIC_AUTH_PASSWORD` risultano configurati sia come repository secret sia nell'environment `staging`.
- Il CMS risponde, ma gli endpoint contenuto `services` e `insights` documentati tornano `404`; il frontend continua quindi a usare fallback/snapshot reali finche il plugin/API CMS online non viene riallineato.
- La Quality GitHub del commit `53b5a99` e completata con successo, E2E incluso.
- `staging.netmarket.it` e raggiungibile ma serve ancora la build `6117c244cd3c1159f901c149c94e178f36bde8f0`, quindi e stale rispetto a `53b5a99`.

## Findings

### Critical

- **CMS headless online non allineato alle route contenuto**  
  Run dry-run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33615147619`  
  Esito deploy dry-run: success.  
  Evidenza build: `CMS endpoint /services?per_page=50&sort=priority ha risposto con status 404` e warning analoghi su `/insights`.  
  Impatto: servizi, progetti e insight possono essere generati dagli snapshot/fallback invece che dalla fonte CMS primaria. Il sito resta deployabile, ma la content source non e ancora production-ready.

### High

- **Deploy staging precedente non operativo, ora corretto in dry-run**  
  Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33611336296`  
  Esito: failure nello step `Deploy`.  
  Evidenza: `rsync: [Receiver] change_dir#1 "***/" failed: Permission denied (13)`.  
  Correzione verificata: dry-run `https://github.com/netmarketadv/netmarket-website/actions/runs/33615147619` completato con successo nello step `Dry-run deploy plan`.

- **Staging remoto stale**  
  Evidenza: health check read-only su `https://staging.netmarket.it` valido, ma meta `netmarket-build` uguale a `6117c244cd3c1159f901c149c94e178f36bde8f0`.  
  Impatto: fino al completamento del deploy reale, le ultime modifiche presenti su `chore/prelaunch-hardening` non sono verificabili online.

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
- I loader di servizi, progetti e insight riutilizzano l'archivio gia caricato quando la source e fallback/snapshot, evitando chiamate CMS ripetute sui dettagli e riducendo tempi/rumore CI.

## Secret CMS

I secret sono presenti su GitHub. Per rigenerarli usare valori reali, non placeholder:

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

- Portare `deploy-cms.yml` e `verify-siteground.yml` sul default branch oppure registrarli in GitHub Actions, poi rilanciare il deploy CMS per riallineare le route `/netmarket/v1/services` e `/netmarket/v1/insights`.
- Rilanciare `Deploy Staging` dopo la cache fallback per ridurre il tempo di build quando il CMS non e allineato.
- Eseguire smoke remoto su `staging.netmarket.it` e verificare meta `netmarket-build` uguale allo SHA atteso.
