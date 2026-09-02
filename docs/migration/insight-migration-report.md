# Insight Migration Report

Generated from public read-only REST snapshots. The content is preserved conservatively: headings, paragraphs, lists, links and images are kept, while legacy wrappers, inline styles, scripts and shortcode-like fragments are removed.

## Summary

- Legacy posts found: 26
- Success: 20
- Success with warnings: 6
- Public legacy author: NetAdmin
- Person matches: 0 automatic matches

## CMS Import Status

Status: imported to `cms.netmarket.it` on 2026-09-02.

- Imported posts: 26
- WordPress demo post `Hello world!`: moved to draft
- Media: imported or reused in the CMS media library
- Frontend staging: deployed from CMS cache and smoke-tested
- Related services: deferred until matching `nm_service` posts exist in the CMS; source slugs are preserved in `nmhc_migration_related_service_slugs`

Operational importer:

```sh
pnpm migration:insights:cms
```

Use `--dry-run`, `--skip-media` and `--force` for controlled re-runs.

## Manual Review

- Cosa fa una Web Agency?: missing_featured_image
- Maximulta a Meta dal garante privacy irlandese: 1,2 miliardi di euro: missing_featured_image
- THREADS: NUOVO SOCIAL DI META?: missing_featured_image
- RECENSIONI ONLINE: CREATE DALL’UOMO O DAL “AI”?: missing_featured_image
- Il passaggio da Google Analytics a GA4: missing_featured_image
- 5 APP PER LA PRODUTTIVITA’: ecco come diventare efficienti: missing_featured_image
