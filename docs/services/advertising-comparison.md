# Variante advertising — confronto editoriale (archivio)

La variante è stata consolidata in `/advertising/` il 14 ottobre 2026. `/advertising-v2/` viene reindirizzata con 301. Le sezioni trasferite e il webhook sono descritti in `advertising-landing.md`. Le note seguenti documentano il confronto precedente, non lo stato corrente.

## Destinazione e isolamento

Nuova route `/advertising-v2/`, affiancata a `/advertising/`. La prima versione, i suoi dati e i suoi stili restano invariati. Entrambe usano gli stessi componenti canonici. La variante conserva il canonical `/advertising/` e non entra nella sitemap: confronto pubblico senza proporre un secondo URL equivalente ai motori. Metadati e schema Service preservati; FAQPage generata dalle FAQ effettive della variante. Local e staging restano noindex.

Il brief autorizza esplicitamente la pubblicazione della seconda versione. Solo pipeline production protetta, dopo Quality Full e revisione del candidato; nessuna modifica a container GTM, configurazioni Ads o CMS.

## Evidenze e scelte editoriali

- Verificato nel codice: le precedenti CTA compilano solo i campi vuoti; il messaggio automatico supera da solo la lunghezza minima. La variante elimina il messaggio generato e distingue selezione del canale dall’obiettivo.
- Quattro casi numerici forniti nell’HTML utente del 9 ottobre, importati senza duplicare o cambiare i valori. Tutti riguardano lead generation. Pilates: 41 iscritti, 3.100/41 = 75,61 € per iscritto; CLV totale stimato 16.400 €, rapporto CLV/spesa 5,29× nei dettagli, mai ROAS. Altri casi: fatturato attribuito / spesa Ads = 15,66×, 20,09×, 14,19×.
- Date precise, canali dei casi e criteri tecnici di attribuzione non sono documentati: non aggiunti. Milano rimane l’unico territorio esplicito nei casi. Non sono introdotti nomi o loghi per identificare i quattro casi anonimi.
- Non disponibile una prova ecommerce Ads con attribuzione e autorizzazione documentate: nessun nuovo risultato ecommerce. I visual BRB già pubblicati su richiesta dell’utente restano prova di creatività e sviluppo ecommerce, con didascalia che esclude risultati Ads. I loghi esistenti restano riferiti a collaborazioni in marketing, comunicazione e tecnologia. Il riuso conserva la selezione precedentemente approvata; non costituisce una nuova attestazione di liberatoria.
- Recensioni non riscritte. Fonte registrata: `googleReviewsMeta`, Google Place Details API, recupero 1 settembre 2026; rating e conteggio esistenti da `googleBusinessProfile`. Nessun aggiornamento numerico senza riscontro affidabile più recente.
- Non reperito un documento autonomo “Netmarket Brand Voice” nel repository. Applicati tono e gerarchia del design system e del brief: professionale, diretto, senza garanzie o superlativi.

Rimossi dalla variante: video in preparazione, blocco geografico esteso, ripetizioni nei badge metodo, output ridondanti delle fasi, avatar doppi e numeri generici del team. Sintetizzati obiettivi, FAQ e condizioni; prezzo, IVA e budget escluso restano immediatamente visibili. Team e metodo hanno funzioni distinte. Nessun approfondimento nuovo usato per nascondere testo rimosso.

## Form, precompilazione e tracking

`ContactForm.channelOptions` è opzionale: solo la variante espone un canale facoltativo tramite campi e stili canonici. Nessun campo aggiuntivo nelle altre pagine. L’obiettivo resta nel campo API `service`; il canale viene aggiunto come riga etichettata al messaggio soltanto al momento dell’invio, dopo aver validato la descrizione scritta dall’utente. Non richiede modifiche allo schema CMS. Il limite 2.900 caratteri della variante riserva spazio al contesto nel limite CMS di 3.000.

`nextAutomaticChoice` permette alle CTA di aggiornare la propria scelta precedente. Una selezione manuale, anche uguale a quella suggerita, viene preservata; svuotare il campo consente una nuova proposta. Canale e obiettivo sono indipendenti. Il messaggio non viene mai scritto o modificato dalle CTA; stringhe vuote, spazi o meno di dieci caratteri utili non consentono l’invio.

`initAdvertisingLanding({ prefill: false })` riusa rail e dettagli della landing con la precompilazione legacy disattivata solo per la variante. La versione originale mantiene il comportamento per il confronto.

TrackingController riconosce la nuova route come landing e ammette il nuovo `form_id=advertising-landing-v2` per la conferma su `/grazie/`. Il clic CTA resta distinto dal lead. Solo JSON `success:true` dopo POST produce la conferma; nessun dato personale o contenuto del modulo entra negli eventi. Restano consenso, attribuzione, blocco doppi invii e fallback quando sessionStorage non è disponibile. La nuova allowlist è necessaria per non perdere la conversione della variante; non altera gli altri ID ammessi.

## Controlli

Test mirati unitari: sostituzione delle scelte automatiche, protezione delle scelte manuali/ripristinate, svuotamento, descrizione indipendente dal contesto. Smoke dedicati: precompilazione, validazione, doppio invio, successo simulato e conversione unica, errori rete e challenge, privacy analytics, tutti i casi via tastiera mobile, rail senza scroll trap, overflow 320–1728px, CTA fissa e menu, formule, canonical e FAQ/schema.

Gli invii sono intercettati con mock: non inviare lead di prova a destinatari reali. Gli smoke e la suite completa includono la prima versione come regressione.

Il confronto del testo usa il DOM renderizzato in reduced motion, sotto `main`, senza menu duplicati, script, metadata, SVG, dialog duplicati e copie aria-hidden dei rail. Il conteggio principale include il contenuto leggibile lungo la pagina con dettagli chiusi; quello aggiuntivo include anche i contenuti dei dettagli, per evitare una riduzione ottenuta solo nascondendo testo. Testimonianze troncate visivamente contate integralmente in entrambe le versioni: stima conservativa. Risultati e verifiche visive da registrare a fine QA.

### Esito del candidato — 12 ottobre 2026

- `pnpm check:fast`: lint, typecheck, 84 test unitari e build di 69 pagine superati. Build locale con snapshot/fallback CMS; non viene presentata come verifica dell’invio reale.
- 31 smoke superati su entrambe le landing e percorso staging; 9 test della variante ripetuti e superati dopo gli ultimi ritocchi. Nuovo focus del rail porta immediatamente in vista l’intera card, anche da tastiera su mobile.
- Controllo visivo desktop e mobile 390×844: hero, risultati, prezzi, menu e form. Didascalia BRB resa leggibile anche sotto 1100px, senza cambiare il visual originale.
- Conteggio indicativo DOM: testo normalmente visibile 1.464 → 991 parole (−32,3%); includendo dettagli e FAQ 1.960 → 1.358 (−30,7%). Esclusi anche le option dei select nativi e i placeholder dei campi, con identico criterio per entrambe le versioni. I testi eliminati non sono stati trasferiti in nuovi blocchi chiusi.
- Il link pubblico Google non è leggibile dal tool di ricerca di questa sessione; conservati voto e conteggio documentati, senza dichiarare un aggiornamento al giorno della pubblicazione.
- Resta richiesta la Quality Full della PR prima del merge/deploy; gli esiti production saranno verificati sulla revisione pubblicata.
