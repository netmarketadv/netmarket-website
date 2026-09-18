# Correzioni audit visuale — 18 settembre 2026

Riferimento: appunti pagina per pagina forniti dal cliente e documento Drive «DA SISTEMARE sito netmarket», letto con autorizzazione esplicita.

## Interventi

- Homepage: categoria e descrizione concorso Vinci e Viaggia 2; descrizioni editoriali uniformate senza incipit «caso studio»; card e cloni dello slider con dimensioni coerenti; autoplay con accumulo delle frazioni di pixel e ripresa al ritorno nella finestra; recensioni leggibili e controlli centrati; icona trofeo per i concorsi.
- Servizi: larghezze, allineamenti e spaziatura uniformi; eliminata CTA ridondante «Esplora i servizi»; righe con spazio costante e frecce non traslate fuori dal contenitore; immagini distinte per software e contenuti; tre progetti della stessa dimensione con destinazioni reali; eliminato titolo clienti duplicato; modulo contatto corretto.
- Siti web: slider condiviso corretto; card tipologie allineate in alto; bordi completi su contenuti e competenze; padding del logo Gemini; screenshot portfolio per i progetti web; CTA allineata a sinistra.
- SEO, branding, ecommerce, advertising, contenuti, software, social, concorsi: etichetta «Cosa risolviamo» più leggibile; icone con spazio adeguato; rimossa la maschera di clipping al termine dei reveal; titoli delle evidenze dimensionati sul contenitore. Venitaly in maiuscolo/minuscolo coerente.
- Agenzia: bollino Padova 1986 nel flusso della pagina, titoli senza clipping, slider e CTA coerenti.
- Lavora con noi: icone e titoli delle discipline allineati.
- Progetti, insight e dettagli: reveal dei titoli senza maschere residue; sezioni narrative allineate; metrica 100.000+ contenuta nel riquadro.
- Sirene Blu app: cinque immagini aggiornate dall’export definitivo, cover e galleria coerenti anche nel fallback CMS.
- NOD: titoli ed evidenziazioni senza clipping; titolo Operatività contenuto nella propria colonna.
- Design system: pulsanti con destinazioni effettive; progetti uniformi; preview cursore più reattiva; selettori dei badge limitati ai figli diretti per non alterare il glifo «o»; recensioni e modulo breve corretti. Il modulo trasferisce l’email al contatto tramite sessionStorage senza inserirla nell’URL.

## Immagini autorizzate

Origine: cartella export collegata nel documento, sottocartella `DEF/APPLE`, file `01_ANTEPRIME APP.jpg`–`05_ANTEPRIME APP.jpg` (luglio 2026). Copie web in `apps/web/public/media/case-studies/sirene-blu-app/`, WebP 900 × 1948, circa 424 KB totali. Le descrizioni alternative corrispondono alle schermate verificate. Nessuna modifica al CMS o al WordPress legacy.

## Verifica

Test di regressione in `apps/web/tests/e2e/visual-audit.spec.ts`: autoplay e ripresa, dimensioni dei cloni, evidenze e metriche responsive, immagini nuove, destinazioni, categoria concorso, modulo breve e ingombri NOD. Copertura aggiuntiva dalla suite E2E completa del repository. Controlli visuali nel browser su homepage, servizi, SEO, dettaglio progetto, NOD e catalogo design system. La verifica non costituisce una certificazione WCAG.

Pubblicazione prevista attraverso Deploy Staging e, dopo verifica del candidate, workflow protetto Deploy Production.

Validazione locale completata: lint, TypeScript, test unitari, build statica di 67 pagine, PHP lint, PHPCS, PHPStan, scansione segreti e 70 test Playwright superati. Verificata inoltre l’apertura reale dei progetti in una nuova scheda e la ripresa dei tre slider interessati.
