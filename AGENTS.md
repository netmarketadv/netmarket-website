# AGENTS.md

## Contesto

Netmarket è un'agenzia italiana attiva dal 1986. Questo repository prepara la nuova piattaforma: Astro statico, TypeScript strict e WordPress headless proprietario su `cms.netmarket.it`.

## Regola Di Produzione

Target operativi consentiti per scritture, deploy, test di pubblicazione e integrazioni sono `staging.netmarket.it`, `cms.netmarket.it` e, per il go-live finale tramite pipeline production protetta, `netmarket.it`.

Per migrazione e audit contenuti sono consentite richieste HTTP `GET` e `HEAD` read-only verso `https://netmarket.it`. Le modifiche production sono consentite esclusivamente dal workflow production approvato, per pubblicare il frontend statico, redirect, robots e sitemap previsti dal candidate validato; restano vietate modifiche manuali al WordPress legacy, plugin, database, DNS e Search Console.

## Branch E Deploy

- `develop` pubblica automaticamente il frontend su `staging.netmarket.it` tramite `Deploy Staging`.
- `main` pubblica `netmarket.it` esclusivamente tramite il workflow production protetto, avviato manualmente con conferma esplicita.
- Branch `feature/*` e `fix/*` non pubblicano su SiteGround; la full QA automatica passa dalle Pull Request verso `develop` o `main`.
- Il deploy frontend e il deploy CMS sono separati: una modifica Astro non deve deployare automaticamente il plugin WordPress.
- Ogni build staging deve esporre `netmarket-build`, `netmarket-build-time` e `netmarket-environment`; lo smoke test deve verificare lo SHA online.
- Prima di un deploy staging reale viene salvato uno snapshot rollback `before-<sha>.tgz` sullo stesso hosting.
- La source of truth operativa è `Git -> GitHub -> GitHub Actions -> SiteGround`. Non usare normalmente FTP, SCP, rsync locale diretto, modifiche file server o upload manuali SiteGround se la pipeline ufficiale funziona.
- Se una modifica deve essere pubblicata su staging, porta il codice corretto su `develop`, verifica push, `Deploy Staging`, smoke test, build SHA online e `https://staging.netmarket.it` prima di dichiararla pubblicata.
- Loop quotidiano: `edit -> targeted checks -> commit -> push develop -> Deploy Staging (check:fast -> deploy -> smoke)`.
- Non aspettare o lanciare automaticamente la full E2E suite durante sviluppo normale, salvo rischio reale o richiesta esplicita.

## Comandi

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm check:fast`
- `pnpm test:e2e:smoke`
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

Ogni modifica deve aggiornare test e documentazione quando cambia comportamento. Scegliere sempre il livello minimo di validazione sufficiente:

- small change: lint/build mirati o controllo del package interessato;
- medium change: lint, typecheck, unit e build;
- functional/routing/form/navigation change: aggiungere smoke E2E mirato;
- release o merge verso `main`: full validation e full Playwright E2E.

Per sviluppo quotidiano preferire `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:fast` o comandi filtrati. Non lanciare automaticamente `pnpm test:e2e` per copy, CSS, spacing, colore, piccole animazioni o refactor locali non critici. Usare `pnpm test:e2e:smoke` per controlli funzionali rapidi. Usare `pnpm test:e2e` solo quando richiesto, prima di release, su modifiche E2E, routing, navigazione, form, flussi critici o quando il rischio lo giustifica.

`Quality Fast` gira su PR verso `develop` e manual trigger: frontend fast checks, WordPress fast checks solo se cambiano file pertinenti, secret scan e path filtering. Su push `develop`, `Deploy Staging` esegue direttamente `pnpm check:fast`, deploy e smoke per evitare workflow duplicati. `Quality Full` vive in `.github/workflows/quality.yml` e gira su PR verso `main`, push `main` o manual trigger: lint, TypeScript, Vitest, build Astro, PHP lint, PHPCS, PHPStan, secret scan e Playwright E2E completo.

## Accessibilità, SEO, Performance

Target WCAG 2.2 AA, senza dichiarare conformità finché non verificata manualmente. Local e staging sono sempre noindex. Budget iniziali in `docs/performance-budgets.md`.

## Motion

`docs/motion-system.md` è la source of truth per animazioni, easing, durate, distanze e preset. Non creare easing arbitrari o nuove animazioni non documentate. Usare i preset esistenti, rispettare sempre `prefers-reduced-motion`, e dare priorità a performance, accessibilità e contenuto visibile senza JavaScript.

## Design System

`docs/design-system.md` è la source of truth del linguaggio visivo Netmarket e `apps/web/src/styles/tokens.css` contiene i token implementati. Prima di introdurre un nuovo pattern, verificare se è già coperto da primitive o componenti canonici; le eccezioni di pagina restano locali e non diventano standard senza riuso comprovato. La pagina interna `/design-system/` è il catalogo visuale di controllo e deve rimanere coerente con la documentazione.

## Sicurezza

Nessun secret versionato. Gli script distruttivi devono richiedere parametri espliciti, usare `set -Eeuo pipefail`, supportare dry-run e rifiutare target non autorizzati.

## Definition Of Done

Codice verificato, documentazione aggiornata, limiti dichiarati, deploy production consentito solo tramite environment protetto, nessun segreto nel repository.
