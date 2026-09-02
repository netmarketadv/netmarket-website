#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN=""
WP_PATH=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="${2:-}"; shift 2 ;;
    --path) WP_PATH="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

required=(SG_SSH_HOST SG_SSH_PORT SG_SSH_USER SG_SSH_PRIVATE_KEY SG_SSH_KNOWN_HOSTS CMS_BASIC_AUTH_USER CMS_BASIC_AUTH_PASSWORD)
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Secret mancante: $var"
    exit 1
  fi
done

if [[ "$DOMAIN" != "cms.netmarket.it" ]]; then
  echo "Target rifiutato: hardening consentito solo su cms.netmarket.it."
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

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
HTPASSWD_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE" "$HTPASSWD_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"

HASH="$(openssl passwd -apr1 "$CMS_BASIC_AUTH_PASSWORD")"
printf '%s:%s\n' "$CMS_BASIC_AUTH_USER" "$HASH" >"$HTPASSWD_FILE"
chmod 600 "$HTPASSWD_FILE"

SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")
HTPASSWD_PATH="${WP_PATH%/public_html}/.htpasswd-netmarket-cms"

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "test -f '$WP_PATH/wp-config.php'"
scp -P "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes" "$HTPASSWD_FILE" "$SG_SSH_USER@$SG_SSH_HOST:$HTPASSWD_PATH"
ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "chmod 600 '$HTPASSWD_PATH'"

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "set -Eeuo pipefail
cd '$WP_PATH'
STAMP=\"\$(date +%Y%m%d%H%M%S)\"
cp .htaccess \".htaccess.before-netmarket-hardening-\$STAMP\" 2>/dev/null || true
cat > .htaccess <<'EOF'
# Netmarket CMS privacy hardening
<IfModule mod_headers.c>
  Header always set X-Robots-Tag \"noindex, nofollow, noarchive\"
</IfModule>

<IfModule mod_setenvif.c>
  SetEnvIf Request_URI \"^/robots\\.txt$\" NMHC_NO_AUTH=1
</IfModule>

AuthType Basic
AuthName \"Netmarket CMS\"
AuthUserFile $HTPASSWD_PATH

<IfModule mod_authz_core.c>
  <RequireAny>
    Require env NMHC_NO_AUTH
    Require valid-user
  </RequireAny>
</IfModule>
<IfModule !mod_authz_core.c>
  Require valid-user
</IfModule>

# SGS XMLRPC Disable Service
<Files xmlrpc.php>
  order deny,allow
  deny from all
</Files>
# SGS XMLRPC Disable Service END

# BEGIN WordPress
<IfModule mod_rewrite.c>
 RewriteEngine On
 RewriteBase /
 RewriteRule ^index\\.php$ - [L]
 RewriteCond %{REQUEST_URI} !/(wp-content\\/uploads/.*)$
 RewriteCond %{REQUEST_FILENAME} !-f
 RewriteCond %{REQUEST_FILENAME} !-d
 RewriteRule . /index.php [L]
</IfModule>
# END WordPress

# SGO Unset Vary
<IfModule mod_headers.c>
    Header unset Vary
    Header always set X-Robots-Tag \"noindex, nofollow, noarchive\"
</IfModule>
# SGO Unset Vary END
EOF
cat > robots.txt <<'EOF'
User-agent: *
Disallow: /
EOF
chmod 644 .htaccess robots.txt
(wp sg purge || wp cache flush || true)"
