# Sviluppo Locale

1. Copiare `.env.example` in `.env`.
2. Eseguire `pnpm install`.
3. Avviare `pnpm dev`.
4. Aprire `http://localhost:4321`.

Il CMS remoto non è necessario per la homepage iniziale. Le chiamate CMS future devono passare dal client tipizzato.

Per lo sviluppo quotidiano usare branch dedicati (`feature/*` o `fix/*`) e aprire PR verso `develop`. I push su `develop` aggiornano staging automaticamente; i push su branch feature eseguono solo i controlli di qualità configurati, senza deploy.

Prima di chiedere o fare merge su `develop`, eseguire almeno i controlli rilevanti:

```sh
pnpm typecheck
pnpm test
pnpm build
```

La suite Playwright completa resta disponibile con `pnpm test:e2e`, ma in CI vive nella pipeline `Quality`, non nel deploy staging rapido.
