#!/usr/bin/env bash
set -Eeuo pipefail

echo "Node: $(node --version)"
echo "pnpm: $(pnpm --version)"
echo "PHP: $(php -r 'echo PHP_VERSION;')"

if [[ "${PUBLIC_DEPLOY_ENV:-local}" == "production" || "${PUBLIC_SITE_URL:-}" == "https://netmarket.it" ]]; then
  echo "Ambiente rifiutato: netmarket.it non è un target operativo per sviluppo, test o deploy."
  exit 1
fi

echo "Environment verification completed."
