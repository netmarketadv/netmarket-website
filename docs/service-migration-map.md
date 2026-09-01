# Service Migration Map

Documento preliminare, non applica redirect e non modifica produzione.

Fonti lette:

- HTML esportato della pagina Netmarket servizi/siti web;
- HTML esportato ecommerce;
- navigazione footer/menu del sito corrente;
- ispezione read-only dei contenuti esistenti.

## Redirect Candidate

| URL legacy                       | Nuovo servizio candidato             | Note                                                                 |
| -------------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `/servizi/`                      | `/servizi/`                          | Archivio resta stabile come hub.                                     |
| `/realizzazione-siti-web/`       | `/servizi/siti-web/`                 | Pagina storica siti web.                                             |
| `/e-commerce/`                   | `/servizi/ecommerce/`                | Canonical legacy rilevato nei meta Yoast.                            |
| `/software-gestionali/`          | `/servizi/software-e-integrazioni/`  | Voce menu legacy.                                                    |
| `/seo/`                          | `/servizi/seo/`                      | Voce menu legacy.                                                    |
| `/marketing/`                    | `/servizi/advertising/`              | Da validare editorialmente: marketing legacy può includere più aree. |
| `/social-media-marketing/`       | `/servizi/social-media/`             | Voce menu legacy.                                                    |
| `/comunicazione/`                | `/servizi/branding-e-comunicazione/` | Da validare con copy definitivo.                                     |
| `/agenzia-pubblicitaria-padova/` | `/servizi/advertising/`              | Possibile pagina pubblicità tradizionale.                            |
| `/concorsi-a-premi/`             | `/servizi/concorsi-a-premi/`         | Voce menu legacy.                                                    |

## Editorial Notes

- Non copiare automaticamente headline e body copy legacy: il nuovo sistema deve essere editoriale e commerciale, non una serie di landing SEO.
- Prima dei redirect reali servono crawl completo, export sitemap e verifica Search Console.
- I redirect andranno implementati solo quando produzione sarà autorizzata.
