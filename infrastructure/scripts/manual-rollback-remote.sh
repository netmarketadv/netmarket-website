#!/usr/bin/env bash
# Invoked only through the guarded production wrapper; also exercised against local fixtures.
set -Eeuo pipefail
[[ $# == 6 ]] || { echo "Argomenti rollback incompleti."; exit 1; }
target="$1"
snapshot="$2"
current="$3"
restore="$4"
mode="$5"
expected_digest="$6"
[[ "$target" =~ ^/[a-zA-Z0-9_./-]+/netmarket\.it/public_html$ && "$target" != *"/../"* && "$target" != *"/./"* ]] || { echo "Percorso non autorizzato."; exit 1; }
[[ "$current" =~ ^[0-9a-f]{40}$ && "$restore" =~ ^[0-9a-f]{40}$ && "$current" != "$restore" && "$snapshot" == "before-$current" ]] || { echo "Snapshot/SHA non validi."; exit 1; }
[[ "$mode" == dry-run || "$mode" == execute ]] || { echo "Modalita non valida."; exit 1; }
[[ "$expected_digest" == - || "$expected_digest" =~ ^[0-9a-f]{64}$ ]] || { echo "Digest non valido."; exit 1; }
parent="$(dirname -- "$target")"
rollback="$parent/.netmarket-rollbacks/$snapshot"

validate_release() {
  local directory="$1" sha="$2" ref refs
  [[ -d "$directory" && ! -L "$directory" ]] || return 1
  [[ -z "$(find "$directory" -path "$directory/.well-known" -prune -o -type l -print -quit)" ]] || return 1
  for ref in index.html .htaccess robots.txt sitemap-index.xml netmarket-release; do
    [[ -s "$directory/$ref" ]] || return 1
  done
  [[ "$(cat "$directory/netmarket-release")" == "$sha" ]] || return 1
  grep -Fq "name=\"netmarket-build\" content=\"$sha\"" "$directory/index.html" || return 1
  grep -Fq 'name="netmarket-environment" content="production"' "$directory/index.html" || return 1
  grep -Fq 'https://netmarket.it/sitemap-index.xml' "$directory/robots.txt" || return 1
  [[ -d "$directory/assets" ]] || return 1
  refs="$(grep -oE '(src|href)="/assets/[^"]+"' "$directory/index.html" | sed -E 's/^(src|href)="\///; s/"$//')" || return 1
  [[ -n "$refs" ]] || return 1
  while IFS= read -r ref; do
    [[ "$ref" != *".."* && -s "$directory/$ref" ]] || return 1
  done <<< "$refs"
}

tree_digest() {
  (cd -- "$1" && find . -path './.well-known' -prune -o -type f -print0 |
    LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | cut -d ' ' -f 1)
}
validate_release "$target" "$current" || { echo "Frontend corrente non corrispondente o incompleto."; exit 1; }
validate_release "$rollback" "$restore" || { echo "Snapshot non corrispondente o incompleto."; exit 1; }
digest="$(tree_digest "$rollback")"
[[ "$expected_digest" == - || "$expected_digest" == "$digest" ]] || { echo "Snapshot cambiato rispetto al piano."; exit 1; }
printf 'snapshot=%s\ncurrent=%s\nrestore=%s\ndigest=%s\n' "$snapshot" "$current" "$restore" "$digest"
if [[ "$mode" == dry-run ]]; then
  echo "Piano verificato: nessuna scrittura remota."
  exit 0
fi
[[ "$expected_digest" != - ]] || { echo "Digest del piano obbligatorio."; exit 1; }
lock="$parent/.netmarket-release-lock"
mkdir -- "$lock" || { echo "Operazione production gia in corso."; exit 1; }
trap 'rmdir -- "$lock"' EXIT
validate_release "$target" "$current" && validate_release "$rollback" "$restore" || { echo "Stato cambiato prima del ripristino."; exit 1; }
[[ "$(tree_digest "$rollback")" == "$expected_digest" ]] || { echo "Integrita snapshot cambiata."; exit 1; }
failed="$parent/.netmarket-failed/$current-$(date -u +%Y%m%d%H%M%S)"
[[ ! -e "$failed" ]] || { echo "Destinazione failed gia presente."; exit 1; }
mkdir -p -- "$parent/.netmarket-failed"
mv -- "$target" "$failed"
if ! mv -- "$rollback" "$target"; then
  mv -- "$failed" "$target"
  exit 1
fi
if ! validate_release "$target" "$restore" || [[ "$(tree_digest "$target")" != "$expected_digest" ]]; then
  mv -- "$target" "$rollback"
  mv -- "$failed" "$target"
  echo "Verifica fallita: frontend originale ripristinato."
  exit 1
fi
echo "Rollback frontend verificato: $restore. Frontend rimosso conservato: $current."
