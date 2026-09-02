# apps/web

- Astro deve rimanere statico: niente adapter Node, SSR o SPA globale.
- TypeScript sempre strict.
- React va aggiunto solo per island realmente interattive.
- Staging e local devono restare `noindex`.
- Ogni nuova pagina deve usare `BaseLayout` e il componente SEO centrale.
