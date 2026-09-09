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

if [[ "$HOST" != "netmarket.it" ]]; then
  echo "Target rifiutato: il deploy production accetta solo netmarket.it."
  exit 1
fi

if [[ -z "$PATH_TARGET" || "$PATH_TARGET" != /* || "$PATH_TARGET" == "/" || "$PATH_TARGET" == *"/../"* ]]; then
  echo "Percorso production mancante o ambiguo."
  exit 1
fi

if [[ "$PATH_TARGET" != *"/netmarket.it/"* || "$PATH_TARGET" != */public_html ]]; then
  echo "Percorso production rifiutato: deve appartenere a netmarket.it e terminare con /public_html."
  exit 1
fi

if [[ "${PUBLIC_DEPLOY_ENV:-}" != "production" || "${PUBLIC_SITE_URL:-}" != "https://netmarket.it" ]]; then
  echo "Build environment non production."
  exit 1
fi

BUILD_DIR="apps/web/dist"
if [[ ! -f "$BUILD_DIR/index.html" || ! -f "$BUILD_DIR/.htaccess" ]]; then
  echo "Artifact production incompleto."
  exit 1
fi

if grep -Eqi 'noindex|staging\.netmarket\.it|localhost:' "$BUILD_DIR/.htaccess"; then
  echo "Artifact production non sicuro: .htaccess contiene direttive non ammesse."
  exit 1
fi

if grep -RqiE 'staging\.netmarket\.it|localhost:' "$BUILD_DIR" --include='*.html' --include='*.xml' --include='robots.txt'; then
  echo "Artifact production non sicuro: contiene URL non production."
  exit 1
fi

RELEASE_ID="${PUBLIC_BUILD_SHA:-$(date -u +%Y%m%d%H%M%S)}"
SAFE_RELEASE_ID="$(tr -cd '[:alnum:]_.-' <<<"$RELEASE_ID")"
if [[ -z "$SAFE_RELEASE_ID" ]]; then
  echo "Release ID non valido."
  exit 1
fi

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"

SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")
RSYNC_SSH="ssh ${SSH_ARGS[*]}"

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" \
  "test -d '$PATH_TARGET' && test -w '$PATH_TARGET' && command -v rsync >/dev/null"

if [[ "$DRY_RUN" == true ]]; then
  echo "Dry-run production verso $HOST:$PATH_TARGET"
  rsync -az --delete --dry-run --itemize-changes --exclude .well-known -e "$RSYNC_SSH" \
    "$BUILD_DIR/" "$SG_SSH_USER@$SG_SSH_HOST:$PATH_TARGET/"
  exit 0
fi

PARENT_DIR="$(dirname -- "$PATH_TARGET")"
RELEASE_DIR="$PARENT_DIR/.netmarket-releases/$SAFE_RELEASE_ID"
ROLLBACK_DIR="$PARENT_DIR/.netmarket-rollbacks/before-$SAFE_RELEASE_ID"

echo "Upload release production $SAFE_RELEASE_ID"
ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" \
  "test ! -e '$RELEASE_DIR' && test ! -e '$ROLLBACK_DIR' && mkdir -p '$RELEASE_DIR' '$PARENT_DIR/.netmarket-rollbacks'"

rsync -az --delete --itemize-changes -e "$RSYNC_SSH" \
  "$BUILD_DIR/" "$SG_SSH_USER@$SG_SSH_HOST:$RELEASE_DIR/"

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" \
  "set -eu; target='$PATH_TARGET'; release='$RELEASE_DIR'; rollback='$ROLLBACK_DIR'; test -s \"\$release/index.html\"; test -s \"\$release/.htaccess\"; if [ -d \"\$target/.well-known\" ]; then cp -a \"\$target/.well-known\" \"\$release/.well-known\"; fi; mv \"\$target\" \"\$rollback\"; if ! mv \"\$release\" \"\$target\"; then mv \"\$rollback\" \"\$target\"; exit 1; fi; test -s \"\$target/index.html\" || { mv \"\$target\" \"\$release.failed\"; mv \"\$rollback\" \"\$target\"; exit 1; }; printf '%s\\n' '$SAFE_RELEASE_ID' > \"\$target/netmarket-release\""

echo "Deploy production completato: $SAFE_RELEASE_ID. Rollback: $ROLLBACK_DIR"
