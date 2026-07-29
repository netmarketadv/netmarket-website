# AGENTS.md

## Contesto

Netmarket è un'agenzia italiana attiva dal 1986. Questo repository prepara la nuova piattaforma: Astro statico, TypeScript strict e WordPress headless proprietario su `cms.netmarket.it`.

## Regola Di Produzione

Non modificare, testare deploy, connettersi o usare come target operativo `netmarket.it`. Target consentiti: `staging.netmarket.it` e `cms.netmarket.it`.

## Comandi

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm validate`

## Standard

- TypeScript strict, niente `any` non motivati.
- Astro statico, niente SSR, adapter Node, SPA globale o dipendenze Vercel/Netlify.
- React solo per future island realmente interattive.
- PHP 8.2+, namespace `Netmarket\HeadlessCore`, text domain `netmarket-headless-core`.
- WordPress solo API native; vietati ACF, Elementor e page builder.

## Struttura

- `apps/web`: frontend.
- `apps/wordpress`: plugin e codice CMS.
- `packages/*`: config, schemi, SEO, analytics.
- `docs`: guide e ADR.
- `infrastructure`: workflow e script sicuri.

## Git

Usare branch dedicati, commit piccoli, niente force push, niente merge diretto su `main`. Controllare sempre lo stato prima di modificare.

## Qualità

Ogni modifica deve aggiornare test e documentazione quando cambia comportamento. Prima di chiudere: lint, typecheck, test, build, PHP lint, secret scan e controllo diff.

## Accessibilità, SEO, Performance

Target WCAG 2.2 AA, senza dichiarare conformità finché non verificata manualmente. Local e staging sono sempre noindex. Budget iniziali in `docs/performance-budgets.md`.

## Sicurezza

Nessun secret versionato. Gli script distruttivi devono richiedere parametri espliciti, usare `set -Eeuo pipefail`, supportare dry-run e rifiutare target non autorizzati.

## Definition Of Done

Codice verificato, documentazione aggiornata, limiti dichiarati, nessun target produzione configurato per deploy, nessun segreto nel repository.
