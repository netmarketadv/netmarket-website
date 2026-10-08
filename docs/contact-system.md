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

Il frontend non puo scegliere destinatari. I contatti ordinari non vengono salvati nel database; le candidature sono archiviate come descritto sotto. I log contengono solo request ID, timestamp implicito del server e stato tecnico.

Quando `wp_mail()` fallisce per un contatto ordinario, l'endpoint risponde con errore `mail_failed` e il frontend non effettua redirect. Per le candidature già archiviate restituisce successo con `notificationSent=false`: il CV resta recuperabile e l'utente non è invitato a inviarlo nuovamente.

## Candidature e verifica del CMS

`/lavora-con-noi/` usa lo stesso endpoint con `service=lavora-con-noi` e un CV
PDF, DOC o DOCX, obbligatorio e di massimo 5 MB. Il CMS valida il file e lo allega
alla mail senza salvarlo nella libreria media pubblica. Il consenso multipart
viene interpretato come booleano, quindi la stringa `false` non autorizza l'invio.

### Archivio privato candidature

Il plugin salva nome, email, messaggio (area e portfolio inclusi), data e CV nel
database WordPress **prima** di inviare la notifica. Il post type `nm_application`
è privato, escluso dalle API REST e dalle query pubbliche. Il CV è un record privato separato (`nm_cv_file`), codificato base64 e
collegato tramite metadato protetto (`_nm_cv`): non viene creato alcun URL pubblico.
La lista amministrativa carica solo i riferimenti, senza caricare tutti i file.
La codifica non è cifratura; chi amministra database e backup può leggere i file.

Gli amministratori (`manage_options`) accedono a **Candidature** nel menu CMS:
ricerca per nome/email, dettagli, download CV e stato della notifica email.
Il download richiede sessione amministratore e nonce, forza un allegato e vieta
la cache. Gli utenti senza permessi non possono consultare né scaricare i CV.
Se il salvataggio fallisce, il form restituisce `archive_failed` senza inviare mail.

I dati persistono fino alla cancellazione manuale; il cestino conserva il CV,
ma ne impedisce il download. La cancellazione definitiva elimina anche il
record del file e il relativo metadato. L'archivio rientra nei backup del database: verificare
copertura e ripristino dei backup hosting prima di considerarli garantiti.
Base64 aggiunge circa un terzo alla dimensione dei file nel database.
Non vengono importati i CV delle candidature ricevute prima del deploy.

Verifica locale: `php apps/wordpress/plugins/netmarket-headless-core/tests/career-archive.php`,
PHP lint, PHPCS e PHPStan. Dopo il deploy CMS verificare anche la lista e il
download con un amministratore e una candidatura di prova autorizzata.

Il deploy frontend non aggiorna il plugin: usare il workflow separato
`Deploy CMS Plugin` e verificare il contratto del form dopo la pubblicazione.

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
