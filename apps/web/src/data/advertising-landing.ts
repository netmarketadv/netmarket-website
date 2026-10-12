import type { LandingShellConfig } from '@/types/landing';

export const advertisingShell: LandingShellConfig = {
  topHref: '#inizio',
  cta: { label: 'Parliamo del tuo progetto', href: '#consulenza' },
  links: [
    {
      label: 'Risultati',
      icon: 'projects',
      description: 'Quattro casi, numeri reali',
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
      label: 'Costi',
      icon: 'pricing',
      description: 'Google e Meta, da 400 €/mese',
      href: '#costi'
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
    'Va bene anche per una piccola attività?',
    'Sì. Seguiamo attività locali, professionisti, PMI, ecommerce e aziende strutturate. Adattiamo il progetto al tuo punto di partenza. Nel primo confronto valutiamo se obiettivi, offerta e risorse permettono di impostare un investimento sensato.'
  ],
  [
    'Quanto budget serve per iniziare?',
    'Dipende dal mercato, dal valore di un cliente, dall’obiettivo e dai canali. Nel primo confronto mettiamo a fuoco questi elementi. La gestione parte da 400 € al mese + IVA per canale. Il budget pubblicitario è escluso e viene investito sulle piattaforme. Configurazione iniziale, creatività, landing, feed e integrazioni sono definiti separatamente nella proposta, in base alle attività necessarie.'
  ],
  [
    'Potete migliorare campagne già attive?',
    'Sì. Partiamo da obiettivi, struttura delle campagne, misurazione e pagine di destinazione. Consideriamo anche la qualità dei contatti o delle vendite. Da questa analisi definiamo cosa mantenere e quali interventi hanno la priorità.'
  ],
  [
    'Gestite Google Ads e Meta Ads?',
    'Sì, e possiamo partire da un solo canale. La scelta dipende da domanda, offerta, obiettivi e budget: Google intercetta ricerche e intenzioni di acquisto; Meta sviluppa interesse presso i pubblici scelti. Un piano coordinato viene proposto quando ha una funzione concreta nel percorso di acquisizione.'
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
    'Ti ricontattiamo per un primo confronto gratuito, senza impegno, su obiettivi e situazione attuale. Un audit approfondito degli account o un piano operativo completo vengono eventualmente concordati in seguito. L’invio del modulo non attiva un servizio né un abbonamento.'
  ]
];

// Dati forniti da Netmarket nell’anteprima HTML del 9 ottobre 2026.
// ROAS = fatturato attribuito IVA esclusa / sola spesa Ads; Pilates usa CLV, non fatturato.
export const advertisingCases = [
  {
    id: 'pilates',
    title: 'Studio Pilates',
    period: '6 mesi',
    description: '197 richieste di informazioni. 41 persone che hanno scelto di iscriversi.',
    leads: 197,
    customers: 41,
    customerLabel: 'nuovi iscritti',
    investment: 3100,
    value: 16400,
    valueLabel: 'CLV netto stimato',
    returnLabel: 'CLV / spesa Ads',
    outcome: '41 nuovi iscritti.',
    context:
      'Lead generation per uno studio Pilates: dalle richieste di informazioni alle nuove iscrizioni.',
    note: 'CLV netto stimato di 400 € per iscritto, prima della spesa Ads. I 16.400 € rappresentano il valore stimato lungo il ciclo di vita dei clienti, non il fatturato incassato nei sei mesi.'
  },
  {
    id: 'eventi',
    title: 'Eventi privati · Milano',
    period: '6 mesi',
    description: 'Dalle richieste di preventivo a 89 eventi realmente organizzati.',
    leads: 439,
    customers: 89,
    customerLabel: 'eventi organizzati',
    investment: 5400,
    value: 84550,
    valueLabel: 'fatturato · IVA esclusa',
    returnLabel: 'ROAS',
    outcome: '89 eventi organizzati.',
    context:
      'Richieste per compleanni, feste di laurea ed eventi aziendali, trasformate in prenotazioni effettive.',
    note: 'Valore medio evento: 950 € IVA esclusa. Il fatturato è attribuito ai contatti acquisiti dalle campagne.'
  },
  {
    id: 'pergole',
    title: 'Pergole su misura',
    period: '4 mesi',
    description: '203 contatti. 13 vendite concluse per un prodotto ad alto valore.',
    leads: 203,
    customers: 13,
    customerLabel: 'vendite concluse',
    investment: 4400,
    value: 88400,
    valueLabel: 'fatturato · IVA esclusa',
    returnLabel: 'ROAS',
    outcome: '13 vendite concluse.',
    context:
      'Lead generation per la progettazione e vendita di pergole personalizzate, con richieste di preventivo orientate all’acquisto.',
    note: 'Valore medio vendita: 6.800 € IVA esclusa. Il fatturato è attribuito ai contatti acquisiti dalle campagne.'
  },
  {
    id: 'tappeti',
    title: 'Tappeti di pregio',
    period: '3 mesi',
    description: 'Lavaggio e restauro: 300 contatti diventati 133 clienti acquisiti.',
    leads: 300,
    customers: 133,
    customerLabel: 'clienti acquisiti',
    investment: 7500,
    value: 106400,
    valueLabel: 'fatturato · IVA esclusa',
    returnLabel: 'ROAS',
    outcome: '133 clienti acquisiti.',
    context:
      'Campagne per intercettare la domanda di lavaggio e restauro specialistico, valorizzando la cura di tappeti antichi e di pregio.',
    note: 'Scontrino medio: 800 € IVA esclusa. Il fatturato è attribuito ai contatti acquisiti dalle campagne.'
  }
] as const;

export const advertisingPricing = [
  {
    channel: 'Google Ads',
    platforms: 'Search · Shopping · Performance Max',
    title: 'Chi ti cerca, deve trovarti.',
    text: 'Intercettiamo chi sta cercando il tuo servizio o prodotti come i tuoi.',
    monthlyFrom: 400,
    includes: [
      'Strategia e struttura delle campagne.',
      'Gestione, test e ottimizzazione.',
      'Lettura dei risultati e priorità di intervento.'
    ]
  },
  {
    channel: 'Meta Ads',
    platforms: 'Facebook · Instagram',
    title: 'Fatti scegliere prima della ricerca.',
    text: 'Facciamo emergere il bisogno e trasformiamo l’interesse in contatti o acquisti.',
    monthlyFrom: 400,
    includes: [
      'Strategia e struttura delle campagne.',
      'Test di pubblici, messaggi e creatività.',
      'Gestione e ottimizzazione sui risultati.'
    ]
  }
] as const;

// Inserire MP4/WebM e sottotitoli VTT locali quando il video è pronto.
// Il placeholder non carica player esterni e non simula un pulsante play.
export const advertisingVideo: {
  src: string;
  poster: string;
  captions: string;
  transcript: string;
} = {
  src: '',
  poster: '/media/advertising/giacomo.webp',
  captions: '',
  transcript: ''
};
