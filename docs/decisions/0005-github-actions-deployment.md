# 0005 GitHub Actions Deployment

## Stato

Accettata.

## Contesto

Build e deploy devono essere ripetibili.

## Decisione

Usare GitHub Actions con quality workflow automatico e deploy staging manuale.

## Alternative Considerate

Deploy manuale locale, CI esterna.

## Conseguenze

Maggiore tracciabilità. I secret restano fuori dal repository.
