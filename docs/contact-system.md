# Contact System

## Route

`/contatti/` contiene una pagina statica con dati aziendali verificati e form contatto.

## Endpoint

Il form invia a:

`POST /netmarket/v1/forms/contact`

Il payload include:

- `name`;
- `email`;
- `company`;
- `phone`;
- `service`;
- `message`;
- `privacyConsent`;
- `marketingConsent`;
- `website` honeypot;
- `utm`;
- `sourceUrl`;
- `referrer`;
- `elapsedMs`.

## Validazione Server

Il plugin WordPress valida:

- payload JSON per i contatti e multipart/form-data per le candidature;
- honeypot vuoto;
- nome 2-120 caratteri;
- email valida;
- messaggio 10-3000 caratteri;
- consenso privacy obbligatorio;
- pattern spam di base;
- rate limit per IP + email, massimo 3 invii ogni 10 minuti;
- tempo minimo opzionale tramite `elapsedMs`, per intercettare invii automatici troppo rapidi senza dipendere dall'orologio del device.

I destinatari sono configurati server-side nel plugin:

- TO: `segreteria@netmarket.it`;
- CC: `enrico@netmarket.it`;
- From: `Netmarket <segreteria@netmarket.it>`;
- Reply-To: nome/email inseriti dall'utente, dopo sanitizzazione.

Il frontend non puo scegliere destinatari. Il plugin non salva lead nel database e logga solo request ID, timestamp implicito del server e stato tecnico.

Quando `wp_mail()` fallisce, l'endpoint risponde con errore `mail_failed` e il frontend non effettua redirect.

## Candidature e verifica del CMS

`/lavora-con-noi/` usa lo stesso endpoint con `service=lavora-con-noi` e un CV
PDF, DOC o DOCX, obbligatorio e di massimo 5 MB. Il CMS valida il file e lo allega
alla mail senza salvarlo nella libreria media pubblica. Il consenso multipart
viene interpretato come booleano, quindi la stringa `false` non autorizza l'invio.

Il deploy frontend non aggiorna il plugin: il supporto multipart richiede il
workflow separato `Deploy CMS Plugin`. Il 30 settembre 2026 il CMS pubblicato
era ancora al commit `9aae34f`, precedente al supporto CV introdotto in `27da939`:
le candidature venivano respinte con HTTP 400 `invalid_payload`.

Il workflow CMS esegue ora `node infrastructure/scripts/smoke-cms-forms.mjs`
dopo la pubblicazione. Il controllo verifica JSON, candidatura senza CV,
candidatura con PDF e CORS dall'origine production. Le richieste usano sia
nome vuoto sia consenso negato: si verifica la validazione reale del server
senza inviare email. Il solo health check non rileva un plugin obsoleto.
Lo stesso gate precede ogni deploy frontend production: se il CMS non supporta
il contratto dei form, la pubblicazione si ferma prima di modificare il sito.
Come per gli smoke production, la sola challenge SiteGround riconosciuta da
HTTP 202 e `/.well-known/sgcaptcha/` sul runner GitHub differisce il controllo
pubblico: emette un warning e registra l'obbligo nel riepilogo della run.
In quel caso eseguire lo stesso comando da una rete esterna prima di dichiarare
il rilascio verificato. Esecuzioni locali, errori API, CORS errati e risposte 202
senza la firma della challenge continuano a fallire.

## Success

Dopo una risposta positiva reale dal backend, il frontend invia `contact_form_success` e reindirizza a `/grazie/`. Il redirect non contiene dati personali in query string.

`/grazie/` e pubblica, non compare in navigazione o sitemap, e in produzione deve restare `noindex, follow`. In staging/local la policy globale resta piu restrittiva.

## Analytics

Il form spinge eventi `dataLayer`:

- `contact_form_start`;
- `contact_form_submit`;
- `contact_form_success`;
- `generate_lead`, emesso una sola volta su `/grazie/` dopo un successo reale;
- `contact_form_error`.

Staging e locale non caricano script marketing. La conversione primaria e `generate_lead`: un marker
temporaneo in `sessionStorage` permette di emetterla sulla pagina di conferma soltanto dopo una
risposta positiva del backend. Un accesso diretto a `/grazie/` non genera conversioni.
