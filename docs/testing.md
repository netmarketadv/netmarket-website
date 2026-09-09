# Testing

## Filosofia

Il progetto distingue tre livelli:

- Fast development loop: feedback rapido per sviluppo quotidiano.
- Staging validation: deploy veloce su `staging.netmarket.it` con smoke reali post deploy.
- Full release validation: controlli completi prima di `main`/release.

Regola operativa: small change -> small validation, medium change -> targeted validation, release/critical change -> full validation.

## Comandi

- `pnpm check:fast`: lint, typecheck, unit e build.
- `pnpm test:e2e:smoke`: Playwright smoke rapido sui percorsi critici.
- `pnpm test:e2e`: suite Playwright completa.
- `pnpm smoke:staging`: smoke HTTP build SHA/environment post deploy.

Non usare `pnpm test:e2e` come default dopo modifiche CSS, copy, spacing, colore o piccole animazioni. Usarlo per release, modifiche E2E, routing, navigazione, form, flussi critici o quando il rischio lo giustifica.

## Misure Di Riferimento

Rilevazioni locali del 2026-09-02, con Node locale `v26.7.0` fuori range progetto ma CI su Node 22:

- Before: `pnpm test:e2e` con `astro dev` ha richiesto circa 7.7 minuti localmente; in CI una run PR precedente ha raggiunto 18.6 minuti con failure E2E.
- After: `pnpm check:fast` passa in circa 20 secondi localmente.
- After: `pnpm test:e2e:smoke` passa in circa 11 secondi localmente usando build statica e `astro preview`.
- After: `pnpm test:e2e` passa in circa 1.3 minuti localmente usando build statica e `astro preview`.
- After GitHub PR `Quality Fast`: job principale `fast-checks` 1m32s, `wordpress-fast` 12s, `secrets-fast` 19s.
- After GitHub `Deploy Staging`: 2m56s end-to-end con cache CMS, `pnpm check:fast`, deploy, smoke HTTP e Playwright smoke. Prima esecuzione con download/cache browser Playwright inclusi.
- After GitHub `Deploy Staging` con cache Playwright già disponibile: 2m24s di run, con job principale da 2m19s.
- After GitHub staging smoke: Playwright smoke remoto 4.7s; smoke locale contro `https://staging.netmarket.it` 1.8s.

Gli E2E usano build statica + `astro preview`, non `astro dev`, per evitare flakiness da Vite dependency optimization e per avvicinare i test a staging/produzione.

## Deploy Staging Rapido

Il deploy staging non esegue la suite completa. Il suo obiettivo è pubblicare velocemente una build frontend verificabile:

- test unit essenziali di `@netmarket/web`;
- `astro check` e `astro build` tramite `pnpm --filter @netmarket/web build`;
- rsync verso `staging.netmarket.it`;
- smoke test remoto con verifica di `netmarket-build` e `netmarket-environment`.
- Playwright smoke contro il vero `https://staging.netmarket.it`.

## Quality Completa

`quality-fast.yml` gira su PR verso `develop` e manual trigger. Usa path filtering per evitare WordPress checks quando cambia solo frontend e viceversa. I job obsoleti sullo stesso ref vengono cancellati. Su push `develop`, il fast loop vive direttamente in `deploy-staging.yml` per evitare installazioni e build duplicate.

Controlli previsti in `quality.yml` / `Quality Full`:

- ESLint.
- TypeScript strict.
- Vitest.
- Build Astro.
- Playwright E2E.
- PHP lint.
- PHPCS e PHPStan dopo installazione Composer.
- Secret scan.

I job sono separati per permettere l'esecuzione parallela. Playwright E2E completo resta nella QA completa e non blocca ogni deploy staging. La full Quality gira su PR verso `main`, push `main` o manual trigger.

Un test WordPress completo richiede un'istanza WordPress con database e non è incluso nel bootstrap locale.
