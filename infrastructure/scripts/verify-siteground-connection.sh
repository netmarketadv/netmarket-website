#!/usr/bin/env bash
set -Eeuo pipefail

required=(SG_SSH_HOST SG_SSH_PORT SG_SSH_USER SG_SSH_PRIVATE_KEY SG_SSH_KNOWN_HOSTS)
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Secret mancante: $var"
    exit 1
  fi
done

if [[ "$SG_SSH_HOST" == *"netmarket.it"* && "$SG_SSH_HOST" != "staging.netmarket.it" && "$SG_SSH_HOST" != "cms.netmarket.it" ]]; then
  echo "Host rifiutato: $SG_SSH_HOST"
  exit 1
fi

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"

ssh -p "$SG_SSH_PORT" \
  -i "$KEY_FILE" \
  -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" \
  -o "StrictHostKeyChecking=yes" \
  "$SG_SSH_USER@$SG_SSH_HOST" \
  'whoami && pwd && php -v | head -n 1 && git --version && (wp --version || true)'

if [[ -n "${SG_STAGING_DEPLOY_PATH:-}" ]]; then
  if [[ "$SG_STAGING_DEPLOY_PATH" != /* || "$SG_STAGING_DEPLOY_PATH" == "/" || "$SG_STAGING_DEPLOY_PATH" == *".."* ]]; then
    echo "Percorso staging rifiutato: SG_STAGING_DEPLOY_PATH deve essere assoluto e non ambiguo."
    exit 1
  fi

  printf -v REMOTE_STAGING_PATH "%q" "$SG_STAGING_DEPLOY_PATH"
  ssh -p "$SG_SSH_PORT" \
    -i "$KEY_FILE" \
    -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" \
    -o "StrictHostKeyChecking=yes" \
    "$SG_SSH_USER@$SG_SSH_HOST" \
    "target=$REMOTE_STAGING_PATH; test -d \"\$target\" && test -r \"\$target\" && test -x \"\$target\" && test -w \"\$target\""
  echo "Deploy path staging accessibile in lettura e scrittura."
fi
