#!/usr/bin/env bash
set -Eeuo pipefail

MODE=dry-run
HOST=""
PATH_TARGET=""
SNAPSHOT=""
CURRENT_SHA=""
RESTORE_SHA=""
DIGEST="-"
CONFIRM=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) MODE=dry-run; shift ;;
    --execute) MODE=execute; shift ;;
    --host) HOST="${2:-}"; shift 2 ;;
    --path) PATH_TARGET="${2:-}"; shift 2 ;;
    --snapshot) SNAPSHOT="${2:-}"; shift 2 ;;
    --current) CURRENT_SHA="${2:-}"; shift 2 ;;
    --restore) RESTORE_SHA="${2:-}"; shift 2 ;;
    --digest) DIGEST="${2:-}"; shift 2 ;;
    --confirm) CONFIRM="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto."; exit 2 ;;
  esac
done
[[ "$HOST" == netmarket.it && "$PATH_TARGET" == /home/customer/www/netmarket.it/public_html ]] || { echo "Target production rifiutato."; exit 1; }
[[ "$CURRENT_SHA" =~ ^[0-9a-f]{40}$ && "$RESTORE_SHA" =~ ^[0-9a-f]{40}$ && "$CURRENT_SHA" != "$RESTORE_SHA" ]] || { echo "SHA non validi."; exit 1; }
[[ "$SNAPSHOT" == "before-$CURRENT_SHA" ]] || { echo "Serve lo snapshot esatto before-<current-sha>, mai latest."; exit 1; }
if [[ "$MODE" == execute ]]; then
  [[ "${GITHUB_ACTIONS:-}" == true && "${GITHUB_REPOSITORY:-}" == netmarketadv/netmarket-website && "${GITHUB_REF:-}" == refs/heads/main ]] || { echo "Rollback execute consentito solo nella pipeline production protetta."; exit 1; }
  [[ "$DIGEST" =~ ^[0-9a-f]{64}$ && "$CONFIRM" == "ROLLBACK NETMARKET $CURRENT_SHA TO $RESTORE_SHA" ]] || { echo "Conferma esatta e digest del piano obbligatori."; exit 1; }
fi
for var in SG_SSH_HOST SG_SSH_PORT SG_SSH_USER SG_SSH_PRIVATE_KEY SG_SSH_KNOWN_HOSTS; do
  [[ -n "${!var:-}" ]] || { echo "Secret richiesto mancante: $var"; exit 1; }
done
KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"
printf '%s\n' "$SG_SSH_PRIVATE_KEY" > "$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" > "$KNOWN_HOSTS_FILE"
SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o StrictHostKeyChecking=yes -o BatchMode=yes -o ConnectTimeout=15)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" bash -s -- "$PATH_TARGET" "$SNAPSHOT" "$CURRENT_SHA" "$RESTORE_SHA" "$MODE" "$DIGEST" < "$SCRIPT_DIR/manual-rollback-remote.sh"
