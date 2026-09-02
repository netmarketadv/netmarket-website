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
- `referrer`.

## Validazione Server

Il plugin WordPress valida:

- payload JSON;
- honeypot vuoto;
- nome 2-120 caratteri;
- email valida;
- messaggio 10-3000 caratteri;
- consenso privacy obbligatorio;
- pattern spam di base;
- rate limit per IP + email, massimo 3 invii ogni 10 minuti.

Il destinatario attuale e `admin_email` WordPress. Non vengono salvati dati personali nel repository.

## Analytics

Il form spinge eventi `dataLayer`:

- `contact_form_start`;
- `contact_form_submit`;
- `contact_form_success`;
- `contact_form_error`.

Gli ID di tracking non sono configurati nel repository e staging non carica script marketing di default.
