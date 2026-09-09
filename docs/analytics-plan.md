# Analytics

Il package `@netmarket/analytics` definisce eventi `dataLayer` tipizzati:

- `page_view`
- `cta_click`
- `contact_form_start`
- `contact_form_submit`
- `contact_form_success`
- `contact_form_error`
- `case_study_view`
- `service_view`
- `resource_download`
- `outbound_click`

Il container rilevato sul sito legacy è `GTM-K782CJ46`. Il frontend lo carica soltanto in production quando `PUBLIC_ANALYTICS_ENABLED=true`; staging e locale restano senza richieste GTM. Prima del caricamento vengono impostati i segnali Consent Mode su `denied`, in attesa dell'aggiornamento esplicito della CMP. La configurazione Iubenda nel container deve essere validata in GTM Preview prima del go-live.

## Conversioni

La conversione contatto primaria e `contact_form_success`, emessa solo dopo risposta positiva reale da `POST /netmarket/v1/forms/contact`. La pagina `/grazie/` conferma il submit e puo essere usata come destinazione, ma non deve duplicare la stessa conversione senza una regola di deduplica in GTM/GA4.
