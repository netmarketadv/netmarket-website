#!/usr/bin/env bash
set -Eeuo pipefail

DRY_RUN=false
HOST=""
PATH_TARGET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --host) HOST="${2:-}"; shift 2 ;;
    --path) PATH_TARGET="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

if [[ "$HOST" != "staging.netmarket.it" ]]; then
  echo "Target rifiutato: deploy consentito solo verso staging.netmarket.it."
  exit 1
fi

if [[ -z "$PATH_TARGET" || "$PATH_TARGET" == *"netmarket.it"* ]]; then
  echo "Percorso deploy mancante o ambiguo."
  exit 1
fi

echo "Deploy staging preparato per host $HOST e path $PATH_TARGET."
if [[ "$DRY_RUN" == true ]]; then
  echo "Dry-run: nessun file verra copiato."
  exit 0
fi

echo "Deploy reale non implementato finche SSH e strategia rsync non saranno autorizzati."
exit 1
