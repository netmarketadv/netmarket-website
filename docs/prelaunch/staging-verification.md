# Staging Verification

Data audit: 2026-09-02

## Target

- URL: `https://staging.netmarket.it`
- Build attesa piu recente: `2c8c73b474ced6f4049cabf66de338eae14f2278` oppure commit successivo del branch `chore/prelaunch-hardening`
- Ambiente atteso: `staging`

## Stato

Esito corrente: `VERIFIED WITH WARNINGS`

Il deploy del commit `53b5a99` non era arrivato allo smoke test remoto per fallimento nello step `Deploy`. Dopo hardening, il branch `chore/prelaunch-hardening` e stato deployato correttamente su staging.

Health check remoto read-only eseguito su `https://staging.netmarket.it`:

- Esito HTTP/strutturale: valido.
- Build online rilevata: `a1753b3e77f6e9c0de4cecc3f4b4616b2e0929bc`.
- Environment online rilevato: `staging`.
- Stato: ambiente raggiungibile e aggiornato allo SHA atteso.

## Evidenze

- Workflow: `Deploy Staging`
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33611336296`
- Conclusione: `failure`
- Step fallito: `Deploy`
- Errore: `rsync: [Receiver] change_dir#1 "***/" failed: Permission denied (13)`
- Step `Smoke staging`: skipped

Dry-run corretto:

- Workflow: `Deploy Staging`
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33615147619`
- Conclusione: `success`
- Step `Dry-run deploy plan`: success

Deploy reale rilanciato:

- Workflow: `Deploy Staging`
- Run annullata: `https://github.com/netmarketadv/netmarket-website/actions/runs/33615441326`
- Motivo: commit superato da patch cache fallback.

Deploy reale verificato:

- Workflow: `Deploy Staging`
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33616676522`
- Conclusione: `success`
- Step `Deploy`: success
- Step `Smoke staging`: success
- SHA online: `a1753b3e77f6e9c0de4cecc3f4b4616b2e0929bc`

Warning:

- Il CMS risponde `404` sugli endpoint contenuto headless, quindi le pagine editoriali deployate usano fallback/snapshot reali.

## Criteri Da Verificare Dopo Deploy

- HTTP 200 su `https://staging.netmarket.it`.
- Documento HTML reale, non placeholder hosting.
- `meta[name="netmarket-build"]` uguale allo SHA della run.
- `meta[name="netmarket-environment"]` uguale a `staging`.
- `meta[name="robots"]` con `noindex`.
- Header e footer presenti.
- Nessun riferimento a `localhost`.
- Pagine chiave navigabili:
  - `/`
  - `/servizi/`
  - `/progetti/`
  - `/insight/`
  - `/agenzia/`
  - `/contatti/`

## Comando Smoke

```bash
EXPECTED_BUILD_SHA=a1753b3e77f6e9c0de4cecc3f4b4616b2e0929bc EXPECTED_BUILD_ENV=staging pnpm smoke:staging
```
