# Testing

## Deploy Staging Rapido

Il deploy staging non esegue la suite completa. Il suo obiettivo è pubblicare velocemente una build frontend verificabile:

- test unit essenziali di `@netmarket/web`;
- `astro check` e `astro build` tramite `pnpm --filter @netmarket/web build`;
- rsync verso `staging.netmarket.it`;
- smoke test remoto con verifica di `netmarket-build` e `netmarket-environment`.

## Quality Completa

Controlli previsti in `quality.yml`:

- ESLint.
- TypeScript strict.
- Vitest.
- Build Astro.
- Playwright E2E.
- PHP lint.
- PHPCS e PHPStan dopo installazione Composer.
- Secret scan.

I job sono separati per permettere l'esecuzione parallela. Playwright E2E resta nella QA completa e non blocca ogni deploy staging.

Un test WordPress completo richiede un'istanza WordPress con database e non è incluso nel bootstrap locale.
