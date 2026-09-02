# Sicurezza

- Nessun secret nel repository.
- Secrets solo in GitHub Environment.
- Endpoint pubblici read-only, con unica eccezione operativa `POST /netmarket/v1/forms/contact` per il form contatti.
- `cms.netmarket.it` e protetto da Basic Auth per editing/admin; l'hardening lascia senza Basic Auth solo `robots.txt`, `wp-content/uploads/`, `GET /wp-json/netmarket/v1/health` e `POST /wp-json/netmarket/v1/forms/contact`, necessari a sito statico, deploy e form.
- Il form contatti valida server-side, usa honeypot e rate limit, non accetta destinatari dal client e non salva PII nel database.
- Capability check e nonce in admin.
- Sanitizzazione in salvataggio.
- Escaping in output.
- Script remoti con target consentiti e dry-run.
- Nessuna modifica a DNS, SSL, email, database o produzione.
