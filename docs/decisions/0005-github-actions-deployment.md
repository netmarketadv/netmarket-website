# 0005 GitHub Actions Deployment

## Stato

Accettata.

## Contesto

Build e deploy devono essere ripetibili.

## Decisione

Usare GitHub Actions con due percorsi distinti:

- deploy staging rapido su `develop`, con branch `chore/bootstrap-netmarket-platform` abilitato solo durante la transizione;
- quality workflow completo su PR, branch stabili e avvio manuale.

Il deploy staging genera metadata di build nel frontend e verifica lo SHA pubblicato dopo rsync.

## Alternative Considerate

Deploy manuale locale, CI esterna.

## Conseguenze

Maggiore tracciabilità. I secret restano fuori dal repository. La QA completa non rallenta il normale ciclo modifica, push e staging.
