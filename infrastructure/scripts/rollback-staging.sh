#!/usr/bin/env bash
set -Eeuo pipefail

DRY_RUN=true
RELEASE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --execute) DRY_RUN=false; shift ;;
    --release) RELEASE="${2:-}"; shift 2 ;;
    *) echo "Parametro non riconosciuto: $1"; exit 2 ;;
  esac
done

if [[ -z "$RELEASE" ]]; then
  echo "Indicare --release."
  exit 1
fi

echo "Rollback staging verso release $RELEASE."
if [[ "$DRY_RUN" == true ]]; then
  echo "Dry-run: nessuna modifica eseguita."
  exit 0
fi

echo "Rollback reale da implementare dopo definizione path SiteGround."
exit 1
