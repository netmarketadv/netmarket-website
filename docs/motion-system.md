# Netmarket Motion System

Il motion Netmarket comunica qualita, precisione e controllo. Questa pagina documenta il comportamento realmente implementato; nuove animazioni non entrano nel sistema finche non sono riutilizzate e verificate.

## Principles

- Purposeful: ogni movimento deve sostenere comprensione, stato o gerarchia.
- Restrained: distanze brevi, scale minime, nessun bounce aggressivo.
- Hierarchy-first: hero, heading, CTA, media e card hanno priorita; gli elementi secondari restano sobri.
- Responsive: desktop puo usare micro-interazioni piu ricche, mobile riduce distanza, durata e stagger.
- Interruptible: menu, accordion e hover devono rispondere subito a input, ESC e cambio contesto.
- Accessible: il contenuto resta disponibile senza JavaScript e con `prefers-reduced-motion`.
- Performance-aware: transform e opacity come default, un solo orchestratore JS, niente listener scroll pesanti.

## Technology Choice

Il sistema usa GSAP e ScrollTrigger come enhancement principale per entrance, line reveal, media reveal e scroll motion. CSS, IntersectionObserver e Web Animations API restano fallback e governano micro-interazioni, menu, accordion, hover, focus e stati rapidi.

Non vengono usati plugin premium Club GSAP. Lo splitting dei titoli e proprietario: il DOM viene preparato in modo progressivo, senza dipendere da SplitText.

React non e usato: il sito e Astro statico e le interazioni sono progressive enhancement.

## Tokens

Durate:

- `--nm-motion-duration-instant`: 90ms
- `--nm-motion-duration-fast`: 190ms
- `--nm-motion-duration-base`: 320ms
- `--nm-motion-duration-slow`: 720ms
- `--nm-motion-duration-overlay`: 920ms

Easing:

- `--nm-motion-ease-hover`: micro-interazioni e stati.
- `--nm-motion-ease-enter`: elementi in ingresso.
- `--nm-motion-ease-exit`: chiusure rapide.
- `--nm-motion-ease-layout`: layout, menu e accordion.
- `--nm-motion-ease-emphasized`: heading, media e sezioni importanti.

Distanze:

- `--nm-motion-distance-xs`: 4px
- `--nm-motion-distance-sm`: 8px
- `--nm-motion-distance-md`: 16px
- `--nm-motion-distance-lg`: 24px

## Presets

- `fade`: opacita soltanto, per elementi piccoli e footer.
- `up`: fade + translateY percepibile, default per blocchi editoriali.
- `down`: fade + translateY negativo, solo per piccoli elementi sopra heading.
- `scale`: scale morbido + fade + blur minimo, per card e moduli.
- `media`: clip reveal + scale + brightness/fade, per immagini importanti.
- `line`: text masking proprietario per parole raggruppate per riga visiva, con stagger breve e padding di sicurezza per ascendenti, discendenti, “o” obliqua e marker.

## Data Attribute API

Il sistema preferisce data attribute per restare leggero:

```html
<section data-reveal="up" data-reveal-stagger="2">...</section>
```

Attributi supportati:

- `data-reveal`: `fade`, `up`, `down`, `scale`, `media`, `line`.
- `data-reveal-delay`: indice semantico, non millisecondi arbitrari.
- `data-reveal-stagger`: applica delay breve ai figli diretti.
- `data-motion-state`: stato interno `ready` -> `revealed`; non va scritto a mano nei componenti.
- `data-motion-count`: abilita count-up su metriche selezionate.
- `data-cursor-label`: mostra una label contestuale desktop only.
- `data-motion-magnetic`: applica magnetic micro-effect solo a CTA importanti.
- `data-motion-engine`: stato interno su `html`, `gsap` quando GSAP ha preso controllo.

## Usage Rules

- Hero: header visibile subito, badge/heading/form/rail con stagger leggero e differenza iniziale percepibile.
- Section headings: reveal `line` su titoli editoriali e sezioni chiave.
- Project cards: hover curato con image scale massimo 1.035, border blu tenue, cursor label e preview immagine desktop.
- Service cards: hover piu sobrio, image scale massimo 1.025.
- Buttons: nessun layout jump, translate massimo 1px e background interpolation.
- FAQ: accordion accessibile con WAAPI su altezza misurata.
- Mega menu: apertura piu lenta della chiusura, overlay leggero, delayed close su pointer.
- Mobile: niente magnetic e niente cursor label, durata/distanza ridotte.
- Media scroll: immagini importanti possono avere scale/brightness scrub leggero, senza pinning obbligatorio e senza bloccare la navigazione.
- Services: l'archivio usa reveal progressivo sulle righe del service index; il dettaglio usa line reveal sull'H1, media reveal sul visual, stagger leggero su processo e related content.
- Rail e carousel: lo scorrimento manuale nativo resta sempre disponibile; autoplay e animazioni si fermano durante hover, focus o interazione e non sono essenziali al contenuto.
- Case study: media e capitoli entrano con i preset esistenti; nessun effetto deve alterare crop, aspect ratio o ordine narrativo.

## Reduced Motion

Con `prefers-reduced-motion: reduce`:

- GSAP, reveal e stagger sono disabilitati;
- count-up mostra subito il valore finale;
- magnetic e cursor label sono disabilitati;
- accordion cambia stato senza animazioni lunghe;
- transitions globali sono portate a 1ms.
- marquee e autoplay dei rail sono fermi, con contenuto comunque esplorabile manualmente.

## No-JS Resilience

Nessun contenuto dipende da JS per essere visibile. Le classi di hidden/reveal si attivano solo quando `html.js` e presente e il controller ha marcato l'elemento con `data-motion-state="ready"`. Se JavaScript fallisce, arriva in ritardo o viene bloccato, HTML e CSS restano leggibili e navigabili.

La state machine reveal e:

- default: contenuto visibile;
- `ready`: elemento registrato dall'orchestratore e temporaneamente animabile;
- `revealed`: elemento visibile in modo definitivo, con delay ripulito dopo l'ingresso.

Gli elementi sopra o gia vicini al viewport vengono rivelati in modo fail-safe. Lo stagger e percepibile ma breve; non deve mai rallentare la leggibilita del contenuto.

## Performance Budget

GSAP e caricato nel bundle motion del frontend e deve restare l'unica libreria di animazione. Usare ScrollTrigger solo su elementi chiave, passive listeners e `requestAnimationFrame` per pointer/magnetic. `will-change` e ammesso solo durante l'interazione o sull'elemento attivamente animato, mai come stato permanente di liste numerose.

## Eccezioni Locali

La composizione social della homepage, i rail dell'archivio e le sequenze media dei case study possono definire timing o direzione locali, ma devono riusare easing, durate e criteri reduced motion del sistema. Pinning, scroll-jacking e nuove dipendenze motion non sono pattern canonici.
