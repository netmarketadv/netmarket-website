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

- payload JSON;
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
