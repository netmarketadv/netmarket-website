#!/usr/bin/env bash
set -Eeuo pipefail

DRY_RUN=true
DOMAIN=""
WP_PATH=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --execute) DRY_RUN=false; shift ;;
    --domain) DOMAIN="${2:-}"; shift 2 ;;
    --path) WP_PATH="${2:-}"; shift 2 ;;
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

if [[ "$DOMAIN" != "cms.netmarket.it" ]]; then
  echo "Target rifiutato: bootstrap WordPress consentito solo su cms.netmarket.it."
  exit 1
fi

if [[ "$SG_SSH_HOST" == *"netmarket.it"* && "$SG_SSH_HOST" != "$DOMAIN" ]]; then
  echo "Host SSH non coerente: $SG_SSH_HOST"
  exit 1
fi

if [[ -z "$WP_PATH" || "$WP_PATH" != /* || "$WP_PATH" == "/" || "$WP_PATH" == *"/../"* ]]; then
  echo "Percorso WordPress mancante o ambiguo."
  exit 1
fi

if [[ "$WP_PATH" == *"netmarket.it"* && "$WP_PATH" != *"cms.netmarket.it"* ]]; then
  echo "Percorso WordPress rifiutato: usare solo cms.netmarket.it."
  exit 1
fi

PLUGIN_DIR="apps/wordpress/plugins/netmarket-headless-core"
PLUGIN_SLUG="netmarket-headless-core"
if [[ ! -f "$PLUGIN_DIR/netmarket-headless-core.php" ]]; then
  echo "Plugin locale non trovato: $PLUGIN_DIR"
  exit 1
fi

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"

SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")
RSYNC_ARGS=(-az --delete --checksum --exclude vendor --exclude .git --exclude tests --exclude composer.lock --exclude phpcs.xml.dist --exclude phpstan.neon -e "ssh ${SSH_ARGS[*]}")

if [[ "$DRY_RUN" == true ]]; then
  RSYNC_ARGS+=(--dry-run)
  echo "Dry-run bootstrap WordPress su $DOMAIN:$WP_PATH"
else
  echo "Bootstrap WordPress su $DOMAIN:$WP_PATH"
fi

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "test -f '$WP_PATH/wp-config.php' && command -v wp >/dev/null"

if [[ "$DRY_RUN" == false ]]; then
  ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "mkdir -p '$WP_PATH/wp-content/plugins/$PLUGIN_SLUG'"
fi

rsync "${RSYNC_ARGS[@]}" "$PLUGIN_DIR/" "$SG_SSH_USER@$SG_SSH_HOST:$WP_PATH/wp-content/plugins/$PLUGIN_SLUG/"

if [[ "$DRY_RUN" == true ]]; then
  exit 0
fi

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "cd '$WP_PATH' && wp core is-installed && wp option update blog_public 0 && wp rewrite structure '/%postname%/' --hard && wp plugin activate '$PLUGIN_SLUG' && wp rewrite flush --hard"
