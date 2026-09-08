export const serviceExperienceSlugs = [
  'ecommerce',
  'software-e-integrazioni',
  'seo',
  'advertising',
  'social-media',
  'branding-e-comunicazione',
  'content-production',
  'concorsi-a-premi'
] as const;

export type ServiceExperienceSlug = (typeof serviceExperienceSlugs)[number];

export interface ServiceExperience {
  eyebrow: string;
  h1: string;
  accent: string;
  introTitle: string;
  territoryText: string;
  problemsTitle: string;
  systemTitle: string;
  processTitle: string;
  proofTitle: string;
  proofText: string;
  projectsTitle: string;
  projectsText: string;
  ctaTitle: string;
  ctaText: string;
  title: string;
  description: string;
  variant: ServiceExperienceSlug;
}

export const serviceExperiences: Record<ServiceExperienceSlug, ServiceExperience> = {
  ecommerce: {
    eyebrow: 'Ecommerce a Padova',
    h1: 'Uno store che vende. E resta governabile.',
    accent: 'vende',
    introTitle: 'Vendere online richiede più di un catalogo.',
    territoryText:
      'Da Padova progettiamo ecommerce per aziende del Veneto e di tutta Italia, collegando vendita online e operatività quotidiana.',
    problemsTitle: 'Dove si interrompe davvero un acquisto.',
    systemTitle: 'Catalogo, contenuti e gestione lavorano insieme.',
    processTitle: 'Dal prodotto al checkout, senza passaggi scollegati.',
    proofTitle: 'I numeri hanno senso quando raccontano un sistema.',
    proofText: 'Dati pubblicati nei case study Netmarket, con contesto e fonte leggibili.',
    projectsTitle: 'Ecommerce costruiti su prodotti e processi reali.',
    projectsText:
      'Progetti in cui piattaforma, comunicazione e operatività sono stati affrontati insieme.',
    ctaTitle: 'Il tuo ecommerce deve vendere senza complicare il lavoro.',
    ctaText: 'Partiamo da catalogo, margini, flussi e obiettivi. Poi scegliamo la piattaforma.',
    title: 'Ecommerce a Padova per aziende | Netmarket',
    description:
      'Progettazione ecommerce a Padova per aziende: cataloghi, UX, checkout, WooCommerce, contenuti, SEO, tracking e integrazioni operative.',
    variant: 'ecommerce'
  },
  'software-e-integrazioni': {
    eyebrow: 'Software e integrazioni a Padova',
    h1: 'Meno passaggi manuali. Più lavoro che scorre.',
    accent: 'scorre',
    introTitle: 'Il software utile parte dal modo in cui lavorate.',
    territoryText:
      'Il team Netmarket sviluppa a Padova software e integrazioni per imprese locali e nazionali, partendo dai processi reali.',
    problemsTitle: 'Quando gli strumenti aumentano, il processo si frammenta.',
    systemTitle: 'Dati, persone e strumenti dentro lo stesso flusso.',
    processTitle: 'Prima il processo. Poi il codice necessario.',
    proofTitle: 'Tecnologia applicata a operazioni concrete.',
    proofText: 'Casi reali tra loyalty, app, CRM e integrazioni gestionali.',
    projectsTitle: 'Strumenti progettati attorno alle persone che li usano.',
    projectsText: 'Progetti software con un perimetro operativo chiaro e verificabile.',
    ctaTitle: 'Colleghiamo ciò che oggi vi fa perdere tempo.',
    ctaText: 'Mappiamo flussi, dati e responsabilità prima di proporre una soluzione.',
    title: 'Software gestionali e integrazioni a Padova | Netmarket',
    description:
      'Software custom, CRM, app e integrazioni a Padova per collegare dati, strumenti e processi aziendali con interfacce chiare.',
    variant: 'software-e-integrazioni'
  },
  seo: {
    eyebrow: 'Consulenza SEO a Padova',
    h1: 'Essere trovati quando la ricerca conta.',
    accent: 'trovati',
    introTitle: 'La visibilità nasce da pagine utili e segnali coerenti.',
    territoryText:
      'Da Padova affianchiamo aziende che vogliono consolidare la visibilità locale, in Veneto e sui mercati nazionali.',
    problemsTitle: 'Il traffico non basta se non incontra l’intento giusto.',
    systemTitle: 'Struttura, contenuti e autorevolezza si sostengono a vicenda.',
    processTitle: 'Dalla domanda alla pagina che merita di rispondere.',
    proofTitle: 'La SEO si dimostra nelle scelte, non nelle promesse.',
    proofText:
      'Progetti in cui architettura, contenuti e visibilità sono parte dello stesso lavoro.',
    projectsTitle: 'Siti resi più leggibili per persone e motori di ricerca.',
    projectsText: 'Applicazioni reali del metodo SEO Netmarket.',
    ctaTitle: 'Capire dove intervenire viene prima di produrre contenuti.',
    ctaText: 'Analizziamo domanda, sito e priorità per costruire un percorso SEO sostenibile.',
    title: 'Consulenza SEO a Padova per aziende | Netmarket',
    description:
      'Consulenza SEO a Padova per aziende: analisi tecnica, architettura, contenuti, SEO locale e misurazione per una visibilità sostenibile.',
    variant: 'seo'
  },
  advertising: {
    eyebrow: 'Advertising a Padova',
    h1: 'Ogni campagna deve portare da qualche parte.',
    accent: 'portare',
    introTitle: 'Media, messaggio e destinazione formano un unico percorso.',
    territoryText:
      'Gestiamo da Padova campagne rivolte a pubblici locali e nazionali, mantenendo messaggio, landing e misurazione nello stesso percorso.',
    problemsTitle: 'La dispersione inizia prima del click.',
    systemTitle: 'Dall’attenzione al contatto, con passaggi misurabili.',
    processTitle: 'Strategia, creatività, attivazione e lettura dei dati.',
    proofTitle: 'Risultati letti nel contesto del progetto.',
    proofText:
      'Niente metriche isolate o promesse di rendimento: colleghiamo campagne, contenuti e destinazioni.',
    projectsTitle: 'Campagne dentro sistemi di comunicazione più ampi.',
    projectsText:
      'Esperienze in cui media, social, contenuti e presenza digitale lavorano insieme.',
    ctaTitle: 'Prima del budget, mettiamo a fuoco il percorso.',
    ctaText: 'Obiettivo, pubblico, messaggio, landing e misurazione devono partire allineati.',
    title: 'Advertising a Padova: campagne e media | Netmarket',
    description:
      'Advertising a Padova per aziende: strategia media, campagne digitali e tradizionali, creatività, landing page, tracking e ottimizzazione.',
    variant: 'advertising'
  },
  'social-media': {
    eyebrow: 'Social media management a Padova',
    h1: 'Una presenza riconoscibile, non un feed da riempire.',
    accent: 'riconoscibile',
    introTitle: 'I social funzionano quando hanno un ruolo nel marketing.',
    territoryText:
      'Da Padova seguiamo la presenza social di aziende del territorio e brand nazionali con una regia editoriale continuativa.',
    problemsTitle: 'Pubblicare senza una direzione consuma tempo e identità.',
    systemTitle: 'Strategia, format e continuità danno forma alla presenza.',
    processTitle: 'Dal piano editoriale alla lettura dei segnali.',
    proofTitle: 'Contenuti e risultati appartengono alla stessa storia.',
    proofText: 'Progetti reali in cui social, ecommerce e comunicazione sono stati coordinati.',
    projectsTitle: 'Brand raccontati con continuità sui canali social.',
    projectsText: 'Contenuti e gestione inseriti in un sistema di marca e marketing.',
    ctaTitle: 'Costruiamo una presenza che la vostra azienda possa sostenere.',
    ctaText: 'Scegliamo canali, ritmo e formati in base a obiettivi e risorse reali.',
    title: 'Gestione social media a Padova | Netmarket',
    description:
      'Gestione social media a Padova per aziende e PMI: strategia, piano editoriale, contenuti, campagne e reporting coordinati.',
    variant: 'social-media'
  },
  'branding-e-comunicazione': {
    eyebrow: 'Branding e comunicazione a Padova',
    h1: 'Rendere visibile ciò che vi rende diversi.',
    accent: 'diversi',
    introTitle: 'Un’identità è utile quando orienta ogni scelta.',
    territoryText:
      'A Padova lavoriamo con imprese che vogliono rendere più riconoscibile la propria identità, sul territorio e oltre.',
    problemsTitle: 'La marca perde forza quando ogni materiale parla da solo.',
    systemTitle: 'Messaggi, segni e applicazioni dentro un sistema riconoscibile.',
    processTitle: 'Dalla memoria dell’azienda alla sua forma contemporanea.',
    proofTitle: 'Esperienza creativa che attraversa canali ed epoche.',
    proofText: 'Dal 1986 lavoriamo tra comunicazione, identità, materiali e digitale.',
    projectsTitle: 'Identità applicate, non soltanto presentate.',
    projectsText: 'Progetti reali in cui il brand prende forma nei punti di contatto.',
    ctaTitle: 'La vostra identità esiste già. Rendiamola più chiara.',
    ctaText: 'Partiamo da storia, persone, mercato e differenze concrete.',
    title: 'Branding e comunicazione a Padova | Netmarket',
    description:
      'Branding e comunicazione a Padova: strategia, identità visiva, copy, immagine coordinata e materiali online e offline per aziende.',
    variant: 'branding-e-comunicazione'
  },
  'content-production': {
    eyebrow: 'Produzione contenuti a Padova',
    h1: 'Contenuti nati per essere guardati. E usati.',
    accent: 'usati',
    introTitle: 'Ogni contenuto deve sapere dove andrà a vivere.',
    territoryText:
      'Produciamo a Padova contenuti per aziende, prodotti e persone, organizzandoli per siti, campagne e canali social.',
    problemsTitle: 'La qualità si perde quando la produzione è scollegata dal piano.',
    systemTitle: 'Un contenuto madre, molti formati coerenti.',
    processTitle: 'Dal brief alla libreria di asset pronta per i canali.',
    proofTitle: 'Produzione e progetto si rafforzano a vicenda.',
    proofText: 'Shooting, copy e formati multicanale documentati nei progetti Netmarket.',
    projectsTitle: 'Immagini e parole costruite attorno ad aziende reali.',
    projectsText: 'Contenuti prodotti per raccontare competenze, prodotti e persone.',
    ctaTitle: 'Produciamo meno materiale isolato e più contenuto utile.',
    ctaText: 'Definiamo messaggi, destinazioni e formati prima di entrare in produzione.',
    title: 'Produzione contenuti a Padova | Netmarket',
    description:
      'Produzione contenuti a Padova per siti, social e campagne: shooting fotografici, video, copy, creatività e asset multicanale.',
    variant: 'content-production'
  },
  'concorsi-a-premi': {
    eyebrow: 'Concorsi a premi a Padova',
    h1: 'Un’idea promozionale, governata fino all’ultimo passaggio.',
    accent: 'governata',
    introTitle: 'Un concorso è un progetto di comunicazione e operatività.',
    territoryText:
      'Da Padova coordiniamo concorsi a premi per iniziative locali e nazionali, dalla meccanica alla piattaforma digitale.',
    problemsTitle: 'La partecipazione sembra semplice solo quando la regia è solida.',
    systemTitle: 'Meccanica, piattaforma e comunicazione dentro lo stesso percorso.',
    processTitle: 'Dall’obiettivo alla chiusura dell’iniziativa.',
    proofTitle: 'La complessità resta dietro le quinte.',
    proofText: 'Un caso reale documenta concept, piattaforma e coordinamento multicanale.',
    projectsTitle: 'Promozioni progettate per funzionare online e sul territorio.',
    projectsText: 'Meccaniche e strumenti costruiti attorno alla partecipazione reale.',
    ctaTitle: 'Trasformiamo la promozione in un progetto governabile.',
    ctaText: 'Definiamo insieme obiettivo, meccanica, canali, dati e responsabilità.',
    title: 'Concorsi a premi a Padova | Netmarket',
    description:
      'Concorsi a premi a Padova: ideazione, meccanica, piattaforma digitale, comunicazione, raccolta dati e coordinamento operativo.',
    variant: 'concorsi-a-premi'
  }
};

export function isServiceExperienceSlug(slug: string): slug is ServiceExperienceSlug {
  return serviceExperienceSlugs.includes(slug as ServiceExperienceSlug);
}
