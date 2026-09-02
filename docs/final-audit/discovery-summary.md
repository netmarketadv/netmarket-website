# Final Audit Discovery Summary

Generated: 2026-09-02T12:22:07.791Z

## Scope Completed

- Read internal governance, design, motion, content architecture, service, project, insight, agency, contact, REST, SEO, accessibility, performance and analytics docs.
- Crawled legacy production read-only: 101 URLs.
- Crawled staging: 53 URLs.
- Audited local CMS cache and confirmed current headless content availability.
- Built preliminary URL decision matrix and redirect master map without applying production changes.

## Key Findings

- Legacy inventory found 90 OK URLs, 11 errors and 23 pages missing meta description.
- Staging inventory found 53 OK URLs and 0 error. Current staging 404: `/nod/`.
- CMS API cache currently exposes 26 insights, but 0 services, 0 case studies, 0 clients, 0 people, 0 resources and 0 testimonials.
- Services and projects still rely on validated fallback data during build; insight content is now imported in CMS.
- Staging pages emit no missing titles/descriptions/H1 in the crawl, but image alt usage needs manual review because decorative and content images are mixed.
- Duplicate paginated Insight H1 detected: `Archivi o Insight.` on paginated archive pages.

## Generated Outputs

- `data/final-audit/legacy-site-inventory.json`
- `docs/final-audit/legacy-site-inventory.md`
- `data/final-audit/staging-site-inventory.json`
- `docs/final-audit/staging-site-inventory.md`
- `data/final-audit/url-decision-matrix.json`
- `docs/final-audit/url-decision-matrix.md`
- `data/migrations/redirects-master.json`
- `docs/final-audit/redirects-master.md`
- `data/final-audit/manual-review.json`
- `docs/final-audit/manual-review.md`

## Preliminary Counts

- URL decision rows: 103
- Redirect candidates: 54
- Unverified redirect targets: 0
- Manual review items: 101

## Current Blockers For Go-Live Readiness

- CMS is not yet the source of truth for services, case studies, clients, people, resources and testimonials.
- `/nod/` is linked on staging but returns 404.
- Redirect strategy is prepared but not validated against real traffic/backlink data.
- No Search Console, GA4 or Bing data exports found in this audit pass.
