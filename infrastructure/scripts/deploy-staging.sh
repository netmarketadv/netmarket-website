#!/usr/bin/env bash
set -Eeuo pipefail

DRY_RUN=true
HOST=""
PATH_TARGET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --execute) DRY_RUN=false; shift ;;
    --host) HOST="${2:-}"; shift 2 ;;
    --path) PATH_TARGET="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

required=(SG_SSH_HOST SG_SSH_PORT SG_SSH_USER SG_SSH_PRIVATE_KEY SG_SSH_KNOWN_HOSTS)
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Secret mancante: $var"
    exit 1
  fi
done

if [[ "$HOST" != "staging.netmarket.it" ]]; then
  echo "Target rifiutato: deploy consentito solo verso staging.netmarket.it."
  exit 1
fi

if [[ "$SG_SSH_HOST" == *"netmarket.it"* && "$SG_SSH_HOST" != "$HOST" ]]; then
  echo "Host SSH non coerente: $SG_SSH_HOST"
  exit 1
fi

if [[ -z "$PATH_TARGET" || "$PATH_TARGET" != /* || "$PATH_TARGET" == "/" || "$PATH_TARGET" == *"/../"* ]]; then
  echo "Percorso deploy mancante o ambiguo."
  exit 1
fi

if [[ "$PATH_TARGET" == *"netmarket.it"* && "$PATH_TARGET" != *"staging.netmarket.it"* ]]; then
  echo "Percorso deploy rifiutato: usare solo staging.netmarket.it."
  exit 1
fi

BUILD_DIR="apps/web/dist"
if [[ ! -f "$BUILD_DIR/index.html" ]]; then
  echo "Build Astro mancante: eseguire pnpm build prima del deploy."
  exit 1
fi

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"

SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")
RSYNC_ARGS=(-az --delete --checksum --itemize-changes --exclude .well-known -e "ssh ${SSH_ARGS[*]}")

if [[ "$DRY_RUN" == true ]]; then
  RSYNC_ARGS+=(--dry-run)
  echo "Dry-run deploy staging verso $HOST:$PATH_TARGET"
else
  echo "Deploy staging verso $HOST:$PATH_TARGET"
fi

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "test -d '$PATH_TARGET'"
rsync "${RSYNC_ARGS[@]}" "$BUILD_DIR/" "$SG_SSH_USER@$SG_SSH_HOST:$PATH_TARGET/"
