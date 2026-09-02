# Sicurezza

- Nessun secret nel repository.
- Secrets solo in GitHub Environment.
- Endpoint pubblici read-only, con unica eccezione operativa `POST /netmarket/v1/forms/contact` per il form contatti.
- `cms.netmarket.it` mantiene Basic Auth su `wp-login.php` e `wp-admin/`; REST pubblico e `wp-content/uploads/` restano raggiungibili sotto header noindex per sito statico, deploy e form.
- Il form contatti valida server-side, usa honeypot e rate limit, non accetta destinatari dal client e non salva PII nel database.
- Capability check e nonce in admin.
- Sanitizzazione in salvataggio.
- Escaping in output.
- Script remoti con target consentiti e dry-run.
- Nessuna modifica a DNS, SSL, email, database o produzione.
