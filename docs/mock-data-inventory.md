# Mock Data Inventory

Questo inventario classifica dati hardcoded attuali e percorso di migrazione.

| File                                            | Contenuto                             | Stato          | Migrazione                                                                        |
| ----------------------------------------------- | ------------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| `apps/web/src/data/team.ts`                     | Persone e foto team approvate         | must migrate   | Spostare in `nm_person`; mantenere fallback TS finche CMS non e popolato          |
| `apps/web/src/data/home.ts` `clientLogos`       | Loghi clienti e scala visiva          | must migrate   | Spostare in `nm_client` con `show_in_marquee` e `visual_scale`                    |
| `apps/web/src/data/home.ts` `serviceCards`      | Sintesi servizi homepage              | temporary mock | Sostituire con `nm_service` featured quando i servizi CMS sono completi           |
| `apps/web/src/data/home.ts` `insights`          | Card insight statiche                 | temporary mock | Sostituire con `post` featured da `/insights`                                     |
| `apps/web/src/data/home.ts` `questions`         | FAQ homepage                          | temporary mock | Spostare nei metadata della homepage/page quando il template home sara collegato  |
| `apps/web/src/data/reviews.ts`                  | Recensioni Google statiche verificate | keep separate  | Restano separate da `nm_testimonial`; aggiornarle solo da fonte Google verificata |
| `apps/web/src/data/home.ts` `trustBadges/proof` | Badge/proof homepage                  | temporary mock | Spostare in Global Settings o metadata homepage                                   |

Nessun mock deve essere presentato come contenuto CMS reale.
