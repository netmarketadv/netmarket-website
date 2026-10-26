# Stape: rapporto conclusivo del candidate

Aggiornato il 26 ottobre 2026. Questo documento sostituisce il precedente resoconto del
candidate. [Audit iniziale](stape-pre-release-audit.md) e [guida loader](stape-custom-loader.md).

## 1. Stato: NO-GO per la pubblicazione

Le correzioni tecniche locali sono implementate e verificate. Il difetto motion della
baseline è risolto; pipeline, completezza CMS, promozione dell'artifact e rollback sono
rafforzati. Restano prerequisiti che richiedono operazioni esterne espressamente vietate
senza autorizzazione: pubblicazione dei contenuti CMS, configurazione del reviewer e
pubblicazione del branch/workflow. Non esiste ancora un artifact production completo.

Nessun push, merge, workflow remoto, deploy, rollback reale, modifica CMS, protezione GitHub,
container GTM o configurazione Stape è stato effettuato. La scelta del reviewer `netmarketadv`
è recepita nel payload locale; non equivale all'autorizzazione ad applicarlo.

### Blocchi effettivi

1. **CMS realmente vuoto:** `nm_service` e `nm_case_study` sono registrati ma senza contenuti
   in alcuno stato. Non è un problema risolvibile aggiungendo credenziali alla build.
2. **Environment production senza required reviewer:** branch ammesso soltanto `main`,
   ma l'approvazione obbligatoria non è configurata. Il nuovo guard lo rifiuta.
3. **Pipeline protetta non eseguita:** branch/workflow non pubblicati né integrati in main.
   L'accesso con i secret del runner e il candidate autenticato completo restano da provare.

Nessuna deroga, archivio fittizio o artifact parziale è stato utilizzato per ottenere GO.

## 2. Problemi risolti e implementazioni

### CMS e provenienza

Il preflight usa soltanto l'origine canonica HTTPS e i secret Basic Auth esistenti. Rifiuta
secret mancanti, challenge, risposte non JSON, archivi vuoti e assenza degli slug della
baseline. Non ripiega su richieste anonime. La successiva build registra le richieste
realmente eseguite: origine della risposta, autenticazione, hash, quantità, slug e paginazione.
L'audit rifiuta errori/accessi saltati, fallback, pagine incomplete e contenuti obbligatori
mancanti anche se sono cambiati dopo il preflight. I log sono redatti e il frontend è
controllato per impedire la distribuzione dei valori segreti noti.

La vecchia cache SSH, non consumata dal client frontend, non costituisce una fonte valida.
I 64 accessi saltati della precedente build locale non sono stati riclassificati come PASS:
ora rendono impossibile la produzione dell'artifact ufficiale.

### Motion isolato dall'integrazione Stape

Il titolo «Cosa resta dopo il progetto.» poteva rimanere con opacity 0 dopo ripristino dello
scroll: era già nel viewport ma sotto la soglia di partenza del reveal (94%). Inoltre il
layout dopo font/line split poteva rendere obsoleta la posizione memorizzata da ScrollTrigger,
particolarmente in WebKit. La correzione avvia lo stesso tween quando il target è già visibile;
un IntersectionObserver copre l'assestamento tardivo e completa i target già superati.
Preset, easing, durata, reduced-motion e visibilità senza JavaScript sono preservati.

Due test di regressione desktop/mobile verificano geometria fra 94% e 100% del viewport,
stato revealed, opacità di titolo e singole parole. Le assertion originali sono intatte.
I commit motion sono separati dal codice Stape e dalle modifiche di infrastruttura.

### Candidate riproducibile e promozione dello stesso artifact

`Deploy Production` ha due operazioni distinte: `candidate` produce l'artifact dopo
preflight, full validation, full E2E, invarianti tracking, build CMS autenticata, audit e
suite sullo stesso frontend statico. `deploy` richiede l'ID di quella run riuscita, SHA
identico, main canonico e artifact univoco non scaduto. Non ricostruisce il frontend.

Il manifest verifica SHA, provenienza CMS, hash dell'archivio e di ogni file, marcatori e
file essenziali. Archivio senza traversal/symlink/hardlink; estrazione in directory nuova e
confronto dell'esatto insieme di file. Ulteriore verifica immediatamente prima dell'upload.
Il controllo dello SHA live usa SSH autenticato read-only, evitando di interpretare la
challenge HTTP SiteGround come prova del contenuto. Il vecchio bootstrap Google è ammesso
soltanto per verificare esplicitamente la baseline attuale; il post-deploy richiede Stape.

Le E2E del candidate usano loopback, servizi tracking simulati e mock dei form; gli asset
immagine canonici restano leggibili via GET. Questo consente QA dell'artifact senza inviare
lead o eventi reali. Non certifica Iubenda o ricevitori GA4/Ads/Meta reali.

### Rollback protetto dopo pipeline riuscita

Workflow manuale autonomo `Rollback Production Manual`: piano read-only, successiva
esecuzione con nuova approvazione, SHA corrente e atteso nello snapshot, snapshot esatto,
digest e conferma esplicita. Condivide il lock con il deploy; la build candidate non blocca
un ripristino urgente. Controlla integrità prima/dopo, preserva il frontend rimosso e recupera
lo stato originale se fallisce la verifica immediata. Può ripristinare un frontend danneggiato
se il suo marcatore identifica ancora lo SHA; un'identità ignota è rifiutata. L'esecuzione
locale fuori dalla pipeline è vietata. Anche il rollback automatico usa lo snapshot esatto.

## 3. Commit e file

Baseline production/main verificata: `6b2e5524ba43e237229e0f56e86161edd87e1165`.
Branch: `codex/stape-release-candidate`, nel worktree dedicato.

| Commit | Contenuto |
| --- | --- |
| `637d9154c582cb1aef3b9c626fdc0126c25253f5` | Integrazione Stape isolata, primo gate e recovery; genitore esattamente la baseline |
| `35befc538453c983f9c5f437ba5fa7b0d991c328` | Documentazione iniziale |
| `1e04694d04bf425567b0931406e986b9db5429ce` | Correzione reveal dopo scroll ripristinato e test |
| `af1d255deaaba534c6939e06325633e8efceee5e` | Recovery layout tardivo e regressione cross-engine |
| `95505b0765587d6439fb3cb9cab3ef614b7ad571` | CMS completo obbligatorio, promozione artifact, controlli integrità e rollback, harness QA |

Questo report e le guide sono salvati in un successivo commit solo documentale, identificabile
con `git log -1`. Lo SHA del futuro artifact sarà quello effettivo su main, non un hash
abbreviato di questa tabella. Nessun merge/rebase/reset del checkout originale; lavori estranei
rimangono nel branch/worktree originale e non sono inclusi.

File interessati, raggruppati per responsabilità:

- Motion: `apps/web/src/lib/motion/gsap-motion.ts`,
  `apps/web/tests/e2e/motion-restoration.spec.ts`, `docs/motion-system.md`.
- Readiness CMS: `apps/web/src/lib/api/{client,provenance}.ts`,
  `infrastructure/scripts/{preflight-production-cms,audit-cms-provenance}.mjs`,
  `data/releases/stape-cms-inventory.json`.
- Artifact: `infrastructure/scripts/{build-production-candidate,verify-production-candidate,stage-production-candidate,check-production-candidate-run,candidate-secrets}.mjs`.
- Policy/rollback: i due workflow production,
  `infrastructure/config/production-environment.json`,
  `infrastructure/scripts/check-production-protection.mjs`,
  `manual-rollback-production.sh`, `manual-rollback-remote.sh`, `verify-production-release.sh`.
- QA: test `candidate-integrity`, `candidate-secrets`, `cms-preflight`, `cms-provenance`,
  `release-safety`; fixture E2E e import delle suite. Nessuna assertion preesistente rimossa.
- Guide: questo rapporto, `docs/stape-custom-loader.md`, `docs/deployment.md`.

Per l'elenco esatto completo e il diff: `git diff --stat 6b2e5524ba43e237229e0f56e86161edd87e1165 HEAD`
e `git show --stat 95505b0`. Nessuna modifica PHP/WordPress o dipendenze.

## 4. Verifiche eseguite e limiti

| Controllo | Esito reale |
| --- | --- |
| Full `pnpm validate`, codice finale | PASS: lint, typecheck, 118 test unitari, build, PHP lint, PHPCS, PHPStan, secret scan |
| Full E2E frontend statico, harness finale | **116/116 PASS**; mock dei servizi esterni, nessun evento reale |
| Motion originale + regressioni, Chromium/Firefox/WebKit | **9/9 PASS**, assertion originali preservate |
| Smoke Stape locale senza tracking | 1 PASS, 3 casi esclusivi production non applicabili |
| Smoke Stape configurazione production in loopback | 3 PASS, 1 caso esclusivo locale non applicabile; stessi 3 PASS anche WebKit |
| Invarianti Iubenda/consensi/eventi/dispatcher/loader | PASS, confronto byte per byte/hash contro baseline e loader approvato |
| Actionlint ufficiale 1.7.12, due workflow | PASS, checksum del tool verificato |
| Sintassi Bash e `git diff --check` | PASS |
| Integrità artifact/provenienza/policy/rollback | PASS nei test positivi e negativi su risposte simulate e filesystem sintetici |
| Piano rollback sul filesystem SiteGround reale | PASS read-only; nessuna scrittura/switch |
| CMS nativo e API pubbliche, policy GitHub reale | Verificati read-only; blocchi confermati |
| Audit production/provenienza dell'artifact ufficiale | **NON ESEGUITI**: CMS vuoto, workflow protetto non pubblicato/eseguito |
| Ricezione servizi tracking e consenso reali, Safari/AdBlock reali | **NON ESEGUITI**, collaudo autorizzato dopo deploy |

Runtime locale Node 24.19.0, dipendenze bloccate dal lockfile. Installato soltanto il browser
Firefox corrispondente alla versione Playwright già bloccata; nessuna dipendenza aggiornata.
Un tentativo esplorativo della suite contro Astro dev è stato interrotto perché privo della
trasformazione build degli heading: non è conteggiato come controllo superato. La verifica
valida è stata eseguita successivamente contro il frontend statico, 116/116.

La build locale usa i fallback deterministici previsti dal repository: verifica codice e UI,
**non è il candidate production**. Gli smoke loopback production simulano CMP e richieste
esterne; WebKit non equivale a un collaudo Safari reale. Evidenze locali non versionate:
`artifacts/stape-release-evidence/` (log, diff e indice). Nessuna certificazione inventata
di ricezione GA4/Ads/Meta o di conformità privacy/accessibilità.

## 5. Contenuti CMS, artifact e SHA

GET pubbliche: servizi 0, case study 0, insight 27. Verifica supplementare tramite alias SSH
canonico, solo lettura, sul sito `https://cms.netmarket.it`:
`wp_count_posts` per `nm_service` e `nm_case_study`, entrambi registrati, restituisce zero
per tutti gli stati, inclusi draft/private/trash. Plugin proprietario attivo 0.1.0.
Quindi la mancata autenticazione locale non spiega da sola gli archivi vuoti.

L'inventario versionato registra baseline, SHA256 delle fonti e 9 servizi/8 case study
necessari. Fonti già presenti nel repository: `apps/web/src/data/service-fallbacks.ts` e
`data/migrations/case-studies/case-study-transform-dry-run.json`. Non sono stati presentati
come contenuti provenienti dal CMS. L'intervento necessario è una pubblicazione CMS
**separata e autorizzata**, con revisione editoriale delle fonti e degli overlay esistenti,
mappatura schema/relazioni/SEO/noindex e media CMS reali; non riutilizzare ID provvisori 900x
o vecchi media ID senza verifica. Nessun contenuto inventato o import live eseguito.

I nomi dei secret Basic Auth sono presenti nel repository; SSH/percorso in production.
Valori non estratti, stampati o inventati. Validità delle credenziali nel runner ancora
non dimostrata. Il preflight autenticato e l'audit di ogni richiesta build devono riuscire
nella pipeline ufficiale dopo il popolamento CMS; nessun accesso saltato accettato.

**Artifact production: non prodotto. SHA artifact: non disponibile.** Dopo run riuscita,
`production-candidate-<sha>` conterrà `frontend.tgz`, `release.json` con SHA/run/timestamp,
hash archivio/file e provenienza, `cms-preflight.json`, `cms-access.jsonl` e log redatto.
Upload valido soltanto dopo tutti i gate. Output falliti restano diagnostici, mai promuovibili.
Retenzione artifact 14 giorni: se scaduto, nuova run candidate e nuova approvazione.

## 6. Autorizzazioni ancora necessarie

### Reviewer production: azione esatta pronta, non eseguita

Utente scelto: **netmarketadv**, ID GitHub verificato **257532415**. Payload locale pronto:
`infrastructure/config/production-environment.json`. Prevede required reviewer, nessuna
attesa aggiunta e policy custom main già esistente. Dopo autorizzazione esplicita:

```sh
gh api --method PUT repos/netmarketadv/netmarket-website/environments/production \
  --input infrastructure/config/production-environment.json
```

`prevent_self_review=false` permette al medesimo account umano di avviare e approvare
manualmente la run; non rappresenta un'approvazione indipendente di seconda persona.
L'agente non approva run. L'opzione preesistente `can_admins_bypass=true` non è stata
modificata né usata; il processo richiede comunque il normale gate. Prima di applicare il
payload ricontrollare la configurazione per preservare eventuali cambiamenti concorrenti.
Il guard ricontrolla reviewer e policy effettiva main dopo l'environment gate.
[Schema REST GitHub](https://docs.github.com/en/rest/deployments/environments).

Sono inoltre necessarie autorizzazioni distinte per pubblicare i contenuti CMS revisionati,
fare push del branch e portarlo in main tramite PR/review, avviare le run protette e infine
eseguire il deploy. Nessuna di queste operazioni è implicitamente autorizzata da questo report.
Il rilascio resta bloccato finché i contenuti non sono reali/completi e la run non è verde.

## 7. Pubblicazione e rollback

### Pubblicazione dopo lo sblocco

1. Revisionare i commit isolati e autorizzare push/PR/integrazione in main, senza importare
   il working tree originale. Configurare il reviewer con autorizzazione separata.
2. Completare l'intervento CMS approvato; controllare schema, media, slug, SEO e contenuti.
3. Avviare `Deploy Production`, `mode=candidate`, sullo SHA main approvato, con
   `expected_live_sha=6b2e5524ba43e237229e0f56e86161edd87e1165` se ancora attuale e conferma
   `BUILD NETMARKET CANDIDATE`. Approvazione umana dell'environment.
4. Pretendere tutti i gate verdi: accessi CMS autenticati/completi, nessun fallback,
   full quality/E2E, audit production, integrità e smoke. Esaminare artifact, manifest,
   provenienza e run. Il solo PASS locale non autorizza il rilascio.
5. Dopo approvazione esplicita del deploy, avviare `mode=deploy` sullo **stesso SHA**,
   `candidate_run_id=<run-riuscita>`, SHA live atteso e conferma `DEPLOY NETMARKET`.
   Nuova approvazione environment; download, verifica e pubblicazione degli stessi byte,
   nessuna rebuild/CMS fallback. Il controllo supporto form live avviene solo in questa fase.
6. Verificare SHA online, metadati, smoke funzionale/SEO/redirect e collaudo reale sotto.
   Con challenge SiteGround al runner, il workflow registra il differimento delle verifiche
   HTTP pubbliche: devono essere completate da rete esterna, non dichiarate PASS.

### Ripristino frontend senza modificare GTM/CMS/Stape

1. `Rollback Production Manual`, `mode=plan`, SHA online, SHA da ripristinare e snapshot
   esatto `before-<sha-online>`. Approvare production. Niente `latest`.
2. Esaminare integrità e digest restituiti. Per tornare dalla futura release Stape alla
   baseline, usare `restore_sha=6b2e5524ba43e237229e0f56e86161edd87e1165` e snapshot creato
   dal nuovo deploy. Non usare il digest dello snapshot storico sotto.
3. Solo dopo autorizzazione esplicita, nuova run `mode=execute`, stessi parametri,
   digest del piano e conferma `ROLLBACK NETMARKET <current_sha> TO <restore_sha>`.
   Nuova approvazione; controllo SHA/digest e integrità prima/dopo lo switch.
4. Verificare SHA e smoke online, poi ricezione tracking della versione ripristinata.
   Non ripubblicare container né cambiare WordPress o Stape.

Piano read-only verificato realmente sullo snapshot esistente
`before-6b2e5524ba43e237229e0f56e86161edd87e1165`, restore
`9ae69fd10588b36d2d915f69fcf39f1346b77ee3`, digest
`9fe3fec43045c45fc8ceda1ccde12f617037431be84907bd5589d32a23f9d519`.
È una prova di compatibilità del piano sul filesystem reale; nessuna esecuzione reale del
rollback e nessuna prova del futuro snapshot Stape, che non esiste ancora.

## 8. Tracking preservato e checklist di collaudo reale

Iubenda, Consent Mode v2, dataLayer, dispatcher Astro e script eventi restano identici alla
baseline. Invariati `page_view`, `generate_lead`, `contact`, `click_tel`, `click_whatsapp`,
`click_email`, deduplicazione Meta e container. Il loader originale mantiene esattamente URL
e query. DOMContentLoaded rimane invariato: anticiparlo senza validazione CMP reale sarebbe
un cambiamento non dimostrato; gli eventi già accodati restano nel dataLayer. Restano possibili
perdite se si lascia la pagina prima del bootstrap, non quantificate dai mock.

Nessun iframe noscript non protetto dal consenso. Una sola inizializzazione Stape, assenza
del vecchio loader Google concorrente, verificate nei test del frontend. GET read-only del
resource Google/Stape: versione 26, 47 tag, hash comune
`78c231199827f004179bedd109b778d58ceb6e53841e05ed82f18865a821f80d`.
Questo confronto non prova la ricezione di eventi remoti. Nessun container pubblicato.

Tutti i seguenti test sui servizi reali sono **NON ESEGUITI**. Dopo deploy autorizzato,
registrare per ogni prova SHA, timestamp UTC, browser/versione, stato consenso, event ID,
evidenze Network/Tag Assistant/DebugView/preview server/Meta Test Events/diagnostica Ads.

- [ ] SHA e ambiente online corretti; una sola richiesta bootstrap tramite Stape, nessun
  loader Google concorrente; URL/query originali, nessun errore CSP o JavaScript.
- [ ] Iubenda reale: primo accesso, nessuna scelta, rifiuto, soli consensi statistici,
  marketing, revoca e visita successiva; verificare default/update Consent Mode v2 e invii
  effettivi secondo il consenso. Senza JavaScript nessun iframe GTM.
- [ ] GA4 `page_view` e `generate_lead` ricevuti, transizioni Astro senza duplicati.
- [ ] Form confermato e contatti telefono/WhatsApp/email: `contact`, `click_tel`,
  `click_whatsapp`, `click_email`; errori/challenge form non generano lead. Test lead reali
  soltanto autorizzati e riconoscibili, concordando la gestione dei destinatari.
- [ ] Meta Pixel e Meta CAPI: PageView/Lead ricevuti, stesso `event_id` browser/server,
  una sola conversione deduplicata; nessun dato personale improprio nei payload/log.
- [ ] Google Ads: conversioni attese ricevute e diagnostica coerente con il consenso.
- [ ] Data Client ed endpoint server funzionanti. Con protezione Enhanced Ad Blocker i
  percorsi possono essere codificati: non richiedere necessariamente `/data` o `/g/collect`
  letterali; verificare elaborazione nel server preview.
- [ ] Chrome e Firefox normali, Safari reale macOS/iOS, AdBlock reale con filtri/versione
  registrati e confronto con evidenze della configurazione precedente. I test WebKit locali
  e i mock non sostituiscono questi controlli.
- [ ] Snapshot nuovo verificabile, piano rollback disponibile e collaudo pubblico completo
  anche se il runner SiteGround fosse intercettato da challenge.

Il GO finale richiede l'artifact autenticato completo e le approvazioni prima del rilascio;
l'accettazione operativa richiede anche il collaudo reale post-deploy. I controlli locali
completati non sono una garanzia su ricevitori esterni o future modifiche del CMS.
