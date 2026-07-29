#!/usr/bin/env bash
set -Eeuo pipefail

DRY_RUN=true
DOMAIN=""
WP_PATH=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --execute) DRY_RUN=false; shift ;;
    --domain) DOMAIN="${2:-}"; shift 2 ;;
    --path) WP_PATH="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

if [[ "$DOMAIN" != "cms.netmarket.it" ]]; then
  echo "Target rifiutato: bootstrap WordPress consentito solo su cms.netmarket.it."
  exit 1
fi

if [[ -z "$WP_PATH" || "$WP_PATH" == *"netmarket.it"* ]]; then
  echo "Percorso WordPress mancante o ambiguo."
  exit 1
fi

if ! command -v wp >/dev/null 2>&1; then
  echo "WP-CLI non disponibile: nessuna operazione eseguita."
  exit 1
fi

echo "Azioni previste: verifica core, permalink, plugin proprietario, noindex CMS."
if [[ "$DRY_RUN" == true ]]; then
  echo "Dry-run: nessuna modifica eseguita."
  exit 0
fi

echo "Bootstrap reale non abilitato in questa fase."
exit 1
