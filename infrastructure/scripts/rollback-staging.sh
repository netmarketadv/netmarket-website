#!/usr/bin/env bash
set -Eeuo pipefail

DRY_RUN=true
RELEASE=""
HOST=""
PATH_TARGET=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --execute) DRY_RUN=false; shift ;;
    --release) RELEASE="${2:-}"; shift 2 ;;
    --host) HOST="${2:-}"; shift 2 ;;
    --path) PATH_TARGET="${2:-}"; shift 2 ;;
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

if [[ "$HOST" != "staging.netmarket.it" ]]; then
  echo "Target rifiutato: rollback consentito solo verso staging.netmarket.it."
  exit 1
fi

if [[ -z "$PATH_TARGET" || "$PATH_TARGET" != /* || "$PATH_TARGET" == "/" || "$PATH_TARGET" == *"/../"* ]]; then
  echo "Percorso rollback mancante o ambiguo."
  exit 1
fi

if [[ "$PATH_TARGET" == *"netmarket.it"* && "$PATH_TARGET" != *"staging.netmarket.it"* ]]; then
  echo "Percorso rollback rifiutato: usare solo staging.netmarket.it."
  exit 1
fi

if [[ -z "$RELEASE" ]]; then
  RELEASE="latest"
fi

if [[ "$RELEASE" != "latest" && ! "$RELEASE" =~ ^before-[[:alnum:]_.-]+\.tgz$ ]]; then
  echo "Release non valida: usare latest o un file before-<sha>.tgz."
  exit 1
fi

KEY_FILE="$(mktemp)"
KNOWN_HOSTS_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE" "$KNOWN_HOSTS_FILE"' EXIT
printf '%s\n' "$SG_SSH_PRIVATE_KEY" >"$KEY_FILE"
printf '%s\n' "$SG_SSH_KNOWN_HOSTS" >"$KNOWN_HOSTS_FILE"
chmod 600 "$KEY_FILE" "$KNOWN_HOSTS_FILE"

SSH_ARGS=(-p "$SG_SSH_PORT" -i "$KEY_FILE" -o "UserKnownHostsFile=$KNOWN_HOSTS_FILE" -o "StrictHostKeyChecking=yes")

echo "Rollback staging verso release $RELEASE."
if [[ "$DRY_RUN" == true ]]; then
  echo "Dry-run: nessuna modifica eseguita."
  ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "target='$PATH_TARGET'; backup_dir=\"\$(dirname -- \"\$target\")/.netmarket-backups\"; if [ -d \"\$backup_dir\" ]; then find \"\$backup_dir\" -maxdepth 1 -name 'before-*.tgz' -type f -printf '%TY-%Tm-%Td %TH:%TM %p\n' | sort -r | head -n 10; else echo 'Nessun backup staging disponibile.'; fi"
  exit 0
fi

ssh "${SSH_ARGS[@]}" "$SG_SSH_USER@$SG_SSH_HOST" "target='$PATH_TARGET'; backup_dir=\"\$(dirname -- \"\$target\")/.netmarket-backups\"; if [ '$RELEASE' = 'latest' ]; then archive=\"\$(find \"\$backup_dir\" -maxdepth 1 -name 'before-*.tgz' -type f -printf '%T@ %p\n' | sort -nr | head -n 1 | cut -d ' ' -f 2-)\"; else archive=\"\$backup_dir/$RELEASE\"; fi; if [ -z \"\$archive\" ] || [ ! -f \"\$archive\" ]; then echo 'Backup rollback non trovato.'; exit 1; fi; tmp_dir=\"\$(mktemp -d)\"; tar -xzf \"\$archive\" -C \"\$tmp_dir\"; find \"\$target\" -mindepth 1 -maxdepth 1 ! -name '.well-known' -exec rm -rf {} +; cp -a \"\$tmp_dir\"/. \"\$target\"/; rm -rf \"\$tmp_dir\"; echo \"Rollback completato da \$archive\""
