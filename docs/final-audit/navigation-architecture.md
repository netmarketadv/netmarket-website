# Navigation Architecture

Date: 2026-09-02

This document records the current navigation direction before homepage and global IA consolidation. It does not authorize production changes.

## Primary Navigation

Recommended public navigation:

| Label | URL | Role | Status |
| --- | --- | --- | --- |
| Progetti | `/progetti/` | Proof and commercial validation | Route exists on staging, CMS case studies missing. |
| Servizi | `/servizi/` | Commercial service discovery | Route exists on staging, CMS services missing. |
| Agenzia | `/agenzia/` | Trust, team, method, local entity | Route exists on staging. |
| Insight | `/insight/` | Editorial depth and search demand capture | CMS content imported. |
| Contatti | `/contatti/` | Conversion | Route exists on staging. |

Recommended primary CTA: `Parliamone` or `Raccontaci il progetto`, pointing to `/contatti/`.

## Mega Menu

The services mega menu should remain compact and crawlable. Use real links, not JavaScript-only destinations.

Priority service entries:

- `/servizi/siti-web/`
- `/servizi/ecommerce/`
- `/servizi/software-e-integrazioni/`
- `/servizi/seo/`
- `/servizi/advertising/`
- `/servizi/social-media/`
- `/servizi/branding-e-comunicazione/`
- `/servizi/content-production/`
- `/servizi/concorsi-a-premi/`

Do not fetch heavy related data in the header. If a featured project is shown, use a small centralized config or a light CMS field after CMS service/project relations are populated.

## Mobile Navigation

- Full-screen menu is acceptable and already aligned with the Awesomic-inspired design direction.
- Submenus should be accordions with native buttons, visible focus, `aria-expanded` and reduced-motion support.
- Hamburger and close button must keep the same position to avoid motor memory friction.

## Footer Navigation

- Footer can include deeper links than header, but every link must return `200` on staging before go-live.
- Current blocker: `/nod/` is linked but returns `404` on staging. Either create a real NOD page or remove/hide the link before go-live.
- Legal links and compliance badges should remain visually quiet and non-card-like where requested.

## IA Rules

- Do not add new top-level public sections unless they have a real editorial/commercial role.
- Do not expose CMS-empty domains as if they were complete.
- Navigation labels should be short, concrete and stable. Avoid campaign slogans inside navigation.
