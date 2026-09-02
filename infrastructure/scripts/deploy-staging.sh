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

if [[ -z "$PATH_TARGET" || "$PATH_TARGET" != /* || "$PATH_TARGET" == "/" || "$PATH_TARGET" == *"/../"* || "$PATH_TARGET" == *".."* ]]; then
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

RELEASE_ID="${PUBLIC_BUILD_SHA:-$(date -u +%Y%m%d%H%M%S)}"
SAFE_RELEASE_ID="$(tr -cd '[:alnum:]_.-' <<<"$RELEASE_ID")"
if [[ -z "$SAFE_RELEASE_ID" ]]; then
  SAFE_RELEASE_ID="$(date -u +%Y%m%d%H%M%S)"
fi

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"

SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")
printf -v REMOTE_PATH_TARGET "%q" "$PATH_TARGET"
RSYNC_ARGS=(
  -az
  --delete
  --itemize-changes
  --exclude .well-known
  --rsync-path "cd $REMOTE_PATH_TARGET && rsync"
  -e "ssh ${SSH_ARGS[*]}"
)

if [[ "$DRY_RUN" == true ]]; then
  RSYNC_ARGS+=(--dry-run)
  echo "Dry-run deploy staging verso $HOST:$PATH_TARGET"
else
  echo "Deploy staging verso $HOST:$PATH_TARGET"
fi

REMOTE_PREFLIGHT='
set -eu
target="$1"
if [ ! -d "$target" ]; then
  echo "Deploy path non esiste o non e una directory: $target" >&2
  exit 21
fi
if [ ! -r "$target" ] || [ ! -x "$target" ]; then
  echo "Deploy path non leggibile/attraversabile dall utente SSH: $target" >&2
  exit 22
fi
if [ ! -w "$target" ]; then
  echo "Deploy path non scrivibile dall utente SSH: $target" >&2
  exit 23
fi
cd "$target"
probe=".netmarket-write-test-$$"
touch "$probe"
rm -f "$probe"
'

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "sh -s -- $REMOTE_PATH_TARGET" <<<"$REMOTE_PREFLIGHT"
if [[ "$DRY_RUN" == false ]]; then
  ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "target=$REMOTE_PATH_TARGET; backup_dir=\"\$(dirname -- \"\$target\")/.netmarket-backups\"; mkdir -p \"\$backup_dir\"; if [ -f \"\$target/index.html\" ]; then tar -C \"\$target\" --exclude='.well-known' -czf \"\$backup_dir/before-$SAFE_RELEASE_ID.tgz\" .; find \"\$backup_dir\" -maxdepth 1 -name 'before-*.tgz' -type f -printf '%T@ %p\n' | sort -nr | tail -n +6 | cut -d ' ' -f 2- | xargs -r rm -f; fi"
fi
rsync "${RSYNC_ARGS[@]}" "$BUILD_DIR/" "$SG_SSH_USER@$SG_SSH_HOST:."
