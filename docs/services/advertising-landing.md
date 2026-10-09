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
