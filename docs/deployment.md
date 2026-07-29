# Deployment

Il deploy reale non è attivo. `deploy-staging.yml` è manuale, supporta dry-run e rifiuta target diversi da `staging.netmarket.it`.

Passi futuri:

1. Configurare GitHub Environment `staging`.
2. Aggiungere secret SSH e variables.
3. Verificare connessione read-only.
4. Eseguire dry-run.
5. Abilitare strategia rsync/rollback dopo autorizzazione.
