# Consolidamento del design system — 18 settembre 2026

## Obiettivo e perimetro

Rendere coerenti fondazioni, componenti e comportamenti, senza moltiplicare le alternative per lo stesso compito. Audit del catalogo esistente, inventario di tutti i componenti Astro, verifica dei consumatori e delle regole CSS, confronto con pagine reali. Direzione mantenuta: identità editoriale Netmarket, blu come accento, tipografia ampia, immagini dei progetti e motion discreto.

## Risultato

- Registro completo: 58 componenti, di cui 15 canonici, 4 infrastrutturali e 39 composizioni o sottocomponenti privati. Rimossi 17 componenti senza consumatori; nessuna eliminazione di funzionalità utilizzate.
- Una sola implementazione Button, con tre gerarchie, due dimensioni e stati focus, disabled e busy. Submit esplicito; link disabilitati senza destinazione attiva. IconButton per controlli con sola icona.
- Un solo stylesheet per i campi di contatto e candidatura; dimensioni, bordi, errori, aiuti, selezioni e conferme condivisi. Form Contatti stabile durante l'interazione, senza reveal sul contenitore interattivo. Rimosso il main annidato.
- SectionHeading governa titolo, testo, eyebrow e allineamento. ContactCTA sostituisce le implementazioni duplicate di agenzia, progetti e servizi. ProjectCard governa prove semplici e correlati, con categoria esterna all'immagine e media 4:3.
- Token per controlli, spessore icone e livelli di sovrapposizione. Metadati più leggibili: colore aggiornato da #858D9A a #626C7A. Contrasti approvati verificati automaticamente.
- Rimossi CSS dei componenti ritirati, selettori privi di consumatori e le due implementazioni di cursore personalizzato. Il cursore nativo e gli stati di link restano prevedibili.
- Catalogo ampliato con indice, mappa esigenza/componente, layout, spazi, raggi, controlli reali, stati form, pattern ed eccezioni esplicite. Catalogo sempre noindex.
- Immagine principale homepage ricompressa in WebP a qualità 75: 161.810 → 112.120 byte; variante 388 px: 52.232 → 40.436 byte. Nessuna modifica al soggetto o al formato. Ritratti del team fuori dalla prima schermata caricati lazy, senza competere con l'immagine principale.

## Evidenze visuali

Screenshot della sessione in `/tmp/netmarket-design-system/`:

1. `01-catalog-before.png`: il titolo del catalogo non seguiva la gerarchia H1. Correzione con token tipografico, indice e spaziatura del marker.
2. `04-controls-after.png`: controlli canonici su fondo chiaro e scuro, dimensioni e stati allineati; nessuna ricostruzione dimostrativa diversa dai componenti di produzione.
3. `08-fields-mobile-after.png`: campo normale, errore, disabled e select leggibili a 390 px, con label persistenti e messaggi collegati.
4. `05-contact-after.png`: medesime regole applicate al form reale, testo di supporto e consenso con gerarchia corretta.

Le acquisizioni durante le animazioni non sono usate come prova del risultato finale. Le composizioni specifiche di home, NOD, Siti web e archivi restano eccezioni documentate, non nuove primitive concorrenti.

## Verifica e manutenzione

Test di governance: registro completo, assenza di componenti inutilizzati, azioni primarie attraverso Button, stylesheet form condiviso e nove coppie cromatiche con contrasto almeno 4,5:1. Nove nuovi test browser coprono sette larghezze tra 390 e 1728 px, landmarks, opzioni select, assenza di overflow, target di almeno 44 px, tastiera, errori e contratti condivisi nelle pagine reali.

Validazione: lint, TypeScript, test unitari, build di 67 pagine, PHP lint, PHPCS, PHPStan e scansione segreti. Suite completa Playwright richiesta prima della pubblicazione; gate Quality Full nella PR verso main. La pipeline ufficiale verifica staging e SHA, quindi pubblica attraverso l'environment production protetto.

Queste verifiche non equivalgono a una certificazione WCAG o a una graduatoria delle agenzie. La misura Lighthouse locale è un controllo di laboratorio; SEO locale penalizzato intenzionalmente dal noindex. I budget sul traffico reale restano da verificare con misure sul campo e le immagini CMS mantengono opportunità di ulteriore ottimizzazione responsive.

Esito locale finale: **79/79 test Playwright superati**. Lighthouse mobile simulato: performance **78** (prima delle ottimizzazioni 72), accessibilità **100**, best practice **100**, SEO **69** sul sito locale noindex; LCP 5,8 s, TBT 0 ms, CLS 0. Il caricamento delle immagini mobile resta un limite misurato, non viene dichiarato raggiunto il budget LCP. Rapporti JSON prima/dopo nella stessa cartella delle evidenze.
