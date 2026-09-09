# Analytics e conversioni

## Architettura canonica

- Container: Google Tag Manager `GTM-K782CJ46`.
- Stream web GA4: `G-DHXW4WZ5XP`.
- Google Ads: `AW-16639879288`.
- Dominio misurato: `https://netmarket.it` senza `www`.
- GTM viene compilato nel sito soltanto in production; locale e staging non inviano dati.
- Il frontend imposta Consent Mode v2 su `denied` prima di caricare GTM.
- La CMP canonica e iubenda, site `2837332`, cookie policy `69986431`.

Non inserire GA4, Google Ads, Meta Pixel o altri tracker direttamente nei componenti di pagina.
GTM e l'unico punto di distribuzione dei tag. Gli eventi applicativi vengono accodati nel
`dataLayer` e passati al Google tag gia distribuito da GTM. Il `dataLayer` non deve contenere
email, telefono, nome, testo dei form, query string o altri dati personali.

## Eventi applicativi

| Evento                 | Quando                          | Parametri                                              |
| ---------------------- | ------------------------------- | ------------------------------------------------------ |
| `page_context`         | Ogni documento                  | `page_path`, `page_title`, `page_type`, `content_slug` |
| `service_view`         | Dettaglio servizio              | `service_slug`                                         |
| `case_study_view`      | Dettaglio progetto              | `case_study_slug`                                      |
| `insight_view`         | Dettaglio insight               | `insight_slug`                                         |
| `cta_click`            | CTA esplicita                   | `cta_label`, `cta_url`, `cta_location`                 |
| `contact_click`        | Email, telefono o mappa         | `contact_method`                                       |
| `contact_form_start`   | Prima interazione con un form   | `form_id`                                              |
| `contact_form_submit`  | Tentativo valido di invio       | `form_id`                                              |
| `contact_form_success` | Risposta positiva reale dal CMS | `form_id`                                              |
| `generate_lead`        | Contatto acquisito con successo | `form_id`, `lead_type`                                 |
| `contact_form_error`   | Errore del backend              | `form_id`, `error_code`                                |
| `resource_download`    | Download di un documento        | `resource_slug`                                        |
| `outbound_click`       | Uscita dal dominio              | `outbound_domain`, `outbound_path`                     |

`generate_lead` e la conversione primaria. `/grazie/` e solo conferma visiva e non deve generare
una seconda conversione. `contact_form_submit` misura il tentativo, non il risultato.

## Configurazione GTM richiesta

1. Iubenda Privacy Controls and Cookie Solution viene inizializzata direttamente nell'`head`,
   prima di GTM, aggiorna Consent Mode v2 ed emette `iubenda_gtm_consent_event`. I callback
   `onPreferenceExpressed` e `onConsentRead` accodano `netmarket_consent_ready` dopo che la CMP ha
   consolidato la scelta, anche nelle visite successive.
2. Il Google tag GA4 usa `G-DHXW4WZ5XP`, tutte le pagine, con i consent check integrati.
3. Il Google tag Ads usa `AW-16639879288`, tutte le pagine, con i consent check integrati.
4. Il Conversion Linker usa tutte le pagine e richiede `ad_storage`.
5. Meta Pixel e ogni Custom HTML non Google devono richiedere `ad_storage`, ascoltare soltanto
   `netmarket_consent_ready` e avere firing limitato a una volta per pagina.
6. Gli eventi applicativi, eccetto `generate_lead`, vengono inviati al Google tag dal dispatcher
   tipizzato del frontend. Non creare tag GA4 duplicati per gli stessi eventi.
7. Marcare `generate_lead` come key event in GA4 e importarlo una sola volta in Google Ads. Non
   affiancare una seconda conversione Ads basata su `/grazie/`.

La misurazione avanzata GA4 resta attiva per gli eventi standard (`click`, `file_download`,
`scroll` e interazioni form). Gli eventi applicativi usano nomi distinti e una tassonomia
Netmarket; non creare tag GTM aggiuntivi che replichino gli stessi nomi custom.

## Impostazioni GA4

- Data retention eventi: 14 mesi.
- Internal traffic: filtro di esclusione presente in stato `Test`; verificare gli IP dell'agenzia
  prima di portarlo su `Attivo`.
- Developer traffic: non configurato; usare `debug_mode` soltanto nelle sessioni di collaudo.
- Referral indesiderati: verificare gateway di pagamento e domini realmente coinvolti; non
  aggiungere domini per abitudine.
- Custom dimensions event-scoped: `page_type`, `content_slug`, `cta_location`, `form_id`,
  `lead_type`, `service_slug`, `case_study_slug`, `insight_slug`, `contact_method`,
  `outbound_domain`.
- Nessun User-ID o dato fornito dall'utente finche non esiste una base tecnica e legale dedicata.

## Attribuzione

UTM, click ID e primo referrer vengono mantenuti nella sessione e allegati al lead inviato al CMS.
Il `dataLayer` riceve soltanto URL ripuliti: nessuna query string o frammento. Usare almeno
`utm_source`, `utm_medium` e `utm_campaign`; aggiungere `utm_content` e `utm_term` quando utili.

## QA prima della pubblicazione

- Browser pulito: nessun cookie non necessario prima della scelta.
- Rifiuta tutto: consenso negato persistente, niente `_fbp`, `_ga` o cookie marketing.
- Accetta statistiche: GA4 registra una sola page view e gli eventi consentiti.
- Accetta marketing: Google Ads e Meta partono dopo il segnale CMP.
- Revoca: i consent state tornano negati e i tag smettono di usare storage.
- Form: un solo `generate_lead` dopo HTTP 200; zero conversioni sugli errori.
- Verifica in Tag Assistant, GA4 DebugView, Google Ads diagnostics e Meta Pixel Helper.

## Stato configurazione del 9 settembre 2026

- Collegamenti GA4 a Google Ads e Search Console verificati.
- Conservazione di eventi e dati utente impostata a 14 mesi.
- Oscuramento automatico degli indirizzi email attivo nello stream web.
- Gli eventi tecnici storicamente marcati come key event sono stati rimossi; `generate_lead` e la
  conversione commerciale canonica.
- La configurazione diventa definitiva solo dopo deploy production, pubblicazione del container
  GTM e collaudo dei tre stati CMP: nessuna scelta, statistiche, marketing.
