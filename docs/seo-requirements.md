# Requisiti SEO

- Canonical assoluti.
- Robots per ambiente.
- Sitemap e RSS predisposti.
- JSON-LD solo quando supportato dal contenuto visibile.
- Staging sempre `noindex, nofollow, noarchive`.
- Production indicizzabile salvo override editoriale.
- Service usa Schema.org `Service` solo su pagine servizio reali, collegato a Organization.
- Article usa `Article`; se esiste una Person editoriale collegata, quella Person e l'autore.
- Person usa `worksFor` verso Netmarket e `sameAs` LinkedIn quando presente.
- Case Study viene modellato come `CreativeWork`/`WebPage`, senza inventare tipi Schema.org non pertinenti.
- Client non genera automaticamente Organization schema, salvo pagina/contenuto che descriva realmente il cliente con dati sufficienti.

Le immagini social sono placeholder documentati; gli asset definitivi saranno creati nella fase design.
