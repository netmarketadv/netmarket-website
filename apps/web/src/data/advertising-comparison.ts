import {
  advertisingShell as originalShell,
  advertisingCases as originalCases,
  advertisingPricing as originalPricing
} from './advertising-landing';

// The comparison reuses the approved source numbers; no new attribution or client identities.
export const advertisingShell = {
  ...originalShell,
  cta: { ...originalShell.cta, label: 'Richiedi il confronto gratuito' }
};

export const advertisingCases = originalCases.map((project) => ({
  ...project,
  note:
    project.id === 'pilates'
      ? 'CLV netto stimato: 400 € per iscritto, prima della spesa Ads. Totale 16.400 € lungo il ciclo di vita dei clienti, non fatturato incassato nei sei mesi.'
      : project.note
}));

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
  ['Analisi.', 'Valutiamo offerta, margini, percorso commerciale e campagne già attive.'],
  ['Preparazione.', 'Definiamo canali e budget; verifichiamo messaggi, pagine e misurazione.'],
  ['Attivazione.', 'Testiamo annunci e pubblici, confrontando i dati con richieste e vendite.'],
  ['Ottimizzazione.', 'Riduciamo le dispersioni e aggiorniamo le priorità in base ai risultati.']
] satisfies [string, string][];

export const advertisingPricing = originalPricing.map((plan) => ({
  ...plan,
  includes:
    plan.channel === 'Google Ads'
      ? ['Strategia delle campagne.', 'Gestione, test e ottimizzazione.', 'Lettura dei risultati.']
      : ['Strategia delle campagne.', 'Test di pubblici e messaggi.', 'Gestione e ottimizzazione.']
}));

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
