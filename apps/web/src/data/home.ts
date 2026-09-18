export const googleBusinessProfile = {
  rating: '5.0',
  reviewCount: '50',
  label: 'recensioni Google',
  profileHref: 'https://share.google/DPsZDzWohdLvBMwmZ'
};

export const googleTrust = googleBusinessProfile;

const cmsUploadsBase = 'https://cms.netmarket.it/wp-content/uploads/2026/09';

export const cmsMedia = {
  projects: {
    sireneBlu: '/media/case-studies/sirene-blu-app/01.webp',
    albertini: `${cmsUploadsBase}/sviluppo-sito-web-aziendale-albertini-allestimenti.webp`,
    progettoe: `${cmsUploadsBase}/sviluppo-sito-web-aziendale-progettoe.webp`
  },
  services: {
    ecommerce: `${cmsUploadsBase}/sviluppo-ecommerce_netmarket-1.png`,
    branding: `${cmsUploadsBase}/comunicazione-grafica-branding_netmarket.png`,
    advertising: `${cmsUploadsBase}/pubblicita-tradizionale-radio_netmarket-1.png`,
    marketing: `${cmsUploadsBase}/marketing-digitale_netmarket.png`,
    websites: `${cmsUploadsBase}/sviluppo-realizzazione-siti-web_netmarket.png`,
    social: `${cmsUploadsBase}/social-media-management_netmarket.png`,
    contests: `${cmsUploadsBase}/concorsi-a-premi_netmarket.png`
  },
  hero: {
    phone: '/media/generated/home-hero-social-phone.webp',
    productPhotography: `${cmsUploadsBase}/product-photography-netmarket.webp`,
    socialPost: `${cmsUploadsBase}/gestione-social-profilo-instagram-netmarket.webp`,
    ecommerce: `${cmsUploadsBase}/sviluppo-ecommerce_netmarket-1.png`
  },
  badges: {
    brevo: `${cmsUploadsBase}/BrevoPartnerPioneer2025.png`,
    iubendaGold: `${cmsUploadsBase}/Gold.png`,
    woocommerce: `${cmsUploadsBase}/netmarket-woocommerce-ecommerce-partner.webp`
  },
  brand: {
    secondaryLogo: `${cmsUploadsBase}/netmarket-logo_2026_secondary.svg`
  }
} as const;

export const proof = [
  ['Dal 1986', 'comunicazione per PMI e aziende'],
  ['5/5 stelle', 'recensioni Google'],
  ['Padova', 'punto di riferimento in Veneto'],
  ['Metodo', 'analisi, progetto, attivazione, ottimizzazione']
] satisfies [string, string][];

export const serviceCards = [
  ['Siti web ed ecommerce', 'Siti istituzionali, piattaforme, cataloghi e commercio digitale con contenuti chiari e performance solide.', cmsMedia.services.websites],
  ['Marketing digitale', 'SEO, advertising, social e contenuti organizzati dentro un piano misurabile e continuativo.', cmsMedia.services.marketing],
  ['Brand e comunicazione', "Identità, messaggi, materiali coordinati e campagne capaci di rendere riconoscibile l'azienda.", cmsMedia.services.branding],
  ['Pubblicità tradizionale', 'Media planning, materiali stampati, iniziative promozionali e concorsi a premi collegati al digitale.', cmsMedia.services.advertising]
] satisfies [string, string, string][];

export const workSteps = [
  ['Analisi', 'Obiettivi, pubblico, concorrenza, canali e vincoli vengono messi sul tavolo prima di produrre.'],
  ['Progetto', 'Strategia, contenuti, design e tecnologia diventano una sequenza di decisioni condivisa.'],
  ['Attivazione', 'Sito, campagne, materiali e tracking partono insieme, con priorità chiare e responsabilità definite.'],
  ['Ottimizzazione', 'Misuriamo ciò che accade e miglioriamo messaggi, canali e conversioni nel tempo.']
] satisfies [string, string][];

export const questions = [
  [
    'Quali servizi offre Netmarket alle aziende di Padova?',
    'Netmarket è un’agenzia di comunicazione, marketing e tecnologia con sede a Padova. Seguiamo strategia, branding, siti web, ecommerce, SEO, advertising, social media, produzione di contenuti, software e concorsi a premi, coordinando le competenze necessarie in un unico progetto.'
  ],
  [
    'Come scegliere un’agenzia di comunicazione e marketing?',
    'Conviene valutare la capacità di comprendere il business, la qualità dei progetti reali, le competenze disponibili e il modo in cui vengono misurati i risultati. Prima di proporre strumenti o canali, Netmarket parte da obiettivi, pubblico, processi e priorità dell’azienda.'
  ],
  [
    'Quanto costa un progetto di comunicazione, marketing o sviluppo web?',
    'Il costo dipende dal perimetro: obiettivi, contenuti, funzionalità, integrazioni, canali e continuità richiesta. Dopo un primo confronto prepariamo una proposta trasparente con attività, tempi, responsabilità e investimento, evitando pacchetti standard poco adatti al contesto.'
  ],
  [
    'Quanto tempo serve per realizzare un sito web o avviare un progetto marketing?',
    'Un sito aziendale richiede normalmente alcune settimane; ecommerce, software e progetti articolati possono richiedere alcuni mesi. Campagne e attività continuative seguono tempi diversi. La pianificazione definitiva viene condivisa dopo aver verificato contenuti, approvazioni, integrazioni e priorità.'
  ],
  [
    'Potete rifare un sito esistente senza perdere contenuti e visibilità SEO?',
    'Sì. Prima della migrazione analizziamo pagine, contenuti, posizionamenti, dati e collegamenti esistenti. Il nuovo progetto considera struttura degli URL, metadata, redirect, performance, tracciamento e controlli prima e dopo la pubblicazione.'
  ],
  [
    'Seguite SEO, Google Ads e social media in modo coordinato?',
    'Sì. SEO, advertising, social e contenuti possono lavorare nello stesso piano, con obiettivi e misurazione condivisi. Questo riduce attività scollegate e aiuta a capire quali canali generano attenzione, contatti e opportunità commerciali.'
  ],
  [
    'Progettate siti e contenuti comprensibili anche dai sistemi AI?',
    'Sì. Organizziamo informazioni, pagine, collegamenti e dati strutturati perché siano chiari alle persone, ai motori di ricerca e ai sistemi basati sull’intelligenza artificiale. Non promettiamo citazioni o posizionamenti automatici: lavoriamo sulla qualità e leggibilità delle fonti.'
  ],
  [
    'Lavorate soltanto con aziende di Padova e del Veneto?',
    'No. La sede di Netmarket è a Padova e lavoriamo direttamente con molte imprese del territorio, ma seguiamo anche aziende in altre regioni italiane. Incontri in presenza e collaborazione da remoto vengono organizzati in base al progetto.'
  ],
  [
    'Offrite assistenza e attività continuative dopo il lancio?',
    'Sì. In base alle necessità possiamo seguire manutenzione ed evoluzione del sito, contenuti, SEO, campagne, social media, analytics e ottimizzazione. Frequenza, responsabilità e indicatori vengono definiti prima di iniziare la collaborazione continuativa.'
  ]
] satisfies [string, string][];

export const insights = [
  ['Black Friday 2025', 'Tendenze e strategie vincenti per le PMI italiane.', '/media/marketing-digitale.png'],
  ['Accessibilità web', 'Come prepararsi agli obblighi e migliorare esperienza e qualità.', '/media/accessibilita.jpg'],
  ['Instagram 2025', 'Reel, caroselli e Meta AI dentro una strategia editoriale sensata.', '/media/servizi-web.png']
] satisfies [string, string, string][];

export const featureHighlights = [
  ['Siti più veloci da aggiornare', 'Design, contenuti e sviluppo lavorano nello stesso sistema.', 'bolt'],
  ['SEO e performance integrate', 'Metadata, redirects, sitemap e immagini pensate prima del lancio.', 'search'],
  ['Sistema riutilizzabile', 'Componenti condivisi per pagine, landing e contenuti futuri.', 'palette'],
  ['Crescita senza caos operativo', 'Tracking, campagne e CMS con responsabilità chiare.', 'arrows']
] satisfies [string, string, 'arrows' | 'bolt' | 'briefcase' | 'chart' | 'desktop' | 'palette' | 'search' | 'shield' | 'sparkles' | 'users'][];

export const painPoints = [
  "Il sito non racconta più bene il valore dell'azienda",
  'Le campagne portano traffico ma pochi contatti utili',
  'Social, SEO e pubblicità procedono separati',
  'I materiali commerciali sembrano di aziende diverse',
  'Ogni modifica richiede troppo tempo',
  'I dati non aiutano a decidere cosa fare dopo'
];

export const trustBadges = [
  ['Google', '5.0 su 50 recensioni pubbliche'],
  ['Agenzia dal 1986', 'continuità nella comunicazione aziendale'],
  ['Padova e Veneto', 'rapporto diretto con PMI e aziende'],
  ['CMS riservato', 'frontend pubblico, backend protetto']
] satisfies [string, string][];

export type ClientLogo = {
  name: string;
  logo: string;
  href?: string;
  visualScale?: number;
};

export const clientLogos = [
  { name: 'Despar', logo: `${cmsUploadsBase}/despar-logo.png`, visualScale: 1.18 },
  { name: 'Morato', logo: `${cmsUploadsBase}/morato-logo.png`, visualScale: 1.16 },
  { name: 'Tigotà', logo: `${cmsUploadsBase}/tigota-logo.png`, visualScale: 1.1 },
  { name: 'Unieuro', logo: `${cmsUploadsBase}/unieuro-logo.png`, visualScale: 1.2 },
  { name: 'Porsche', logo: `${cmsUploadsBase}/porsche-logo.png`, visualScale: 1.24 },
  { name: 'Mercedes-Benz', logo: `${cmsUploadsBase}/mercedes-logo.png`, visualScale: 1.16 },
  { name: 'Kartell', logo: `${cmsUploadsBase}/kartell-logo.png`, visualScale: 1.12 },
  { name: 'Baracco', logo: `${cmsUploadsBase}/baracco-logo2026.png`, visualScale: 0.9 },
  { name: 'Sirene Blu', logo: `${cmsUploadsBase}/sirene-blu-logo.png`, visualScale: 1.18 },
  { name: 'Albertini Allestimenti', logo: `${cmsUploadsBase}/Logotipo-albertini-new.png`, visualScale: 1.28 },
  { name: 'Pazzo Design', logo: `${cmsUploadsBase}/pazzodesign-logo2026.png`, visualScale: 1.2 },
  { name: 'Orofino', logo: `${cmsUploadsBase}/orofino-logo.png`, visualScale: 1.12 }
] satisfies ClientLogo[];

export const approvalSteps = [
  ['Analisi iniziale', 'Obiettivi, pubblico e strumenti già attivi vengono verificati prima di produrre.', '55%'],
  ['Direzione creativa', 'Messaggi, layout e contenuti diventano un sistema coerente.', '21%'],
  ['Attivazione tecnica', 'Sito, CMS, SEO e tracking vengono collegati con ruoli chiari.', '5.3%'],
  ['Miglioramento continuo', 'I dati guidano priorità, campagne e aggiornamenti nel tempo.', '1 regia']
] satisfies [string, string, string][];
