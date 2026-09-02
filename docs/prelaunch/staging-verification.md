# Staging Verification

Data audit: 2026-09-02

## Target

- URL: `https://staging.netmarket.it`
- Build attesa: `99d79ffcfb38449a864d1e1f1b59c437e382098a`
- Ambiente atteso: `staging`

## Stato

Esito corrente: `VERIFIED WITH WARNINGS`

Il deploy staging reale del branch `chore/prelaunch-hardening` e completato con successo.

Evidenze:

- Workflow: `Deploy Staging`
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33629259420`
- Conclusione: success.
- `Pull CMS API cache`: success.
- `Fast frontend tests`: success.
- `Build Astro frontend`: success.
- `Deploy`: success.
- `Smoke staging`: success.

Smoke remoto:

```text
Smoke staging ok: build 99d79ffcfb38449a864d1e1f1b59c437e382098a su staging.
```

Smoke locale read-only:

```bash
EXPECTED_BUILD_SHA=99d79ffcfb38449a864d1e1f1b59c437e382098a EXPECTED_BUILD_ENV=staging pnpm smoke:staging
```

Esito: success.

## Pagine Verificate

- `/`: smoke tramite script.
- `/nod/`: HTTP 200.
- `/robots.txt`: `User-agent: *` e `Disallow: /`.

Header `/nod/`:

```text
HTTP/2 200
cache-control: no-store, max-age=0
x-robots-tag: noindex, nofollow, noarchive
```

## Crawl Staging

Comando:

```bash
pnpm audit:final:crawl:staging
pnpm audit:final:maps
```

Esito:

- 53 URL inventariati.
- 53 URL ok.
- 0 errori.
- 0 redirect.
- 0 title mancanti.
- 0 description mancanti.
- 0 H1 mancanti.
- `/nod/` presente nell'inventario con HTTP 200.

## Warning Aperti

- Staging e correttamente noindex.
- Restano immagini con `alt=""` da classificare manualmente come decorative o contenuto.
- Alcune aree editoriali possono usare fallback/snapshot reali se il CMS non contiene ancora la source finale.
