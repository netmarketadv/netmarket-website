# Google Business Profile

Questa integrazione collega il sito Netmarket al profilo Google verificato senza copiare recensioni dentro il repository.

## Strategia

- Il sito Astro resta statico.
- Le recensioni pubbliche vengono caricate nel browser con Google Maps JavaScript API e Places Library.
- Il codice usa solo `place_id` e API key pubblica con restrizioni HTTP referrer.
- Le recensioni non vengono salvate nel CMS, nel repository o nell'HTML generato.
- Se le credenziali non sono configurate, il sito mostra solo il link al profilo Google Maps.

Google Maps puo restituire rating, numero recensioni e fino a 5 recensioni pubbliche ordinate da Google. Quando disponibili, ogni recensione mostra nome autore, avatar, link profilo e link alla recensione.

## Variabili

```dotenv
PUBLIC_GOOGLE_MAPS_API_KEY=
PUBLIC_GOOGLE_PLACE_ID=
```

`PUBLIC_GOOGLE_MAPS_API_KEY` e pubblica nel browser: deve essere limitata in Google Cloud.

Restrizioni consigliate:

- API consentita: Maps JavaScript API.
- HTTP referrer consentiti:
  - `https://staging.netmarket.it/*`
  - `https://www.netmarket.it/*`
  - `https://netmarket.it/*`
  - `http://localhost:4321/*` solo per sviluppo locale, se necessario.

## Attivazione

1. Entra nel Google Cloud project proprietario di Netmarket.
2. Abilita Maps JavaScript API.
3. Recupera il Place ID del profilo verificato Netmarket SRL.
4. Crea o usa una API key browser con le restrizioni sopra.
5. Configura le due variabili nello staging.
6. Lancia una build e verifica la sezione recensioni.

## Business Profile API

La Google Business Profile API richiede OAuth con un account che possiede o gestisce il profilo. Serve quando vogliamo:

- leggere l'elenco completo delle recensioni;
- gestire risposte alle recensioni;
- verificare account/location ID del profilo.

Questa parte non va implementata nel frontend statico. Se serve sincronizzare dati editoriali dal profilo proprietario, va fatto con un backend controllato o con una funzione di build autorizzata, rispettando policy Google e senza versionare token.

## Compliance

Quando mostriamo contenuti Google Maps:

- attribuzione autore vicina alla recensione;
- avatar e link autore quando disponibili;
- link diretto alla recensione o al profilo;
- testo che dichiara che le recensioni sono ordinate da Google Maps per rilevanza;
- nessun contenuto Google salvato in modo permanente nel repository.

Riferimenti ufficiali:

- Google Maps JavaScript API, Place Reviews: https://developers.google.com/maps/documentation/javascript/place-reviews
- Google Maps JavaScript API policies and attribution: https://developers.google.com/maps/documentation/javascript/policies
- Google Business Profile API reviews: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews
