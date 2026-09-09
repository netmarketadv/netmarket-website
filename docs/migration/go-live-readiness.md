# Go-live readiness

Ultimo audit: 8 settembre 2026. Il proprietario ha autorizzato il go-live tramite pipeline
production protetta e ha confermato il backup manuale SiteGround. I vincoli di
`AGENTS.md` restano prevalenti.

## Stato sintetico

| Gate | Stato | Evidenza |
| --- | --- | --- |
| Repository candidate | PASS | `develop` a `421e248` prima delle modifiche di readiness |
| Inventario URL legacy | PASS | 66 URL pubblicati da sitemap e WordPress REST |
| Redirect map | PASS locale | 3 keep, 59 redirect 301, 4 risposte 410 |
| Canonical | PASS nel codice | origine unica `https://netmarket.it`, senza `www` |
| Staging indexability | PASS live | `Disallow: /`, meta e `X-Robots-Tag` noindex |
| CMS isolation | PASS live | `Disallow: /`, `X-Robots-Tag: noindex`, sitemap WP 404 |
| CMS health | PASS live | `/wp-json/netmarket/v1/health` restituisce `status: ok` |
| Production build audit | Da eseguire a ogni candidate | `pnpm build:production-candidate` |
| Production backup | PASS dichiarato | backup manuale SiteGround confermato dal proprietario; evidenza esterna al repository |
| Production workflow | PRONTO NEL CODICE | workflow protetto, deploy atomico, smoke e rollback aggiunti; environment e secret da verificare su GitHub |
| CMP / Iubenda | NON BLOCCANTE DICHIARATO | integrazione rinviata al post-live; Consent Mode iniziale denied già presente |
| Search Console | BLOCKER esterno | export URL/backlink e accesso proprietà non disponibili |
| Form production | BLOCKER pre-switch | vietato inviare test al dominio legacy; eseguire dopo switch controllato |

## Inventario e redirect

La source of truth è `data/migrations/go-live/legacy-url-map.json`.

- 66 URL pubblicati rilevati;
- 59 redirect permanenti verso la risorsa semanticamente equivalente;
- 3 URL mantenuti invariati: `/`, `/servizi/`, `/grazie/`;
- 4 URL rimossi con `410`: due landing Bolzano concluse, una pagina test e una pagina evento non migrata;
- 2 case study pubblici esclusi dalla sitemap mantengono un redirect uno-a-uno verso le nuove route, anch'esse editorialmente noindex;
- nessun redirect della mappa punta a un altro redirect della stessa mappa.

Le regole vengono generate nella build, non duplicate manualmente. In production le regole legacy precedono la normalizzazione host, così un vecchio URL su HTTP/`www` può arrivare direttamente alla destinazione HTTPS non-`www`.

## Candidato production

Generare e validare localmente:

```sh
pnpm build:production-candidate
```

Il comando imposta esclusivamente l'output locale:

- `PUBLIC_SITE_URL=https://netmarket.it`;
- `PUBLIC_DEPLOY_ENV=production`;
- `PUBLIC_CMS_URL=https://cms.netmarket.it`;
- tracking abilitato con il container legacy `GTM-K782CJ46`;
- `robots.txt` indexabile con sitemap production;
- `.htaccess` production senza `X-Robots-Tag: noindex`;
- redirect, caching, compressione e header di sicurezza compatibili.

`audit-production-build.mjs` fallisce per canonical errati, noindex inattesi, URL staging/localhost, JSON-LD invalido, link interni rotti, route sitemap mancanti, redirect chain o destinazioni assenti.

## Analytics e consenso

Il container rilevato sul sito legacy è `GTM-K782CJ46`. Il nuovo frontend lo carica soltanto quando l'ambiente è `production` e `PUBLIC_ANALYTICS_ENABLED=true`. Prima di caricare GTM imposta Consent Mode con `analytics_storage`, `ad_storage`, `ad_user_data` e `ad_personalization` su `denied`.

Nel controllo post-live il proprietario del container deve verificare in GTM Preview:

1. che Iubenda venga mostrata su `netmarket.it`;
2. che accettazione/rifiuto aggiornino Consent Mode;
3. che `page_view` non parta prima del consenso quando non ammesso;
4. che `contact_form_success` sia la sola conversione primaria;
5. che CTA, outbound, mail e telefono abbiano le regole desiderate.

Iubenda viene completata dopo il go-live, come richiesto dal proprietario. Nel frattempo
lo stato iniziale denied impedisce di concedere implicitamente analytics o advertising.
Non è stato inventato uno snippet Iubenda perché manca il `siteId` verificato e l'OAuth
segnalato non funziona.

## Backup e rollback richiesti

Prima di autorizzare il workflow production, SiteGround deve produrre e rendere leggibili:

| Backup | ID richiesto | Verifica minima |
| --- | --- | --- |
| Document root legacy | `pre-go-live-<UTC>-files` | archivio elencabile e checksum |
| Database WordPress legacy | `pre-go-live-<UTC>-db` | dump apribile e tabelle presenti |
| Uploads | incluso nel backup file o separato | conteggio e dimensione plausibili |
| `.htaccess` e config | incluso e copiato separatamente | file leggibile |
| DNS | `pre-go-live-<UTC>-dns` | export A/CNAME/MX/TXT |
| Candidate Astro | commit SHA + artifact | audit production PASS |

Il rollback deve ripristinare file e database legacy senza modificare MX/SPF/DKIM/DMARC. Trigger immediati: homepage 5xx, noindex production, redirect non attivi, form non funzionante, CSS/JS rotto o CMS irraggiungibile.

## Dati infrastrutturali read-only

Al momento dell'audit:

- `netmarket.it` risolve a `35.214.174.99`;
- MX: `10 in.remailer.it.`;
- il record SPF e le verifiche Google/OpenAI/Brevo esistono e non devono essere modificati;
- HTTP apex fa un 301 diretto a HTTPS apex;
- HTTP `www` passa oggi attraverso HTTPS `www` e poi apex, quindi forma una chain da eliminare nel vhost production;
- HTTPS `www` redirige all'apex.

## Finestra di go-live

1. Congelare contenuti legacy e annotare l'ora UTC.
2. Registrare riferimento e ora del backup manuale SiteGround già confermato.
3. Rieseguire `pnpm validate` e `pnpm build:production-candidate` sul commit candidato.
4. Eseguire visual QA del candidato a 390, 430, 768, 1024 e 1440 px.
5. Verificare Consent Mode denied e presenza GTM solo in production; completare Iubenda post-live.
6. Verificare GitHub Environment `production`, approvazione manuale e secret dedicati.
7. Eseguire il deploy atomico dal branch `main` tramite `Deploy Production`.
8. Eseguire smoke su homepage, servizi, agenzia, progetti, insight, NOD e contatti.
9. Testare tutte le 59 regole 301 e le 4 risposte 410.
10. Inviare un form TEST e verificare email, `/grazie/`, UTM/click ID e conversione.
11. Validare `https://netmarket.it/robots.txt` e `https://netmarket.it/sitemap-index.xml`.
12. Inviare la sitemap in Search Console e controllare GA4 Realtime.

## Monitoraggio

Entro 24 ore: indexability homepage, sitemap, top redirect, form, analytics, 404/5xx.

Entro 7 giorni: indicizzazione, canonical, URL escluse, redirect, traffico organico e Core Web Vitals.

Entro 30 giorni: confronto impression, click, query, landing page, pagine indicizzate e conversioni con il periodo precedente.
