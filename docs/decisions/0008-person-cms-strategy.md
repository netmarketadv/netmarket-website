# 0008 Person CMS Strategy

## Stato

Accettata.

## Contesto

Il team e gia presente nel frontend come dataset TypeScript approvato. Lo stesso concetto serve anche per autori editoriali e contributor di progetto.

## Decisione

Introduciamo `nm_person` come fonte CMS definitiva per persone, team, autori e contributor. Il dataset TypeScript resta fallback temporaneo finche i contenuti non sono migrati nel CMS.

## Conseguenze

Team member, autore e contributor diventano ruoli/relazioni della stessa entita Person. Una Person puo avere una relazione opzionale con un WP User, ma non ogni Person deve essere un utente WordPress.
