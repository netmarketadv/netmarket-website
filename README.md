# Netmarket Website

Nuova piattaforma web Netmarket: frontend statico Astro, WordPress headless su `cms.netmarket.it`, staging futuro su `staging.netmarket.it` e produzione futura su `netmarket.it`.

Il sito WordPress attuale in produzione non deve essere modificato da questo repository.

## Architettura

- `apps/web`: frontend Astro statico, TypeScript strict, CSS custom e componenti accessibili.
- `apps/wordpress`: plugin proprietario WordPress `Netmarket Headless Core`.
- `packages/schemas`: schemi Zod condivisi per le risposte REST.
- `packages/seo`: utility SEO e JSON-LD tipizzate.
- `packages/analytics`: eventi `dataLayer` tipizzati.
- `infrastructure`: workflow e script futuri per SiteGround, inattivi di default.
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
pnpm format
pnpm validate
```

I controlli PHP statici completi richiedono Composer e le dipendenze del plugin.

## Ambienti

Copie locali partono da `.env.example`. In staging e production le variabili obbligatorie devono essere esplicite; i token non devono mai essere versionati.

## Deploy

Il deploy reale non è attivo. Gli script e i workflow rifiutano target diversi da `staging.netmarket.it` o `cms.netmarket.it` secondo lo scopo.

## Stato

Bootstrap tecnico iniziale: frontend minimale di staging, plugin headless installabile, schemi condivisi, documentazione, workflow e script di verifica.
