# Agency Page

## Route

`/agenzia/` e la pagina istituzionale statica per presentare Netmarket, il metodo, il team e una selezione clienti.

## Struttura

- hero editoriale;
- statement sul metodo integrato;
- tre pilastri operativi;
- team riutilizzando `TeamSection`;
- clienti riutilizzando `ClientMarquee`;
- CTA finale verso `/contatti/`.

## Dati

Il team usa `apps/web/src/data/team.ts` finche la collezione `nm_person` non diventa la fonte unica pubblicata dal CMS. I clienti usano la lista centralizzata in `apps/web/src/data/home.ts`.

## SEO

La pagina emette:

- canonical assoluto `/agenzia/`;
- breadcrumb `Home > Agenzia`;
- `WebPage`;
- `Organization`;
- `Person` JSON-LD per le persone visibili.

Non inventa dati aziendali non disponibili.
