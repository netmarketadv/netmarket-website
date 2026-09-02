# 0010 Related Content Strategy

## Stato

Accettata.

## Contesto

Servizi, progetti, insight e risorse devono collegarsi tra loro senza creare query casuali nei componenti Astro.

## Decisione

La selezione manuale ha priorita. Se manca, l'API puo calcolare fallback semplici usando service, sector, capability, featured e priority.

## Conseguenze

Il frontend riceve contenuti correlati gia normalizzati. La logica resta centralizzata nell'API e non diventa un algoritmo opaco.
