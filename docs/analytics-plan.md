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

Non sono presenti ID GA4, GTM, Meta o Ads. Gli script non vengono caricati in staging di default.

## Conversioni

La conversione contatto primaria e `contact_form_success`, emessa solo dopo risposta positiva reale da `POST /netmarket/v1/forms/contact`. La pagina `/grazie/` conferma il submit e puo essere usata come destinazione, ma non deve duplicare la stessa conversione senza una regola di deduplica in GTM/GA4.
