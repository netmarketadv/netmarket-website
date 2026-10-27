# Stape — resoconto operativo e checkpoint di rilascio

Aggiornato il **27 ottobre 2026**. Questo è il rapporto unico corrente; l'
[audit iniziale](stape-pre-release-audit.md) resta storico e la
[guida loader](stape-custom-loader.md) descrive il bootstrap approvato.

## 1. Stato effettivo

**Preparazione locale completata; pubblicazione in attesa delle autorizzazioni A–D sotto.**
Il rilascio non è ancora GO: manca l'esecuzione delle operazioni live richieste per ottenere
un artifact autenticato e completo. Non è stato dichiarato riuscito un deploy inesistente.

Sono implementati il ripristino fedele dei contenuti CMS, l'importer protetto e reversibile,
la verifica del contenuto autenticato, la correzione motion e i controlli della release.
Il CMS live è ancora vuoto per servizi, case study e clienti: il suo popolamento non era
autorizzato. Nessun push, PR remota, merge, deploy, rollback reale, modifica alle protezioni,
plugin WordPress, container GTM o configurazione Stape è stato eseguito.

Produzione riconfermata via SSH read-only e GitHub main:
`6b2e5524ba43e237229e0f56e86161edd87e1165`. Nessun nuovo frontend è online.

## 2. Contenuti ricostruiti e confrontati

Il [manifest completo](../data/releases/stape-cms-import.json) contiene:

| Oggetti | Quantità | Origine e trattamento |
| --- | ---: | --- |
| Servizi | 9 | Fallback versionati + overlay/pilot già pubblicati, senza nuovi testi |
| Case study | 8 | Snapshot storico + trasformazioni/media già presenti nella baseline |
| Clienti di supporto | 7 | Nomi, slug e loghi già presenti nei payload dei progetti |
| Allegati | 38 | Originali verificati, con alt delle fonti; nessun allegato esistente modificato |

Digest SHA256 esatto del manifest approvabile:

```text
a00a92281f7ac5b2b0eed79c745da6c5b060eb2793c7d86f3502bb33fb8926b4
```

Le fonti includono `service-fallbacks.ts`, `service-pilots.ts`, `service-experiences.ts`,
`lib/services/content.ts`, `lib/projects/content.ts`, `presentation.ts`,
`sirene-blu-media.ts` e `case-study-transform-dry-run.json`. Il manifest registra hash
SHA256, provenienza e riferimenti simbolici; gli ID sintetici dei fallback non diventano
ID WordPress. Relazioni e media saranno risolti con gli ID realmente creati dal CMS.
L'estrazione deriva dal commit `30fd5ef`, con le fonti dichiarate ancora identiche nel candidate.

**Confronto pubblicato: 17/17 testi principali, 17/17 titoli, 17/17 descrizioni identici.**
La GET HTTP delle pagine ha ricevuto 403: il confronto è stato effettuato sui 17 file HTML
realmente distribuiti nel document root, letti via SSH, insieme al marcatore SHA della
baseline. Nessuna challenge aggirata e nessuno script di tracking eseguito.
Il [confronto versionato](../data/releases/stape-cms-published-comparison.json) conserva
hash e risultati; gli HTML originali sono nelle evidenze locali.

I 38 riferimenti media sono stati verificati via GET contro le copie pubblicate. Per quelli
presenti nel repository il confronto dei byte è esatto. Gli otto originali CMS necessari
alla riproducibilità offline sono conservati in `data/releases/stape-cms-media/`; gli altri
sono già in `apps/web/public`. Il piano non dipende da futuri download modificabili.
Nel manifest sono normalizzati soltanto due MIME dichiarati erroneamente PNG nelle fonti: i byte reali di
VENITALY e product photography sono WebP. Non è stata convertita alcuna immagine.
WordPress potrà generare normalmente i propri derivati responsive dagli originali.

Restano i due noindex già pubblicati (VENITALY e app Sirene Blu), gli altri sei progetti
restano indicizzabili. I campi storici vuoti restano vuoti; niente metriche, date, relazioni
o testi inventati. Non emerge una decisione di riscrittura editoriale necessaria: si chiede
l'approvazione della pubblicazione di questo pacchetto, non di contenuti nuovi da redigere.

## 3. Importazione, simulazione e rollback dei contenuti

Implementazione in `infrastructure/migrations/stape/` e
`infrastructure/scripts/import-stape-cms.sh`; workflow separato
`Import Stape CMS Content`, esclusivamente su main e environment production protetto.
Non deploya il plugin WordPress e non distribuisce il frontend.

L'importer è **create-only**: rifiuta un contenuto preesistente non appartenente al lotto,
non lo sovrascrive. Riutilizza soltanto allegati con hash e alt già identici; per questo
piano sono previsti 38 nuovi allegati, lasciando intatti i 104 esistenti. Crea solo i termini
mancanti fra quelli già elencati nel manifest, senza rinominare termini esistenti.
Prepara i record in bozza, risolve tutte le relazioni e pubblica dopo la compilazione dei
metadati. La stessa importazione completata, ripetuta invariata, non crea duplicati.

Prima delle scritture richiede target canonico, checkout main pulito e SHA esatto, digest
del manifest, integrità dei file, implementazione CMS compatibile e conferma esplicita.
Controlla MIME reali e SVG privi di script/riferimenti esterni eseguibili.

Il backup della porzione toccata e il journal degli oggetti creati restano privati, fuori
dal document root, in:

```text
/home/customer/www/cms.netmarket.it/.netmarket-cms-imports/<digest>/journal.json
```

Il journal registra proprietà, ID e impronte degli oggetti del lotto. Il rollback verifica
identità, modifiche successive e riferimenti esterni prima di cancellare esclusivamente
oggetti/termini creati dall'importazione. Un record modificato o riutilizzato altrove blocca
la cancellazione automatica. Un'applicazione interrotta non viene ripresa silenziosamente:
il journal rimane disponibile per ripristino o riconciliazione.

Il rollback CMS è separato da quello frontend: **prima di cancellare i media del lotto deve
essere già online il frontend baseline**, che non dipende dai nuovi allegati. Il worker
verifica realmente quel marcatore e rifiuta la cancellazione altrimenti. Il semplice rollback
frontend non richiede di cancellare i contenuti CMS.

### Risultati della simulazione e delle letture reali

- Simulazione completa: 24 record + 38 allegati, riesecuzione senza duplicati e rollback
  dei 62 oggetti, preservando un contenuto estraneo. Recuperata anche un'applicazione
  parziale con errore iniettato durante la pubblicazione.
- Verificati i rifiuti per contenuti estranei preesistenti, riferimenti irrisolti, campi
  sconosciuti, media corrotti, modifiche editoriali successive e uso esterno degli oggetti.
- La simulazione usa il motore PHP e le vere classi Registry/Sanitizer/Routes del progetto
  con un backend WordPress **in memoria**. Non è un'importazione su un database WordPress reale.
- Nel WordPress reale, il preflight read-only ha verificato tutti i 24 record senza conflitti
  né scritture. Gli hash di Registry, FieldDefinition, Sanitizer, Routes, Relations e Media
  coincidono con le classi usate localmente.
- Runtime reale CMS: PHP 8.2.35, DOM e fileinfo disponibili, upload scrivibili; verifica dei
  permessi soltanto in lettura, senza creare directory.

Dopo l'importazione autorizzata il workflow dovrà superare sia il preflight HTTPS Basic Auth
con i secret esistenti sia `audit-import.mjs`: confronto effettivo dei 17 record API con il
manifest, inclusi testi, SEO, noindex, media, tassonomie e relazioni. Nessun fallback anonimo.
Questi controlli HTTPS autenticati **non sono ancora stati eseguiti nel runner**.

## 4. Candidate, sicurezza GitHub e tracking

La pipeline production produce il candidate solo dopo full validation, full E2E, motion
cross-browser, invarianti, accessi CMS autenticati, build senza fallback e audit production.
Il nuovo audit confronta inoltre gli hash delle collezioni verificate con quelli delle
risposte realmente consumate dalla build: modifiche CMS durante la costruzione bloccano
l'artifact. Un archivio vuoto, parziale, con accessi saltati o dati diversi dal piano è rifiutato.

La pubblicazione scarica l'artifact della run candidate riuscita sullo stesso SHA e ne
verifica manifest, hash archivio/file, percorsi, tipi, marcatori e insieme esatto dei file.
Promuove gli stessi byte, senza rebuild. Candidate, deploy, import CMS e rollback mantengono
le rispettive approvazioni e i lock necessari; nessun job si autoapprova.

Configurazione remota osservata: repository **pubblico**, required reviewer assente,
branch ammesso soltanto main e `can_admins_bypass=true`. Il gate ora richiede anche bypass
amministrativo disabilitato: non basta un reviewer formalmente configurato se si può
saltare l'approvazione. La modifica remota è nel checkpoint A, non è stata applicata.

Il reviewer richiesto è `netmarketadv`, ID 257532415. `prevent_self_review=false` consente
alla stessa persona di avviare e approvare manualmente una run: **non è revisione
indipendente**. L'agente non assegna approvazioni a se stesso. Main non ha branch protection
(API 404) né ruleset; la procedura resta PR + controlli + revisione umana, mai push diretto.
Non sono state cambiate le politiche del repository.

Iubenda, Consent Mode v2, dataLayer, dispatcher Astro, sei eventi richiesti, container,
Google Ads/Meta e deduplicazione restano invariati. URL/query del loader originale sono
identici; DOMContentLoaded e caricamento soltanto production restano invariati. Nessun
iframe noscript non protetto dal consenso e nessun doppio bootstrap Google/Stape.
Gli invarianti byte/hash sono passati. L'eventuale perdita di visite concluse prima del
bootstrap rimane un limite preesistente, non quantificato dai mock.

La correzione motion copre sia titoli vicini al bordo sia ripristini tardivi che saltano
oltre gli elementi senza una transizione IntersectionObserver. Usa gli stessi tween,
easing e durate, un solo controllo passivo accorpato per frame e rimozione degli ascoltatori
quando non restano reveal pendenti. Le assertion originali non sono state cambiate.

## 5. Risultati dei test

| Controllo | Risultato effettivo |
| --- | --- |
| Installazione `pnpm install --frozen-lockfile --offline` | PASS, nessuna dipendenza o lockfile aggiornati |
| Full `pnpm validate` finale | PASS: lint, typecheck, **128 test unitari**, build locale, PHP lint, PHPCS, PHPStan, secret scan |
| Full E2E statico con isolamento dei servizi esterni | **118/118 PASS**: preservati i 116 precedenti, aggiunti due casi di ripristino tardivo |
| Motion Chromium / Firefox / WebKit | **15/15 PASS**: preservati i nove precedenti + sei nuove esecuzioni |
| Stabilità WebKit dopo correzione intermittente | **15/15 PASS**, cinque casi ripetuti tre volte |
| CMS importer | **9 test PASS**, incluse simulazione completa, idempotenza, rollback e rifiuti |
| Confronto con il frontend distribuito | 17/17 testi, titoli e descrizioni identici alla baseline |
| Media originali | Byte/hash verificati per tutti i 38 riferimenti |
| Preflight CMS nativo reale | PASS read-only, 24 record, zero conflitti/scritture |
| Invarianti Stape / consenso / eventi / dispatcher | PASS |
| Smoke Stape in loopback | Tutti i quattro casi nei rispettivi ambienti: uno local, tre production; servizi esterni simulati |
| Audit strutturale configurazione production | PASS: 68 HTML, 63 URL sitemap, 3 keep, 59 redirect, 4 gone |
| Actionlint ufficiale 1.7.12 | PASS su production, import CMS e rollback |
| Sintassi PHP/Bash nuova infrastruttura e `git diff --check` | PASS |
| Piano rollback frontend su SiteGround | PASS read-only, digest e snapshot verificati; nessuno switch |
| Pipeline protetta, import CMS reale e artifact autenticato | **NON ESEGUITI**, richiedono il checkpoint |
| Ricezione GA4/Ads/Meta, consenso reale, Safari/AdBlock reali | **NON ESEGUITI**, nessun deploy né conversione di prova autorizzati |

Il conteggio unitario è 118 precedenti + 9 CMS + 1 controllo bypass. Il PHP necessario ai
nuovi test è presente nell'[immagine ufficiale Ubuntu dei runner GitHub](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md).
Il test motion originale è fallito una volta in WebKit prima dell'ultima correzione: quel
fallimento è conservato nelle evidenze, non ignorato. Le verifiche successive sopra sono verdi.

La build locale della full validation usa le fonti deterministiche del repository. Anche
la build con configurazione production usata per audit/smoke contiene accessi CMS saltati:
**è soltanto diagnostica, non un artifact production valido**. Lo smoke non esegue CMP o
conversioni reali. I casi Stape esclusivi dell'altro ambiente non sono contati come test
eseguiti; ciascuno dei quattro è stato eseguito nell'ambiente pertinente.

## 6. Commit, PR e artifact

Branch isolato: `codex/stape-release-candidate`, discendente diretto della baseline online.
Main remoto è ancora la baseline: nessuna divergenza da riconciliare mediante merge di
lavori estranei. Gli altri branch/worktree e le modifiche preesistenti sono preservati.

| Commit | Responsabilità |
| --- | --- |
| `637d915` | Loader Stape approvato e prima preparazione della release isolata |
| `35befc5`, `30fd5ef` | Resoconti e guide precedenti |
| `1e04694`, `af1d255` | Correzioni motion iniziali e regressioni |
| `95505b0` | CMS obbligatorio, integrità, promozione senza rebuild e rollback protetto |
| `71693af` | Correzione isolata dello scroll ripristinato tardivamente |
| `1fe02894557b1ea855ec7c20b2f7838508608ced` | Manifest e media, importer, audit del contenuto, workflow CMS e gate motion ripetibile |
| `8ae4481e3566ea755cc29659762e912fa232caec` | Rifiuto del bypass amministrativo nel gate production |
| `fb50626192592a7651ad38ad8904317e38be8f6c` | Namespace del motore CMS allineato agli standard, con i test del motore ripetuti |
| `b59ed8c21d912fde2fbf39ebdfd96d40ae0e790f` | Permessi dei media pubblici e verifica HTTP/MIME, con journal privato |

Questo rapporto viene salvato con un successivo commit documentale. Lo SHA del futuro
artifact sarà quello effettivo della run main approvata, non un hash abbreviato della tabella.
**Artifact production: non prodotto. SHA artifact: non disponibile. Deploy: non eseguito.**

La PR non esiste ancora (verificato via GitHub); titolo e descrizione pronti in
`artifacts/stape-release-evidence/2026-10-27/pull-request.md`. Non è stata aperta perché
il push necessario non è autorizzato. I file nuovi sono principalmente il manifest e gli
originali media, `infrastructure/migrations/stape/*`, il wrapper import, il workflow CMS,
il gate policy e la configurazione/test motion. Il plugin WordPress resta invariato.

Elenco/diff esatti: `git diff --stat 6b2e5524ba43e237229e0f56e86161edd87e1165 HEAD`.
Log, confronto, preflight e patch sono in `artifacts/stape-release-evidence/2026-10-27/`.
Sono evidenze locali, non artifact da pubblicare.

## 7. Unico checkpoint di approvazione A–D

Tutto il lavoro locale necessario a questo checkpoint è preparato. Si richiedono insieme
le seguenti autorizzazioni, da eseguire nell'ordine indicato senza ripetere l'audit.

**A — Protezioni GitHub production.** Applicare il payload già pronto
`infrastructure/config/production-environment.json`: reviewer `netmarketadv`, self-review
umana consentita, policy custom solo main. Poi disabilitare in Settings → Environments →
production **Allow administrators to bypass configured protection rules**, salvare e
verificare via API `can_admins_bypass=false`. Il payload REST non dichiara di impostare
un campo non previsto dal suo schema; la seconda operazione è un'impostazione UI distinta.
È la procedura descritta dalla [documentazione GitHub](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).
Non cambiare visibilità, secret, altri environment o regole di merge.

```sh
gh api --method PUT repos/netmarketadv/netmarket-website/environments/production \
  --input infrastructure/config/production-environment.json
```

**B — Pubblicazione del codice.** Push del solo branch candidate, apertura della PR verso
main e integrazione tramite PR soltanto dopo Quality Full verde e revisione umana del diff.
Nessun push diretto main, force push o approvazione PR autoattribuita. La creazione della PR
non distribuisce il frontend production.

**C — Pubblicazione del pacchetto CMS.** Dopo A/B, usare il workflow
`Import Stape CMS Content`: prima `mode=plan` con il digest sopra (read-only), poi
`mode=apply` con lo stesso digest e conferma esatta:

```text
IMPORT NETMARKET CMS a00a92281f7ac5b2b0eed79c745da6c5b060eb2793c7d86f3502bb33fb8926b4
```

Approvare manualmente il normale environment gate. Il journal resta privato (0600); solo
i file immagine autorizzati sono leggibili pubblicamente (0644). La verifica successiva
richiede anche HEAD pubblico HTTP 200 e MIME corretto per i media effettivamente esposti.

Approvare il lotto soltanto se questi effetti sono accettati. L'effetto è la pubblicazione nel CMS
di 9 servizi, 8 progetti, 7 clienti, 38 nuovi allegati e dei soli termini mancanti del
manifest. I contenuti diventano leggibili dalle API CMS; nessun deploy frontend/plugin.
Conservare journal privato e prova HTTPS autenticata; nessun PASS senza quella prova.

**D — Generazione ufficiale del candidate, senza deploy.** Sullo SHA main integrato,
avviare `Deploy Production`, `mode=candidate`, con SHA live effettivo e conferma
`BUILD NETMARKET CANDIDATE`. Approvare l'environment e pretendere tutti i gate verdi,
compresi contenuto CMS autenticato identico al piano e assenza di drift della build.
Esaminare manifest, provenienza, hash e resa visiva del frontend realmente prodotto.
I correlati derivati dal CMS possono cambiare ordine rispetto alla precedente selezione
locale: questa verifica dell'artifact è ancora da eseguire; non sono state inventate
relazioni per forzarlo.

Questo checkpoint non autorizza la pubblicazione di un artifact ancora inesistente.
Il consenso finale al deploy dovrà riferirsi alla run, allo SHA e all'artifact risultanti,
che saranno allora concretamente revisionabili. Lo stesso vale per un rollback reale.

## 8. Pubblicazione e ripristino dopo approvazione

### Frontend

Dopo D e approvazione esplicita del rilascio, `Deploy Production`, `mode=deploy`, sullo
stesso SHA, `candidate_run_id=<run-riuscita>`, `expected_live_sha=<sha-reale>` e conferma
`DEPLOY NETMARKET`. Nuova approvazione environment; promozione dello stesso archivio senza
rebuild. Snapshot `.netmarket-rollbacks/before-<nuovo-sha>`, verifica SHA/integrità via SSH,
smoke funzionale, SEO e redirect. Con challenge SiteGround, i controlli HTTP pubblici
rimandati dal runner vanno completati da rete esterna: non contano come PASS.

### Rollback frontend

`Rollback Production Manual` funziona anche dopo un deploy riuscito. Prima `mode=plan`,
SHA corrente, `restore_sha=6b2e5524ba43e237229e0f56e86161edd87e1165` per tornare alla baseline,
snapshot esatto `before-<sha-corrente>`. Poi, solo autorizzato, `mode=execute`, digest appena
ottenuto e conferma `ROLLBACK NETMARKET <current_sha> TO <restore_sha>`, con nuova approvazione.
Verifiche prima/dopo e conservazione del frontend rimosso. Niente `latest`, cambi GTM o CMS.

Il piano reale provato oggi riguarda lo snapshot storico `before-6b2e5524ba43e237229e0f56e86161edd87e1165`,
che contiene `9ae69fd10588b36d2d915f69fcf39f1346b77ee3`, digest
`9fe3fec43045c45fc8ceda1ccde12f617037431be84907bd5589d32a23f9d519`.
Non è il futuro snapshot Stape: per quello servirà il nuovo piano dopo il deploy.

### Rollback CMS

È facoltativo e separato dal ripristino frontend. Prima ripristinare il frontend baseline;
poi `Import Stape CMS Content`, `mode=rollback-plan` con il digest del manifest, ed esaminare
il journal. Soltanto autorizzato, `mode=rollback`, conferma
`ROLLBACK NETMARKET CMS <digest>` e nuova approvazione. Un oggetto modificato o usato altrove
richiede riconciliazione umana, non cancellazione forzata. Nessun rollback reale è stato eseguito.

## 9. Collaudo reale ancora da eseguire

Nessuna ricezione reale GA4, Ads o Meta è stata dichiarata riuscita. Dopo deploy autorizzato,
registrare SHA, timestamp UTC, browser/versione, consenso, event ID e prova del servizio.

- [ ] SHA online, frontend e media, CMS, sitemap e tutti i redirect; nessuna regressione
  visiva/funzionale o errore CSP/JavaScript.
- [ ] Unico bootstrap GTM attraverso Stape, URL/query originali, assenza del bootstrap
  Google concorrente; distinguere le librerie Google caricate dai tag dal secondo container.
- [ ] Iubenda reale: nessuna scelta, rifiuto, statistiche, marketing, revoca e visita successiva;
  default/update Consent Mode v2 e invii effettivi coerenti. Zero iframe GTM senza JavaScript.
- [ ] GA4 `page_view` e `generate_lead`, navigazione Astro senza duplicati; lead soltanto su
  successo reale, assente su errori/challenge. Lead di prova reali soltanto autorizzati.
- [ ] `contact`, `click_tel`, `click_whatsapp`, `click_email` ricevuti; payload e destinatari corretti.
- [ ] Google Ads: ricezione e diagnostica delle conversioni, con stato consenso registrato.
- [ ] Meta Pixel + CAPI: PageView/Lead, stesso `event_id` browser/server e una conversione
  deduplicata; evidenze in Test Events/preview server, niente dati personali impropri.
- [ ] Data Client/elaborazione server. Con Enhanced Ad Blocker i percorsi possono essere
  codificati: non pretendere sempre `/data` e `/g/collect` letterali.
- [ ] Chrome/Firefox normali, Safari reale macOS/iOS e AdBlock reale con filtri/versione;
  confronto con la configurazione precedente. WebKit locale non equivale a Safari reale.
- [ ] Snapshot nuovo verificabile e piano rollback disponibile.

## 10. Limiti residui e chiusura

Il codice locale è verificato e il pacchetto CMS è pronto. Per procedere occorrono le
approvazioni A–D e quelle GitHub umane: l'agente non può attribuirsele. La validità effettiva
dei secret nel runner, l'import WordPress reale e il candidate autenticato sono verifiche
future obbligatorie, non problemi occultati da fallback. Una successiva modifica editoriale
al lotto blocca l'audit o il rollback e richiede una revisione esplicita.

Non si considera concluso il go-live fino alla pubblicazione e alle prove reali eseguibili.
Questo rapporto non concede quelle autorizzazioni: fornisce codice, manifest e procedure
concrete affinché il processo possa proseguire direttamente dopo il checkpoint.

### Correzione esecuzione WP-CLI (27 ottobre 2026)

La prima run apply `40503958293` si è fermata al parsing PHP, prima dell'import:
`wp eval-file` valuta il file anteponendo codice e rende invalido `declare(strict_types=1)`.
Il CMS è stato ricontrollato in sola lettura: nessun journal e zero servizi, case study e clienti.
Lo script usa ora l'opzione ufficiale `--use-include`, disponibile nel WP-CLI installato,
che conserva sia `strict_types` sia la risoluzione di `__DIR__`. Il manifest approvato,
i contenuti e il tracking restano invariati. Un test esegue l'entrypoint PHP reale via
include e verifica che raggiunga il guard sul digest senza errori di parsing.

### Compatibilità dimensioni SVG CMS (27 ottobre 2026)

L'import reale `40505019923` è riuscito e l'audit autenticato ha verificato 17 record e 38 media.
La prima build ufficiale `40505633732` ha poi rifiutato il candidate: i loghi SVG di WordPress
riportano dimensioni sconosciute come zero, incompatibili con lo schema frontend positivo/null.
La normalizzazione frontend converte esclusivamente dimensioni SVG numeriche zero in null;
valori negativi, stringhe e dimensioni raster zero restano invalidi. Non vengono inventate dimensioni,
modificati contenuti CMS o indeboliti i gate contro fallback/accessi saltati. Il simulatore CMS
riproduce ora lo stesso metadata SVG reale e i test coprono anche i loghi annidati nei case study.

### Sincronizzazione regressione motion (27 ottobre 2026)

La run `40509620372` ha superato validate e full E2E, ma il controllo motion WebKit ha
campionato reveal ancora in attesa dello stagger dopo il caricamento asincrono del motore.
Riproduzione deterministica sul codice invariato: modulo GSAP ritardato di 800 ms,
reveal ready/opacity=0 a 950 ms da DOMContentLoaded, tutti visibili dopo il normale budget.
L'ipotesi di conflitto runtime non è stata confermata: nessuna modifica al prodotto.
Il test attende ora il motore effettivamente inizializzato e usa assertion ritentate con
lo stesso criterio array vuoto, entro il timeout E2E esistente, in ogni fase scroll/reload.
Nessun elemento escluso, assertion rimossa o test saltato. Un caso dedicato riproduce il
caricamento tardivo su tutti e tre i browser. Gli invarianti runtime motion/Stape restano intatti.
I test di restoration usano esplicitamente DOMContentLoaded e poi le verifiche già presenti
su motore, font, geometria e visibilità: non attendono più il load globale di immagini remote,
che nella prima prova ripetuta ha causato due timeout di navigazione, non errori di reveal.
