# apps/web

- Astro deve rimanere statico: niente adapter Node, SSR o SPA globale.
- TypeScript sempre strict.
- React va aggiunto solo per island realmente interattive.
- Staging e local devono restare `noindex`.
- Ogni nuova pagina deve usare `BaseLayout` e il componente SEO centrale.
- Per modifiche UI normali usare validazione proporzionata: lint/typecheck/unit/build o test mirati.
- `pnpm test:e2e:smoke` verifica i percorsi critici rapidi; `pnpm test:e2e` completo va usato solo per release, routing/navigazione/form/flussi critici o richiesta esplicita.
- In Playwright preferire locator/eventi a sleep fissi; le animazioni decorative non devono rallentare gli smoke test.
