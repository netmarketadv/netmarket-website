#!/usr/bin/env bash
set -Eeuo pipefail

URL=""
BASIC_AUTH=""
EXPECTED_BUILD_SHA="${EXPECTED_BUILD_SHA:-}"
EXPECTED_BUILD_ENV="${EXPECTED_BUILD_ENV:-staging}"
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

CURL_ARGS=(--fail --location --silent --show-error --max-time 10)
if [[ -n "$BASIC_AUTH" ]]; then
  CURL_ARGS+=(-u "$BASIC_AUTH")
elif [[ "$URL" == "https://cms.netmarket.it/wp-json/netmarket/v1/health" && -n "${CMS_BASIC_AUTH_USER:-}" && -n "${CMS_BASIC_AUTH_PASSWORD:-}" ]]; then
  CURL_ARGS+=(-u "$CMS_BASIC_AUTH_USER:$CMS_BASIC_AUTH_PASSWORD")
elif [[ "$URL" == "https://cms.netmarket.it/wp-json/netmarket/v1/health" ]]; then
  echo "CMS health check richiede Basic Auth: impostare --basic-auth oppure CMS_BASIC_AUTH_USER/CMS_BASIC_AUTH_PASSWORD."
  exit 1
fi

BODY="$(curl "${CURL_ARGS[@]}" "$CHECK_URL")"

read_meta() {
  local name="$1"
  sed -nE "s/.*<meta[[:space:]]+name=[\"']${name}[\"'][[:space:]]+content=[\"']([^\"']+)[\"'].*/\\1/p" <<<"$BODY" | head -n 1
}

if [[ "$URL" == "https://staging.netmarket.it" ]]; then
  if grep -qiE 'under construction|awesome site in the making' <<<"$BODY"; then
    echo "Staging non valido: pagina placeholder SiteGround rilevata."
    exit 1
  fi
  if ! grep -qiE '<!doctype html>|<html[[:space:]>]' <<<"$BODY"; then
    echo "Staging non valido: documento HTML non riconosciuto."
    exit 1
  fi
  if grep -q 'http://localhost:4321' <<<"$BODY"; then
    echo "Staging non valido: metadata localhost rilevati."
    exit 1
  fi
  build_sha="$(read_meta "netmarket-build")"
  build_env="$(read_meta "netmarket-environment")"

  if [[ -z "$build_sha" ]]; then
    echo "Staging non valido: meta netmarket-build mancante."
    exit 1
  fi
  if [[ "$build_env" != "$EXPECTED_BUILD_ENV" ]]; then
    echo "Staging non valido: environment '$build_env' diverso da '$EXPECTED_BUILD_ENV'."
    exit 1
  fi
  if [[ -n "$EXPECTED_BUILD_SHA" && "$build_sha" != "$EXPECTED_BUILD_SHA" ]]; then
    echo "Staging non valido: build '$build_sha' diversa da '$EXPECTED_BUILD_SHA'."
    exit 1
  fi

  required_markers=("<head" "<body" "site-header" "site-footer")
  for marker in "${required_markers[@]}"; do
    if ! grep -qi "$marker" <<<"$BODY"; then
      echo "Staging non valido: marker strutturale mancante: $marker"
      exit 1
    fi
  done

  echo "Staging valido: build $build_sha su $build_env."
fi

if [[ "$URL" == "https://cms.netmarket.it/wp-json/netmarket/v1/health" ]]; then
  if ! grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' <<<"$BODY"; then
    echo "CMS non valido: health endpoint proprietario non risponde status ok."
    exit 1
  fi
fi
