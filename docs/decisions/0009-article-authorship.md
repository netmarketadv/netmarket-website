# 0009 Article Authorship

## Stato

Accettata.

## Contesto

Gli articoli usano WordPress `post`, ma l'autore pubblico puo essere una persona editoriale diversa dall'utente CMS tecnico.

## Decisione

`post` puo dichiarare `author_person` verso `nm_person`. Se presente, JSON-LD Article usa quella Person. In assenza di Person collegata, il fallback sicuro e Organization quando appropriato.

## Conseguenze

Non duplicheremo nomi autore nei post. Il legame WP User -> Person resta opzionale e serve per authorship avanzata.
