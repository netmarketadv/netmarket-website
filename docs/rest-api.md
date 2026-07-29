# REST API

Namespace: `netmarket/v1`.

Endpoint iniziali:

- `GET /netmarket/v1/settings`
- `GET /netmarket/v1/services`
- `GET /netmarket/v1/services/{slug}`
- `GET /netmarket/v1/case-studies`
- `GET /netmarket/v1/case-studies/{slug}`
- `GET /netmarket/v1/landing-pages/{slug}`
- `GET /netmarket/v1/taxonomies`
- `GET /netmarket/v1/health`

Gli endpoint pubblici sono read-only, non espongono utenti, email o metadata amministrativi. Pagination con `page` e `per_page`, massimo 50.

Endpoint futuro documentato, non implementato:

- `POST /netmarket/v1/forms/contact`
