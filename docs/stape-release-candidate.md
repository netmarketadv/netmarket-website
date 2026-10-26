# Candidate Stape isolato e prerequisiti di rilascio

## Esito: NO-GO production

Il codice del candidate è preparato e verificabile. Non è stato prodotto un artifact frontend
valido per il rilascio, perché la pipeline protetta non può essere eseguita senza pubblicazione
autorizzata e l'environment production non richiede attualmente reviewer. Le API CMS pubbliche
mostrano inoltre archivi servizi e case study vuoti. La full E2E rileva un difetto motion
riprodotto anche sulla versione pubblicata. Nessuno di questi blocchi è stato aggirato.

Nessun push, merge, workflow remoto, deploy, rollback reale, modifica WordPress,
modifica ai container GTM o alle configurazioni Stape è stato eseguito.

## Base e commit

- Riferimento iniziale: [audit pre-release](stape-pre-release-audit.md).
- SHA pubblicato, confermato con GitHub e controllo SSH del frontend:
  `6b2e5524ba43e237229e0f56e86161edd87e1165`.
- Checkout isolato: `/Users/enricotoso/.codex/worktrees/stape-release-candidate/netmarket-website`.
- Branch candidato: `codex/stape-release-candidate`.
- Commit del codice: `637d9154c582cb1aef3b9c626fdc0126c25253f5`.
  Il suo unico genitore è esattamente lo SHA pubblicato.
- Il branch originale `codex/stape-custom-loader`, la sua divergenza e tutte le modifiche
  locali preesistenti sono preservati nel checkout originale. Nessun merge/rebase/reset.
- Sono stati trasferiti solo il loader Stape approvato, il suo gate e i suoi test.
  Header, footer, landing, CSS, form, plugin WordPress e package analytics non sono stati
  riportati dal working tree: il candidate eredita le loro versioni già pubblicate.

Il commit successivo contiene questo rapporto e la documentazione operativa. Lo SHA effettivo
del futuro artifact sarà quello del checkout GitHub approvato, registrato dalla pipeline;
non si presenterà come artifact valido una build locale con contenuti saltati.

## File del candidate

### Tracking approvato

- `apps/web/src/components/analytics/TrackingController.astro`: sola sostituzione del bootstrap.
- `apps/web/src/lib/tracking-config.ts`: vincolo al container web corretto, production soltanto.
- `apps/web/tests/tracking-config.test.ts` e `tests/e2e-smoke/stape-tracking.spec.ts`:
  test del caricamento singolo, coda, CMP, lead e assenza di fallback senza JavaScript.
- `apps/web/tests/go-live.test.ts`: gate adeguati al bootstrap e alla pipeline protetta.

Il body del layout è quello già pubblicato, senza iframe noscript. La rimozione approvata del
fallback che erogava un pixel Ads senza CMP non richiede quindi un diff nel layout candidato.

### Build, provenienza e approvazione

- `.github/workflows/deploy-production.yml`: modalità esplicite `candidate` (default, senza deploy)
  e `deploy`; conferme differenti; controllo base live; full quality; artifact autenticato.
- `infrastructure/scripts/check-production-protection.mjs`: verifica effettiva, via API,
  di required reviewer e restrizione dei branch. Ripetuta dopo l'environment gate.
- `apps/web/src/lib/api/provenance.ts` e `client.ts`: registrazione opzionale delle richieste
  build effettive, schema validato, autenticazione presente, hash del payload, quantità e
  paginazione. Nessun contenuto CMS o credenziale nel report; nessuna modifica al risultato API.
- `infrastructure/scripts/audit-cms-provenance.mjs`: rifiuta richieste fallite/saltate/non
  autenticate, archivi principali vuoti e paginazione incompleta.
- `infrastructure/scripts/build-production-candidate.mjs`: consentito soltanto nella pipeline
  main canonica, checkout pulito e SHA corrispondente; rifiuta anche warning di fallback.
- `infrastructure/scripts/verify-stape-invariants.mjs`: confronto esatto con la produzione
  di Iubenda, Consent Mode, eventi e dispatcher; hash del loader approvato.
- `infrastructure/scripts/smoke-production.mjs` e `verify-production-release.sh`: verificano
  il nuovo bootstrap Stape, senza richiedere il vecchio ID in chiaro nel bootstrap codificato.
- `infrastructure/scripts/deploy-production.sh`: SHA completi obbligatori e confronto live
  prima delle operazioni di pubblicazione.
- `apps/web/tests/cms-provenance.test.ts`, `release-safety.test.js`: verifiche reali dei
  guardrail con risposte simulate e filesystem sintetici.
- `.gitignore`: solo output locali di candidate ed evidenze.

### Rollback e documentazione

- `.github/workflows/rollback-production.yml`: piano read-only e rollback manuale con
  environment production, reviewer effettivo, conferma esatta e serializzazione col deploy.
- `infrastructure/scripts/manual-rollback-production.sh`: wrapper con host/percorso canonici,
  secret esistenti, host key rigorosa, parametri espliciti e modalità dry-run predefinita.
- `infrastructure/scripts/manual-rollback-remote.sh`: verifica snapshot, SHA, asset, symlink,
  digest, integrità prima e dopo lo switch; conserva il frontend rimosso e recupera quello
  originale se la verifica immediata fallisce.
- `docs/stape-pre-release-audit.md`: riferimento storico importato dal branch sorgente.
- Questo rapporto e il collegamento nella guida deploy descrivono procedure e blocchi correnti.

## Provenienza CMS e artifact: verifica ancora bloccata

I nomi dei secret CMS esistono nel repository; quelli SSH e dei percorsi esistono
nell'environment production. Non sono stati letti valori, creati token, inventate credenziali
o usati account alternativi.

La pipeline proposta usa direttamente HTTPS autenticato agli endpoint
`https://cms.netmarket.it/wp-json/netmarket/v1/`, con i secret Basic Auth esistenti. È stata
rimossa dal workflow la lettura della vecchia cache SSH, che il client frontend non consumava.
Non viene abilitato un accesso pubblico alternativo nel client per aggirare la mancanza di secret.

Le GET diagnostiche pubbliche hanno restituito:

| Archivio   | Contenuti restituiti | Totale dichiarato |
| ---------- | -------------------: | ----------------: |
| servizi    |                    0 |                 0 |
| case study |                    0 |                 0 |
| insight    |                   27 |                27 |

Queste letture non sostituiscono una verifica autenticata nel runner. Evidenziano però che
l'assenza di credenziali locali non è l'unico possibile problema: finché i dati autenticati
non dimostrano archivi principali completi, il nuovo gate rifiuterà l'artifact. Non sono
stati caricati contenuti nel CMS né trasformati gli snapshot locali in finti dati CMS.

Solo dopo una run approvata e riuscita verrà caricato l'artifact
`production-candidate-<sha>`, contenente:

- `frontend.tgz`, inclusi `.htaccess` e marcatore `netmarket-release=<sha>`;
- `release.json`: SHA, base, run GitHub, timestamp, hash dell'archivio e di tutti i file,
  richieste CMS autenticate e hash dei payload;
- `cms-access.jsonl` e log build per la tracciabilità.

L'upload avviene dopo full quality, build autenticata, audit e smoke Stape sullo stesso
artifact servito in loopback. Un fallimento non produce un artifact dichiarato valido.
Il comando di build ufficiale rifiuta l'esecuzione locale fuori dalla pipeline: il rifiuto
è stato verificato senza simulare variabili GitHub per eludere il controllo.

## Test eseguiti

| Controllo                                  | Esito                                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Install pnpm frozen/offline                | PASS, nessun aggiornamento dipendenze                                                        |
| `pnpm validate`                            | PASS: lint, typecheck, 100 test unitari, build locale, PHP lint, PHPCS, PHPStan, secret scan |
| Test safety dopo adattamento SiteGround    | PASS: 13 test mirati inclusi rollback e go-live                                              |
| `pnpm test:e2e --workers=2`                | 113 PASS, 1 FAIL su 114                                                                      |
| Riproduzione mirata sulla baseline esatta  | Stesso FAIL motion, stesso titolo e stato opacity=0                                          |
| actionlint ufficiale 1.7.12                | PASS sui due workflow, checksum del tool verificato                                          |
| Bash syntax                                | PASS                                                                                         |
| Invarianti tracking e dispatcher           | PASS                                                                                         |
| Confronto pubblico Google/Stape            | PASS, resource versione 26, 47 tag, identico                                                 |
| Piano rollback su SiteGround               | PASS read-only, nessuna scrittura/switch                                                     |
| Policy GitHub effettiva                    | BLOCCO correttamente rilevato: required reviewer assente                                     |
| Pipeline autenticata / artifact production | NON ESEGUITI: non pubblicati né autorizzati                                                  |

La build locale nella full validation usa i fallback previsti per test deterministici:
serve al controllo del codice e **non è un candidate production completo**.

Il test fallito è `apps/web/tests/e2e/home.spec.ts:851`, controllo a riga 869 dopo reload
a metà pagina: l'h2 «Cosa resta dopo il progetto.» resta con opacity 0 e stato ready.
Una copia temporanea dell'esatto commit live, senza patch Stape, riproduce lo stesso risultato.
Le dipendenze utilizzate sono identiche e i package workspace non hanno diff dalla baseline.
Non è stato modificato il motion né disabilitato/attenuato il test per ottenere un PASS.
La full E2E resta quindi un blocco di release da risolvere in una correzione distinta.

Evidenze locali: `artifacts/stape-release-evidence/` nel worktree candidato. I log e le trace
si riferiscono a test locali; non contengono una certificazione di ricezione GA4/Ads/Meta.

## Tracking preservato

Il confronto verifica il blocco Iubenda/Consent Mode e tutto lo script eventi contro lo SHA
pubblicato, il dispatcher analytics byte per byte e il loader contro l'hash della versione
approvata. DOMContentLoaded e coda dataLayer restano invariati. Restano identici tutti i tag
e le regole per `page_view`, `generate_lead`, `contact`, `click_tel`, `click_whatsapp`,
`click_email`.

Il resource pubblico Google e Stape ha hash comune
`78c231199827f004179bedd109b778d58ceb6e53841e05ed82f18865a821f80d`.
Non sono stati pubblicati container o alterate configurazioni Stape.
Il collaudo su origine production, Iubenda reale, ricezione/deduplicazione GA4/Ads/Meta CAPI,
Data Client e ad blocker rimane successivo a un deploy esplicitamente autorizzato.

## Procedura di build e deploy, dopo lo sblocco

1. Ottenere autorizzazione separata per la pubblicazione del branch e la sua integrazione
   approvata in main. Non includere il working tree originale nel rilascio.
2. Configurare, con autorizzazione esplicita, un required reviewer production effettivo,
   conservando la restrizione main. La configurazione remota non è stata cambiata.
3. Rendere disponibili i contenuti CMS principali attraverso un intervento autorizzato
   distinto, o dimostrare in pipeline autenticata che i dati sono già completi. Nessuna
   deroga al gate CMS e nessuna modifica WordPress inclusa in questo candidate.
4. Risolvere il problema motion della baseline in una correzione separata e rieseguire
   full quality. Non derogare ai test per lanciare la run.
5. Avviare `Deploy Production` con `mode=candidate`, SHA live atteso e conferma
   `BUILD NETMARKET CANDIDATE`. Richiedere l'approvazione dell'environment. Questa modalità
   non esegue deploy, test POST al CMS, upload server o rollback.
6. Verificare artifact, provenienza CMS e risultato della run. Il GO dipende da questi esiti,
   non dalla sola presenza di questo commit o dal PASS della build locale.
7. Solo dopo approvazione esplicita `DEPLOY NETMARKET`, avviare `mode=deploy` sul commit
   approvato con lo SHA live atteso. La run ripete i gate e produce un nuovo artifact completo
   prima di pubblicare gli stessi file verificati nella run; non riusa automaticamente un
   artifact precedente se nel frattempo i contenuti CMS sono cambiati.
8. Verificare SHA online, smoke e collaudo tracking reale. Lo snapshot della versione prima
   del rilascio sarà `before-<nuovo-sha>`.

Se SiteGround presenta una challenge nelle letture CMS del candidate o nel controllo dello
SHA live atteso, questi gate falliscono anziché accettare contenuti saltati.

## Procedura rollback manuale, senza modificare GTM o CMS

Workflow `Rollback Production Manual`, disponibile soltanto dopo pubblicazione autorizzata:

1. Scegliere `mode=plan`, `current_sha=<sha-online>`,
   `restore_sha=<sha-atteso-nello-snapshot>`, `snapshot=before-<sha-online>`.
   `latest` non è accettato. Approvare l'environment production.
2. Il piano legge lo stato reale e verifica marcatore SHA, meta, robots, file essenziali,
   asset e assenza di symlink. Calcola il digest dell'intero frontend, esclusa soltanto
   `.well-known` che appartiene alla gestione hosting/certificati.
3. Per il ripristino reale, previa autorizzazione esplicita, scegliere `mode=execute` con
   gli stessi parametri, digest appena ottenuto e conferma esatta
   `ROLLBACK NETMARKET <current_sha> TO <restore_sha>`. Serve una nuova approvazione.
4. Il job ricontrolla le protezioni, prende lo stesso gruppo di concorrenza del deploy e
   verifica nuovamente stato e digest. Conserva il frontend rimosso, sposta lo snapshot e
   controlla l'integrità dopo il ripristino. Non richiama WordPress, GTM, DNS o Stape.

Il piano read-only è stato provato sullo snapshot esistente
`before-6b2e5524ba43e237229e0f56e86161edd87e1165`, contenente
`9ae69fd10588b36d2d915f69fcf39f1346b77ee3`; digest:
`9fe3fec43045c45fc8ceda1ccde12f617037431be84907bd5589d32a23f9d519`.
È una prova di compatibilità sul filesystem reale, non un rollback effettuato né la prova
del futuro snapshot Stape. Per tornare dalla futura release Stape alla produzione attuale,
usare lo snapshot creato da quella nuova release e un nuovo piano, non questo digest storico.

Il rollback automatico post-deploy usa ora anch'esso lo snapshot esatto e lo SHA precedente
verificato, senza scegliere genericamente `latest`.

## Blocchi residui per il GO

1. Required reviewer production effettivo assente; configurazione remota non autorizzata.
2. Workflow non pubblicati/eseguiti: accesso autenticato con secret e artifact completo non provati.
3. Servizi/case study pubblici vuoti; completezza CMS da risolvere/dimostrare senza deroghe.
4. Full E2E non verde per difetto motion riprodotto nella baseline, estraneo a Stape.

Questi blocchi richiedono autorizzazioni o interventi ulteriori rispetto ai vincoli attuali.
Il candidate e i controlli sono pronti per revisione; il giudizio production resta NO-GO.
