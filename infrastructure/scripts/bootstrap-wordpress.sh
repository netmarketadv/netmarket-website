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
PLUGIN_PARENT="$WP_PATH/wp-content/plugins"
PLUGIN_TARGET="$PLUGIN_PARENT/$PLUGIN_SLUG"
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

ARCHIVE_FILE="$(mktemp -t "${PLUGIN_SLUG}.XXXXXX.tar.gz")"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE" "$ARCHIVE_FILE"' EXIT
COPYFILE_DISABLE=1 tar \
  --exclude vendor \
  --exclude .git \
  --exclude tests \
  --exclude composer.lock \
  --exclude phpcs.xml.dist \
  --exclude phpstan.neon \
  -czf "$ARCHIVE_FILE" \
  -C "$PLUGIN_DIR" \
  .

SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")
SCP_ARGS=(-P "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")

if [[ "$DRY_RUN" == true ]]; then
  echo "Dry-run bootstrap WordPress su $DOMAIN:$WP_PATH"
else
  echo "Bootstrap WordPress su $DOMAIN:$WP_PATH"
fi

printf -v REMOTE_WP_PATH "%q" "$WP_PATH"
printf -v REMOTE_PLUGIN_PARENT "%q" "$PLUGIN_PARENT"
ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "test -f $REMOTE_WP_PATH/wp-config.php && test -d $REMOTE_PLUGIN_PARENT && test -w $REMOTE_PLUGIN_PARENT && command -v wp >/dev/null"

if [[ "$DRY_RUN" == true ]]; then
  exit 0
fi

REMOTE_ARCHIVE="/tmp/${PLUGIN_SLUG}-$(date +%Y%m%d%H%M%S).tar.gz"
REMOTE_BACKUP_DIR="$WP_PATH/wp-content/netmarket-deploy-backups"
printf -v REMOTE_ARCHIVE_Q "%q" "$REMOTE_ARCHIVE"
printf -v REMOTE_PLUGIN_TARGET "%q" "$PLUGIN_TARGET"
printf -v REMOTE_BACKUP_DIR_Q "%q" "$REMOTE_BACKUP_DIR"
printf -v REMOTE_PLUGIN_SLUG "%q" "$PLUGIN_SLUG"

scp "${SCP_ARGS[@]}" "$ARCHIVE_FILE" "$SG_SSH_USER@$SG_SSH_HOST:$REMOTE_ARCHIVE"
ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "
  set -Eeuo pipefail
  cd $REMOTE_WP_PATH
  wp --skip-plugins --skip-themes core is-installed
  mkdir -p $REMOTE_BACKUP_DIR_Q
  if [[ -d $REMOTE_PLUGIN_TARGET ]]; then
    tar -czf $REMOTE_BACKUP_DIR_Q/${PLUGIN_SLUG}-before-\$(date +%Y%m%d%H%M%S).tar.gz -C $REMOTE_PLUGIN_PARENT $REMOTE_PLUGIN_SLUG
  fi
  rm -rf $REMOTE_PLUGIN_TARGET
  mkdir -p $REMOTE_PLUGIN_TARGET
  tar -xzf $REMOTE_ARCHIVE_Q -C $REMOTE_PLUGIN_TARGET
  rm -f $REMOTE_ARCHIVE_Q
  wp --skip-plugins --skip-themes option update blog_public 0
  wp --skip-plugins --skip-themes rewrite structure '/%postname%/' --hard
  wp --skip-plugins --skip-themes plugin activate $REMOTE_PLUGIN_SLUG
  wp --skip-themes rewrite flush --hard
"
