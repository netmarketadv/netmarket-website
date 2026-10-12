# Landing advertising

Route `/advertising/`, indicizzabile solo in produzione e inclusa in sitemap. Pagina di acquisizione dedicata, affiancata al servizio istituzionale.

## Struttura e percorso

Hero con composizione di asset reali BRB, CTA blu e recensioni; loghi clienti; competenze con produzione fotografica reale; tre obiettivi; slider progetti e approfondimenti in pagina; metodo; team; mappa interattiva dei mercati; recensioni Google; FAQ; modulo in pagina.

Riferimento di struttura: https://www.levthn.com/performance-marketing/. Branding, testi, dati e asset restano Netmarket. La maggiore presenza di media, prova sociale e movimento deriva dal brief di revisione; non vengono replicate testimonianze o risultati del riferimento.

`advertisingShell` configura menu e CTA in un solo punto. BaseLayout seleziona LandingHeader/LandingFooter. Logo, griglia, pulsanti e PartnerBadges sono condivisi con il sito. Nel menu e nei progetti non ci sono link verso altre pagine del sito: le schede aprono approfondimenti interni. Restano solo le uscite intenzionali per fonti pubbliche, certificazioni, privacy ed email.

## Contenuti reali

- BRB: metriche dalla presentazione canonica, primi tre mesi dal lancio rispetto allo storico. Riguardano il progetto integrato, non le sole campagne Ads né garanzie di rendimento.
- Pazzo Design e Progetto-e: prove delle competenze ecommerce, sito e contenuti; nessuna metrica pubblicitaria inventata.
- Ritratti da team.ts, ottimizzati in WebP da foto del CMS. Avatar recensioni e testi da reviews.ts; rating da home.ts. Non sono stati generati clienti, persone o testimonianze fittizi.
- Gli asset di progetti sono conversioni WebP degli originali migrati in public/media/case-studies/legacy; i nomi e ruoli del team restano quelli del registro.
- Loghi clienti da clientLogos, attestazioni da cmsMedia.badges. Le icone Google/Meta sono i marchi vettoriali della famiglia Tabler già presente.

## Mappa

Dati: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson, Natural Earth 1:110m, pubblico dominio (https://www.naturalearthdata.com/about/terms-of-use/). Proiezione equirettangolare ritagliata sull’Europa, trasformazione x=(lon+20)*10, y=(70-lat)*14. Un solo punto sede: Padova. Cerchi e collegamenti illustrano pianificazione del pubblico, non sedi o risultati commerciali.

I tre pulsanti cambiano stato aria-pressed, descrizione e rappresentazione visiva. Il pulsante contatto può preparare il messaggio con il mercato scelto, solo se vuoto. Nessuna geolocalizzazione, API di mappe, cookie o dipendenza aggiuntiva.

## Conversione

ContactForm preseleziona advertising, conserva validazione, consenso e attribuzione UTM/click ID. formId `advertising-landing`; pagina Grazie genera una sola conversione per invio confermato. Pulsante disabilitato finché lo script non è pronto, istruzione per attivare JavaScript nella landing. Le CTA obiettivo e mercato non sovrascrivono messaggi già scritti.

StickyContactCTA si attiva solo sotto 761px e dopo la CTA hero, nascondendosi quando form o menu sono visibili. Nessuna barra al primo caricamento; inert quando nascosta; rispetto safe-area e reduced motion.

## Validazione e pubblicazione

Test dedicati in tests/e2e-smoke/advertising.spec.ts: navigazione confinata, carousel, FAQ, mappa, CTA mobile, focus e reduced motion; regressione del form condiviso. Invii CMS simulati, nessun lead di prova reale. Build locale con fallback non equivale a verifica del CMS live. Deploy esclusivamente secondo pipeline Netmarket.


Verifica locale del 5 ottobre 2026: lint e typecheck superati, 79 test unitari superati, build di 68 pagine, 7 smoke E2E e 6 regressioni mirate su header/footer/team/catalogo/form superate. Controllo visivo a 1440px e 390px; assenza di overflow verificata da 390px a 1728px. Build con snapshot/fallback: invio e integrazione CMS live non verificati. Nessun deploy eseguito.

## Revisione 9 ottobre 2026

- Progetti subito dopo hero e loghi: prova del lavoro prima del dettaglio delle competenze. Schede con immagine, contesto e risultati raccolti in un unico blocco.
- H1 con tracking locale -0.045em su richiesta esplicita; i token tipografici globali restano invariati.
- Albertini ridotto nella sola selezione landing (scala 0.58). Marchio Google fornito dal CMS, copia locale `media/advertising/google-g.webp`; Meta invariato.
- Rail progetti: reset locale del min-height 100% della ProjectCard, overflow verticale nascosto, snap solo inline e chaining verticale nativo. Test wheel e controllo dei limiti delle metriche per evitare scroll intrappolato o risultati tagliati.
- Mercati mobile: titolo, selettori e mappa condividono una schermata; testo sintetico, altezza SVG adattiva. Nessuna altezza bloccata al contenuto, che può crescere con zoom/accessibilità.
- Menu con descrizioni opzionali da LandingShellConfig, sezione corrente, ancore e contatto; CTA fixed trasparente intorno al solo pulsante con ombra, senza intercettare input fuori dal bottone.

Verifica revisione: lint, typecheck, 79 unit test e build superati; 9 smoke E2E sulla build statica superati. Mappa verificata a 375×667 e 390×844, menu controllato visivamente e via CSS/focus/ancore, slider controllato con wheel e bounds dei risultati. CMS live non verificato: invii simulati e build con fallback.


### Semplificazione editoriale del 9 ottobre

Eliminati approfondimenti “Dal clic al cliente” e relativi dati/stili, baseline hero, avatar/testo/recensioni/email nella sezione contatto. Footer landing senza email: unico canale di richiesta il form. Nuova foto CMS product-photography-netmarket.webp nella card creatività. “In buona compagnia” usa scala H2. Case study inizialmente tutti chiusi (resta apertura via scheda/hash). Titolo contatto composto su due righe responsive. ContactForm accetta serviceOptions e showEmailFallback opzionali: configurazione landing ristretta a campagne, landing, creatività e progetto integrato; pagina contatti istituzionale invariata.

Validazione semplificazione: check:fast superato (lint, typecheck, 79 unit test, build); 10 smoke E2E superati, incluso titolo contatto su due righe a 375/390/768/1024/1440px, opzioni form ristrette, assenza mailto e dettagli chiusi. Verifica visiva mobile completata. Invio CMS sempre simulato.

Menu mobile: hamburger senza etichetta visiva, pannello compatto con icone Tabler semantiche, descrizioni e CTA; eliminati numeri, frecce e sottolineature. Controllo visivo e regressione dedicata delle righe/allineamento/CTA a 375×667 e 390×844.

BRB: metriche su due colonne uguali allineate in alto; dimensione numerica relativa alla larghezza effettiva del pannello (container query units), per evitare overflow nei rail stretti. Regressione geometrica a 320, 375, 390, 430, 768, 1024 e 1440px.

Hero: altezza minima pari al viewport stabile meno header (4.55rem + bordo), contenuto centrato verticalmente e libero di crescere sui dispositivi stretti. La sezione clienti ha padding superiore pari al ritmo di sezione canonico: “In buona compagnia” compare solo dopo la prima schermata.

## Preparazione produzione

Canonical autonomo `/advertising/`, title e description dedicati, Open Graph/Twitter, Organization/WebSite/WebPage e Service con provider canonico; FAQPage derivata dalle stesse FAQ visibili. Nessun AggregateRating autoreferenziale o promessa di risultati/rich result. HTML statico leggibile senza JavaScript, prove e sede reali supportano ricerca e sistemi AI.

Attribuzione resistente a storage negato o corrotto; una nuova campagna sostituisce la precedente per evitare click ID mescolati. GCLID/FBCLID/UTM nel payload CMS; GBRAID/WBRAID anche nel payload e nell’URL sorgente (l’attuale allowlist CMS non li archivia nel campo UTM). Nessun dato del form nel dataLayer. Solo risposta JSON success:true genera il lead: una challenge HTTP 200 non è un successo. In assenza di sessionStorage, conferma e conversione restano nella pagina senza doppio invio.

## Pubblicazione e verifica finale — 9 ottobre 2026

Landing online: https://netmarket.it/advertising/. PR #38; SHA production `a88da9b695304914ba8e1ed36f70784e809474aa`; workflow ufficiale https://github.com/netmarketadv/netmarket-website/actions/runs/37919657927 concluso con successo. HTTP 200, SHA online, canonical, indicizzabilità production, sitemap e cinque tipi schema verificati sul sito pubblico. Smoke production: 18 route; SEO smoke: 12 pagine e robots/sitemap.

Quality Full superata: 80 unit test e 93 E2E (92 al primo tentativo, un test motion homepage preesistente superato al retry). Verifica visiva desktop/mobile completata. CMS reale: health e risposte di validazione 422/CORS verificate; gli invii positivi sono simulati e non hanno creato contatti o email reali.

GTM `GTM-K782CJ46`, versione 18 pubblicata: aggiunto Meta Lead sul solo generate_lead, una volta per evento e con ad_storage richiesto. Pixel `485694213884589`. Google Ads Netmarket Pubblicità `205-784-1558`: conversione primaria nativa `16639879288 / rs3VCPShl50cEPjQwf49`, conteggio Una; vecchie importazioni GA4 secondarie escluse dagli obiettivi account. Nessuna campagna o budget modificato.

GA4 proprietà `375590061`, stream `G-DHXW4WZ5XP`: generate_lead contrassegnato evento chiave. Regola storica Lead_submit aggiornata da page_view con URL contenente grazie a event_name uguale generate_lead, senza vincolo URL: impedisce falsi lead da visita diretta e supporta la conferma inline se storage indisponibile. Lead_submit resta un evento distinto non chiave, per compatibilità storica; per i report dei lead usare generate_lead, senza sommare i due eventi. Salvataggi riletti nell’interfaccia.

Consenso reale Iubenda verificato con accettazione/rifiuto: Google Consent Mode G111/G100; dispatch Meta Lead zero con consenso negato e uno concesso nei test controllati; ricaricare Grazie non rigenera generate_lead. L’SDK Meta riconosce e blocca il browser automatico (Bot traffic detected and blocked): configurazione e dispatch verificati, ricezione effettiva da controllare in Events Manager al primo contatto reale. Non sono state aggirate le protezioni né inviate conversioni fittizie alle piattaforme. Enhanced Conversions e Conversions API non risultano configurate e non sono dichiarate attive.

Questo verbale finale è aggiunto alla documentazione locale dopo il deploy; il codice pubblicato è quello dello SHA sopra indicato.

## Revisione offerta e casi — 9 ottobre 2026

Fonte editoriale: HTML fornito dall’utente “Google Ads e Meta Ads per acquisire clienti _ Netmarket — Anteprima.html”. Ripresi prezzi, quattro casi anonimi e precisazioni economiche; esclusi form dimostrativo, modale scaletta e script dell’anteprima. Identità clienti non dedotta e nessuna immagine di altri progetti attribuita ai quattro casi. I media BRB restano esplicitamente identificati nella hero.

Hero diretta, gestione da 400 €/mese + IVA per canale, budget Ads escluso; badge Google Partner subito dopo hero con profilo già utilizzato dal sito. Prove numeriche prima dei loghi: Pilates, eventi Milano, pergole e tappeti. Metriche derivate da valori sorgente per evitare incoerenze di arrotondamento. Pilates: CLV netto stimato, non fatturato e non ROAS; gli altri casi riportano fatturato IVA esclusa/spesa Ads. Dettagli inizialmente chiusi, fonti e limiti visibili.

Due offerte Google/Meta con perimetro e costi aggiuntivi espliciti, ancoraggio Costi nella shell. Le CTA dei piani preparano il messaggio senza sovrascrivere quanto scritto. Form reale e tracking invariati. FAQ e schema FAQ condividono i prezzi aggiornati.

Video: configurazione `advertisingVideo` in src/data/advertising-landing.ts. Impostare src del video orizzontale da circa 60 secondi, poster 16:9, captions VTT e transcript finale. Fino ad allora spazio editoriale 16:9 dichiarato “Video in preparazione”, con ritratto reale di Giacomo; nessun play finto o iframe esterno. Una volta configurato: player nativo, controls, playsinline, preload none, nessun autoplay, sottotitoli e trascrizione. Nessun VideoObject pubblicato per un filmato non ancora disponibile.

Validazione revisione offerta: lint, typecheck, 80 unit test e build Astro (68 pagine) superati. 16 smoke E2E dedicati alla landing e 9 controlli del catalogo superati; verifiche responsive 320–1728 px, prezzi, distinzione CLV/ROAS, navigazione, form e attribuzione con invii CMS simulati. Verifica visiva desktop e mobile. Build locale con snapshot/fallback CMS: questa revisione è in anteprima locale, non è stata pubblicata in produzione.

## Revisione 12 ottobre 2026

Selezione recensioni della sola landing: Svetlana Soboleva, Gherardo Gasparin e Pazzo Design, senza Paola Malighetti anche negli avatar hero. Il dato aggregato Google resta invariato. Titolo recensioni esteso alla griglia e composto su due righe responsive. ReviewsSection accetta una selezione tramite prop reviews e uno slot title, con default invariati per il resto del sito.

Chiusura su canvas, riepilogo prezzo e form in un pannello con introduzione. Campo “Cosa vuoi ottenere?” inizialmente vuoto: Contatti e preventivi, Vendite ecommerce, Notorietà del brand, Da definire insieme. Valori slug inviati nel campo service già supportato dal CMS, senza modifiche a API o tracking. Label, placeholder ed errore di ContactForm configurabili; i default istituzionali restano invariati. Le CTA obiettivo preselezionano solo se il campo è vuoto e non sovrascrivono il messaggio.

Verifiche candidato 12 ottobre: check:fast superato (80 unit test, lint, typecheck, build 68 pagine); 21 smoke landing superati, inclusi quattro invii simulati con obiettivo distinto, selezione obbligatoria, recensioni e titolo massimo due righe a 320–1728 px. I quattro slug sono stati accettati dal validatore CMS reale tramite payload deliberatamente invalidi (422 e CORS corretti; nessuna email/lead). Suite completa richiesta dalla PR production prima del merge.
