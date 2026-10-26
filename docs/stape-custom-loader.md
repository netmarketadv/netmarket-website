# Stape Custom Loader

Guida sintetica dell'integrazione approvata; stato operativo e consegna nel
[rapporto unico di rilascio](stape-release-candidate.md). L'audit iniziale rimane in
[stape-pre-release-audit.md](stape-pre-release-audit.md).

Il bootstrap è nel componente Astro `apps/web/src/components/analytics/TrackingController.astro`,
non in un plugin WordPress. Il container web rimane `GTM-K782CJ46`; il server è
`GTM-MB32L54C`. Il loader originale è mantenuto esattamente:

```text
https://web.netmarket.it/10ddffrvzl.js?433kq=BR5LNTIrSS9bQkQxLFJSQhpHRFxXQAAKURQTBgsHFg8JDlgbEg%3D%3D
```

Il gate autorizza soltanto production e il container approvato. Inizializzazione dataLayer,
DOMContentLoaded, Iubenda, Consent Mode v2 e dispatcher eventi conservano l'ordine approvato.
Il caricamento differito resta invariato: anticiparlo richiederebbe una prova distinta con
CMP reale. La coda conserva gli eventi precedenti al download; ciò non certifica la ricezione
remota o il recupero di visite interrotte prima del bootstrap.

Non è presente un iframe noscript: senza JavaScript manca il controllo CMP e la soluzione
prudente approvata è non caricare GTM. Il bootstrap Google precedente e quello Stape non sono
presenti contemporaneamente. Nessuna modifica ai container, agli attivatori o ai tag.

Prima del rilascio eseguire `node infrastructure/scripts/verify-stape-invariants.mjs` e la
pipeline ufficiale con CMS autenticato. L'artifact verificato è promosso senza rebuild; non
pubblicare una build locale con fallback. Rollback esclusivamente tramite il workflow
production protetto e snapshot esatto; nessuna modifica WordPress/GTM/Stape necessaria.
