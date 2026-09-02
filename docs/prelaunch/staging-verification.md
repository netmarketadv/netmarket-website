# Staging Verification

Data audit: 2026-09-02

## Target

- URL: `https://staging.netmarket.it`
- Build attesa piu recente: `2c8c73b474ced6f4049cabf66de338eae14f2278` oppure commit successivo del branch `chore/prelaunch-hardening`
- Ambiente atteso: `staging`

## Stato

Esito corrente: `DEPLOY IN PROGRESS`

Il deploy del commit `53b5a99` non era arrivato allo smoke test remoto per fallimento nello step `Deploy`. Dopo hardening, il dry-run del branch `chore/prelaunch-hardening` e verde e il deploy reale e stato rilanciato con run `33615441326`.

Health check remoto read-only eseguito su `https://staging.netmarket.it`:

- Esito HTTP/strutturale: valido.
- Build online rilevata: `6117c244cd3c1159f901c149c94e178f36bde8f0`.
- Environment online rilevato: `staging`.
- Stato: ambiente raggiungibile ma stale rispetto al commit atteso finche la run reale non completa lo smoke.

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
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33615441326`
- Stato durante audit: in progress.

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
EXPECTED_BUILD_SHA=2c8c73b474ced6f4049cabf66de338eae14f2278 EXPECTED_BUILD_ENV=staging pnpm smoke:staging
```
