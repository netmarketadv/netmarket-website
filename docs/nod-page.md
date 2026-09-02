# NØD Landing Page

Date: 2026-09-02

Route: `/nod/`

## Purpose

NØD is positioned as a proprietary Netmarket product, not as a generic service page. The page explains how NØD connects marketing acquisition with the commercial process: lead capture, pipeline, task, follow-up, automation, AI support and measurement.

## Components

- `NodHero`
- `NodProductNav`
- `NodProblem`
- `NodBridge`
- `NodProductTour`
- `NodLeadDetail`
- `NodAutomationAi`
- `NodIntegrations`
- `NodRevenueAudience`
- `NodWorkspace`
- `NodBeta`
- `NodCTA`
- `NodBetaForm`
- `NodProductFrame`

Shared components reused:

- `BaseLayout`
- `Button`
- `FAQBlock`

## Config

Editable data lives in `apps/web/src/data/nod.ts`.

Use it for:

- product screenshot paths;
- product tour tabs;
- integration availability labels;
- beta pricing;
- FAQ content.

Pricing is intentionally centralized:

```ts
export const nodPricing = {
  regularMonthlyPrice: 299,
  betaMonthlyPrice: 0,
  currency: 'EUR',
  billingUnit: 'mese',
  betaLabel: 'Beta privata'
};
```

## Screenshot Replacement

The page is ready for these real product screenshots:

- `/images/nod/dashboard.webp`
- `/images/nod/leads.webp`
- `/images/nod/lead-detail.webp`
- `/images/nod/pipeline.webp`
- `/images/nod/calendar.webp`
- `/images/nod/communications.webp`
- `/images/nod/ai-assistant.webp`
- `/images/nod/automations.webp`
- `/images/nod/reports.webp`
- `/images/nod/sources.webp`

If a file is missing, `NodProductFrame` renders a neutral product mock placeholder. To replace placeholders, add WebP screenshots to `apps/web/public/images/nod/` using the exact filenames above.

## Form

The beta form posts to the existing Netmarket contact endpoint through `submitContactForm`. Extra NØD-specific answers are serialized into the message body and tracked with `form_id: nod-beta`.

## SEO

The page includes:

- production canonical `/nod/`;
- breadcrumb JSON-LD;
- `SoftwareApplication` JSON-LD;
- visible FAQ and FAQPage JSON-LD;
- no ratings, fake reviews or invented product metrics.

Staging remains noindex through environment robots logic.

## QA Notes

Verified locally:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- Playwright local QA at 390, 768 and 1440 widths.

Known limitation:

- Real NØD screenshots are not yet present, so the current visual uses CSS product placeholders.
