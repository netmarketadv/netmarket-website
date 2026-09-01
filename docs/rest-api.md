# REST API

Namespace: `netmarket/v1`.

Endpoint pubblici read-only:

- `GET /netmarket/v1/settings`
- `GET /netmarket/v1/services`
- `GET /netmarket/v1/services/{slug}`
- `GET /netmarket/v1/case-studies`
- `GET /netmarket/v1/case-studies/{slug}`
- `GET /netmarket/v1/clients`
- `GET /netmarket/v1/clients/{slug}`
- `GET /netmarket/v1/people`
- `GET /netmarket/v1/people/{slug}`
- `GET /netmarket/v1/insights`
- `GET /netmarket/v1/insights/{slug}`
- `GET /netmarket/v1/resources`
- `GET /netmarket/v1/resources/{slug}`
- `GET /netmarket/v1/testimonials`
- `GET /netmarket/v1/testimonials/{slug}`
- `GET /netmarket/v1/landing-pages/{slug}`
- `GET /netmarket/v1/taxonomies`
- `GET /netmarket/v1/health`

Gli endpoint pubblici sono read-only, non espongono utenti, email o metadata amministrativi. Pagination con `page` e `per_page` o `perPage`, massimo 50.

Archivi:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "perPage": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Filtri whitelisted:

- comuni: `featured`, `sort=date|priority|title`, `sector`, `technology`;
- case studies: `service`, `client`;
- insights: `service`, `author`.

Le relazioni nelle response sono summary:

```json
{
  "id": 123,
  "slug": "siti-web",
  "title": "Siti web",
  "type": "nm_service",
  "image": null
}
```

Le immagini includono `id`, `url`, `alt`, `width`, `height`, `mimeType`, `srcset`, `sizes` e `focalPoint` quando disponibili.

Endpoint admin autenticato:

- `GET /netmarket/v1/admin/relation-search?search=...&types=nm_service,nm_client`

Serve solo ai metabox relazione e richiede capability `edit_posts`.

Endpoint futuro documentato, non implementato:

- `POST /netmarket/v1/forms/contact`
