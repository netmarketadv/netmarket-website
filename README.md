# Netmarket Website

Nuova piattaforma web Netmarket: frontend statico Astro, WordPress headless su `cms.netmarket.it`, staging su `staging.netmarket.it` e produzione futura su `netmarket.it`.

Il sito WordPress attuale in produzione non deve essere modificato da questo repository.

## Architettura

- `apps/web`: frontend Astro statico, TypeScript strict, CSS custom e componenti accessibili.
- `apps/wordpress`: plugin proprietario WordPress `Netmarket Headless Core`.
- `packages/schemas`: schemi Zod condivisi per le risposte REST.
- `packages/seo`: utility SEO e JSON-LD tipizzate.
- `packages/analytics`: eventi `dataLayer` tipizzati.
- `infrastructure`: workflow e script SiteGround per staging e CMS, con guard rail anti-produzione.
- `docs`: guide operative e ADR.

## Requisiti

- Node.js LTS 22.
- pnpm 11.
- PHP 8.2+ per il plugin WordPress.
- WordPress target: 6.6+.

## Comandi

```sh
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm smoke:staging
pnpm format
pnpm validate
```

I controlli PHP statici completi richiedono Composer e le dipendenze del plugin.

## Ambienti

Copie locali partono da `.env.example`. In staging e production le variabili obbligatorie devono essere esplicite; i token non devono mai essere versionati.

## CI/CD

`develop` pubblica automaticamente il frontend su `staging.netmarket.it` con una pipeline rapida: install, test essenziali web, build Astro, rsync e smoke test con verifica dello SHA pubblicato. Durante la migrazione anche `chore/bootstrap-netmarket-platform` pubblica staging.

`quality.yml` resta separato e contiene i controlli approfonditi: lint, typecheck, unit test, build, controlli PHP, secret scan e Playwright E2E completo.

Il CMS su `cms.netmarket.it` ha workflow dedicato. `netmarket.it` non viene mai usato come target operativo da questo repository.

## Stato

Piattaforma staging attiva: frontend Astro statico, plugin headless, schemi condivisi, design system, workflow staging rapido e quality pipeline separata.
