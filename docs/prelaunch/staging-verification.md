# Staging Verification

Data audit: 2026-09-02

## Target

- URL: `https://staging.netmarket.it`
- Build attesa piu recente: `53b5a99`
- Ambiente atteso: `staging`

## Stato

Esito corrente: `NOT VERIFIED`

Il deploy del commit `53b5a99` non e arrivato allo smoke test remoto per fallimento nello step `Deploy`.

Health check remoto read-only eseguito su `https://staging.netmarket.it`:

- Esito HTTP/strutturale: valido.
- Build online rilevata: `6117c244cd3c1159f901c149c94e178f36bde8f0`.
- Environment online rilevato: `staging`.
- Stato: ambiente raggiungibile ma stale rispetto al commit atteso `53b5a99`.

## Evidenze

- Workflow: `Deploy Staging`
- Run: `https://github.com/netmarketadv/netmarket-website/actions/runs/33611336296`
- Conclusione: `failure`
- Step fallito: `Deploy`
- Errore: `rsync: [Receiver] change_dir#1 "***/" failed: Permission denied (13)`
- Step `Smoke staging`: skipped

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
EXPECTED_BUILD_SHA=53b5a998ad4ec540587cc1b729ef3f6d35c36506 EXPECTED_BUILD_ENV=staging pnpm smoke:staging
```
