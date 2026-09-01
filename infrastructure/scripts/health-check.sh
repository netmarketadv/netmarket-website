#!/usr/bin/env bash
set -Eeuo pipefail

URL=""
BASIC_AUTH=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --url) URL="${2:-}"; shift 2 ;;
    --basic-auth) BASIC_AUTH="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

if [[ "$URL" != "https://staging.netmarket.it" && "$URL" != "https://cms.netmarket.it/wp-json/netmarket/v1/health" ]]; then
  echo "URL health check rifiutato: $URL"
  exit 1
fi

echo "Health check configurato per $URL."
CHECK_URL="$URL"
if [[ "$URL" == "https://staging.netmarket.it" ]]; then
  CHECK_URL="${URL}?nm_health=$(date +%s)"
fi

CURL_ARGS=(--fail --silent --show-error --max-time 10)
if [[ -n "$BASIC_AUTH" ]]; then
  CURL_ARGS+=(-u "$BASIC_AUTH")
elif [[ "$URL" == "https://cms.netmarket.it/wp-json/netmarket/v1/health" && -n "${CMS_BASIC_AUTH_USER:-}" && -n "${CMS_BASIC_AUTH_PASSWORD:-}" ]]; then
  CURL_ARGS+=(-u "$CMS_BASIC_AUTH_USER:$CMS_BASIC_AUTH_PASSWORD")
fi

BODY="$(curl "${CURL_ARGS[@]}" "$CHECK_URL")"

if [[ "$URL" == "https://staging.netmarket.it" ]]; then
  if grep -qiE 'under construction|awesome site in the making' <<<"$BODY"; then
    echo "Staging non valido: pagina placeholder SiteGround rilevata."
    exit 1
  fi
  if ! grep -qi 'netmarket' <<<"$BODY"; then
    echo "Staging non valido: contenuto Netmarket non rilevato."
    exit 1
  fi
  if grep -q 'http://localhost:4321' <<<"$BODY"; then
    echo "Staging non valido: metadata localhost rilevati."
    exit 1
  fi
  required_markers=(
    "Clienti e progetti seguiti da Netmarket."
    "Persone, competenze, valore."
    "Recensioni e segnali di fiducia."
  )
  for marker in "${required_markers[@]}"; do
    if ! grep -q "$marker" <<<"$BODY"; then
      echo "Staging non valido: marker homepage mancante: $marker"
      exit 1
    fi
  done
fi

if [[ "$URL" == "https://cms.netmarket.it/wp-json/netmarket/v1/health" ]]; then
  if ! grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' <<<"$BODY"; then
    echo "CMS non valido: health endpoint proprietario non risponde status ok."
    exit 1
  fi
fi
