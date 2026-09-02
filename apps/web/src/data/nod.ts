export const nodScreenshots = {
  dashboard: '/images/nod/dashboard.webp',
  leads: '/images/nod/leads.webp',
  leadDetail: '/images/nod/lead-detail.webp',
  pipeline: '/images/nod/pipeline.webp',
  calendar: '/images/nod/calendar.webp',
  communications: '/images/nod/communications.webp',
  aiAssistant: '/images/nod/ai-assistant.webp',
  automations: '/images/nod/automations.webp',
  reports: '/images/nod/reports.webp',
  sources: '/images/nod/sources.webp'
} as const;

export const nodPricing = {
  regularMonthlyPrice: 299,
  betaMonthlyPrice: 0,
  currency: 'EUR',
  billingUnit: 'mese',
  betaLabel: 'Beta privata'
} as const;

export const productTourItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Capisci cosa richiede attenzione.',
    description: 'Lead, opportunità, task e andamento commerciale nella stessa vista.',
    benefits: ['Priorità visibili', 'Task aperti', 'Andamento per fonte'],
    screenshot: nodScreenshots.dashboard
  },
  {
    id: 'leads',
    label: 'Lead',
    title: 'Ogni richiesta conserva il proprio contesto.',
    description: 'Fonte, interesse, attività, valore, priorità e prossima azione restano collegati.',
    benefits: ['Fonte del contatto', 'Campi utili', 'Storico ordinato'],
    screenshot: nodScreenshots.leads
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    title: 'Sai sempre dove si trova ogni opportunità.',
    description: 'Una vista chiara del processo commerciale, dal nuovo contatto alla chiusura.',
    benefits: ['Stati personalizzati', 'Valori stimati', 'Filtri rapidi'],
    screenshot: nodScreenshots.pipeline
  },
  {
    id: 'follow-up',
    label: 'Follow-up',
    title: 'Il prossimo passo non dipende dalla memoria.',
    description: 'Task, scadenze e sequenze aiutano il team a mantenere continuità.',
    benefits: ['Chiamate', 'Email', 'Meeting e proposte'],
    screenshot: nodScreenshots.calendar
  },
  {
    id: 'automazioni',
    label: 'Automazioni',
    title: 'Automatizza ciò che non richiede una decisione.',
    description: 'Reminder, task, notifiche e comunicazioni possono partire automaticamente.',
    benefits: ['Nuovi lead', 'Task scaduti', 'Stati cambiati'],
    screenshot: nodScreenshots.automations
  },
  {
    id: 'ai',
    label: 'AI',
    title: 'AI dentro il processo, non accanto al processo.',
    description: "Sintetizza informazioni, suggerisce azioni e prepara comunicazioni quando serve.",
    benefits: ['Riepiloghi', 'Priorità', 'Bozze email'],
    screenshot: nodScreenshots.aiAssistant
  },
  {
    id: 'report',
    label: 'Report',
    title: 'Dal costo per lead al valore della pipeline.',
    description: 'Leggi fonti, opportunità e conversioni in modo più vicino al risultato commerciale.',
    benefits: ['Fonti', 'Trend', 'Opportunità'],
    screenshot: nodScreenshots.reports
  }
] as const;

export const integrationSources = [
  ['Sito web', 'disponibile'],
  ['Elementor', 'disponibile'],
  ['Contact Form 7', 'disponibile'],
  ['Google Forms', 'disponibile'],
  ['Typeform', 'disponibile'],
  ['Tally', 'disponibile'],
  ['Make', 'disponibile'],
  ['Zapier', 'disponibile'],
  ['n8n', 'disponibile'],
  ['CSV', 'disponibile'],
  ['Email', 'disponibile'],
  ['Meta Lead Ads', 'in arrivo'],
  ['Google Ads', 'in arrivo'],
  ['LinkedIn Lead Gen', 'in arrivo']
] as const;

export const nodFaqItems: [string, string][] = [
  [
    'Cos’è NØD?',
    'NØD è il sistema operativo commerciale sviluppato da Netmarket per collegare lead, pipeline, follow-up, automazioni e dati in un unico ambiente.'
  ],
  [
    'È un CRM?',
    'Può svolgere alcune funzioni tipiche di un CRM, ma nasce soprattutto per collegare marketing e processo commerciale dopo il primo contatto.'
  ],
  [
    'Devo sostituire gli strumenti che utilizzo già?',
    'Non necessariamente. NØD può raccogliere richieste da strumenti diversi e portarle in un processo più ordinato.'
  ],
  [
    'Da quali canali può ricevere i lead?',
    'Può ricevere lead da sito, form, CSV, email e strumenti di automazione. Alcune integrazioni pubblicitarie dirette sono previste nelle prossime fasi.'
  ],
  [
    'Posso usarlo insieme alle campagne Netmarket?',
    'Sì. Il valore aumenta quando sito, campagne e gestione commerciale vengono letti nello stesso percorso.'
  ],
  [
    'Come viene utilizzata l’intelligenza artificiale?',
    'L’AI aiuta a riassumere richieste, evidenziare informazioni mancanti, suggerire priorità e preparare comunicazioni quando è utile.'
  ],
  [
    'Quanto costa NØD?',
    'Il valore previsto della licenza a regime è 299 euro al mese per workspace. Durante la beta la licenza è gratuita per i clienti ammessi.'
  ],
  [
    'Perché durante la beta è gratuito?',
    'Perché Netmarket sta validando NØD con un gruppo di clienti e settori differenti, raccogliendo feedback diretto sul prodotto.'
  ],
  [
    'Cosa significa che NØD è in beta?',
    'Significa che il prodotto è già utilizzabile, ma lo sviluppo è ancora attivo e alcune funzioni possono evolvere.'
  ],
  [
    'Chi può richiedere l’accesso?',
    'Possono richiederlo aziende che gestiscono lead commerciali e clienti Netmarket interessati a ordinare il processo dopo la generazione del contatto.'
  ],
  [
    'Posso importare i lead che ho già?',
    'Sì, l’import da CSV è previsto per portare nello stesso ambiente anche contatti già raccolti.'
  ],
  [
    'È possibile personalizzare pipeline e automazioni?',
    'Sì, workspace, pipeline, stati, campi e automazioni possono essere configurati in base al processo commerciale.'
  ]
];
