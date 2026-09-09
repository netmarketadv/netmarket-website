#!/usr/bin/env bash
set -Eeuo pipefail

HOST=""
PATH_TARGET=""
EXPECTED_SHA=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) HOST="${2:-}"; shift 2 ;;
    --path) PATH_TARGET="${2:-}"; shift 2 ;;
    --sha) EXPECTED_SHA="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

required=(SG_SSH_HOST SG_SSH_PORT SG_SSH_USER SG_SSH_PRIVATE_KEY SG_SSH_KNOWN_HOSTS)
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then echo "Secret mancante: $var"; exit 1; fi
done

if [[ "$HOST" != "netmarket.it" ]]; then
  echo "Target verifica rifiutato."
  exit 1
fi

if [[ -z "$PATH_TARGET" || "$PATH_TARGET" != *"/netmarket.it/"* || "$PATH_TARGET" != */public_html ]]; then
  echo "Percorso verifica production non valido."
  exit 1
fi

if [[ ! "$EXPECTED_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "SHA production non valido."
  exit 1
fi

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"
SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" \
  "set -eu; target='$PATH_TARGET'; expected='$EXPECTED_SHA'; test -s \"\$target/index.html\"; test -s \"\$target/.htaccess\"; test -s \"\$target/robots.txt\"; test -s \"\$target/sitemap-index.xml\"; test \"\$(cat \"\$target/netmarket-release\")\" = \"\$expected\"; grep -Fq \"\$expected\" \"\$target/index.html\"; grep -Fq 'name=\"netmarket-environment\" content=\"production\"' \"\$target/index.html\"; grep -Fq 'GTM-K782CJ46' \"\$target/index.html\"; grep -Fq \"analytics_storage: 'denied'\" \"\$target/index.html\"; grep -Fq 'Sitemap: https://netmarket.it/sitemap-index.xml' \"\$target/robots.txt\"; grep -Fq 'https://netmarket.it/nod/' \"\$target/sitemap-index.xml\"; for file in servizi/index.html servizi/siti-web/index.html agenzia/index.html lavora-con-noi/index.html progetti/index.html insight/index.html nod/index.html contatti/index.html grazie/index.html; do test -s \"\$target/\$file\"; done; ! grep -RqiE 'staging\\.netmarket\\.it|localhost:' \"\$target\" --include='*.html' --include='*.xml' --include='robots.txt'"

echo "Verifica artifact production PASS: $EXPECTED_SHA."
