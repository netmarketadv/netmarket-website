# Netmarket Design System

## 1. Design Principles

- Comunicare valore prima di decorare.
- Usare il blu Netmarket come segnale, non come riempitivo.
- Dare ai progetti piu peso delle promesse.
- Rendere il 1986 un vantaggio decisionale, non uno stile vintage.
- Costruire con griglia, gerarchia e spazio bianco.
- Preferire motion utile a motion scenografica.
- Proteggere performance, accessibilita e SEO fin dall'impianto.

## 2. Visual Personality

Netmarket e editoriale, digitale, precisa. Il sistema combina superfici bianche, neutri freddi, tipografia ampia e un blu proprietario `#0E51FE`. Deve sembrare un'agenzia capace di gestire progetti complessi, non una startup SaaS ne un portfolio freelance.

La direzione V3 e "agency marketplace system": contenuto reale, proof immediato, form leggero, rail visuale, card morbide, sezioni grigio chiarissimo, CTA sceniche e FAQ compatte. La pagina deve apparire moderna e molto pulita, ma non fredda; solida, ma non tradizionale. Ogni grande momento visivo deve avere una ragione informativa.

## 3. Grid

- Mobile: 1 colonna, margini 16px.
- Tablet: 6 colonne logiche, margini fluidi.
- Desktop: 12 colonne, max-width 1216px.
- Wide: max-width 1472px per hero, media e sezioni portfolio.
- Gutter: `clamp(1rem, 1vw, 1.5rem)`.
- Multi-colonna sempre con fallback esplicito sotto 900px.

## 4. Layout Primitives

- `Container`: contenimento standard o wide.
- `Section`: ritmo verticale e landmark semantico.
- `Grid`: griglia 12 colonne.
- `Stack`: ritmo verticale locale.
- `Cluster`: gruppi inline come CTA o tag.
- `Split`: relazione testo/visual.
- `Bleed`: media quasi full-width senza uscire dal controllo.
- `Frame`: contenitore per media o mockup.
- `StickyRegion`: riservato a narrazioni scroll future.

Pattern principali homepage:

- Hero split: headline ampia, due badge proof, pannello form e CTA.
- Showcase rail: card orizzontali scroll-snap con servizio, immagini reali e claim blu.
- Proof strip: quattro prove concise sotto al rail.
- Plan card: blocco grigio grande con piano di lavoro e step in mini-card.
- Project rail: un caso dominante e due casi secondari, tutti con asset reali.
- Bottleneck panel: testo + checklist scura per problemi e interventi.
- Service bento: griglia 3 colonne con almeno due celle visuali forti.
- Landscape CTA: immagine generata proprietaria per pausa scenica e conversione.
- Reviews carousel: recensioni Google statiche, full-width, card compatte, stelle gialle e modal per testi lunghi aperto da icona occhio.
- Trust metrics: quattro metriche verificabili, senza numeri inventati.
- Process card: card grande con step ripetibili.
- Insight cards: tre card editoriali con immagine, titolo e descrizione.
- FAQ accordion: domande brevi, risposte sintetiche.

Pattern servizi:

- Service archive hero: messaggio editoriale ampio con CTA verso l'indice.
- Service index: righe grandi con preview media, indice numerico discreto, descrizione e chip tassonomici solo se esistono dati reali.
- Service detail hero: breadcrumb, H1, lead, CTA e media opzionale.
- Service needs: blocco scuro usato solo quando problemi/esigenze hanno contenuto reale.
- Service proof: blocco editoriale con massimo tre proof point, usato solo con dati verificabili o fonti interne reali.
- Service process: step data-driven in card leggere, senza label generiche tipo "fase".
- Service technical focus: blocco grigio per decisioni tecniche citabili, non una lista di feature o loghi.
- Service related links: link crawlable verso servizi, progetti, insight e risorse.

## 5. Spacing System

Scala fluida: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`. Usare i token in `apps/web/src/styles/tokens.css`; non introdurre valori ad hoc salvo casi documentati.

## 6. Typography System

Font: `Mona Sans`, self-hosted in `apps/web/public/fonts`, con fallback `Aptos`, `Segoe UI`, system-ui. Usare Regular 400, Medium 500 e SemiBold 600. Evitare pesi oltre 600 nella UI pubblica salvo casi speciali.

- Display: `clamp(3.75rem, 8.25vw, 7.8rem)`, line-height 0.9, weight 500, tracking `var(--nm-tracking-display)` / `-0.025em`.
- H1: `clamp(3rem, 6vw, 5.85rem)`, line-height 0.95, tracking `var(--nm-tracking-h1)` / `-0.027em`.
- H2: `clamp(2.1rem, 4.25vw, 4.15rem)`, line-height 0.98, tracking `var(--nm-tracking-h2)` / `-0.028em`.
- H3: `clamp(1.45rem, 2.65vw, 2.45rem)`, line-height 1.05, tracking `var(--nm-tracking-h3)` / `-0.016em`.
- H4 e heading piccoli: tracking `var(--nm-tracking-heading-small)` / `-0.01em`.
- Body large: `clamp(1.05rem, 1.4vw, 1.32rem)`, max 58ch.
- Body: 1rem, line-height 1.58, tracking `var(--nm-tracking-body)` / `0`.
- Small: 0.875rem.
- Label/meta: 0.75-0.78rem, usati con parsimonia.

### 6.1 Heading Spacing

Il rapporto heading verso body usa token semantici, non margini locali casuali.

- Display / H1 verso lead: `var(--nm-heading-gap-lg)` / `clamp(1.35rem, 2vw, 2.35rem)`.
- H2 verso paragraph o rich text: `var(--nm-heading-gap-md)` / `clamp(1rem, 1.35vw, 1.55rem)`.
- H3 verso paragraph: `var(--nm-heading-gap-sm)` / `clamp(0.75rem, 0.9vw, 1.05rem)`.
- Card heading verso body: `var(--nm-heading-gap-xs)` / `clamp(0.55rem, 0.7vw, 0.85rem)`.

Usare `display: grid` e `gap` nelle primitive (`Stack`, `center-heading`, card body, bento, FAQ) quando il titolo e il testo appartengono allo stesso gruppo.

### 6.2 Heading Accent System

I titoli possono usare parole evidenziate quando serve guidare la lettura, ma l'accento deve restare raro e intenzionale. Le primitive globali sono:

- `.nm-heading-accent`: parola o breve frase in blu Netmarket `#0E51FE`, usata per evidenziare il concetto principale del titolo.
- `.nm-heading-muted`: parola o breve frase in grigio soft, per il pattern gia usato scuro + grigio.
- `.nm-heading-marker`: selezione tipografica in stile testo selezionato iOS, con fondo azzurro chiaro, barre laterali blu e handle diagonali. Utile quando il titolo deve mantenere colore ink ma dare enfasi.
- `.nm-heading-marker--strong`: variante con selezione leggermente piu intensa, riservata a hero o sezioni prodotto.

Regole:

- Non usare piu di un accento forte nello stesso heading.
- Evidenziare parole brevi o sintagmi chiari, non frasi intere.
- Non combinare nello stesso titolo blu pieno, grigio e marker salvo casi editoriali approvati.
- Gli accent devono funzionare dentro `h1`, `h2`, `h3`, `h4` e classi heading dedicate senza rompere la regola della "o" obliqua.
- Il marker deve sembrare una selezione intenzionale, non un evidenziatore a pennarello: niente radius morbidi, niente sfumature decorative, niente cambio colore del testo. Non sostituisce link, badge o CTA.

### 6.3 Netmarket Italic O

In display and heading typography, occurrences of the letter "o" or "O" inside words are rendered with a subtle oblique treatment. The standalone Italian conjunction "o" remains roman. The rule does not apply to body copy or interface text unless explicitly classified as heading typography.

La trasformazione e responsabilita del frontend: testi statici e contenuti CMS passano da Astro, vengono trasformati con un parser HTML durante dev/build, e poi il motion system applica reveal e interazioni sul DOM gia pronto. La pipeline e:

`CMS/plain text -> Astro HTML -> heading typography transform -> static HTML output -> motion enhancement`.

La trasformazione si applica solo a `h1`, `h2`, `h3`, `h4` e a classi heading dedicate (`nm-heading`, `nm-display-heading`). Non viene applicata a paragrafi, label, eyebrow, bottoni, menu, metadata o rich text non-heading. Gli span generati sono inline e puramente tipografici (`.nm-heading-o` dentro `.nm-heading-o-word`). Sugli heading nativi viene preservato un `aria-label` con il testo originale, cosi screen reader e test di accessibilita non leggono parole spezzate. Il wrapper di parola evita rotture innaturali tra la lettera modificata e il resto della parola.

Nota font: nel repository sono presenti Mona Sans Regular, Medium e SemiBold roman. La regola usa `font-style: italic`; finche non viene aggiunta una variante Mona Sans Italic ufficiale, il browser puo sintetizzare l'italic mantenendo peso, dimensione, colore e baseline.

## 7. Color System

- Primary: `#0E51FE`.
- Foreground: `#090A0F`.
- Muted: `#5B6472`.
- Canvas: `#F6F7F9`.
- Surface: `#FFFFFF`.
- Border: `#DDE2EA`.
- Inverse: `#080B16`.
- Error: `#B42318`.
- Success: `#027A48`.
- Warning: `#B54708`.

Il blu appare in CTA, focus, indicatori e grandi momenti visuali. Evitare palette secondarie sature.

## 8. Radius

Piccoli controlli: 12px. Frame e card importanti: 24-36px. Pill solo per CTA, badge e nav mobile. Non arrotondare ogni sezione: il radius deve indicare oggetto o media.

## 9. Borders

Hairline da 1px come struttura primaria. Usare bordi al posto di shadow quando basta separare superfici. Bordi piu forti solo per stati attivi/focus.

## 10. Shadows

Shadow leggere per overlay, pannelli hero e CTA primarie. Niente drop shadow dure. Le shadow blu sono riservate ai momenti ad alta enfasi.

## 11. Images

I casi studio devono usare immagini reali appena disponibili dal CMS o asset esportati nel frontend statico. Vietati placeholder che sembrano casi cliente. Media principali: aspect ratio 16:10 o 4:3; portrait solo se il contenuto lo richiede. Il CMS non e host pubblico indicizzabile per media SEO: gli asset SEO devono essere serviti dal frontend pubblico con nomi, alt e contesto corretti.

Le immagini principali dei servizi sono visual PNG trasparenti caricati su `cms.netmarket.it`. Vanno renderizzate dentro frame grigio chiaro, con padding interno e `object-fit: contain`; non devono essere croppate come fotografie.

Il sistema `/progetti/` usa un archivio editoriale con featured project e righe media-driven, non una griglia portfolio generica. Le detail page supportano hero visuale, metadata progetto, contenuto preservato, risultati dichiarati, gallery e progetto successivo. Le sezioni vuote non vengono renderizzate.

## 12. Iconography

Icone minime, stroke 1.75-2px, 16-20px. Non introdurre librerie finche non serve un set ampio. Evitare icone decorative ripetute.

## 13. Buttons and Links

- Primary: nero morbido, testo bianco, pill, senza glow.
- Secondary: bianco, bordo, testo ink.
- Inverse: bianco su superfici scure.
- Focus sempre visibile.
- Hover leggero `translateY(-1px)`, active `translateY(1px)`.
- Label CTA principale: "Parliamone".

## 13.1 Forms

- Label sempre visibile sopra il campo.
- Input pill solo per form brevi in hero o CTA.
- Nessun placeholder come unica label.
- Focus affidato al wrapper o al browser, mai rimosso senza sostituto.
- Stati previsti: normale, focus, disabled, error future.

## 13.2 Content Blocks

- `hero-showcase`: rail orizzontale per servizi e progetti.
- `plan-card`: spiegazione del percorso con step interni.
- `dark-checklist`: pain point o vincoli, solo quando serve contrasto.
- `service-bento`: competenze con immagine e testo.
- `landscape-cta` / `home-final-cta`: pausa visiva e conversione. In homepage la CTA finale e una card scenica scura dentro sezione bianca, non una fascia full-width.
- `trust-grid`: metriche reali.
- `reviews-carousel`: slider orizzontale full-width con contenuti Google reali statici.
- `client-marquee`: riga loghi clienti full-width, continua e riutilizzabile.
- `team-section` / `person-card`: sistema persone per team, autori e contributor futuri.
- `process-card`: metodo operativo.
- `faq-list`: accordion.
- `project-card`: card portfolio media-first per casi studio e progetti selezionati.

### 13.3 Project Card

`ProjectCard` e il componente ufficiale per mostrare un progetto in homepage, pagine servizio, archivio progetti e design system.

Regole:

- La parte alta e sempre media-first: l'immagine in evidenza occupa tutta l'area visiva con `object-fit: cover`.
- La categoria del caso studio appare sovrapposta nella parte bassa dell'immagine, dentro una pill leggibile su sfondi chiari o scuri.
- Sotto l'immagine appaiono solo nome cliente/progetto e descrizione breve.
- Nessuna card esterna con bordo o box bianco vuoto: il bordo visuale e dato dal media arrotondato.
- Hover desktop leggero: micro zoom dell'immagine e titolo blu Netmarket. Nessun effetto che sposti layout o renda il testo meno leggibile.
- Il componente resta data-driven: `title`, `category`, `description`, `image`, `alt`, `href`.
- Mobile: una colonna, immagine 16:10, categoria sempre dentro il media, testo sotto con line-height stabile.
- Non creare varianti parallele per l'archivio progetti: usare `ProjectCard` salvo layout featured realmente editoriale.

### 13.4 Client Marquee

`ClientMarquee` e il componente ufficiale per mostrare clienti, partner e progetti seguiti. Sostituisce ogni griglia loghi con card.

Regole:

- Full viewport width sul componente; il contenuto testuale resta allineato alla griglia, ma il rail visivo deve attraversare tutto lo schermo.
- Una sola riga orizzontale, senza wrapping, box, card, bordi o ombre.
- Movimento automatico continuo, lineare, lento, da destra verso sinistra.
- Gap compatto e respirato: circa 15-44px desktop, 13-24px mobile. Evitare slot larghi che fanno sembrare i loghi piccoli o dispersi.
- Loghi visibili e generosi: altezza ottica circa 71-133px desktop e 80-112px mobile, normalizzata con `visualScale`.
- Fade laterale con CSS mask per evitare tagli duri ai bordi viewport.
- Loghi data-driven con `name`, `logo`, `href?`, `visualScale?`.
- `visualScale` serve per normalizzare otticamente loghi con formati diversi, senza alterare i file sorgenti.
- Link solo quando esiste una destinazione reale e coerente, come un caso studio pubblicato. In assenza di URL reale, il logo resta non cliccabile.
- Il gruppo duplicato per il loop e puramente visivo: `aria-hidden="true"` e immagini con `alt=""`.
- Reduced motion obbligatorio: niente autoplay, una sola lista semantica, scroll orizzontale manuale.

### 13.4.1 Homepage Case Slider

Lo slider case study in homepage e un rail full-width con autoplay leggero e scroll manuale nativo. I testi della sezione e delle card restano centrati; le card mantengono altezza uniforme pur alternando larghezze diverse. In hover, focus o interazione manuale l'autoplay si ferma, e in reduced motion viene disattivato.

### 13.5 People / Team

`PersonCard` e `TeamSection` sono il sistema ufficiale per persone Netmarket, autori editoriali e contributor futuri dei case study.

Regole:

- Source of truth iniziale in `apps/web/src/data/team.ts`; niente nomi, ruoli, bio o competenze inventate nei componenti.
- ID stabili: `enrico-paolo-toso`, `mattia-graziotti`, `greta-negro`, `giacomo-galanti`, `marco-toso`.
- Immagini sempre `aspect-ratio: var(--nm-aspect-team-portrait)` / `3 / 4`.
- Foto con `object-fit: cover`, `object-position` definito per persona, dimensioni dichiarate e `sizes` responsive.
- `imageSrcSet` e predisposto nel modello dati per future varianti WebP/AVIF generate dal CMS o dal build pipeline.
- Alt text nel formato "Ritratto di Nome Cognome".
- Nome visivo breve, ruolo editoriale ufficiale sotto. Bio, expertise e certificazioni non appaiono finche non sono dati reali.
- LinkedIn discreto, esterno, con label accessibile "Profilo LinkedIn di Nome Cognome".
- Desktop: 5 colonne solo quando le foto restano grandi. Tablet largo: 3+2 centrato intenzionale. Tablet: 2 colonne. Mobile: rail swipe nativo con prossima card parzialmente visibile.
- Hover desktop: micro scale immagine massimo circa `1.025`, link LinkedIn piu evidente; niente overlay pesanti, rotazioni o testo sopra il volto.
- Il link LinkedIn compatto e un bottone circolare: l'icona resta centrata anche quando label e freccia sono nascoste. Su hover/focus puo espandersi a pill con testo.
- Motion: sezione con `line` reveal, persone con stagger leggero. Il contenuto resta server-rendered e visibile senza JS.
- Structured data: usare utility centrale `personJsonLd`; emettere `Person` solo nelle pagine dove la persona e visibile o semanticamente rilevante.
- Futura integrazione CMS: valutare CPT `nm_person` o relazione con utenti WordPress per authoring. `Person` resta entita principale; team member, author e contributor sono ruoli/relazioni, non copie della stessa persona.
- Future pagine persona solo con contenuto reale sufficiente: nome, ruolo, ritratto, bio professionale verificata, competenze, progetti, articoli, LinkedIn.

### 13.6 Reviews

Le sezioni recensioni devono centrare badge Google, titolo e testo introduttivo. Le card recensione usano clamp sul testo e mostrano un fade inferiore solo quando il testo e realmente troncato; il pulsante di lettura completa resta sopra il fade e apre la modale accessibile.

## 14. Cards

Usare card per progetti, insight, componenti e moduli ripetuti. Evitare card annidate. Le sezioni principali restano layout o bande, non scatole decorative.

## 15. Motion System

Il motion system ufficiale e documentato in `docs/motion-system.md`. Usare i token semantici in `apps/web/src/styles/tokens.css`, non valori casuali nei componenti.

Regole sintetiche:

- Motion as quality, not decoration.
- GSAP + ScrollTrigger governano entrance, line masking, media reveal e scroll motion quando disponibili.
- CSS, WAAPI e IntersectionObserver restano fallback e coprono micro-interazioni, menu, accordion, metriche e stati base.
- Entrance e reveal sono progressivi enhancement: senza JS il contenuto resta visibile.
- Reduced motion e obbligatorio.
- Performance e accessibilita hanno priorita rispetto a qualunque effetto.

## 16. Responsive Philosophy

Mobile non e desktop ridotto: cambia ordine, densita, crop e lunghezza riga. Hero senza `h-screen`; usare `100dvh` solo come riferimento massimo. Le CTA restano visibili e leggibili. Le griglie diventano sequenze curate.

## 17. Accessibility

Obiettivo WCAG 2.2 AA: contrasto leggibile, focus visibile, landmark corretti, heading ordinati, touch target minimi, nessun `div` cliccabile. `aria` solo quando serve.

## 18. Performance Constraints

Astro statico, zero hydration non necessaria, GSAP come unica libreria motion, immagini dimensionate e lazy fuori viewport, font system finche non viene deciso un font brand ufficiale.

## 19. Do / Don't

Do:

- Usare progetti e metodo come prova.
- Mantenere copy breve e concreto.
- Usare il blu per momenti decisivi.
- Separare mock/demo da dati reali.

Don't:

- Clonare Arcade, Awesomic o il sito attuale.
- Indicizzare asset da `cms.netmarket.it`.
- Usare griglie 3x3 di icone per spiegare tutto.
- Introdurre numeri o clienti non verificati.
- Riempire la pagina di card arrotondate.
- Usare mockup UI finti quando esistono immagini reali dei lavori Netmarket.
