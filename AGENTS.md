# AGENTS.md

## Contesto

Netmarket è un'agenzia italiana attiva dal 1986. Questo repository prepara la nuova piattaforma: Astro statico, TypeScript strict e WordPress headless proprietario su `cms.netmarket.it`.

## Regola Di Produzione

Non modificare, testare deploy o usare come target operativo di scrittura `netmarket.it`. Target operativi consentiti per scritture, deploy, test di pubblicazione e integrazioni sono solo `staging.netmarket.it` e `cms.netmarket.it`.

Eccezione autorizzata per migrazione e audit contenuti: sono consentite richieste HTTP `GET` e `HEAD` read-only verso `https://netmarket.it` esclusivamente per crawl responsabile, inventory, confronto SEO, raccolta URL, analisi HTML, sitemap, robots, media pubblici e WordPress REST pubblico. Questa eccezione non autorizza login, POST/PUT/PATCH/DELETE, modifiche a WordPress legacy, installazione plugin, redirect, DNS, Search Console, robots/sitemap di produzione, cancellazioni, upload o qualunque operazione che cambi stato sul sito legacy.

## Branch E Deploy

- `develop` pubblica automaticamente il frontend su `staging.netmarket.it` tramite `Deploy Staging`.
- `main` è riservato al futuro production deploy, ma oggi non deve pubblicare su `netmarket.it`.
- Branch `feature/*` e `fix/*` non pubblicano su SiteGround; la full QA automatica passa dalle Pull Request verso `develop` o `main`.
- Il deploy frontend e il deploy CMS sono separati: una modifica Astro non deve deployare automaticamente il plugin WordPress.
- Ogni build staging deve esporre `netmarket-build`, `netmarket-build-time` e `netmarket-environment`; lo smoke test deve verificare lo SHA online.
- Prima di un deploy staging reale viene salvato uno snapshot rollback `before-<sha>.tgz` sullo stesso hosting.
- La source of truth operativa è `Git -> GitHub -> GitHub Actions -> SiteGround`. Non usare normalmente FTP, SCP, rsync locale diretto, modifiche file server o upload manuali SiteGround se la pipeline ufficiale funziona.
- Se una modifica deve essere pubblicata su staging, porta il codice corretto su `develop`, verifica push, `Deploy Staging`, smoke test, build SHA online e `https://staging.netmarket.it` prima di dichiararla pubblicata.

## Comandi

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm smoke:staging`
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

Ogni modifica deve aggiornare test e documentazione quando cambia comportamento. Per sviluppo quotidiano: test/typecheck/build rilevanti e smoke staging dopo deploy. La full QA completa vive in `.github/workflows/quality.yml` e include lint, TypeScript, Vitest, build Astro, PHP lint, PHPCS, PHPStan, secret scan e Playwright E2E.

## Accessibilità, SEO, Performance

Target WCAG 2.2 AA, senza dichiarare conformità finché non verificata manualmente. Local e staging sono sempre noindex. Budget iniziali in `docs/performance-budgets.md`.

## Motion

`docs/motion-system.md` è la source of truth per animazioni, easing, durate, distanze e preset. Non creare easing arbitrari o nuove animazioni non documentate. Usare i preset esistenti, rispettare sempre `prefers-reduced-motion`, e dare priorità a performance, accessibilità e contenuto visibile senza JavaScript.

## Sicurezza

Nessun secret versionato. Gli script distruttivi devono richiedere parametri espliciti, usare `set -Eeuo pipefail`, supportare dry-run e rifiutare target non autorizzati.

## Definition Of Done

Codice verificato, documentazione aggiornata, limiti dichiarati, nessun target produzione configurato per deploy, nessun segreto nel repository.
