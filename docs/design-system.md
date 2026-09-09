# Netmarket Design System

Questa documentazione descrive il linguaggio visivo realmente in uso nel sito Netmarket. Non e una raccolta di direzioni future. Le fonti osservate sono homepage, Agenzia, archivio Progetti, case study, archivio e dettaglio Insight, archivio Servizi e pagina Siti web.

## 1. Gerarchia delle fonti

1. `apps/web/src/styles/tokens.css`: valori implementati e alias compatibili.
2. `docs/design-system.md`: regole, classificazione e criteri di riuso.
3. `docs/motion-system.md`: motion language e comportamento reduced motion.
4. `/design-system/`: catalogo visuale interno per il controllo dei pattern canonici.
5. CSS locale di pagina: eccezioni motivate, non precedenti automatici.

Un pattern diventa canonico quando ricorre in piu contesti, ha una responsabilita chiara e regge almeno mobile, tablet e desktop. Un componente usato una sola volta resta un'eccezione finche il riuso non e dimostrato.

## 2. Principi

- Minimal, editoriale, premium e modulare.
- Tipografia e immagini reali guidano la gerarchia.
- I progetti dimostrano il valore prima delle promesse.
- Il blu Netmarket segnala accento, focus e azione; non riempie ogni superficie.
- Pochi componenti forti, nessuna micro-card senza una funzione.
- Nessun linguaggio da prodotto SaaS, stock, dashboard finta o decorazione gratuita.
- Il 1986 comunica continuita e competenza, non nostalgia.
- Accessibilita, performance e contenuto server-rendered fanno parte del design.

## 3. Design Tokens

### 3.1 Colore

| Ruolo          | Token                  | Valore    | Uso                                           |
| -------------- | ---------------------- | --------- | --------------------------------------------- |
| Brand          | `--nm-color-blue`      | `#0E51FE` | accenti, focus, stati attivi, momenti visuali |
| Brand profondo | `--nm-color-blue-deep` | `#0735B9` | testo su superfici blu chiare                 |
| Brand soft     | `--nm-color-blue-soft` | `#EAF1FF` | marker, note e supporto                       |
| Ink            | `--nm-color-ink`       | `#090A0F` | testo e pannelli scuri                        |
| Ink secondario | `--nm-color-ink-2`     | `#1D2430` | testo UI ad alto contrasto                    |
| Muted          | `--nm-color-muted`     | `#5B6472` | body secondario                               |
| Subtle         | `--nm-color-subtle`    | `#858D9A` | metadata e label                              |
| Canvas         | `--nm-color-canvas`    | `#F6F7F9` | fondi neutri di sezione                       |
| Surface        | `--nm-color-surface`   | `#FFFFFF` | pagina e card                                 |
| Surface 2      | `--nm-color-surface-2` | `#EEF2F7` | frame media e pannelli                        |
| Border         | `--nm-color-border`    | `#DDE2EA` | hairline strutturali                          |
| Inverse        | `--nm-color-inverse`   | `#080B16` | sezioni e CTA scure                           |

Rosso, verde e arancio sono riservati a stati semantici. Le tinte specifiche di un cliente possono vivere nei case study tramite variabili `--case-*`, senza entrare nella palette globale.

### 3.2 Griglia e contenimento

- Gutter pagina: `--nm-page-margin`, da 16px a 56px.
- Contenuto: `--nm-layout-content`, 1200px.
- Wide: `--nm-layout-wide`, 1328px, per hero, portfolio, team e media.
- Shell: `--nm-layout-shell`, 1472px, riservato a header e footer.
- Gutter interno griglia: `--nm-grid-gutter`, 16-24px.
- Le colonne usano sempre `minmax(0, ...)` per impedire overflow.
- Il full-width editoriale e intenzionale: rail e marquee possono attraversare il viewport, mentre heading e controlli restano sulla griglia.

### 3.3 Spacing

La scala `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` governa i gap locali. Il ritmo di sezione usa:

- Standard: `--nm-section-space`, 64-120px.
- Compatto: `--nm-section-space-compact`, 44-80px.
- Heading/body: `--nm-heading-gap-xs|sm|md|lg`.

Valori locali sono ammessi per composizioni editoriali o media art-directed. Non devono duplicare un token esistente.

### 3.4 Tipografia

Mona Sans self-hosted, pesi 400, 500 e 600. Fallback: Aptos, Segoe UI e system UI.

| Livello | Token               | Line-height | Uso                 |
| ------- | ------------------- | ----------- | ------------------- |
| Display | `--nm-text-display` | `0.90-0.96` | hero eccezionali    |
| H1      | `--nm-text-h1`      | `0.94-1`    | titolo pagina       |
| H2      | `--nm-text-h2`      | `0.98-1.04` | apertura sezione    |
| H3      | `--nm-text-h3`      | `1.04-1.12` | card e sottosezioni |
| Lead    | `--nm-text-lead`    | `1.42-1.50` | introduzioni        |
| Body    | `--nm-text-body`    | `1.58`      | contenuto corrente  |
| Small   | `--nm-text-small`   | `1.45`      | supporto            |
| Label   | `--nm-text-label`   | `1.35-1.45` | tassonomie e UI     |
| Meta    | `--nm-text-meta`    | `1.35-1.45` | metadata            |

Il peso standard degli heading e 500. Il body non supera normalmente `--nm-measure-body` (58ch); i blocchi editoriali lunghi usano misure piu strette. Il `letter-spacing` canonico e `0` a ogni livello: la compattezza deriva da font, scala, misura e line-height, non da tracking negativo.

#### La “o” obliqua

Negli heading la lettera `o` o `O` interna a una parola riceve il trattamento `.nm-heading-o`: lieve inclinazione tramite `skewX(-5deg)`, stessa famiglia, peso, colore e baseline. La congiunzione italiana “o” isolata resta roman. Body, label, menu, bottoni e metadata non vengono trasformati. Il parser preserva il testo originale in `aria-label` e non deve spezzare le parole.

#### Accenti nei titoli

- `.nm-heading-accent`: una parola o frase breve in blu.
- `.nm-heading-muted`: accento secondario grigio, raro.
- `.nm-heading-marker`: selezione in stile iOS con fondo azzurro, barre laterali e handle.
- `.nm-heading-marker--strong`: solo per hero o momenti editoriali principali.

Massimo un accento forte per titolo. Gli handle devono restare visibili e il wrapper del reveal deve lasciare spazio ad ascendenti, discendenti e marker.

### 3.5 Radius, bordi e ombre

- `--nm-radius-control` (12px): controlli e piccoli pannelli.
- `--nm-radius-media` (16px): immagini e card media-first.
- `--nm-radius-card` (24px): pannelli importanti.
- `--nm-radius-feature` (36px): hero visual e CTA sceniche.
- `--nm-radius-pill`: bottoni, badge, filtri e chip.
- Hairline da 1px come separazione primaria.
- Ombre solo per overlay, media flottanti o gerarchie che il bordo non risolve.

Il radius indica un oggetto. Le sezioni non diventano card per semplice decorazione e le card non vengono annidate.

## 4. Primitive

### Canoniche

- `Container`: contenimento standard o wide.
- `Section`: landmark e ritmo verticale standard/compact.
- `Stack`: ritmo verticale locale tramite `gap`.
- `.nm-cluster`: gruppi inline che possono andare a capo.

### Di supporto

- `Grid`, `Split`, `Bleed`, `Frame`: utility disponibili, da usare quando descrivono davvero la composizione. Non sostituiscono layout editoriali specifici.
- `SectionHeading`: utile per sezioni semplici; le aperture editoriali complesse mantengono markup locale.

Queste primitive di supporto non sono obbligatorie e non vanno presentate come componenti dominanti finche il loro riuso resta limitato.

## 5. Componenti Riutilizzabili

### Navigazione

- `SiteHeader`: sticky bianco, logo, navigazione sobria, CTA primaria.
- Mega menu: `details/summary`, introduzione breve e link con icone Tabler.
- Menu mobile: pannello dedicato, gerarchia piatta, sottomenu accessibili e CTA contatto.
- `SiteFooter`: identita, colonne di link, social, trust badge e dati societari. Il watermark e un'eccezione controllata del footer.

### Azioni e form

- `Button`: primary nero, secondary bianco con bordo, inverse bianco su scuro.
- Bottoni pill, label concise, hover massimo 1px e focus visibile.
- Link testuali: underline animato discreto; link-card senza underline.
- Form: label sempre visibile, campi dimensionati, messaggi e stati accessibili. La disposizione pill e ammessa solo nei moduli brevi; non e un pattern hero obbligatorio.

### Contenuto e fiducia

- `ClientMarquee`: rail full-width continuo, loghi normalizzati otticamente, pausa/reduced motion e gruppo duplicato `aria-hidden`.
- `ReviewsSection` + `ReviewCard`: header centrato, badge Google, rail manuale, clamp e fade solo quando il testo e troncato, pulsante occhio e dialog accessibile.
- `FAQBlock`: split tra introduzione e accordion; trigger button, stato `aria-expanded`, pannello associato e animazione misurata.
- `TeamSection` + `PersonCard`: ritratti 3:4, dati reali, LinkedIn discreto, griglia desktop e rail mobile.
- `CTAInlineForm`: CTA conversione con form breve, usata solo dove il contesto richiede raccolta email immediata.

### Progetti

- `ProjectCard`: card media-first per contesti secondari e related content.
- `CaseStudyHero`, `CaseStudyStory`, `CaseStudyMedia`, `CaseStudyResults`, `RelatedProjects`, `CaseStudyCTA`: sistema canonico delle pagine case study.
- Le card progetto mostrano immagine reale, tipologia, cliente e sintesi. Hover: micro-zoom massimo `1.025-1.035` e segnale blu, senza spostamenti di layout.
- In mobile, rail e sequenze media usano overflow orizzontale nativo e scroll snap; le immagini restano presenti senza dipendere da JS.

### Icone

Tabler Icons e il set canonico: stroke 1.7-1.8, normalmente 16-20px. `IconBubble` resta adatto a menu e liste tassonomiche. Nelle pagine servizio il pattern canonico e il medaglione circolare neutro: superficie bianca, pittogramma nero, bordo hairline e secondo anello esterno molto leggero. Non usa fondi colorati e non eredita l'accento del servizio. Le icone chiariscono categoria, azione o stato; non riempiono griglie solo per decorazione.

### Breadcrumb di servizio

Tutte le pagine dettaglio servizio riservano la stessa riga iniziale al breadcrumb: altezza, margine inferiore e distanza dall'header sono condivisi. Il nome corrente resta su una riga e viene abbreviato con ellissi soltanto quando non entra nel viewport, senza cambiare la quota della hero.

## 6. Pattern Editoriali

### Hero editoriale

Eyebrow breve, H1 dominante con un accento, lead misurato, una o due CTA e visual reale o composizione proprietaria. Non esiste un hero unico universale: homepage, Agenzia, Servizi, Progetti e Insight condividono gerarchia e griglia, non la stessa scenografia.

### Layout split

Due colonne asimmetriche con copy e prova visiva o operativa. Collassa in una colonna sotto 760-900px; ogni figlio usa `min-width: 0`. In mobile l'ordine segue la comprensione, non la posizione desktop.

### Featured content

Un contenuto dominante per volta. Negli archivi Progetti e Insight il featured usa immagine reale, caption breve e percorso chiaro; non e una card generica duplicata in griglia.

### Portfolio e case study

- Archivio Progetti: hero editoriale, progetto in evidenza, filtri accessibili, griglia media-driven e CTA finale.
- Case study: hero adattiva, metadati, capitoli narrativi, sequenze media, risultati verificati, progetti correlati e CTA.
- Le sezioni vuote non vengono renderizzate.
- Colori e crop cliente sono art direction locale; griglia, tipografia, accessibilita e responsive restano sistemici.

### Sezioni chiare e scure

Il bianco e la superficie dominante. Il canvas grigio organizza senza separare eccessivamente. I pannelli scuri concentrano metodo, vincoli, risultati o conversione; non sono alternanza decorativa obbligatoria.

### Editoriale Insight

Cover story ampia su superficie scura, metadata discreti, titolo forte, descrizione breve e stream asimmetrico deterministico. Le immagini sono contenuto, non riempitivo; le card non hanno un box esterno e affidano gerarchia a ratio, scala tipografica e ritmo. Le categorie sono link a pagine statiche reali, non filtri decorativi.

Le pagine articolo usano hero a due colonne, cover wide, misura di lettura entro 44rem, indice condizionale e rail contestuale. CTA servizio, progetti e approfondimenti correlati compaiono solo quando pertinenti. Cover story scura e rail restano pattern specifici del magazine, non primitive automatiche per servizi o case study.

## 7. Responsive Behaviour

- Mobile first nel comportamento, non semplice riduzione del desktop.
- Nessun figlio puo imporre una larghezza superiore al viewport; usare `min-width: 0`, `max-width: 100%` e `minmax(0, 1fr)`.
- CTA affiancate diventano full-width quando il testo non entra comodamente.
- Griglie dense diventano una colonna o rail swipe con anteprima della card successiva.
- I rail devono restare usabili manualmente anche quando hanno autoplay.
- Media con formato fisso dichiarano `aspect-ratio`, dimensioni e `object-fit`.
- Evitare `100vh` per hero; `100dvh` e solo un limite quando serve.
- Validare almeno 390, 430, 768, 1024, 1280, 1440 e 1728px per pattern condivisi.

## 8. Motion Language

Il dettaglio operativo vive in `docs/motion-system.md`.

- GSAP e ScrollTrigger sono progressive enhancement, non prerequisiti di lettura.
- Preset canonici: `fade`, `up`, `down`, `scale`, `media`, `line`.
- `line` anima gruppi di parole senza tagliare `g`, `p`, `q`, la “o” obliqua o il marker.
- Hover e magnetic sono desktop-only quando dipendono dal puntatore.
- Niente pinning o scrub se non migliorano una narrazione reale.
- Con `prefers-reduced-motion: reduce`, contenuto subito visibile, autoplay fermo e transizioni ridotte.

## 9. Immagini e Mockup

- Priorita ad asset reali di clienti, team e lavori.
- `width`, `height`, `sizes`, `srcset`, `loading` e `fetchpriority` vanno definiti in base alla posizione.
- L'immagine LCP e eager e `fetchpriority="high"`; il lazy loading parte fuori dalla prima viewport.
- Fotografie: `object-fit: cover` quando il crop e editoriale.
- Mockup e PNG trasparenti: `object-fit: contain`, senza fondi aggiunti che alterano l'asset.
- Il CMS e source dei media; il frontend deve comunque fornire nomi, alt e contesto SEO corretti.
- Vietati stock, placeholder che sembrano lavori reali e mockup UI finti quando esiste il progetto.

## 10. Accessibilita

- Obiettivo WCAG 2.2 AA, da verificare anche manualmente.
- Landmark e heading in ordine, un H1 per pagina.
- `aria-label` solo su elementi che supportano nome accessibile; nessun ARIA decorativo su `div` generici.
- Focus visibile, touch target adeguati, controlli nativi e tastiera completa.
- Icone decorative `aria-hidden`; link esterni con label comprensibile.
- Carousel e rail non catturano lo scroll verticale e restano navigabili senza autoplay.
- Testo e immagini restano visibili senza JavaScript e in reduced motion.

## 11. Eccezioni Specifiche Di Pagina

- Homepage social hero: composizione art-directed unica, non componente generico.
- Homepage case slider: rail full-viewport con larghezze variabili, loop continuo, touch nativo e drag mouse; l'autoplay leggero e riservato ai puntatori precisi e non sostituisce `ProjectCard` altrove.
- Pagina Siti web: hero browser/device, bento tipologie e blocco AI sono specifici del servizio.
- Agenzia: montage di progetti reali, timeline storica e diagramma editoriale delle tre aree sono pattern narrativi locali.
- Lavora con noi: mosaico del team e form di candidatura spontanea sono specifici della pagina; principi, liste editoriali e campi form riusano primitive canoniche.
- Archivio Progetti: featured editoriale e filtri sono propri dell'archivio.
- Case study: variabili colore `--case-*`, ordine media e proporzioni possono cambiare per cliente.
- NOD e pagine di campagna possono avere art direction distinta, ma devono rispettare fondazioni, accessibilita e motion.

## 12. Regole Deprecate

Non sono piu standard:

- La definizione “agency marketplace system”.
- Hero con form come struttura predefinita.
- Alternanza obbligatoria di bento, dark checklist, proof strip e landscape CTA.
- Griglie di icone usate per spiegare ogni contenuto.
- Un unico `ProjectCard` per archivio, featured e dettaglio progetto.
- Mockup finti o texture sceniche come prova primaria.
- Tracking negativo negli heading.
- Radius grande applicato a ogni sezione.

## 13. Checklist Per Nuove Pagine

1. Parti da contenuto, progetto reale e gerarchia, non da un catalogo di card.
2. Usa token e primitive canoniche prima di introdurre valori locali.
3. Scegli un solo accento forte per heading.
4. Dichiara cosa e componente riusabile e cosa resta eccezione.
5. Verifica overflow, wrapping, focus, reduced motion e immagini ai breakpoint canonici.
6. Esegui lint, typecheck, test, build e visual QA mirato.
