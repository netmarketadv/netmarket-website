import type { LandingShellConfig } from '@/types/landing';

export const advertisingShell: LandingShellConfig = {
  topHref: '#inizio',
  cta: { label: 'Parliamo del tuo progetto', href: '#consulenza' },
  links: [
    {
      label: 'Progetti',
      icon: 'projects',
      description: 'Lavori reali e risultati',
      href: '#progetti'
    },
    {
      label: 'Obiettivi',
      icon: 'goals',
      description: 'Contatti, vendite, notorietà',
      href: '#obiettivi'
    },
    { label: 'Metodo', icon: 'method', description: 'Come investiamo insieme', href: '#metodo' },
    { label: 'Team', icon: 'team', description: 'Le persone al tuo fianco', href: '#team' },
    {
      label: 'Mercati',
      icon: 'markets',
      description: 'Vicino a te, in Italia, all’estero',
      href: '#mercati'
    },
    {
      label: 'Recensioni',
      icon: 'reviews',
      description: 'La voce dei nostri clienti',
      href: '#recensioni'
    }
  ]
};

export const advertisingGoals = [
  {
    label: 'Lead generation',
    title: 'Contatti che diventano opportunità.',
    text: 'Raggiungiamo chi cerca una soluzione come la tua. Annunci e landing lavorano insieme per raccogliere richieste pertinenti, da qualificare con il tuo team commerciale.',
    measure: 'Qualità dei contatti · Costo per opportunità',
    action: 'Voglio più contatti'
  },
  {
    label: 'Ecommerce',
    title: 'Vendite con una prospettiva di crescita.',
    text: 'Colleghiamo campagne, catalogo e percorso di acquisto. Leggiamo il ritorno pubblicitario insieme a margini e valore degli ordini, per decidere dove investire.',
    measure: 'Vendite · Costo di acquisizione · Marginalità',
    action: 'Voglio far crescere le vendite'
  },
  {
    label: 'Brand awareness',
    title: 'Fatti conoscere dalle persone giuste.',
    text: 'Diamo al tuo brand un messaggio riconoscibile e una presenza coerente. Pianifichiamo pubblico, creatività e frequenza per costruire familiarità prima della scelta.',
    measure: 'Copertura in target · Frequenza · Interesse',
    action: 'Voglio far conoscere il brand'
  }
];

export const advertisingSteps = [
  [
    'Capire il business.',
    'Partiamo da offerta, clienti, margini e percorso commerciale. Se hai già campagne attive, analizziamo quello che stanno producendo.',
    'Obiettivi e priorità condivisi'
  ],
  [
    'Preparare il percorso.',
    'Scegliamo canali, messaggi e budget. Verifichiamo creatività, landing e misurazione delle azioni utili, prima di portare traffico.',
    'Piano di attivazione'
  ],
  [
    'Attivare e imparare.',
    'Mettiamo alla prova annunci, pubblici e pagine. Confrontiamo i segnali delle piattaforme con la qualità delle richieste e delle vendite.',
    'Test e dati da leggere insieme'
  ],
  [
    'Migliorare le scelte.',
    'Riduciamo le dispersioni e lavoriamo sulle opportunità emerse. L’investimento evolve con i risultati e con la capacità della tua azienda di gestirli.',
    'Ottimizzazioni e prossimi passi'
  ]
] satisfies [string, string, string][];

export const advertisingFaq: [string, string][] = [
  [
    'Quanto budget serve per iniziare?',
    'Dipende dal mercato, dal valore di un cliente, dall’obiettivo e dai canali. Nel primo confronto mettiamo a fuoco questi elementi. La proposta distingue l’investimento nelle piattaforme dal lavoro di strategia, gestione e produzione: nessuna cifra standard prima di conoscere il contesto.'
  ],
  [
    'Potete migliorare campagne già attive?',
    'Sì. Partiamo da obiettivi, struttura delle campagne, misurazione e pagine di destinazione. Consideriamo anche la qualità dei contatti o delle vendite. Da questa analisi definiamo cosa mantenere e quali interventi hanno la priorità.'
  ],
  [
    'Gestite Google Ads e Meta Ads?',
    'Sì. Scegliamo la combinazione in base a domanda, pubblico e obiettivi: Google Ads può intercettare ricerche e intenzioni di acquisto; Meta Ads può aiutare a raggiungere pubblici e sviluppare interesse. Il piano viene definito sul tuo progetto.'
  ],
  [
    'Vi occupate anche di landing e creatività?',
    'Sì. Netmarket integra strategia, contenuti, design e sviluppo. Valutiamo ciò che esiste già e inseriamo in proposta le attività necessarie, con un perimetro chiaro prima di iniziare.'
  ],
  [
    'In quanto tempo si vedono i risultati?',
    'Le campagne possono produrre segnali fin dall’avvio, ma risultati stabili richiedono test, dati e un periodo di valutazione coerente con il ciclo di vendita. Condividiamo tempi e indicatori sul tuo caso, senza garantire un numero di clienti o un ritorno fisso.'
  ],
  [
    'Cosa succede dopo la richiesta?',
    'Ti ricontattiamo per un primo confronto su obiettivi, attività in corso e priorità. Valutiamo insieme se possiamo aiutarti e quale approfondimento serve per formulare una proposta. L’invio del modulo non attiva un servizio né un abbonamento.'
  ]
];
