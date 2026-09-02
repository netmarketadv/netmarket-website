# Project / Case Study System

The project system exposes Netmarket case studies under:

- `/progetti/`
- `/progetti/[slug]/`

The frontend is CMS-first. It tries `GET /netmarket/v1/case-studies` and `GET /netmarket/v1/case-studies/{slug}` during static build.

When the CMS is unreachable in local/staging build, the project system falls back to the real migration snapshot generated from the read-only legacy source. This fallback is not fake content: it comes from `data/migrations/case-studies/case-study-transform-dry-run.json` and uses copied local media under `apps/web/public/media/case-studies/legacy/`.

## Components And Templates

- Archive route: `apps/web/src/pages/progetti/index.astro`
- Detail route: `apps/web/src/pages/progetti/[slug].astro`
- Data loader: `apps/web/src/lib/projects/content.ts`
- Shared card primitive remains `apps/web/src/components/content/ProjectCard.astro`

## Data Priority

1. CMS case studies.
2. Migration snapshot fallback.

The fallback must be removed once the CMS contains the migrated case studies and the build pipeline can read the CMS with server-only credentials.

## SEO

- Archive emits `WebPage` and `BreadcrumbList`.
- Detail emits `CreativeWork` via `caseStudyJsonLd` and `BreadcrumbList`.
- Legacy `noindex` is preserved when present in migrated metadata.
- Canonical paths use the future production domain `https://netmarket.it`.

## Migration

Discovery and validation command:

```sh
pnpm migration:validate:case-studies
```

Generated files:

- `docs/migration/case-study-legacy-inventory.md`
- `docs/migration/case-study-url-map.md`
- `docs/migration/case-study-migration-report.md`
- `data/migrations/case-studies/case-study-inventory.json`
- `data/migrations/case-studies/case-study-transform-dry-run.json`
- `data/migrations/case-studies/case-study-url-map.json`
- `data/migrations/case-studies/redirects-case-studies.json`
- `data/migrations/case-studies/service-map.json`

## Known Gap

The real CMS import is not complete until the transformed case studies, media and clients are written into `cms.netmarket.it`. The local fallback keeps staging usable and traceable, but the CMS remains the intended source of truth.
