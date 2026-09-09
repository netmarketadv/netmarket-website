import { serviceSchema, type Service } from '@netmarket/schemas';
import { cmsMedia } from '@/data/home';

const seo = (title: string, description: string) => ({
  title,
  description,
  noindex: false
});

const serviceImage = (id: number, url: string, alt: string) => ({
  id,
  url,
  alt,
  width: 1400,
  height: 900,
  mimeType: url.endsWith('.png') ? 'image/png' : 'image/webp'
});

const baseUrl = 'https://www.netmarket.it/#contatti';

const rawServices = [
  {
    id: 9001,
    slug: 'siti-web',
    title: 'Siti web',
    subtitle: 'Presenza digitale chiara, veloce e governabile.',
    shortDescription:
      'Siti aziendali progettati per raccontare valore, generare contatti e restare aggiornabili nel tempo.',
    excerpt:
      'Progettiamo siti web aziendali con struttura editoriale, performance, SEO tecnica e gestione contenuti ordinata.',
    image: serviceImage(
      9101,
      cmsMedia.services.websites,
      'Visual servizio sviluppo e realizzazione siti web Netmarket'
    ),
    hero: {
      image: serviceImage(
        9102,
        cmsMedia.services.websites,
        'Visual principale servizio siti web Netmarket'
      )
    },
    valueProps: [
      {
        title: 'Architettura prima della grafica',
        description:
          'Struttura, contenuti e percorso utente vengono definiti prima di produrre pagine.'
      },
      {
        title: 'SEO tecnica nel progetto',
        description:
          'Metadata, performance, gerarchie e migrazione sono parte del lavoro, non una fase finale.'
      },
      {
        title: 'CMS e componenti riutilizzabili',
        description: 'Il sito resta ordinato anche quando crescono pagine, landing e contenuti.'
      }
    ],
    problems: [
      {
        title: 'Siti difficili da aggiornare',
        description: 'Riduciamo dipendenza da interventi occasionali e contenuti dispersi.'
      },
      {
        title: 'Pagine che non spiegano il valore',
        description: "Rendiamo leggibili servizi, prove, metodo e prossimi passi dell'azienda."
      }
    ],
    process: [
      {
        title: 'Analisi',
        description: 'Obiettivi, pubblico, contenuti esistenti e SEO vengono mappati.'
      },
      {
        title: 'Architettura',
        description: 'Definiamo struttura, template, priorità e migrazione.'
      },
      {
        title: 'Produzione',
        description: 'Design, sviluppo e contenuti procedono dentro lo stesso sistema.'
      },
      {
        title: 'Ottimizzazione',
        description: 'Misuriamo velocità, indicizzazione, conversioni e qualità editoriale.'
      }
    ],
    results: [],
    faq: [
      {
        question: 'Possiamo rifare un sito già online?',
        answer:
          'Sì. Partiamo da contenuti, dati, SEO e criticità esistenti per costruire una migrazione ordinata.'
      },
      {
        question: 'Il sito può essere collegato al marketing?',
        answer:
          'Sì. La struttura viene pensata per campagne, tracciamenti, contenuti e aggiornamenti futuri.'
      }
    ],
    priority: 10,
    featured: true,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      { id: 9004, slug: 'seo', title: 'SEO', type: 'nm_service' },
      { id: 9002, slug: 'ecommerce', title: 'Ecommerce', type: 'nm_service' },
      {
        id: 9003,
        slug: 'software-e-integrazioni',
        title: 'Software e integrazioni',
        type: 'nm_service'
      }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'Siti web',
      'Siti web aziendali progettati con strategia, contenuti, SEO tecnica e componenti aggiornabili.'
    )
  },
  {
    id: 9002,
    slug: 'ecommerce',
    title: 'Ecommerce',
    subtitle: 'Store, cataloghi e percorsi di vendita misurabili.',
    shortDescription:
      'Ecommerce e cataloghi digitali collegati a contenuti, marketing, gestione operativa e misurazione.',
    excerpt:
      'Sviluppiamo ecommerce con attenzione a UX, performance, gestione catalogo, SEO e campagne.',
    image: serviceImage(
      9201,
      cmsMedia.services.ecommerce,
      'Visual servizio sviluppo ecommerce Netmarket'
    ),
    hero: {
      image: serviceImage(
        9202,
        cmsMedia.services.ecommerce,
        'Visual principale servizio ecommerce Netmarket'
      )
    },
    valueProps: [
      {
        title: 'Vendita e gestione insieme',
        description:
          'Lo store viene progettato attorno a catalogo, contenuti, promozioni e processi reali.'
      },
      {
        title: 'Campagne collegate alla piattaforma',
        description:
          'Advertising, email, SEO e analytics lavorano sullo stesso percorso di conversione.'
      }
    ],
    problems: [
      {
        title: 'Cataloghi difficili da governare',
        description:
          'Organizziamo informazioni, categorie e priorità per rendere la gestione più sostenibile.'
      },
      {
        title: 'Traffico senza vendite',
        description: 'Colleghiamo UX, contenuti e misurazione per capire dove intervenire.'
      }
    ],
    process: [
      {
        title: 'Catalogo',
        description: 'Mappiamo prodotti, varianti, regole commerciali e contenuti.'
      },
      {
        title: 'Percorso',
        description: 'Disegniamo ricerca, schede prodotto, carrello e checkout.'
      },
      {
        title: 'Integrazioni',
        description: 'Colleghiamo strumenti gestionali, marketing e tracking quando serve.'
      },
      { title: 'Crescita', description: 'SEO, campagne e ottimizzazione accompagnano il lancio.' }
    ],
    results: [],
    faq: [],
    priority: 20,
    featured: true,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      { id: 9005, slug: 'advertising', title: 'Advertising', type: 'nm_service' },
      { id: 9004, slug: 'seo', title: 'SEO', type: 'nm_service' },
      {
        id: 9003,
        slug: 'software-e-integrazioni',
        title: 'Software e integrazioni',
        type: 'nm_service'
      }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'Ecommerce',
      'Ecommerce e cataloghi digitali collegati a UX, SEO, marketing e gestione operativa.'
    )
  },
  {
    id: 9003,
    slug: 'software-e-integrazioni',
    title: 'Software e integrazioni',
    subtitle: 'Strumenti operativi connessi ai processi reali.',
    shortDescription:
      'Applicazioni, CRM, automazioni e integrazioni per ridurre lavoro manuale e dispersione tra strumenti.',
    excerpt:
      'Progettiamo software e integrazioni quando sito, dati, persone e processi devono lavorare insieme.',
    image: serviceImage(
      9301,
      cmsMedia.projects.progettoe,
      'Sistema digitale e integrazioni Netmarket'
    ),
    hero: {
      image: serviceImage(
        9302,
        cmsMedia.projects.progettoe,
        'Progetto digitale con componenti integrati'
      )
    },
    valueProps: [
      {
        title: 'Meno passaggi manuali',
        description:
          'Automazioni e integrazioni rendono più lineare il lavoro tra sito, CRM e strumenti interni.'
      },
      {
        title: 'Interfacce utili',
        description:
          'Ogni funzionalità nasce da un flusso operativo, non da una lista generica di feature.'
      }
    ],
    problems: [
      {
        title: 'Dati dispersi',
        description:
          'Colleghiamo fonti e strumenti per dare continuità a informazioni e responsabilità.'
      }
    ],
    process: [
      {
        title: 'Mappa dei flussi',
        description: 'Individuiamo persone, strumenti, dati e punti di attrito.'
      },
      { title: 'Prototipo', description: 'Riduciamo il rischio validando percorso e priorità.' },
      {
        title: 'Sviluppo',
        description: 'Costruiamo componenti e integrazioni con manutenzione chiara.'
      },
      { title: 'Supporto', description: 'Monitoriamo stabilità, evoluzioni e passaggio operativo.' }
    ],
    results: [],
    faq: [],
    priority: 30,
    featured: true,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      { id: 9001, slug: 'siti-web', title: 'Siti web', type: 'nm_service' },
      { id: 9002, slug: 'ecommerce', title: 'Ecommerce', type: 'nm_service' }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'Software e integrazioni',
      'Software, CRM, automazioni e integrazioni per collegare processi, dati e strumenti aziendali.'
    )
  },
  {
    id: 9004,
    slug: 'seo',
    title: 'SEO',
    subtitle: 'Struttura, contenuti e segnali tecnici per essere trovati meglio.',
    shortDescription:
      'SEO tecnica, contenuti e architettura informativa per migliorare visibilità, qualità e continuità organica.',
    excerpt:
      'La SEO entra nel progetto fin dall’inizio: struttura, contenuti, performance e migrazione lavorano insieme.',
    image: serviceImage(9401, cmsMedia.services.marketing, 'Visual servizio marketing digitale Netmarket'),
    hero: {
      image: serviceImage(
        9402,
        cmsMedia.services.marketing,
        'Visual principale servizio SEO e marketing digitale Netmarket'
      )
    },
    valueProps: [
      {
        title: 'SEO dentro il sistema',
        description:
          'Tecnica, contenuti e gerarchie vengono progettati insieme al sito e alle campagne.'
      },
      {
        title: 'Migrazioni controllate',
        description:
          'Riduciamo perdita di traffico con mapping URL, metadata, redirect candidate e controlli.'
      }
    ],
    problems: [
      {
        title: 'Visibilità fragile',
        description:
          'Interveniamo su struttura, performance e contenuti che Google deve comprendere.'
      }
    ],
    process: [
      {
        title: 'Audit',
        description: 'Analizziamo contenuti, tecnologia, query, pagine e criticità.'
      },
      {
        title: 'Piano editoriale',
        description: 'Definiamo pagine, priorità e contenuti utili al posizionamento.'
      },
      {
        title: 'Ottimizzazione',
        description: 'Metadata, struttura, internal link e performance vengono rifiniti.'
      },
      {
        title: 'Monitoraggio',
        description: 'Misuriamo risultati e decidiamo gli interventi successivi.'
      }
    ],
    results: [],
    faq: [],
    priority: 40,
    featured: false,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      { id: 9001, slug: 'siti-web', title: 'Siti web', type: 'nm_service' },
      { id: 9008, slug: 'content-production', title: 'Content production', type: 'nm_service' }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'SEO',
      'SEO tecnica, contenuti e architettura per migliorare visibilità organica e qualità del sito.'
    )
  },
  {
    id: 9005,
    slug: 'advertising',
    title: 'Advertising',
    subtitle: 'Campagne misurabili, collegate a pagine e contenuti.',
    shortDescription:
      'Campagne digitali e pianificazione pubblicitaria coordinate con sito, creatività, dati e obiettivi commerciali.',
    excerpt:
      'Gestiamo advertising con attenzione a messaggi, landing, tracciamento e ottimizzazione continua.',
    image: serviceImage(9501, cmsMedia.services.advertising, 'Visual servizio advertising e pubblicità Netmarket'),
    hero: {
      image: serviceImage(
        9502,
        cmsMedia.services.advertising,
        'Visual principale servizio advertising Netmarket'
      )
    },
    valueProps: [
      {
        title: 'Creatività e dati insieme',
        description:
          'La campagna non vive isolata: messaggio, pagina e misurazione decidono la qualità.'
      }
    ],
    problems: [
      {
        title: 'Budget disperso',
        description: 'Riduciamo sprechi collegando obiettivo, pubblico, creatività e conversione.'
      }
    ],
    process: [
      { title: 'Scenario', description: 'Definiamo obiettivo, audience, canali e vincoli.' },
      {
        title: 'Creatività',
        description: 'Prepariamo messaggi e asset coerenti con la pagina di destinazione.'
      },
      {
        title: 'Tracking',
        description: 'Colleghiamo eventi e conversioni per leggere i risultati.'
      },
      {
        title: 'Ottimizzazione',
        description: 'Interveniamo su budget, creatività e landing in base ai dati.'
      }
    ],
    results: [],
    faq: [],
    priority: 50,
    featured: false,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      { id: 9008, slug: 'content-production', title: 'Content production', type: 'nm_service' },
      { id: 9001, slug: 'siti-web', title: 'Siti web', type: 'nm_service' }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'Advertising',
      'Advertising digitale e campagne coordinate con creatività, landing page, dati e obiettivi.'
    )
  },
  {
    id: 9006,
    slug: 'social-media',
    title: 'Social media',
    subtitle: 'Canali, contenuti e continuità editoriale.',
    shortDescription:
      'Gestione social e contenuti per rendere riconoscibile l’azienda con un piano coerente e sostenibile.',
    excerpt:
      'Costruiamo presenza social con strategia, format, produzione contenuti e lettura dei risultati.',
    image: serviceImage(9601, cmsMedia.services.social, 'Visual servizio social media management Netmarket'),
    hero: {
      image: serviceImage(
        9602,
        cmsMedia.services.social,
        'Visual principale servizio social media Netmarket'
      )
    },
    valueProps: [
      {
        title: 'Format riconoscibili',
        description:
          'I contenuti seguono tono, obiettivi e identità invece di inseguire singole uscite.'
      }
    ],
    problems: [
      {
        title: 'Calendari senza direzione',
        description: 'Mettiamo ordine tra rubriche, priorità commerciali, produzione e canali.'
      }
    ],
    process: [
      { title: 'Posizionamento', description: 'Chiariamo messaggi, pubblico e ruolo dei canali.' },
      { title: 'Piano', description: 'Definiamo format, frequenze e priorità editoriali.' },
      { title: 'Produzione', description: 'Prepariamo contenuti visuali, testi e adattamenti.' },
      {
        title: 'Lettura',
        description: 'Analizziamo risultati per migliorare contenuti e campagne.'
      }
    ],
    results: [],
    faq: [],
    priority: 60,
    featured: false,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      { id: 9008, slug: 'content-production', title: 'Content production', type: 'nm_service' },
      { id: 9005, slug: 'advertising', title: 'Advertising', type: 'nm_service' }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'Social media',
      'Gestione social media e produzione contenuti con strategia, format e continuità editoriale.'
    )
  },
  {
    id: 9007,
    slug: 'branding-e-comunicazione',
    title: 'Branding e comunicazione',
    subtitle: 'Identità, messaggi e materiali coordinati.',
    shortDescription:
      'Branding, copy, materiali e comunicazione coordinata per rendere l’azienda riconoscibile online e offline.',
    excerpt:
      'Lavoriamo su identità, messaggi, materiali commerciali e coerenza tra canali digitali e tradizionali.',
    image: serviceImage(
      9701,
      cmsMedia.services.branding,
      'Visual servizio comunicazione grafica e branding Netmarket'
    ),
    hero: {
      image: serviceImage(
        9702,
        cmsMedia.services.branding,
        'Visual principale servizio branding e comunicazione Netmarket'
      )
    },
    valueProps: [
      {
        title: 'Una voce riconoscibile',
        description:
          'Design, copy e materiali convergono in un sistema leggibile per clienti e team interni.'
      }
    ],
    problems: [
      {
        title: 'Comunicazione disallineata',
        description: 'Rendiamo coerenti presentazioni, sito, social, materiali e campagne.'
      }
    ],
    process: [
      { title: 'Direzione', description: 'Definiamo cosa deve comunicare il brand e a chi.' },
      { title: 'Sistema visivo', description: 'Costruiamo regole, asset e materiali ricorrenti.' },
      { title: 'Contenuti', description: 'Allineiamo messaggi, tono e priorità editoriali.' },
      {
        title: 'Applicazioni',
        description: 'Portiamo il sistema su sito, campagne, materiali e canali.'
      }
    ],
    results: [],
    faq: [],
    priority: 70,
    featured: false,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      { id: 9008, slug: 'content-production', title: 'Content production', type: 'nm_service' },
      { id: 9006, slug: 'social-media', title: 'Social media', type: 'nm_service' }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'Branding e comunicazione',
      'Branding, copy e comunicazione coordinata per identità, materiali, campagne e presenza digitale.'
    )
  },
  {
    id: 9008,
    slug: 'content-production',
    title: 'Content production',
    subtitle: 'Contenuti utili per sito, social, campagne e vendite.',
    shortDescription:
      'Produzione di testi, visual e asset editoriali collegati a strategia, posizionamento e canali.',
    excerpt:
      'Creiamo contenuti per rendere più chiari servizi, prodotti, campagne e materiali commerciali.',
    image: serviceImage(9801, cmsMedia.projects.progettoe, 'Produzione contenuti digitali Netmarket'),
    hero: {
      image: serviceImage(
        9802,
        cmsMedia.projects.progettoe,
        'Asset content production per canali digitali'
      )
    },
    valueProps: [
      {
        title: 'Contenuti riutilizzabili',
        description: 'Ogni asset può servire sito, campagne, social e materiali commerciali.'
      }
    ],
    problems: [
      {
        title: 'Messaggi sempre da ricreare',
        description: 'Organizziamo contenuti base, format e priorità per accelerare la produzione.'
      }
    ],
    process: [
      { title: 'Piano contenuti', description: 'Definiamo messaggi, formati, priorità e canali.' },
      {
        title: 'Produzione',
        description: 'Realizziamo testi, visual e asset coerenti con il sistema.'
      },
      {
        title: 'Distribuzione',
        description: 'Adattiamo i contenuti alle pagine e ai canali previsti.'
      },
      {
        title: 'Riuso',
        description: 'Manteniamo librerie utili per campagne e aggiornamenti futuri.'
      }
    ],
    results: [],
    faq: [],
    priority: 80,
    featured: false,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      {
        id: 9007,
        slug: 'branding-e-comunicazione',
        title: 'Branding e comunicazione',
        type: 'nm_service'
      },
      { id: 9006, slug: 'social-media', title: 'Social media', type: 'nm_service' },
      { id: 9004, slug: 'seo', title: 'SEO', type: 'nm_service' }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'Content production',
      'Produzione contenuti per siti, campagne, social e materiali commerciali.'
    )
  },
  {
    id: 9009,
    slug: 'concorsi-a-premi',
    title: 'Concorsi a premi',
    subtitle: 'Promozioni digitali e operative con regia completa.',
    shortDescription:
      'Ideazione, sviluppo e gestione di concorsi a premi e iniziative promozionali integrate con il digitale.',
    excerpt:
      'Seguiamo concorsi a premi collegando meccanica, burocrazia, sito, contenuti e comunicazione.',
    image: serviceImage(
      9901,
      cmsMedia.services.contests,
      'Visual servizio concorsi a premi Netmarket'
    ),
    hero: {
      image: serviceImage(
        9902,
        cmsMedia.services.contests,
        'Visual principale servizio concorsi a premi Netmarket'
      )
    },
    valueProps: [
      {
        title: 'Regia operativa',
        description:
          'Meccanica, materiali, sviluppo e adempimenti vengono coordinati in un unico percorso.'
      }
    ],
    problems: [
      {
        title: 'Promozioni complesse da gestire',
        description: 'Riduciamo dispersione tra idea, regole, sviluppo, comunicazione e assistenza.'
      }
    ],
    process: [
      { title: 'Meccanica', description: 'Definiamo partecipazione, premi, vincoli e flussi.' },
      {
        title: 'Adempimenti',
        description: 'Coordiniamo documenti e passaggi necessari al progetto.'
      },
      {
        title: 'Sviluppo',
        description: 'Realizziamo landing, form, tracciamenti e strumenti operativi.'
      },
      { title: 'Gestione', description: 'Accompagniamo lancio, comunicazione e supporto.' }
    ],
    results: [],
    faq: [],
    priority: 90,
    featured: false,
    cta: { label: 'Parliamone', url: baseUrl },
    relatedServices: [
      { id: 9005, slug: 'advertising', title: 'Advertising', type: 'nm_service' },
      { id: 9008, slug: 'content-production', title: 'Content production', type: 'nm_service' }
    ],
    relatedCaseStudies: [],
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: seo(
      'Concorsi a premi',
      'Concorsi a premi e iniziative promozionali con ideazione, sviluppo, comunicazione e gestione.'
    )
  }
] satisfies unknown[];

export const serviceFallbacks: Service[] = rawServices.map((service) =>
  serviceSchema.parse(service)
);
