# Requisiti SEO

- Canonical assoluti.
- Robots per ambiente.
- Sitemap e RSS predisposti.
- JSON-LD solo quando supportato dal contenuto visibile.
- Staging sempre `noindex, nofollow, noarchive`.
- Production indicizzabile salvo override editoriale.
- Service usa Schema.org `Service` solo su pagine servizio reali, collegato a Organization.
- Le pagine servizio emettono canonical assoluti verso il dominio pubblico finale, mentre staging resta noindex via robots environment.
- Ogni dettaglio servizio emette breadcrumb `Home > Servizi > Nome servizio` e `Service` con `@id` stabile `#service`.
- Article usa `Article`; se esiste una Person editoriale collegata, quella Person e l'autore.
- L'archivio Insight e le pagine paginated sono incluse in sitemap e RSS. I dettagli articolo emettono breadcrumb e `Article` schema.
- `/agenzia/` emette WebPage, Organization e Person per il team visibile.
- `/contatti/` emette ContactPage e mantiene i dati aziendali visibili coerenti con il footer.
- Person usa `worksFor` verso Netmarket e `sameAs` LinkedIn quando presente.
- Case Study viene modellato come `CreativeWork`/`WebPage`, senza inventare tipi Schema.org non pertinenti.
- Client non genera automaticamente Organization schema, salvo pagina/contenuto che descriva realmente il cliente con dati sufficienti.

Le immagini social sono placeholder documentati; gli asset definitivi saranno creati nella fase design.
