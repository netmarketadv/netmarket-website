# 0004 SiteGround Static Hosting

## Stato

Accettata.

## Contesto

Il progetto userà SiteGround.

## Decisione

Preparare deploy statico su staging via SSH, senza eseguirlo ora.

## Alternative Considerate

Vercel, Netlify, hosting Node.

## Conseguenze

Nessun runtime frontend server. Servono script SSH sicuri, health check e rollback.
