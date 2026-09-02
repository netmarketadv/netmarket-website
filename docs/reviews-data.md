# Netmarket Reviews Data

## Fonte

Le recensioni mostrate nel frontend sono dati statici salvati in `apps/web/src/data/reviews.ts`.

Fonte utilizzata il 2026-09-01:

- Google Place Details API
- Place ID: `ChIJqQav5mnafkcRWAtHnewoKQo`
- Profilo pubblico: `https://share.google/DPsZDzWohdLvBMwmZ`

Google ha restituito 5 recensioni pubbliche tramite endpoint Place Details. Non sono state inventate, riscritte o integrate recensioni non disponibili dalla risposta API.

## Regole

- La fonte visibile nel sito e `Google`.
- Le date e le descrizioni relative, come `2 anni fa`, non vengono mostrate.
- Rating, autore, testo, avatar e link autore vengono usati solo se presenti nella risposta pubblica.
- Il frontend non chiama Google a runtime per renderizzare le recensioni.

## Aggiornamento

1. Recuperare le recensioni pubbliche dal profilo Google verificato.
2. Aggiornare `apps/web/src/data/reviews.ts` mantenendo testi, nomi e rating fedeli alla fonte.
3. Eseguire la validazione Zod implicita tramite test, typecheck e build.
4. Controllare `/design-system/` e homepage a 390, 430, 768, 1024, 1280, 1440 e 1920 px.
5. Eseguire `pnpm validate`.
6. Pubblicare su `staging.netmarket.it`.
