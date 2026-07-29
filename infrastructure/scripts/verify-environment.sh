#!/usr/bin/env bash
set -Eeuo pipefail

echo "Node: $(node --version)"
echo "pnpm: $(pnpm --version)"
echo "PHP: $(php -r 'echo PHP_VERSION;')"
test "${PUBLIC_DEPLOY_ENV:-local}" != "production" || test "${PUBLIC_SITE_URL:-}" = "https://netmarket.it"
echo "Environment verification completed."
