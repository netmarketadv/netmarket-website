# Audit pre-release Stape Custom Loader — 26 ottobre 2026

> Riferimento storico del branch sorgente. Preparazione e verifiche successive:
> [candidate isolato e blocchi aggiornati](stape-release-candidate.md).

**Giudizio: NO-GO per il rilascio del candidate attuale.** La sostituzione del loader è
compatibile a livello di codice e configurazione pubblica. È stata corretta una regressione
privacy del noscript. Restano da chiudere la completezza CMS del candidate, la sua preparazione
come release riproducibile e il percorso operativo di rollback dopo una pipeline riuscita.

Nessun push, merge, deploy, invio di conversioni di prova o modifica ai container GTM.
Letture remote soltanto via GET/HEAD, GitHub e SSH. Account GitHub verificato: `netmarketadv`,
repository `netmarketadv/netmarket-website`, permessi ADMIN.

## Riferimenti e perimetro

- Branch verificato: `codex/stape-custom-loader`.
- HEAD locale: `24bac495302de035392b914c7a72f1f7ce806d56`; implementazione ancora nel working tree.
- Produzione HTTP e file `netmarket-release` via SSH: `6b2e5524ba43e237229e0f56e86161edd87e1165`.
- Ultima [pipeline production riuscita](https://github.com/netmarketadv/netmarket-website/actions/runs/39448584323):
  20 ottobre 2026; SHA coerente con il sito pubblico. I log storici non sono più disponibili
  tramite API (HTTP 410), quindi non sono stati usati per certificare la build storica.
- Le modifiche locali preesistenti, comprese quelle CMS e della landing advertising,
  sono state preservate. Questo audit non approva il loro rilascio insieme a Stape.

## 1. DOMContentLoaded

**Esito: mantenuto, nessuna modifica necessaria per questa integrazione.** Il loader Google
attualmente pubblicato usa già la stessa attesa di `DOMContentLoaded` e lo stesso ramo
immediato per documenti già pronti. Il Custom Loader conserva entrambi.

L'attesa non è un requisito di Iubenda o Consent Mode: i default denied sono impostati
prima e la CMP è asincrona. `DOMContentLoaded` non dimostra che Iubenda abbia letto il consenso.
Rimangono i quattro default denied, `wait_for_update: 2000`, i callback CMP e il segnale
`netmarket_consent_ready`, identici al codice pubblicato.

Gli eventi già accodati nel dataLayer vengono conservati; Google documenta che il container
elabora la coda al caricamento. Sono invece potenzialmente persi una visita terminata prima
del caricamento del container o un click avvenuto prima dell'installazione dei listener GTM.
Questo limite esiste già in produzione; Stape può avere tempi di rete diversi, non misurati
da questo audit. Non anticipo il loader senza un confronto reale dei consensi e dei tag.

Fonti: [elaborazione della coda dataLayer](https://developers.google.com/tag-platform/tag-manager/datalayer)
e [ordine dei consensi e CMP asincrone](https://developers.google.com/tag-platform/security/guides/consent).

## 2. Noscript e privacy — problema confermato e corretto

La GET a `https://web.netmarket.it/ns.html?id=GTM-K782CJ46` risponde HTTP 200 con un HTML
contenente effettivamente questo pixel:

```html
<img height="1" width="1" style="border-style:none;" alt="" src="//www.googleadservices.com/pagead/conversion/16639879288/?url=&amp;guid=ON&amp;script=0&amp;data="/>
```

Senza JavaScript l'iframe richiederebbe prima Stape e poi il pixel Ads. La CMP JavaScript e
i comandi Consent Mode del documento non vengono eseguiti e non proteggono queste richieste.
La sola assenza di `Set-Cookie` nella risposta iframe non le rende prive di dati: almeno i
normali metadati della richiesta sarebbero trasmessi. Non è stato eseguito il pixel reale,
né si afferma che quella specifica richiesta contabilizzi una conversione Ads.

**Correzione minima applicata:** rimosso il blocco noscript da `BaseLayout.astro`, insieme ai
soli import e variabile necessari a quel blocco. Il layout coincide ora con lo stato locale
precedente all'integrazione Stape. Il sito pubblico attuale non ha un iframe GTM noscript:
la correzione conserva tale comportamento. Nessun cambiamento a container, tag o WordPress.

Il test senza JavaScript ora richiede zero iframe e zero richieste al loader, al fallback
o alle origini Google GTM/Ads. Un eventuale reinserimento richiederebbe un meccanismo verificato
di consenso per il fallback, senza affidarsi a una CMP JavaScript che in quel contesto non gira.

## 3. Candidate production — blocco aperto

La build con variabili production termina con successo e l'audit strutturale passa:
68 pagine HTML, 63 URL sitemap, 3 keep, 59 redirect, 4 gone. Tuttavia il log contiene
**64 accessi CMS saltati perché le credenziali non sono configurate**, con uso di fallback.
Il numero di pagine e il PASS di `audit-production-build.mjs` non certificano la provenienza
dei contenuti: quel controllo verifica struttura/SEO/link, non l'assenza di fallback CMS.

Il client API rifiuta localmente gli accessi a `cms.netmarket.it` senza credenziali e non legge
`CMS_API_CACHE_DIR`. La directory cache presente non risolve il problema: contiene anche
collezioni vuote ed è datata; non è stata sostituita o usata per simulare una build completa.
Le GET di health, services e case-studies del CMS rispondono JSON HTTP 200: il problema
osservato è la configurazione della build locale, non una prova di token scaduto o CMS offline.

Il workflow production locale è identico a quello dello SHA pubblicato. Variabili confrontate:

| Variabile | Valore del workflow e della build di audit |
| --- | --- |
| `PUBLIC_SITE_URL` | `https://netmarket.it` |
| `PUBLIC_CMS_URL` | `https://cms.netmarket.it` |
| `PUBLIC_DEPLOY_ENV` | `production` |
| `PUBLIC_ANALYTICS_ENABLED` | `true` |
| `PUBLIC_GTM_ID` | `GTM-K782CJ46` |
| `CMS_API_BASE_URL` | `https://cms.netmarket.it/wp-json/netmarket/v1/` |

La pipeline pubblica usa inoltre `CMS_API_CACHE_DIR`, credenziali CMS da secret e lo SHA
GitHub per identificare la build. I nomi dei secret CMS sono presenti nel repository e quelli
SSH/percorsi nell'environment production; valori ed effettiva validità non sono stati letti.
La build di audit ha correttamente ambiente production, ma marcatore **`netmarket-build=local`**:
non è un artifact immutabile da pubblicare.

Il branch risulta anche divergente da `origin/main` locale (21 commit solo su main e 6 solo
su HEAD); non è stata eseguita una riconciliazione o una merge. Prima del GO occorre preparare
un candidate esatto sulla base production corretta, senza includere incidentalmente il lavoro
preesistente, con SHA identificabile e contenuti CMS effettivi. Poi eseguire full validation
e full E2E richieste dalla governance per una release verso main. Non sono state eseguite
durante questo audit: una build con fallback non soddisfa già il prerequisito del rilascio.

## 4. Caricamento unico

**Esito: superato nel frontend candidato.** Tutte le 68 pagine generate contengono il loader
Stape e nessuna contiene l'URL del vecchio bootstrap Google o il fallback noscript.
`TrackingController` è incluso una sola volta nel layout e `__netmarketGtmLoaded` protegge
la funzione da chiamate ripetute. Non esiste una modalità che abiliti simultaneamente i due
bootstrap. Il test browser verifica una sola richiesta Stape e un solo evento `gtm.js`,
anche richiamando due volte il loader e ripetendo `DOMContentLoaded`.

Questo non vieta ai tag pubblicati di caricare altri script Google necessari a GA4/Ads;
tali risorse non sono un secondo bootstrap dello stesso container. La conferma Network
end-to-end con il container remoto reale resta un controllo post-deploy.

## 5. Compatibilità del tracking

Le GET del loader Google e di quello Stape restituiscono entrambi il container web versione
**26**, con **47 tag**. È stato estratto senza esecuzione l'intero oggetto `resource`:
`version`, `macros`, `tags`, `predicates` e `rules` sono identici, non soltanto i nomi evento.
SHA-256 del JSON normalizzato comune:
`78c231199827f004179bedd109b778d58ceb6e53841e05ed82f18865a821f80d`.

| Evento | Configurazione pubblica Google e Stape identica |
| --- | --- |
| `page_view` | Tag 89 e 95; regole su `stape_consent_update` e `netmarket_consent_ready` |
| `generate_lead` | Tag 85 e 90; attivazione sull'evento `generate_lead` |
| `contact` | Tag 94 e 97; click GTM su telefono, WhatsApp e email |
| `click_tel` | Tag 31; `gtm.linkClick` con URL `tel:` |
| `click_whatsapp` | Tag 32; `gtm.linkClick` con URL contenente `wa.me` |
| `click_email` | Tag 104; `gtm.linkClick` con URL `mailto:` |

Gli ID GA4 `G-DHXW4WZ5XP` e Ads `AW-16639879288` restano presenti e identici. I quattro eventi
contact/click non devono essere aggiunti manualmente al dispatcher Astro: sono già prodotti
dai tag GTM, mentre Astro emette i propri eventi distinti `contact_click`/CTA/outbound.

Confrontati anche i file allo SHA realmente pubblicato: il dispatcher analytics e il blocco
eventi del componente Astro sono identici al working tree; la sola integrazione Stape non
ha cambiato l'inizializzazione Iubenda/Consent Mode. Il blocco Iubenda/default ha hash
`ed3d2b8c1d952574ed678d61fdd7a4dfd8463917a1fd2c52314bda584b1690a9` in entrambi.

Questa è una verifica di compatibilità statica, non una certificazione della ricezione o
deduplicazione downstream. Le regole page_view su più segnali CMP sono preesistenti: il
conteggio effettivo deve essere osservato con consensi reali, non dedotto dal solo confronto.

## 6. Rollback

**Meccanismo frontend confermato; percorso manuale post-successo da chiudere.** SSH read-only
funziona con l'alias canonico e verifica lo SHA live. Gli snapshot `before-*` esistono; gli
snapshot statici controllati hanno `index.html` e `.htaccess`. Il deploy ufficiale sposta
l'intero frontend corrente in `.netmarket-rollbacks/before-<nuovo-sha>` prima dello switch.
Per la futura release Stape è quello snapshot nuovo che ripristinerebbe l'attuale produzione;
uno snapshot `before-<sha-attuale>` contiene invece la versione precedente a quella attuale.

`rollback-production.sh` sposta via il frontend fallito e ripristina lo snapshot, senza
modificare GTM Web, GTM Server, WordPress o il database. Non si tratta di un `.tgz`: production
usa directory di release. La sintassi dei due script è stata verificata con `bash -n`;
nessuno switch o ripristino è stato eseguito e nessun tempo di recovery è stato misurato.

La pipeline production invoca già il rollback automaticamente quando fallisce una verifica
dopo il deploy. È però presente solo quel percorso automatico: l'inventario GitHub dei
workflow non contiene un rollback production manuale protetto. Se un'anomalia di tracking
emerge dopo un job riuscito, l'automatismo non parte. Prima del rilascio va concordato e
verificato il percorso production autorizzato per ripristinare **lo snapshot esatto**, oppure
un revert del solo loader tramite pipeline. Un rebuild/revert non è un ripristino istantaneo
dell'artifact; lanciare manualmente SSH non rispetterebbe la regola production del progetto.
Non è stato aggiunto un workflow nell'ambito di questo audit.

Il diff locale reversibile è stato aggiornato e verificato con `git apply --reverse --check`;
preserva le modifiche preesistenti. Serve per il rollback del codice locale, non sostituisce
lo snapshot della release frontend sul server.

## Verifiche superate in questa sessione

- `pnpm check:fast`: lint, typecheck, 89 test unitari, build locale.
- Build production di audit e `audit-production-build.mjs`: PASS strutturale, con il limite CMS sopra.
- Smoke production su loopback: 3 PASS; caricamento singolo/ordine/eventi, ponte CMP/lead,
  assenza del fallback senza JavaScript. Servizi esterni intercettati, nessuna conversione reale.
- GET frontend pubblico e loader Google/Stape: HTTP 200; container/resource confrontati.
- Nessuna CSP HTTP rilevata sulla homepage pubblica; il generatore `.htaccess` non ne introduce una.
- Identità GitHub, ultimo SHA pubblicato e inventario workflow/nomi secret verificati.
- Connessione SSH, snapshot e script rollback verificati in sola lettura.

## Collaudo dopo il deploy autorizzato

1. Verificare SHA online, artifact, CSP/header effettivi e assenza del vecchio bootstrap
   sull'origine production distribuita, inclusi cache/CDN e pagine interne.
2. Browser pulito: nessuna scelta, rifiuto, statistiche, marketing, revoca e visita successiva;
   osservare gli aggiornamenti reali Iubenda e gli stati di consenso dei tag.
3. Tag Assistant/Network: un solo container, un solo caricamento, corretto inoltro a Stape.
4. GA4 DebugView e preview sGTM: confrontare tutti e sei gli eventi e una sola page_view per
   documento; lead solo dopo successo reale e assente su errore. Verificare Data Client.
5. Google Ads e Meta Test Events: ricezione, consenso e deduplicazione browser/CAPI.
6. Confronto con/senza ad blocker, stessi browser e consensi; gli endpoint codificati non
   richiedono la presenza letterale di `/data` o `/g/collect` nel Network.
7. Senza JavaScript: nessun iframe GTM e nessuna richiesta al pixel Ads introdotto dal fallback.

Le verifiche di ricezione possono anche essere preparate prima su un candidate completo con
strumenti di debug reali. Solo la conferma dell'origine production appena rilasciata è
necessariamente post-deploy; non sono un motivo per saltare i blocchi pre-release.

## Modifiche effettuate e condizioni per il GO

Unica correzione runtime: rimozione del noscript non protetto dal consenso. Aggiornati il test
relativo, la guida Stape e questo rapporto. Nessun refactoring del loader o degli eventi.
Evidenze e diff sono in `artifacts/stape-custom-loader-2026-10-26/`.

Il GO richiede: candidate completo con dati CMS reali e SHA riproducibile sulla base corretta;
validazione release completa; percorso autorizzato per il rollback di un problema scoperto
dopo il successo della pipeline. Il problema privacy noscript è già risolto. `DOMContentLoaded`
e i nomi evento non richiedono altre modifiche per questa sostituzione.
