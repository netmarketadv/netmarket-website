#!/usr/bin/env bash
set -Eeuo pipefail
MODE="${MODE:-plan}"
DIGEST="${PLAN_SHA256:-}"
[[ "$MODE" == plan || "$MODE" == apply || "$MODE" == rollback-plan || "$MODE" == rollback ]] || exit 2
[[ "$DIGEST" =~ ^[a-f0-9]{64}$ ]] || { echo 'Exact plan digest required'; exit 1; }
[[ "${GITHUB_ACTIONS:-}" == true && "${GITHUB_REPOSITORY:-}" == netmarketadv/netmarket-website && "${GITHUB_REF:-}" == refs/heads/main ]] || { echo 'Official protected pipeline only'; exit 1; }
[[ "${GITHUB_SHA:-}" =~ ^[a-f0-9]{40}$ && "$(git rev-parse HEAD)" == "$GITHUB_SHA" ]] || { echo 'Checkout SHA mismatch'; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo 'Dirty checkout refused'; exit 1; }
[[ "${SG_CMS_WORDPRESS_PATH:-}" == /home/customer/www/cms.netmarket.it/public_html ]] || { echo 'Canonical CMS path required'; exit 1; }
if [[ "$MODE" == apply || "$MODE" == rollback ]]; then
  verb=IMPORT
  if [[ "$MODE" == rollback ]]; then verb=ROLLBACK; fi
  [[ "${CONFIRM:-}" == "$verb NETMARKET CMS $DIGEST" ]] || { echo 'Exact confirmation required'; exit 1; }
fi
[[ "$(shasum -a 256 data/releases/stape-cms-import.json | cut -d ' ' -f 1)" == "$DIGEST" ]] || exit 1
for variable in SG_SSH_HOST SG_SSH_PORT SG_SSH_USER SG_SSH_PRIVATE_KEY SG_SSH_KNOWN_HOSTS; do
  [[ -n "${!variable:-}" ]] || { echo "Missing existing secret: $variable"; exit 1; }
done
key_file="$(mktemp)"
known_file="$(mktemp)"
trap 'rm -f "$key_file" "$known_file"' EXIT
chmod 600 "$key_file" "$known_file"
printf '%s\n' "$SG_SSH_PRIVATE_KEY" > "$key_file"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" > "$known_file"
ssh_args=(-p "$SG_SSH_PORT" -i "$key_file" -o "UserKnownHostsFile=$known_file" -o StrictHostKeyChecking=yes -o BatchMode=yes -o ConnectTimeout=15 -o AddKeysToAgent=no)
if [[ "$MODE" == plan ]]; then
  { printf '$plan=json_decode(base64_decode("%s"),true);$digest="%s";\n' "$(base64 < data/releases/stape-cms-import.json | tr -d '\n')" "$DIGEST"; tail -n +2 infrastructure/migrations/stape/probe.php; } |
    ssh "${ssh_args[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "cd /home/customer/www/cms.netmarket.it/public_html && wp eval 'eval(stream_get_contents(STDIN));'"
  exit 0
fi
[[ "${GITHUB_RUN_ID:-}" =~ ^[0-9]+$ ]] || exit 1
# Each package is immutable and private. The content journal is outside public_html and survives runs.
tar -czf artifacts/stape-cms-preparation/import-package.tgz data/releases/stape-cms-import.json infrastructure/migrations/stape/Importer.php infrastructure/migrations/stape/run.php artifacts/stape-cms-preparation/media
ssh "${ssh_args[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "set -Eeuo pipefail; umask 077; test ! -L /home/customer/www/cms.netmarket.it/.netmarket-cms-imports; test ! -L /home/customer/www/cms.netmarket.it/.netmarket-cms-imports/$DIGEST; mkdir -p /home/customer/www/cms.netmarket.it/.netmarket-cms-imports/$DIGEST/run-$GITHUB_RUN_ID; test ! -e /home/customer/www/cms.netmarket.it/.netmarket-cms-imports/$DIGEST/run-$GITHUB_RUN_ID/package.tgz; cat > /home/customer/www/cms.netmarket.it/.netmarket-cms-imports/$DIGEST/run-$GITHUB_RUN_ID/package.tgz" < artifacts/stape-cms-preparation/import-package.tgz
ssh "${ssh_args[@]}" "$SG_SSH_USER@$SG_SSH_HOST" bash -s -- "$MODE" "$DIGEST" "$GITHUB_RUN_ID" <<'REMOTE'
set -Eeuo pipefail
umask 077
mode="$1"; digest="$2"; run_id="$3"
root="/home/customer/www/cms.netmarket.it/.netmarket-cms-imports/$digest"
package="$root/run-$run_id"
test ! -L "$root" && test ! -L "$package"
cd "$package"
tar -xzf package.tgz
if [[ "$mode" == rollback ]]; then
  [[ "$(cat /home/customer/www/netmarket.it/public_html/netmarket-release)" == 6b2e5524ba43e237229e0f56e86161edd87e1165 ]] || {
    echo 'CMS content rollback refused: restore the dependency-free baseline frontend first.'
    exit 1
  }
fi
export NETMARKET_APPROVED_IMPORT="$digest"
confirmation="IMPORT NETMARKET CMS $digest"
if [[ "$mode" == rollback ]]; then confirmation="ROLLBACK NETMARKET CMS $digest"; fi
# Include preserves strict_types and __DIR__; WP-CLI's default eval prepends code.
wp --path=/home/customer/www/cms.netmarket.it/public_html eval-file --use-include "$package/infrastructure/migrations/stape/run.php" "$mode" "$package/data/releases/stape-cms-import.json" "$digest" "$package/artifacts/stape-cms-preparation/media" "$root/journal.json" "$confirmation"
REMOTE
