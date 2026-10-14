import type { LandingShellConfig } from '@/types/landing';

export const advertisingShell: LandingShellConfig = {
  topHref: '#inizio',
  cta: { label: 'Richiedi confronto gratuito', href: '#consulenza' },
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
    label: 'Contatti e preventivi',
    value: 'contatti-preventivi',
    title: 'Richieste da qualificare.',
    text: 'Raccogliamo richieste pertinenti da valutare con il tuo team commerciale.',
    action: 'Parliamo dei contatti'
  },
  {
    label: 'Vendite ecommerce',
    value: 'vendite-ecommerce',
    title: 'Acquisti da misurare.',
    text: 'Valutiamo vendite, costo di acquisizione e margini per orientare l’investimento.',
    action: 'Parliamo delle vendite'
  },
  {
    label: 'Notorietà del brand',
    value: 'notorieta-brand',
    title: 'Una presenza riconoscibile.',
    text: 'Pianifichiamo pubblico, messaggi e frequenza per far conoscere la tua offerta.',
    action: 'Parliamo del brand'
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
    'Seguiamo attività locali, professionisti, PMI ed ecommerce. Nel primo confronto valutiamo se offerta, obiettivi e risorse consentono un investimento sensato.'
  ],
  [
    'Quanto budget serve per iniziare?',
    'La gestione parte da 400 € al mese + IVA per singolo canale. Il budget Ads è escluso: lo definiamo in base a mercato, obiettivo e valore del cliente. Non esiste un importo adatto a tutti.'
  ],
  [
    'Potete migliorare campagne già attive?',
    'Valutiamo struttura, misurazione, pagine e qualità delle richieste o delle vendite per individuare gli interventi prioritari.'
  ],
  [
    'Meglio Google Ads o Meta Ads?',
    'Google intercetta ricerche e intenzioni di acquisto; Meta raggiunge i pubblici scelti. Possiamo partire da un solo canale o coordinarli, secondo domanda, offerta e budget.'
  ],
  [
    'Landing e creatività sono incluse nei 400 €?',
    'Non automaticamente. Configurazione iniziale, produzione creativa, landing, feed e integrazioni sono definiti separatamente in proposta, in base alle necessità.'
  ],
  [
    'In quanto tempo si vedono i risultati?',
    'Dipende da test, dati e ciclo di vendita. Concordiamo tempi e indicatori sul tuo caso, senza garantire un numero di clienti o un ritorno fisso.'
  ],
  [
    'Cosa comprende il primo confronto?',
    'Un confronto gratuito e senza impegno su obiettivi e situazione attuale. Un audit approfondito o un piano operativo completo sono eventualmente concordati in seguito. L’invio non attiva servizi o abbonamenti.'
  ]
];

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
