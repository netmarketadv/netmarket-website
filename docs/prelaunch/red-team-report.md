# Red Team Report

Data audit: 2026-09-02
Branch: `chore/prelaunch-hardening`

## Scope

Verifica prelaunch del nuovo sito Netmarket su target consentiti:

- `staging.netmarket.it`
- `cms.netmarket.it`

`netmarket.it` rimane escluso da deploy, login, test distruttivi e modifiche. Le richieste al dominio production sono consentite solo come `GET`/`HEAD` read-only per migrazione o confronto.

## Stato Sintetico

Stato corrente: `STAGING READY WITH WARNINGS`

Evidenze:

- Ultimo commit verificato: `99d79ffcfb38449a864d1e1f1b59c437e382098a`.
- Quality GitHub verde: `https://github.com/netmarketadv/netmarket-website/actions/runs/33627611115`.
- Deploy CMS Plugin verde: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629190214`.
- Verify SiteGround verde: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629193220`.
- Deploy Staging reale verde: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629259420`.
- Smoke remoto verde: `Smoke staging ok: build 99d79ffcfb38449a864d1e1f1b59c437e382098a su staging.`
- `/nod/` pubblicato su staging con HTTP 200 e `x-robots-tag: noindex, nofollow, noarchive`.
- `CMS_BASIC_AUTH_USER`, `CMS_BASIC_AUTH_PASSWORD`, `SG_CMS_WORDPRESS_PATH`, SSH e deploy path staging risultano configurati nei secret GitHub.

## Findings

### Critical

- Nessun blocker tecnico critico aperto sul deploy staging corrente.

### High

- **Content source CMS non ancora completa come source of truth editoriale**  
  Il flusso tecnico CMS e deploy funziona, ma il sito usa ancora fallback/snapshot reali per alcune aree quando i contenuti headless non sono presenti o completi. Impatto: staging e deploy sono funzionanti, ma prima del go-live va deciso formalmente se accettare i fallback o completare il popolamento CMS.

### Medium

- **Node locale fuori engine**  
  Evidenza: comandi locali riportano `Unsupported engine`, richiesto `>=22 <25`, locale `v26.7.0`. CI usa Node configurato dal workflow e passa.

- **Staging intentionally noindex**  
  `robots.txt` risponde `Disallow: /` e le pagine hanno header `x-robots-tag: noindex`. Corretto per staging, da non modificare prima del go-live autorizzato.

- **Review alt immagini ancora manuale**  
  Il crawler segnala immagini con `alt=""`. Molte sono decorative, ma prima del go-live serve review manuale per distinguere decorative reali da immagini contenuto.

## Hardening Applicato

- `deploy-staging.sh` verifica prima di `rsync` che il path remoto esista e sia leggibile, attraversabile e scrivibile dall'utente SSH.
- `deploy-staging.sh` usa quoting piu robusto per il path remoto.
- `deploy-staging.sh` esegue un probe temporaneo `touch/rm` e usa `--rsync-path "cd <deploy-path> && rsync"`.
- `deploy-staging.yml` fallisce esplicitamente se mancano `CMS_BASIC_AUTH_USER` o `CMS_BASIC_AUTH_PASSWORD`.
- `deploy-cms.yml` ha `permissions: contents: read`, timeout, concurrency e guard sul path CMS.
- `verify-siteground.yml` ha `permissions: contents: read`, timeout e concurrency.
- Le canonical della homepage sono state normalizzate su `https://www.netmarket.it`, coerenti con pagine interne e sitemap production simulation.
- `/nod/` e stato aggiunto a header, sitemap, test e documentazione.
- Il final audit produce inventari, URL decision matrix, redirect master e manual review in `data/final-audit/` e `docs/final-audit/`.

## Verifiche Locali

- `pnpm validate`: success.
- `pnpm test:e2e`: success, 26 test passati.
- Production metadata simulation: success con `PUBLIC_SITE_URL=https://www.netmarket.it`, 54 pagine generate.
- Secret scan: success.
- `pnpm content:validate`: non eseguito con credenziali locali; senza Basic Auth il CMS risponde correttamente `401`.

## Verifiche Remote

- Quality: success, inclusi lint, typecheck, unit, Astro build, WordPress, secret scan, E2E.
- CMS plugin deploy: success, inclusi activate, harden e health check.
- Verify SiteGround: success.
- Deploy staging: success, inclusi cache CMS, fast frontend tests, build, deploy e smoke.
- Smoke locale read-only su staging: success con SHA atteso.
- `curl -I https://staging.netmarket.it/nod/`: HTTP 200, `x-robots-tag: noindex, nofollow, noarchive`.
- `curl https://staging.netmarket.it/robots.txt`: `Disallow: /`.
- `curl https://cms.netmarket.it/wp-json/`: HTTP 401, coerente con CMS protetto da Basic Auth.

## Prossime Verifiche Prima Del Go-Live

- Completare o accettare formalmente la source dati CMS per servizi, progetti, clienti, team, risorse e testimonial.
- Completare visual QA manuale su staging.
- Eseguire Lighthouse/performance staging.
- Validare redirect strategy con dati Search Console, Analytics e backlink.
- Non attivare production robots, DNS, IndexNow o Search Console senza autorizzazione esplicita al go-live.
