#!/usr/bin/env bash
set -Eeuo pipefail

DRY_RUN=true
RELEASE="latest"
HOST=""
PATH_TARGET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --execute) DRY_RUN=false; shift ;;
    --release) RELEASE="${2:-}"; shift 2 ;;
    --host) HOST="${2:-}"; shift 2 ;;
    --path) PATH_TARGET="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

required=(SG_SSH_HOST SG_SSH_PORT SG_SSH_USER SG_SSH_PRIVATE_KEY SG_SSH_KNOWN_HOSTS)
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then echo "Secret mancante: $var"; exit 1; fi
done

if [[ "$HOST" != "netmarket.it" ]]; then
  echo "Target rollback rifiutato."
  exit 1
fi

if [[ -z "$PATH_TARGET" || "$PATH_TARGET" != *"/netmarket.it/"* || "$PATH_TARGET" != */public_html ]]; then
  echo "Percorso rollback production non valido."
  exit 1
fi

if [[ "$RELEASE" != "latest" && ! "$RELEASE" =~ ^before-[[:alnum:]_.-]+$ ]]; then
  echo "Release non valida: usare latest o before-<sha>."
  exit 1
fi

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"
SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")

PARENT_DIR="$(dirname -- "$PATH_TARGET")"
ROLLBACK_ROOT="$PARENT_DIR/.netmarket-rollbacks"

if [[ "$DRY_RUN" == true ]]; then
  ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" \
    "test -d '$ROLLBACK_ROOT' && find '$ROLLBACK_ROOT' -mindepth 1 -maxdepth 1 -type d -name 'before-*' -printf '%TY-%Tm-%Td %TH:%TM %f\\n' | sort -r | head -n 10"
  exit 0
fi

FAILED_ID="failed-$(date -u +%Y%m%d%H%M%S)"
ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" \
  "set -eu; target='$PATH_TARGET'; root='$ROLLBACK_ROOT'; requested='$RELEASE'; failed='${PARENT_DIR}/.netmarket-failed/$FAILED_ID'; mkdir -p '${PARENT_DIR}/.netmarket-failed'; if [ \"\$requested\" = latest ]; then rollback=\$(find \"\$root\" -mindepth 1 -maxdepth 1 -type d -name 'before-*' -printf '%T@ %p\\n' | sort -nr | head -n 1 | cut -d ' ' -f 2-); else rollback=\"\$root/\$requested\"; fi; test -n \"\$rollback\" && { test -s \"\$rollback/index.html\" || test -s \"\$rollback/index.php\"; }; mv \"\$target\" \"\$failed\"; if ! mv \"\$rollback\" \"\$target\"; then mv \"\$failed\" \"\$target\"; exit 1; fi; echo \"Rollback production completato da \$rollback; release rimossa in \$failed\""
