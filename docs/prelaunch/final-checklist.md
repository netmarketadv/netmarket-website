# Final Checklist

Data audit: 2026-09-02

## Stato Corrente

Esito: `NOT READY`

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
- [x] Quality GitHub completata con E2E verde per `53b5a99`.
- [x] Hardening deploy path applicato.
- [x] Hardening verifica SiteGround applicato.
- [x] Hardening CMS credentials applicato nel deploy workflow.
- [x] Content validation CMS reale tentata: fallisce con `401` per Basic Auth mancante.
- [ ] `CMS_BASIC_AUTH_USER` configurato su GitHub.
- [ ] `CMS_BASIC_AUTH_PASSWORD` configurato su GitHub.
- [ ] `Verify SiteGround` rilanciato con controllo path.
- [ ] `Deploy Staging` completato con successo.
- [ ] Smoke staging completato con SHA atteso.
- [ ] Content validation CMS reale completata con credenziali.
- [ ] Visual QA staging completata.
- [ ] Performance/Lighthouse staging completata.

## Bloccanti

- Deploy path remoto non accessibile: `Permission denied (13)`.
- Credenziali CMS Basic Auth mancanti nei secret GitHub.
- Staging online ancora fermo alla build `6117c244cd3c1159f901c149c94e178f36bde8f0`.

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
