# Go-Live Runbook

Date: 2026-09-02

This is a preparation document only. It does not authorize production go-live.

## Pre-Go-Live Blockers

Resolve or explicitly accept:

- `docs/final-audit/discovery-summary.md` blockers.
- `/nod/` returns `404` on staging while linked from footer.
- CMS is missing services, case studies, clients, people, resources and testimonials.
- Redirect master has no Search Console, Analytics or backlink priority data.
- Image alt review is not complete.
- Staging must remain noindex until the production switch.

## Required Verification

1. Run final crawl and maps:

```sh
pnpm audit:final
```

2. Pull authenticated CMS cache and build:

```sh
CMS_API_CACHE_DIR="$PWD/apps/web/.cms-cache/netmarket/v1" pnpm build
```

3. Run quality checks:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm php:lint
pnpm secrets:scan
```

4. Smoke staging:

```sh
pnpm smoke:staging
```

5. Manual QA:

- 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 viewport checks.
- Header and mobile menu.
- Footer legal/compliance badges.
- Homepage, services, projects, agency, insights, contacts.
- Forms, Google reviews, maps/trust integrations.
- Reduced motion.
- Keyboard navigation.

## Production Cutover Inputs Needed

- Final DNS plan.
- Final production deploy path.
- Search Console property access.
- GA4 and conversion measurement confirmation.
- Bing Webmaster Tools access.
- Robots.txt crawler policy decision.
- Redirect implementation target and owner.
- Production rollback plan.

## Redirect Deployment

Use `data/migrations/redirects-master.json` as the source of truth after manual review. Do not apply redirects from crawler guesses alone.

After deployment:

- test representative legacy URLs;
- verify no redirect chains;
- verify canonical destination pages return `200`;
- keep an export of the applied redirect rules.

## Search And AI Crawler Policy

Use `docs/final-audit/search-ai-research.md` as the policy source. Production robots should:

- allow public search crawlers for indexable frontend pages;
- keep CMS/admin/private paths protected;
- declare the production sitemap;
- avoid blocking desired AI search retrieval crawlers if visibility is a goal;
- decide separately on model-training tokens where official crawler documentation supports that distinction.

## Post-Go-Live

- Submit sitemap in Search Console and Bing Webmaster Tools.
- Monitor 404s, redirects, indexing, Core Web Vitals and server logs.
- Re-run crawl after DNS/cache propagation.
- Compare important legacy URLs against the redirect master.
- Keep staging noindex and separate from production.
