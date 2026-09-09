# Project / Case Study System

The case-study system publishes Netmarket projects under `/progetti/` and `/progetti/[slug]/`. It is designed for business decision-makers: the page explains the need, the intervention and the verified outcome before exposing implementation detail.

## Rendering Model

The detail template is modular. Empty modules are not rendered and missing content never produces placeholders.

1. `CaseStudyHero`: client, project type, adaptive H1, short introduction, linked services, sector and year, priority cover.
2. `CaseStudyStory`: up to three concise editorial chapters generated from challenge, approach and solution.
3. `CaseStudyMedia`: one-up, paired, mixed or horizontal device sequences based on available media and `layoutHint`.
4. `CaseStudyResults`: qualitative outcome and up to four verified metrics. The first metric carries primary emphasis.
5. `RelatedProjects`: two or three projects selected by explicit CMS relations or scored by shared services, sectors and editorial topics.
6. `CaseStudyCTA`: shared contact path.

Project-specific presentation copy and art direction for the legacy migration live in `apps/web/src/lib/projects/presentation.ts`. This is a temporary compatibility layer for the eight migrated projects, not fake content. New CMS projects fall back to structured CMS fields.

## CMS Model

The `nm_case_study` content type uses these editorial groups:

- Identity: title, client, public client name, cover, year, status and project URL.
- Classification: `nm_sector`, `nm_capability`, `nm_technology` taxonomies and linked services.
- Narrative: short description, context, challenge, objectives, approach, solution and qualitative result.
- Proof: verified numeric results. Values must include a label and may include context or a period.
- Media: ordered Media Library selection. Attachment alt text and captions are exposed by REST.
- Relationships: contributors, insights and optional manually selected related case studies.
- Conversion and discovery: CTA, SEO, canonical and social metadata.

Editors do not write HTML. Narrative fields are plain text, relations use search controls, and gallery media uses the WordPress Media Library. `additional_content` remains only for migration compatibility and should not be used for new content.

## Data Priority And Fallbacks

1. `GET /netmarket/v1/case-studies` and `GET /netmarket/v1/case-studies/{slug}` from the CMS during static build.
2. The real migration snapshot in `data/migrations/case-studies/case-study-transform-dry-run.json` when the CMS is unavailable.

The snapshot uses local media under `apps/web/public/media/case-studies/legacy/`. Known dimensions are attached in the fallback loader to prevent layout shift. The compatibility layer can be removed after all structured fields have been migrated into `cms.netmarket.it` and verified.

## Related Projects

Manual CMS relations have priority. Without them, candidates receive weight for shared services, shared sectors and shared editorial topics. CMS order is only a deterministic tie-breaker. Draft and current projects are excluded.

## SEO And GEO

- SEO title remains independent from the visible H1.
- Detail pages emit `WebPage`, `BreadcrumbList` and one `CreativeWork` linked to the shared Organization node.
- The case-study schema includes client, year, sector, services, result and image when present.
- Open Graph and Twitter metadata use project-specific titles, descriptions and cover media.
- Client, sector, year, project type, services, intervention and result are present in semantic HTML.
- Legacy `noindex` is preserved where supplied by the migration.

## Media And Performance

- Cover media is eager, `fetchpriority="high"`, dimensioned and discoverable in initial HTML.
- Gallery and related media are lazy, asynchronously decoded and use CMS `srcset`/`sizes` when available.
- The fallback has explicit intrinsic dimensions for every raster asset.
- Detail pages use the light motion mode and require no page-specific client JavaScript.
- Reduced motion remains governed by the shared motion system.

## Migration Coverage

The presentation layer covers Sirene Blu app, VENITALY, Rigomar, Albertini Allestimenti, Progetto-e, Pazzo Design, Sirene Blu contest and BRB. Quantitative metrics appear only for Sirene Blu app, Pazzo Design and BRB because those are the projects with source-backed values.

Validation command:

```sh
pnpm migration:validate:case-studies
```

## Known Content Gaps

- Several legacy images have weak or missing source alt text; contextual fallback alt text is provided in the migrated presentation layer.
- VENITALY and Sirene Blu app remain `noindex` because the legacy migration marks them that way.
- CMS import remains pending until transformed content and media are written to `cms.netmarket.it` through the dedicated CMS deployment process.
