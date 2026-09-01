# 0005 GitHub Actions Deployment

## Stato

Accettata.

## Contesto

Build e deploy devono essere ripetibili.

## Decisione

Usare GitHub Actions con due percorsi distinti:

- deploy staging rapido solo su `develop`;
- quality workflow completo su Pull Request verso `develop`/`main`, push diretti a `develop`/`main` e avvio manuale.

Il deploy staging genera metadata di build nel frontend e verifica lo SHA pubblicato dopo rsync.

## Alternative Considerate

Deploy manuale locale, CI esterna.

## Conseguenze

Maggiore tracciabilità. I secret restano fuori dal repository. La QA completa non rallenta il normale ciclo modifica, push e staging.
