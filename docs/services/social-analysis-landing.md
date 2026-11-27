# Analisi gratuita per la gestione social

La campagna usa `/gestione-social/`. Sito e reel generici aprono la versione generale. `?settore=fitness` anticipa Pilates e Altro, `?settore=showroom` apre con l’esempio di una visita. Un valore sconosciuto usa la versione generale. Il parametro cambia l’introduzione e l’esempio iniziale. Offerta, prezzo dell’analisi e modulo sono uguali.

## Materiali

- Enrico in apertura proviene dal girato del reel Netmarket 03, take «netmarket video 3 no motion 2», a 6,22 secondi.
- I PNG di Pilates e Altro provengono dalla scena «NM03-01 · Prima e Dopo con gli screenshot» del master Netmarket 03. La pagina offre immagini ingrandibili, complete di testata e nelle proporzioni originali. Il confronto riguarda il lavoro editoriale.
- Il feed e il negozio BRB provengono dalle immagini del caso studio 5210 nel CMS e nell’archivio di migrazione del progetto. [Caso studio BRB](https://netmarket.it/progetti/casi-studio-strategia-digitale-ecommerce-brb/)
- Lo showroom è un esempio di percorso verso un appuntamento. [Il prodotto NØD](https://netmarket.it/nod/)

## Acquisizione

Il form usa `POST /wp-json/netmarket/v1/forms/contact`. Il commerciale riceve nome, azienda, email, obiettivo, settore ed eventuale profilo. La provenienza usa la pagina senza query, con i cinque parametri UTM separati. La copia leggibile nel campo messaggio permette al commerciale di prendere in carico le richieste anche via email. Il backend della landing include i dettagli strutturati nel webhook dedicato. L’environment staging del workflow CMS usa il secret `SOCIAL_ANALYSIS_WEBHOOK_URL`, da valorizzare con una fonte attiva NØD.

Il CMS conferma l’acquisizione commerciale con JSON `{"success":true}` dopo l’accettazione della mail. Il form blocca invii concorrenti e registra una sola conversione `generate_lead` sul posto con `form_id=gestione-social`. Gli errori recuperabili lasciano i valori compilati. GTM e consenso seguono il layout del sito. Staging permette di ispezionare il dataLayer senza inviare eventi alle piattaforme marketing.

## Verifica

Lo smoke mirato è `apps/web/tests/e2e-smoke/social-analysis.spec.ts`. Intercetta la richiesta CMS e controlla campagne, focus, campi obbligatori, errore HTTP, risposta HTML, errore di rete, riprova, doppio invio e dati analytics. Per verificare la consegna vera usare staging con un nominativo riconoscibile, UTM dedicati e un controllo in posta e nella fonte NØD. I link definitivi delle campagne appartengono al dominio production dopo il rilascio protetto.
