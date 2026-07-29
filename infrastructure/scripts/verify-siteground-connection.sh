#!/usr/bin/env bash
set -Eeuo pipefail

required=(SG_SSH_HOST SG_SSH_PORT SG_SSH_USER SG_SSH_PRIVATE_KEY SG_SSH_KNOWN_HOSTS)
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Secret mancante: $var"
    exit 1
  fi
done

if [[ "$SG_SSH_HOST" != "staging.netmarket.it" && "$SG_SSH_HOST" != "cms.netmarket.it" ]]; then
  echo "Host rifiutato: $SG_SSH_HOST"
  exit 1
fi

echo "Comandi read-only previsti: whoami, pwd, php -v, git --version, wp --version se disponibile."
echo "Esecuzione SSH da completare quando saranno autorizzati dettagli di connessione."
