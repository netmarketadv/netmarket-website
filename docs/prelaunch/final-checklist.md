# Final Checklist

Data audit: 2026-09-02

## Stato Corrente

Esito: `STAGING READY WITH WARNINGS`

## Checklist

- [x] Branch di hardening creato: `chore/prelaunch-hardening`.
- [x] Working tree iniziale pulito.
- [x] Secret scan locale eseguito senza riscontri.
- [x] Unit test frontend locale eseguiti: 26 test passati.
- [x] E2E service locale mirato eseguito: 3 test passati.
- [x] Full E2E locale completato dopo hardening: 26 test passati.
- [x] Production metadata simulation completata: build success, robots production `Allow: /`, nessun staging/localhost nel `dist`.
- [x] Canonical e JSON-LD URL editoriali normalizzati su `https://www.netmarket.it`.
- [x] Deploy staging precedente analizzato.
- [x] Health check staging read-only eseguito: build online valida ma stale (`6117c244cd3c1159f901c149c94e178f36bde8f0`).
- [x] Health check CMS read-only tentato: richiede Basic Auth.
- [x] GitHub secrets audit eseguito per nomi, senza leggere valori.
- [x] `CMS_BASIC_AUTH_USER` configurato su GitHub.
- [x] `CMS_BASIC_AUTH_PASSWORD` configurato su GitHub.
- [x] Quality GitHub completata con E2E verde per `53b5a99`.
- [x] Hardening deploy path applicato.
- [x] Hardening verifica SiteGround applicato.
- [x] Hardening CMS credentials applicato nel deploy workflow.
- [x] Content validation CMS reale tentata: fallisce con `401` per Basic Auth mancante.
- [x] Deploy Staging dry-run completato con successo: run `33615147619`.
- [x] Cache fallback contenuti applicata per evitare chiamate dettaglio CMS ripetute.
- [ ] `Verify SiteGround` registrato/rilanciato con controllo path.
- [x] `Deploy Staging` reale completato con successo: run `33616676522`.
- [x] Smoke staging completato con SHA atteso: `a1753b3e77f6e9c0de4cecc3f4b4616b2e0929bc`.
- [ ] Content validation CMS reale completata con credenziali e route contenuto disponibili.
- [ ] Visual QA staging completata.
- [ ] Performance/Lighthouse staging completata.
- [x] Final audit crawler legacy read-only completato: 101 URL inventariati.
- [x] Final audit crawler staging completato: 53 URL inventariati.
- [x] URL decision matrix generata: 103 righe.
- [x] Redirect master preliminare generato: 54 candidate redirect.
- [x] Search/GEO/AI crawler research documentata con fonti ufficiali.
- [x] Topic map, navigation architecture, homepage strategy, editorial style guide e go-live runbook creati.
- [x] `/nod/` implementato nel codice e generato dalla build locale.
- [ ] `/nod/` pubblicato e verificato su staging.
- [ ] Servizi, case study, clienti, team, risorse e testimonial popolati nel CMS o fallback formalmente accettati.
- [ ] Image alt review completata distinguendo immagini decorative e immagini contenuto.
- [ ] Export Search Console/GA4/Bing/backlink importato per priorizzare redirect e contenuti.

## Bloccanti

- CMS non è ancora source of truth per servizi, case study, clienti, team, risorse e testimonial.
- `/nod/` è linkato su staging ma restituisce `404`.
- La redirect strategy è pronta come bozza, ma non è ancora validata con dati Search Console, Analytics o backlink.
- La visual QA completa su staging e la review alt immagini non sono ancora concluse.
- Staging deve restare noindex; nessuna azione di produzione è autorizzata.

## Comandi Per Secret CMS

```bash
gh auth status
gh secret set CMS_BASIC_AUTH_USER --repo netmarketadv/netmarket-website --body "USERNAME_BASIC_AUTH_CMS"
gh secret set CMS_BASIC_AUTH_PASSWORD --repo netmarketadv/netmarket-website --body "PASSWORD_BASIC_AUTH_CMS"
```

Opzionale environment staging:

```bash
gh secret set CMS_BASIC_AUTH_USER --repo netmarketadv/netmarket-website --env staging --body "USERNAME_BASIC_AUTH_CMS"
gh secret set CMS_BASIC_AUTH_PASSWORD --repo netmarketadv/netmarket-website --env staging --body "PASSWORD_BASIC_AUTH_CMS"
```
