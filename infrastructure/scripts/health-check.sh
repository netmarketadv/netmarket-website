#!/usr/bin/env bash
set -Eeuo pipefail

URL=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --url) URL="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

if [[ "$URL" != "https://staging.netmarket.it" && "$URL" != "https://cms.netmarket.it/wp-json/netmarket/v1/health" ]]; then
  echo "URL health check rifiutato: $URL"
  exit 1
fi

echo "Health check configurato per $URL."
curl --fail --silent --show-error --max-time 10 "$URL" >/dev/null
