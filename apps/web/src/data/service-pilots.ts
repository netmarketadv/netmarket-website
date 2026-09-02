import type { Service } from '@netmarket/schemas';

type ServicePilotContent = Partial<Service> & {
  technicalFocus?: Array<{ title: string; description: string }>;
};

const serviceRelation = (id: number, slug: string, title: string) => ({
  id,
  slug,
  title,
  type: 'nm_service'
});

const capability = (id: number, slug: string, name: string) => ({
  id,
  slug,
  name,
  taxonomy: 'nm_capability' as const
});

const technology = (id: number, slug: string, name: string) => ({
  id,
  slug,
  name,
  taxonomy: 'nm_technology' as const
});

export const servicePilots: Record<string, ServicePilotContent> = {
  'siti-web': {
    subtitle: 'Siti web che mettono ordine tra contenuti, tecnologia e marketing.',
    shortDescription:
      'Progettiamo siti web aziendali per rendere chiara l’offerta, facilitare il contatto e sostenere SEO, campagne e aggiornamenti nel tempo.',
    excerpt:
      'Un sito Netmarket non nasce da una grafica isolata. Parte da obiettivi, contenuti, percorsi utente e requisiti tecnici, poi diventa un sistema pubblicabile, veloce e governabile dal team.',
    valueProps: [
      {
        title: 'Prima il senso, poi le pagine',
        description:
          'Mappiamo servizi, pubblici, contenuti esistenti e priorità commerciali prima di disegnare template e interfacce.'
      },
      {
        title: 'Design e sviluppo nello stesso sistema',
        description:
          'UX, UI, frontend, CMS e componenti vengono progettati insieme, così il sito resta coerente quando cresce.'
      },
      {
        title: 'SEO tecnica fin dall’architettura',
        description:
          'Heading, metadata, performance, internal link, migrazione URL e contenuti sono trattati come parte del progetto, non come rifinitura finale.'
      },
      {
        title: 'Collegato a marketing e operatività',
        description:
          'Form, analytics, landing, contenuti, campagne e integrazioni vengono considerati nel disegno del sito, quando servono al progetto.'
      }
    ],
    problems: [
      {
        title: 'Il sito non spiega bene cosa fa l’azienda',
        description:
          'Servizi, differenze, prove e prossimi passi vengono riscritti in una struttura leggibile per clienti, motori di ricerca e team commerciali.'
      },
      {
        title: 'Aggiornare contenuti è lento o rischioso',
        description:
          'Template, CMS e componenti riducono contenuti duplicati, pagine isolate e interventi tecnici per modifiche ricorrenti.'
      },
      {
        title: 'SEO, performance e conversione arrivano troppo tardi',
        description:
          'Le scelte tecniche e editoriali entrano nel lavoro prima del lancio: struttura, velocità, tracciamenti e redirect candidate.'
      },
      {
        title: 'Il sito è scollegato dal resto del marketing',
        description:
          'La pagina web deve dialogare con campagne, social, email, materiali commerciali e dati, non restare una vetrina separata.'
      }
    ],
    process: [
      {
        title: 'Audit e obiettivi',
        description:
          'Analizziamo sito esistente, contenuti, query, vincoli tecnici, stakeholder e azioni che il sito deve facilitare.'
      },
      {
        title: 'Architettura e contenuti',
        description:
          'Definiamo sitemap, gerarchie, template, messaggi principali, internal link e piano di migrazione quando esiste un sito già online.'
      },
      {
        title: 'Design system e interfacce',
        description:
          'Costruiamo layout, componenti, stati responsive e direzione visuale coerenti con identità, pubblico e contenuti reali.'
      },
      {
        title: 'Sviluppo e CMS',
        description:
          'Implementiamo frontend, WordPress o architettura headless, form, media, tassonomie e componenti aggiornabili.'
      },
      {
        title: 'QA e pubblicazione',
        description:
          'Verifichiamo accessibilità, no-JS, performance, SEO tecnica, redirect candidate, analytics e comportamento sui viewport principali.'
      },
      {
        title: 'Ottimizzazione',
        description:
          'Dopo il lancio il sito può evolvere con nuove pagine, campagne, contenuti editoriali e miglioramenti misurati.'
      }
    ],
    results: [
      {
        label: 'Esperienza',
        value: 'dal 1986',
        context: 'Netmarket lavora su comunicazione, web e marketing con continuità storica.'
      },
      {
        label: 'Progetti web collegati',
        value: '5+',
        context: 'Case study legacy già mappati al servizio Siti web nello storico lavori.'
      },
      {
        label: 'Sistema',
        value: 'CMS + SEO + UX',
        context: 'La pagina modello unisce contenuti, sviluppo, performance e internal linking.'
      }
    ],
    faq: [
      {
        question: 'Quanto costa realizzare un sito web aziendale?',
        answer:
          'Dipende da obiettivi, numero di pagine, contenuti, design, CMS, integrazioni e migrazione. Per questo Netmarket parte da un confronto sul progetto prima di proporre un preventivo.'
      },
      {
        question: 'Quanto tempo serve per pubblicare un nuovo sito?',
        answer:
          'I tempi cambiano in base a complessità, contenuti disponibili e approvazioni. Un progetto ordinato include analisi, architettura, design, sviluppo, test, SEO tecnica e pubblicazione.'
      },
      {
        question: 'Realizzate anche restyling di siti già online?',
        answer:
          'Sì. In quel caso partiamo da contenuti, URL, performance, SEO esistente e criticità operative, così la migrazione non cancella ciò che funziona già.'
      },
      {
        question: 'Meglio WordPress, sviluppo custom o headless?',
        answer:
          'Non esiste una risposta unica. WordPress è utile quando il team deve gestire contenuti con continuità; un approccio custom o headless ha senso quando performance, integrazioni e controllo del frontend diventano centrali.'
      },
      {
        question: 'Il sito viene progettato anche per la SEO?',
        answer:
          'Sì, se il progetto lo richiede. Struttura, heading, metadata, performance, contenuti, internal link e migrazione URL vengono considerati già nella progettazione.'
      },
      {
        question: 'Dopo la pubblicazione chi aggiorna il sito?',
        answer:
          'Il sito può essere predisposto per aggiornamenti interni tramite CMS e per interventi evolutivi Netmarket su contenuti, sezioni, performance, campagne e integrazioni.'
      }
    ],
    capabilities: [
      capability(9101, 'ux-ui-design', 'UX/UI design'),
      capability(9102, 'architettura-contenuti', 'Architettura contenuti'),
      capability(9103, 'frontend', 'Frontend'),
      capability(9104, 'seo-tecnica', 'SEO tecnica'),
      capability(9105, 'performance', 'Performance'),
      capability(9106, 'analytics', 'Analytics'),
      capability(9107, 'lead-generation', 'Lead generation'),
      capability(9108, 'migrazione-seo', 'Migrazione SEO')
    ],
    technologies: [
      technology(9201, 'wordpress', 'WordPress'),
      technology(9202, 'woocommerce', 'WooCommerce'),
      technology(9203, 'astro', 'Astro'),
      technology(9204, 'typescript', 'TypeScript'),
      technology(9205, 'php', 'PHP'),
      technology(9206, 'javascript', 'JavaScript'),
      technology(9207, 'rest-api', 'REST API')
    ],
    relatedServices: [
      serviceRelation(9004, 'seo', 'SEO'),
      serviceRelation(9007, 'branding-e-comunicazione', 'Branding e comunicazione'),
      serviceRelation(9008, 'content-production', 'Content production'),
      serviceRelation(9002, 'ecommerce', 'Ecommerce'),
      serviceRelation(9003, 'software-e-integrazioni', 'Software e integrazioni')
    ],
    seo: {
      title: 'Siti web aziendali',
      description:
        'Siti web aziendali progettati da Netmarket a Padova con UX, contenuti, WordPress/headless, SEO tecnica, performance e integrazioni.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'WordPress quando serve autonomia editoriale',
        description:
          'Per siti aziendali, pagine servizio, news e contenuti ricorrenti, WordPress resta una base solida se il modello dati è ordinato.'
      },
      {
        title: 'Headless quando il frontend deve correre',
        description:
          'Astro e API sono utili quando performance, controllo del codice, SEO statica e componenti riutilizzabili diventano parte del valore.'
      },
      {
        title: 'Performance come requisito commerciale',
        description:
          'Velocità, stabilità visuale, accessibilità e leggibilità aiutano utenti, motori di ricerca e campagne a lavorare sulla stessa pagina.'
      }
    ]
  },
  ecommerce: {
    subtitle: 'Ecommerce pensati come sistema di vendita, non solo come catalogo online.',
    shortDescription:
      'Progettiamo ecommerce e cataloghi digitali collegando UX, schede prodotto, checkout, contenuti, tracking e gestione operativa.',
    excerpt:
      'Un ecommerce funziona quando piattaforma, catalogo, fiducia, marketing e operatività restano allineati. Per questo partiamo da prodotti, processi e obiettivi prima di scegliere layout e funzionalità.',
    valueProps: [
      {
        title: 'Catalogo leggibile e governabile',
        description:
          'Categorie, varianti, schede prodotto e contenuti vengono organizzati per aiutare acquisto, aggiornamento e gestione interna.'
      },
      {
        title: 'Percorso di acquisto senza frizioni inutili',
        description:
          'Ricerca, scheda prodotto, carrello, checkout e segnali di fiducia vengono progettati come un unico flusso.'
      },
      {
        title: 'Marketing collegato alla piattaforma',
        description:
          'SEO, campagne, tracciamenti, promozioni e contenuti devono portare traffico verso pagine pronte a convertire.'
      },
      {
        title: 'Evoluzione dopo il lancio',
        description:
          'Uno store va letto nel tempo: categorie, contenuti, mobile, conversioni e dati guidano gli interventi successivi.'
      }
    ],
    problems: [
      {
        title: 'Il catalogo cresce ma diventa difficile da leggere',
        description:
          'Mettiamo ordine tra categorie, varianti, filtri, informazioni prodotto e priorità commerciali.'
      },
      {
        title: 'Il traffico arriva ma non compra',
        description:
          'Analizziamo dove si interrompe il percorso: contenuto, fiducia, mobile, checkout, tracciamento o offerta.'
      },
      {
        title: 'Gestione interna e sito non parlano',
        description:
          'Quando serve, integriamo ecommerce e strumenti operativi per ridurre lavoro manuale e incoerenze.'
      },
      {
        title: 'Le campagne non hanno una base solida',
        description:
          'Landing, prodotto, tracking e creatività devono essere coerenti prima di aumentare budget e pressione media.'
      }
    ],
    process: [
      {
        title: 'Catalogo e business',
        description:
          'Mappiamo prodotti, margini, varianti, regole commerciali, mercati e gestione quotidiana.'
      },
      {
        title: 'UX e contenuti prodotto',
        description:
          'Disegniamo categorie, schede, percorsi mobile, rassicurazioni e contenuti necessari alla scelta.'
      },
      {
        title: 'Sviluppo piattaforma',
        description:
          'Costruiamo lo store, il CMS, le integrazioni essenziali, i pagamenti e il tracciamento.'
      },
      {
        title: 'Lancio e ottimizzazione',
        description:
          'Verifichiamo SEO, performance, analytics, conversioni e interventi iterativi post pubblicazione.'
      }
    ],
    results: [
      {
        label: 'Proof ecommerce',
        value: '+3M',
        context: 'Fatturato ecommerce 2025 dichiarato nel caso studio Pazzo Design.'
      },
      {
        label: 'Ordine medio',
        value: '€360',
        context: 'Valore medio ordine riportato nel caso studio Pazzo Design.'
      },
      {
        label: 'Traffico 2025',
        value: '+1,2M',
        context: 'Utenti attivi 2025 dichiarati nel caso studio Pazzo Design.'
      }
    ],
    faq: [
      {
        question: 'Quando ha senso aprire o rifare un ecommerce?',
        answer:
          'Quando catalogo, domanda, margini e gestione interna permettono di sostenere vendita, contenuti, assistenza e marketing nel tempo. Non basta mettere online i prodotti.'
      },
      {
        question: 'Realizzate ecommerce con WooCommerce?',
        answer:
          'Sì, WooCommerce è una delle tecnologie pertinenti quando il progetto richiede WordPress, gestione contenuti e uno store flessibile. La scelta dipende da catalogo, integrazioni e obiettivi.'
      },
      {
        question: 'Potete collegare ecommerce e gestionale?',
        answer:
          'Quando il perimetro tecnico lo richiede, valutiamo integrazioni con strumenti gestionali, flussi dati, cataloghi e processi operativi per ridurre passaggi manuali.'
      },
      {
        question: 'Seguite anche marketing e campagne dopo il lancio?',
        answer:
          'Sì, se rientra nel progetto. Ecommerce, SEO, advertising, contenuti e tracking devono lavorare insieme per capire cosa porta vendite e cosa va migliorato.'
      }
    ],
    capabilities: [
      capability(9301, 'catalogo-ecommerce', 'Architettura catalogo'),
      capability(9302, 'ux-checkout', 'UX checkout'),
      capability(9303, 'schede-prodotto', 'Schede prodotto'),
      capability(9304, 'tracking-ecommerce', 'Tracking ecommerce'),
      capability(9305, 'seo-ecommerce', 'SEO ecommerce'),
      capability(9306, 'ottimizzazione-conversione', 'Ottimizzazione conversione')
    ],
    technologies: [
      technology(9401, 'woocommerce', 'WooCommerce'),
      technology(9402, 'wordpress', 'WordPress'),
      technology(9403, 'analytics', 'Analytics'),
      technology(9404, 'search-console', 'Search Console'),
      technology(9405, 'payment-gateway', 'Gateway di pagamento')
    ],
    relatedServices: [
      serviceRelation(9004, 'seo', 'SEO'),
      serviceRelation(9005, 'advertising', 'Advertising'),
      serviceRelation(9003, 'software-e-integrazioni', 'Software e integrazioni'),
      serviceRelation(9008, 'content-production', 'Content production')
    ],
    seo: {
      title: 'Ecommerce e cataloghi digitali',
      description:
        'Ecommerce e cataloghi digitali progettati da Netmarket con UX, WooCommerce, contenuti, tracking, SEO e gestione operativa.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'Catalogo prima della piattaforma',
        description:
          'Categorie, varianti e regole commerciali orientano tecnologia, template e gestione quotidiana dello store.'
      },
      {
        title: 'Checkout e fiducia come parti del contenuto',
        description:
          'Policy, contatti, spedizioni, pagamenti e microcopy aiutano l’utente a completare l’acquisto.'
      },
      {
        title: 'Dati leggibili dopo il lancio',
        description:
          'Tracking e analytics servono a distinguere traffico, interesse, carrello e vendita, senza leggere tutto come una metrica unica.'
      }
    ]
  },
  'software-e-integrazioni': {
    subtitle: 'Software, CRM e integrazioni costruiti attorno ai processi reali.',
    shortDescription:
      'Sviluppiamo strumenti digitali, CRM, app, automazioni e integrazioni quando sito, dati e operatività devono lavorare insieme.',
    excerpt:
      'Non trasformiamo ogni esigenza in una piattaforma. Prima capiamo flussi, persone, dati e vincoli; poi progettiamo lo strumento minimo e stabile per ridurre lavoro manuale e dispersione.',
    valueProps: [
      {
        title: 'Flussi prima delle feature',
        description:
          'Mappiamo chi usa lo strumento, quali dati servono e quali passaggi devono diventare più semplici.'
      },
      {
        title: 'Integrazioni dove servono davvero',
        description:
          'API, gestionali, ecommerce, CRM e fonti dati vengono collegati solo quando il beneficio operativo è chiaro.'
      },
      {
        title: 'Interfacce per lavorare meglio',
        description:
          'Dashboard, pannelli e form devono aiutare persone reali, non aggiungere un altro luogo da controllare.'
      },
      {
        title: 'Manutenzione leggibile',
        description:
          'Un software utile deve poter evolvere: codice, ruoli e responsabilità restano comprensibili nel tempo.'
      }
    ],
    problems: [
      {
        title: 'Dati copiati a mano tra strumenti',
        description:
          'Riduciamo passaggi ripetitivi e incoerenze collegando fonti, form, gestionali e dashboard.'
      },
      {
        title: 'Processi commerciali poco tracciabili',
        description:
          'CRM, pipeline e automazioni aiutano a capire stato dei lead, follow-up e responsabilità.'
      },
      {
        title: 'Software esistenti che non si parlano',
        description:
          'Valutiamo integrazioni progressive, evitando rifacimenti totali quando basta far dialogare ciò che esiste.'
      },
      {
        title: 'Strumenti troppo complessi per il team',
        description:
          'Progettiamo interfacce essenziali, ruoli chiari e dati ordinati per facilitare adozione e supporto.'
      }
    ],
    process: [
      {
        title: 'Mappa operativa',
        description:
          'Analizziamo persone, strumenti, dati, eccezioni, autorizzazioni e punti di attrito.'
      },
      {
        title: 'Priorità e prototipo',
        description:
          'Definiamo cosa serve subito, cosa può aspettare e come validare il flusso prima dello sviluppo completo.'
      },
      {
        title: 'Sviluppo e integrazione',
        description:
          'Costruiamo componenti, API, dashboard e collegamenti mantenendo controllo su sicurezza e manutenzione.'
      },
      {
        title: 'Passaggio operativo',
        description:
          'Testiamo, documentiamo, formiamo il team e gestiamo evoluzioni o supporto quando previsto.'
      }
    ],
    results: [
      {
        label: 'Loyalty Sirene Blu',
        value: '100mila',
        context: 'Utenti registrati al programma fedeltà riportati nel caso studio Sirene Blu.'
      },
      {
        label: 'Ambito',
        value: 'app + casse',
        context: 'App mobile, carta fedeltà, anagrafica e integrazione con gestionale casse.'
      },
      {
        label: 'Proof CRM',
        value: 'VENITALY',
        context: 'Caso studio CRM custom, manutenzione e supporto applicativo.'
      }
    ],
    faq: [
      {
        question: 'Quando serve un software custom invece di uno strumento già pronto?',
        answer:
          'Quando i processi, i dati o le integrazioni sono centrali e gli strumenti standard creano più lavoro di quello che risolvono.'
      },
      {
        question: 'Potete integrare strumenti già esistenti?',
        answer:
          'Sì, quando esistono API, export, database o flussi tecnicamente gestibili. Prima verifichiamo vincoli, sicurezza e qualità dei dati.'
      },
      {
        question: 'Sviluppate anche CRM?',
        answer:
          'Sì, se il progetto richiede gestione lead, pipeline, task, comunicazioni o dati commerciali ordinati attorno al lavoro del team.'
      },
      {
        question: 'Come si evita di creare un software troppo complesso?',
        answer:
          'Partendo dai flussi essenziali, validando priorità e costruendo per iterazioni. Non ogni richiesta deve diventare una feature.'
      }
    ],
    capabilities: [
      capability(9501, 'crm-custom', 'CRM custom'),
      capability(9502, 'integrazioni-api', 'Integrazioni API'),
      capability(9503, 'automazioni', 'Automazioni'),
      capability(9504, 'dashboard-operative', 'Dashboard operative'),
      capability(9505, 'app-mobile', 'App mobile'),
      capability(9506, 'data-flow', 'Flussi dati')
    ],
    technologies: [
      technology(9601, 'rest-api', 'REST API'),
      technology(9602, 'php', 'PHP'),
      technology(9603, 'typescript', 'TypeScript'),
      technology(9604, 'javascript', 'JavaScript'),
      technology(9605, 'wordpress', 'WordPress')
    ],
    relatedServices: [
      serviceRelation(9002, 'ecommerce', 'Ecommerce'),
      serviceRelation(9001, 'siti-web', 'Siti web'),
      serviceRelation(9005, 'advertising', 'Advertising'),
      serviceRelation(9009, 'concorsi-a-premi', 'Concorsi a premi')
    ],
    seo: {
      title: 'Software custom, CRM e integrazioni',
      description:
        'Software custom, CRM, app e integrazioni per collegare processi, dati, ecommerce e strumenti operativi aziendali.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'API e dati come fondazione',
        description:
          'Un’integrazione funziona quando sorgenti, responsabilità e regole del dato sono chiare prima del codice.'
      },
      {
        title: 'CRM come processo, non rubrica',
        description:
          'Pipeline, task e stati devono riflettere il modo in cui il team commerciale lavora davvero.'
      },
      {
        title: 'Automazioni controllabili',
        description:
          'Ogni automatismo deve essere monitorabile, spiegabile e reversibile quando entra in processi aziendali critici.'
      }
    ]
  },
  seo: {
    subtitle: 'SEO tecnica e contenuti per rendere il sito più chiaro a persone e motori di ricerca.',
    shortDescription:
      'Lavoriamo su architettura, contenuti, performance, metadata, Search Console e migrazioni per migliorare la qualità organica del sito.',
    excerpt:
      'La SEO non è una promessa di posizione. È un lavoro continuo su struttura, pagine, segnali tecnici e contenuti utili, così il sito diventa più comprensibile e più governabile.',
    valueProps: [
      {
        title: 'Audit prima delle attività',
        description:
          'Analizziamo struttura, indicizzazione, contenuti, performance e query per capire dove intervenire.'
      },
      {
        title: 'Contenuti con un ruolo preciso',
        description:
          'Ogni pagina deve rispondere a un intento, sostenere internal link e non cannibalizzare altre sezioni.'
      },
      {
        title: 'SEO integrata a web e marketing',
        description:
          'Le decisioni SEO hanno effetto su sito, campagne, copy, analytics e priorità editoriali.'
      },
      {
        title: 'Migrazioni con controllo',
        description:
          'Quando un sito cambia, inventariamo URL, metadata, redirect candidate e contenuti da preservare.'
      }
    ],
    problems: [
      {
        title: 'Pagine indicizzate ma poco utili',
        description:
          'Riorganizziamo contenuti e gerarchie per ridurre rumore, duplicazioni e pagine senza funzione.'
      },
      {
        title: 'Traffico che non sostiene il business',
        description:
          'Le query vengono lette in base a intenti, servizi, prove e possibilità di conversione.'
      },
      {
        title: 'Rifacimenti che perdono visibilità',
        description:
          'La migrazione va preparata prima del lancio con mapping, canonical, sitemap e controlli.'
      },
      {
        title: 'Decisioni basate su sensazioni',
        description:
          'Search Console, analytics e dati tecnici aiutano a ordinare priorità e verificare effetti.'
      }
    ],
    process: [
      {
        title: 'Audit tecnico-editoriale',
        description:
          'Verifichiamo crawling, indexability, struttura, performance, contenuti, metadata e dati disponibili.'
      },
      {
        title: 'Mappa intenti e pagine',
        description:
          'Definiamo quali pagine servono, quali vanno consolidate e quali relazioni interne costruire.'
      },
      {
        title: 'Ottimizzazione',
        description:
          'Interveniamo su template, heading, copy, media, schema, internal link e segnali tecnici.'
      },
      {
        title: 'Monitoraggio',
        description:
          'Leggiamo query, copertura, performance e conversioni per decidere gli interventi successivi.'
      }
    ],
    results: [
      {
        label: 'Proof',
        value: 'Albertini',
        context: 'Caso studio mappato a Siti web e SEO nella migrazione.'
      },
      {
        label: 'Metodo',
        value: 'audit + contenuti',
        context: 'Approccio coerente con pagine legacy e sistema servizi.'
      },
      {
        label: 'Migrazione',
        value: 'URL map',
        context: 'Il progetto usa inventari, sitemap e redirect candidate per evitare perdita di controllo.'
      }
    ],
    faq: [
      {
        question: 'Potete garantire la prima posizione su Google?',
        answer:
          'No. Nessuna attività SEO seria può garantire una posizione. Possiamo però migliorare struttura, contenuti, performance e misurazione per aumentare qualità e probabilità di visibilità.'
      },
      {
        question: 'Da dove parte un progetto SEO?',
        answer:
          'Da un audit del sito, delle query, dei contenuti e dei vincoli tecnici. Solo dopo ha senso definire priorità operative.'
      },
      {
        question: 'La SEO serve anche durante il rifacimento del sito?',
        answer:
          'Sì. È uno dei momenti più delicati: URL, redirect, contenuti, metadata, canonical e sitemap vanno gestiti prima della pubblicazione.'
      },
      {
        question: 'Scrivete anche contenuti SEO?',
        answer:
          'Sì, quando il piano lo richiede. I contenuti vengono progettati per rispondere a intenti reali e collegarsi al resto del sito.'
      }
    ],
    capabilities: [
      capability(9701, 'audit-seo', 'Audit SEO'),
      capability(9702, 'seo-tecnica', 'SEO tecnica'),
      capability(9703, 'seo-on-page', 'SEO on-page'),
      capability(9704, 'content-strategy', 'Content strategy'),
      capability(9705, 'internal-linking', 'Internal linking'),
      capability(9706, 'migrazione-seo', 'Migrazione SEO')
    ],
    technologies: [
      technology(9801, 'search-console', 'Search Console'),
      technology(9802, 'analytics', 'Analytics'),
      technology(9803, 'structured-data', 'Structured data'),
      technology(9804, 'core-web-vitals', 'Core Web Vitals')
    ],
    relatedServices: [
      serviceRelation(9001, 'siti-web', 'Siti web'),
      serviceRelation(9008, 'content-production', 'Content production'),
      serviceRelation(9002, 'ecommerce', 'Ecommerce'),
      serviceRelation(9005, 'advertising', 'Advertising')
    ],
    seo: {
      title: 'SEO tecnica e contenuti',
      description:
        'SEO tecnica, audit, contenuti, performance e migrazioni per rendere il sito più chiaro, trovabile e misurabile.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'Indexability e struttura',
        description:
          'Prima di scrivere nuove pagine, verifichiamo cosa viene scansionato, indicizzato e collegato.'
      },
      {
        title: 'Schema e breadcrumb coerenti',
        description:
          'I dati strutturati aiutano a descrivere entità, relazioni e gerarchie senza aggiungere keyword inutili.'
      },
      {
        title: 'Search Console come controllo continuo',
        description:
          'Query, copertura e performance aiutano a distinguere problemi tecnici, opportunità editoriali e contenuti deboli.'
      }
    ]
  },
  advertising: {
    subtitle: 'Campagne pubblicitarie collegate a messaggi, landing e dati.',
    shortDescription:
      'Gestiamo advertising digitale e pubblicità tradizionale coordinando obiettivi, creatività, media, tracciamento e pagine di destinazione.',
    excerpt:
      'La campagna non è solo budget. Funziona quando offerta, pubblico, messaggio, canale e pagina di arrivo sono coerenti e misurabili.',
    valueProps: [
      {
        title: 'Obiettivo prima del canale',
        description:
          'Lead, vendite, traffico, awareness e promozioni richiedono scelte diverse di messaggio, pubblico e misurazione.'
      },
      {
        title: 'Creatività pensata per il contesto',
        description:
          'Asset, copy e formati vengono collegati al canale, alla landing e alla promessa commerciale.'
      },
      {
        title: 'Tracking leggibile',
        description:
          'Eventi, conversioni e analytics servono a capire quali attività generano valore e dove intervenire.'
      },
      {
        title: 'Digitale e offline nello stesso piano',
        description:
          'Quando serve, campagne radio, materiali e iniziative promozionali dialogano con sito e canali digitali.'
      }
    ],
    problems: [
      {
        title: 'Budget distribuito senza priorità',
        description:
          'Definiamo canali e investimenti in base a obiettivi, target, pagine disponibili e capacità di gestione lead.'
      },
      {
        title: 'Annunci scollegati dalla landing',
        description:
          'Allineiamo promessa, contenuto, form e percorso per non disperdere traffico qualificato.'
      },
      {
        title: 'Conversioni difficili da leggere',
        description:
          'Il tracciamento viene impostato per distinguere contatti, vendite, micro-conversioni e qualità del traffico.'
      },
      {
        title: 'Campagne una tantum senza apprendimento',
        description:
          'Ogni attivazione deve lasciare dati utili per migliorare creatività, pubblico e offerta.'
      }
    ],
    process: [
      {
        title: 'Scenario e obiettivi',
        description:
          'Chiarimento di pubblico, proposta, budget, canali, tempi e pagina di destinazione.'
      },
      {
        title: 'Creatività e landing',
        description:
          'Produciamo messaggi, asset e pagine coerenti con l’azione richiesta all’utente.'
      },
      {
        title: 'Setup e tracciamento',
        description:
          'Configuriamo campagne, eventi, conversioni e controlli prima della pubblicazione.'
      },
      {
        title: 'Lettura e ottimizzazione',
        description:
          'Monitoriamo andamento, qualità dei contatti e segnali di conversione per correggere il piano.'
      }
    ],
    results: [
      {
        label: 'Canali',
        value: 'online + offline',
        context: 'Le fonti legacy citano campagne digitali, radio, stampa e pianificazione media.'
      },
      {
        label: 'Proof BRB',
        value: 'ecosistema',
        context: 'Caso studio legato a ecommerce, sito e strategia social/SEO.'
      },
      {
        label: 'Approccio',
        value: 'landing + dati',
        context: 'Advertising collegato a creatività, destinazioni e tracciamenti.'
      }
    ],
    faq: [
      {
        question: 'Gestite Google Ads e campagne social?',
        answer:
          'Le fonti Netmarket descrivono campagne digitali e social advertising. La scelta delle piattaforme va definita in base a obiettivo, pubblico e tracciamento disponibile.'
      },
      {
        question: 'Serve una landing page dedicata?',
        answer:
          'Spesso sì. Una campagna performa meglio quando la pagina riprende promessa, contenuto e azione richiesta, invece di mandare tutto alla home.'
      },
      {
        question: 'Come si misura una campagna?',
        answer:
          'Con eventi e conversioni coerenti: contatti, vendite, richieste, iscrizioni o altre azioni utili. Le metriche vanno lette rispetto all’obiettivo.'
      },
      {
        question: 'Fate anche pubblicità tradizionale?',
        answer:
          'Sì, le fonti Netmarket citano campagne radio, stampa, materiali promozionali e pianificazione media come parte della comunicazione integrata.'
      }
    ],
    capabilities: [
      capability(9901, 'media-planning', 'Media planning'),
      capability(9902, 'landing-campaign', 'Landing campaign'),
      capability(9903, 'conversion-tracking', 'Conversion tracking'),
      capability(9904, 'creative-ads', 'Creatività advertising'),
      capability(9905, 'lead-generation', 'Lead generation'),
      capability(9906, 'offline-advertising', 'Pubblicità tradizionale')
    ],
    technologies: [
      technology(10001, 'google-ads', 'Google Ads'),
      technology(10002, 'meta-ads', 'Meta Ads'),
      technology(10003, 'analytics', 'Analytics'),
      technology(10004, 'tag-manager', 'Tag Manager')
    ],
    relatedServices: [
      serviceRelation(9008, 'content-production', 'Content production'),
      serviceRelation(9001, 'siti-web', 'Siti web'),
      serviceRelation(9002, 'ecommerce', 'Ecommerce'),
      serviceRelation(9006, 'social-media', 'Social media')
    ],
    seo: {
      title: 'Advertising digitale e pubblicità',
      description:
        'Advertising digitale, campagne social, landing, creatività, tracking e pubblicità tradizionale coordinati con il marketing.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'Conversioni prima dei report',
        description:
          'Senza eventi coerenti, la campagna produce numeri ma non decisioni utili.'
      },
      {
        title: 'Landing come parte della campagna',
        description:
          'La pagina di destinazione deve mantenere la promessa dell’annuncio e ridurre attriti nel contatto.'
      },
      {
        title: 'Creatività misurabile',
        description:
          'Formati e messaggi vanno testati con obiettivi chiari, non valutati solo a gusto.'
      }
    ]
  },
  'social-media': {
    subtitle: 'Social media con direzione editoriale, contenuti e continuità.',
    shortDescription:
      'Gestiamo canali social, piani editoriali, contenuti e campagne per rendere riconoscibile l’azienda nel tempo.',
    excerpt:
      'Una presenza social utile non vive di uscite casuali. Ha un ruolo nel marketing, un tono coerente, format sostenibili e una lettura dei risultati.',
    valueProps: [
      {
        title: 'Piano editoriale sostenibile',
        description:
          'Rubriche, frequenze e contenuti vengono costruiti attorno a obiettivi e risorse reali.'
      },
      {
        title: 'Tono coerente con il brand',
        description:
          'Testi, visual e format devono sembrare parte della stessa azienda, non contenuti isolati.'
      },
      {
        title: 'Produzione collegata ai canali',
        description:
          'Foto, video, grafiche e copy vengono adattati a piattaforme, formati e campagne.'
      },
      {
        title: 'Dati per migliorare la rotta',
        description:
          'Performance e interazioni aiutano a capire cosa ripetere, cosa cambiare e cosa smettere.'
      }
    ],
    problems: [
      {
        title: 'Post pubblicati senza direzione',
        description:
          'Definiamo priorità, format e messaggi prima di riempire il calendario.'
      },
      {
        title: 'Social separati da sito e campagne',
        description:
          'Colleghiamo contenuti social a pagine, promozioni, advertising e obiettivi commerciali.'
      },
      {
        title: 'Tono diverso a ogni uscita',
        description:
          'Costruiamo linee editoriali e visuali per mantenere riconoscibilità e coerenza.'
      },
      {
        title: 'Report difficili da interpretare',
        description:
          'Le metriche vengono lette in base al ruolo del canale: relazione, traffico, lead, promozione o reputazione.'
      }
    ],
    process: [
      {
        title: 'Direzione editoriale',
        description:
          'Chiarimento di pubblico, messaggi, ruolo dei canali e priorità di comunicazione.'
      },
      {
        title: 'Format e calendario',
        description:
          'Definiamo rubriche, frequenze, contenuti ricorrenti e momenti commerciali.'
      },
      {
        title: 'Produzione e pubblicazione',
        description:
          'Prepariamo copy, visual, adattamenti e contenuti coerenti con brand e piattaforma.'
      },
      {
        title: 'Analisi e miglioramento',
        description:
          'Leggiamo risultati e feedback per ottimizzare piano editoriale e campagne.'
      }
    ],
    results: [
      {
        label: 'Proof BRB',
        value: 'social + SEO',
        context: 'Portfolio legacy cita strategia social e SEO per BRB.'
      },
      {
        label: 'Canali',
        value: 'Meta + LinkedIn',
        context: 'Le fonti legacy citano Facebook, Instagram e LinkedIn nella gestione social.'
      },
      {
        label: 'Metodo',
        value: 'piano + contenuti',
        context: 'La pagina social legacy cita gestione, pubblicità e creazione contenuti.'
      }
    ],
    faq: [
      {
        question: 'Vi occupate solo della pubblicazione dei post?',
        answer:
          'No. La pubblicazione è una parte del lavoro: prima servono direzione editoriale, format, contenuti, obiettivi e lettura dei risultati.'
      },
      {
        question: 'Quali canali social gestite?',
        answer:
          'Le fonti legacy Netmarket citano Facebook, Instagram e LinkedIn. I canali effettivi vanno scelti in base a pubblico e obiettivo.'
      },
      {
        question: 'Create anche i contenuti?',
        answer:
          'Sì, quando il progetto lo prevede: copy, grafiche, foto, video e adattamenti per formati social e campagne.'
      },
      {
        question: 'Quanto tempo serve per vedere risultati?',
        answer:
          'Dipende da stato dei canali, frequenza, contenuti, investimento e obiettivi. I social richiedono continuità, non singole uscite scollegate.'
      }
    ],
    capabilities: [
      capability(10101, 'piano-editoriale', 'Piano editoriale'),
      capability(10102, 'social-copywriting', 'Social copywriting'),
      capability(10103, 'content-creation', 'Content creation'),
      capability(10104, 'community-management', 'Community management'),
      capability(10105, 'social-ads', 'Social ads'),
      capability(10106, 'reporting-social', 'Reporting social')
    ],
    technologies: [
      technology(10201, 'instagram', 'Instagram'),
      technology(10202, 'facebook', 'Facebook'),
      technology(10203, 'linkedin', 'LinkedIn'),
      technology(10204, 'meta-ads', 'Meta Ads')
    ],
    relatedServices: [
      serviceRelation(9008, 'content-production', 'Content production'),
      serviceRelation(9005, 'advertising', 'Advertising'),
      serviceRelation(9007, 'branding-e-comunicazione', 'Branding e comunicazione'),
      serviceRelation(9001, 'siti-web', 'Siti web')
    ],
    seo: {
      title: 'Social media management',
      description:
        'Social media management con strategia, piano editoriale, contenuti, campagne e reporting per aziende e PMI.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'Format riutilizzabili',
        description:
          'Rubriche e template aiutano a mantenere continuità senza ripartire da zero a ogni pubblicazione.'
      },
      {
        title: 'Canali con ruoli diversi',
        description:
          'Instagram, Facebook e LinkedIn non devono dire sempre la stessa cosa nello stesso modo.'
      },
      {
        title: 'Metriche lette con contesto',
        description:
          'Reach, interazioni, click e lead hanno valore solo se collegati al ruolo del canale.'
      }
    ]
  },
  'branding-e-comunicazione': {
    subtitle: 'Identità, messaggi e materiali per rendere l’azienda riconoscibile.',
    shortDescription:
      'Lavoriamo su branding, comunicazione, immagine coordinata, copy, materiali e campagne online e offline.',
    excerpt:
      'La comunicazione non è solo un logo. È il modo in cui un’azienda si presenta, spiega il proprio valore e resta coerente tra sito, social, materiali, campagne e relazione commerciale.',
    valueProps: [
      {
        title: 'Posizionamento leggibile',
        description:
          'Prima dei materiali, serve capire cosa rende l’azienda riconoscibile e a chi deve parlare.'
      },
      {
        title: 'Sistema visivo coordinato',
        description:
          'Logo, palette, tipografia, layout e materiali devono costruire continuità tra canali.'
      },
      {
        title: 'Messaggi che aiutano il business',
        description:
          'Copy, payoff, claim e contenuti commerciali devono chiarire valore, differenze e prossimi passi.'
      },
      {
        title: 'Online e offline coerenti',
        description:
          'La stessa identità deve funzionare su sito, social, packaging, brochure, radio, eventi e campagne.'
      }
    ],
    problems: [
      {
        title: 'Materiali che sembrano di aziende diverse',
        description:
          'Riorganizziamo regole visuali, copy e applicazioni per dare riconoscibilità al brand.'
      },
      {
        title: 'Il valore non è chiaro',
        description:
          'Lavoriamo su messaggi, gerarchie e tono per spiegare meglio cosa fa l’azienda e perché sceglierla.'
      },
      {
        title: 'Campagne e sito non parlano la stessa lingua',
        description:
          'Allineiamo comunicazione commerciale, contenuti digitali e materiali offline.'
      },
      {
        title: 'Il brand deve evolvere senza perdere memoria',
        description:
          'Un restyling deve valorizzare ciò che funziona già e rendere più chiaro ciò che oggi confonde.'
      }
    ],
    process: [
      {
        title: 'Analisi identitaria',
        description:
          'Raccogliamo storia, mercato, pubblici, materiali esistenti, tono e differenze reali.'
      },
      {
        title: 'Direzione creativa',
        description:
          'Definiamo territorio visivo, messaggi, criteri e applicazioni prioritarie.'
      },
      {
        title: 'Sistema e materiali',
        description:
          'Produciamo asset, linee guida, copy e formati per sito, social, stampa o campagne.'
      },
      {
        title: 'Applicazione sui canali',
        description:
          'Portiamo il sistema nei punti di contatto che servono davvero al progetto.'
      }
    ],
    results: [
      {
        label: 'Esperienza',
        value: 'dal 1986',
        context: 'Netmarket nasce come agenzia di comunicazione tradizionale e integra poi il digitale.'
      },
      {
        label: 'Proof legacy',
        value: 'Pazzo + Thais',
        context: 'Portfolio legacy cita branding per Pazzo Design e sviluppo brand Thais.'
      },
      {
        label: 'Sistema',
        value: 'online + offline',
        context: 'Le fonti Netmarket descrivono comunicazione integrata digitale e tradizionale.'
      }
    ],
    faq: [
      {
        question: 'Branding significa solo creare un logo?',
        answer:
          'No. Il logo è una parte del sistema. Branding significa definire identità, messaggi, tono, regole visuali e applicazioni coerenti.'
      },
      {
        question: 'Potete lavorare su materiali già esistenti?',
        answer:
          'Sì. Partiamo da ciò che l’azienda usa già per capire cosa preservare, cosa ordinare e cosa aggiornare.'
      },
      {
        question: 'Create anche materiali offline?',
        answer:
          'Sì, le fonti Netmarket citano immagine coordinata, packaging, stampa, campagne e materiali promozionali.'
      },
      {
        question: 'Come si collega il branding al sito?',
        answer:
          'Il sito traduce identità e messaggi in contenuti, layout, gerarchie e percorsi. Per questo branding e web dovrebbero dialogare fin dall’inizio.'
      }
    ],
    capabilities: [
      capability(10301, 'brand-identity', 'Brand identity'),
      capability(10302, 'immagine-coordinata', 'Immagine coordinata'),
      capability(10303, 'copywriting', 'Copywriting'),
      capability(10304, 'graphic-design', 'Graphic design'),
      capability(10305, 'packaging', 'Packaging'),
      capability(10306, 'art-direction', 'Art direction')
    ],
    technologies: [],
    relatedServices: [
      serviceRelation(9008, 'content-production', 'Content production'),
      serviceRelation(9006, 'social-media', 'Social media'),
      serviceRelation(9001, 'siti-web', 'Siti web'),
      serviceRelation(9005, 'advertising', 'Advertising')
    ],
    seo: {
      title: 'Brand identity e comunicazione coordinata',
      description:
        'Branding, comunicazione, immagine coordinata, copy e materiali online/offline per rendere l’azienda riconoscibile.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'Regole che aiutano a produrre',
        description:
          'Un’identità utile non resta in una presentazione: deve velocizzare materiali, pagine e campagne.'
      },
      {
        title: 'Messaggi prima dei formati',
        description:
          'Il canale cambia, ma il nucleo del messaggio deve restare comprensibile e coerente.'
      },
      {
        title: 'Coerenza senza rigidità',
        description:
          'Il sistema deve mantenere riconoscibilità anche quando passa da digitale a stampa, social o advertising.'
      }
    ]
  },
  'content-production': {
    subtitle: 'Contenuti visivi e testuali pensati per essere usati davvero.',
    shortDescription:
      'Produciamo foto, video, copy, visual e asset per siti, social, campagne, ecommerce e materiali commerciali.',
    excerpt:
      'La produzione contenuti diventa efficace quando nasce da un piano: cosa deve spiegare, dove sarà usata, quali formati servono e come può essere riutilizzata.',
    valueProps: [
      {
        title: 'Produzione guidata dalla strategia',
        description:
          'Prima di scattare, scrivere o montare definiamo obiettivi, canali, formati e messaggi.'
      },
      {
        title: 'Asset riutilizzabili',
        description:
          'Un contenuto può alimentare sito, social, schede prodotto, campagne, presentazioni e materiali commerciali.'
      },
      {
        title: 'Coerenza con brand e canali',
        description:
          'Visual, tono e formato vengono adattati senza perdere riconoscibilità.'
      },
      {
        title: 'Dalla produzione alla pubblicazione',
        description:
          'I contenuti vengono pensati per entrare concretamente in pagine, campagne e calendari editoriali.'
      }
    ],
    problems: [
      {
        title: 'Mancano immagini e testi utilizzabili',
        description:
          'Costruiamo librerie di contenuti che evitano soluzioni improvvisate o visual generici.'
      },
      {
        title: 'Ogni canale richiede un formato diverso',
        description:
          'Pianifichiamo adattamenti per sito, social, advertising, ecommerce e materiali commerciali.'
      },
      {
        title: 'I contenuti non spiegano il valore',
        description:
          'Copy, foto e video devono aiutare scelta, fiducia e comprensione, non solo riempire spazi.'
      },
      {
        title: 'Produzione scollegata dal calendario',
        description:
          'Organizziamo priorità e riuso in modo che gli asset sostengano campagne e aggiornamenti.'
      }
    ],
    process: [
      {
        title: 'Piano contenuti',
        description:
          'Definiamo messaggi, soggetti, formati, canali e materiali da produrre.'
      },
      {
        title: 'Produzione',
        description:
          'Realizziamo testi, visual, shooting, video o asset grafici in base al progetto.'
      },
      {
        title: 'Adattamento',
        description:
          'Prepariamo varianti per pagine, social, advertising, ecommerce e presentazioni.'
      },
      {
        title: 'Organizzazione',
        description:
          'Gli asset entrano nel sistema editoriale e possono essere riutilizzati nel tempo.'
      }
    ],
    results: [
      {
        label: 'Proof Rigomar',
        value: 'sito + shooting',
        context: 'Caso studio mappato a Siti web e Content production.'
      },
      {
        label: 'Formati',
        value: 'foto + video + copy',
        context: 'Le fonti legacy comunicazione citano fotografia, video e multimedia.'
      },
      {
        label: 'Uso',
        value: 'multi-canale',
        context: 'Contenuti pensati per sito, social, campagne e materiali commerciali.'
      }
    ],
    faq: [
      {
        question: 'Realizzate shooting fotografici?',
        answer:
          'Sì, le fonti legacy e il caso Rigomar confermano attività di shooting fotografico collegate a progetti web e comunicazione.'
      },
      {
        question: 'Create anche video e contenuti multimediali?',
        answer:
          'Sì, la comunicazione legacy Netmarket include video e multimedia. Il formato viene scelto in base a canale e obiettivo.'
      },
      {
        question: 'I contenuti possono essere usati su più canali?',
        answer:
          'Sì. Il lavoro migliore nasce proprio pensando al riuso su sito, social, campagne, ecommerce e materiali commerciali.'
      },
      {
        question: 'Scrivete anche testi per sito e campagne?',
        answer:
          'Sì, quando il progetto lo prevede: copy, microcopy, testi editoriali, contenuti prodotto e adattamenti per canale.'
      }
    ],
    capabilities: [
      capability(10401, 'shooting-fotografico', 'Shooting fotografico'),
      capability(10402, 'video-production', 'Video production'),
      capability(10403, 'copywriting', 'Copywriting'),
      capability(10404, 'asset-social', 'Asset social'),
      capability(10405, 'creativita-adv', 'Creatività ADV'),
      capability(10406, 'contenuti-prodotto', 'Contenuti prodotto')
    ],
    technologies: [],
    relatedServices: [
      serviceRelation(9006, 'social-media', 'Social media'),
      serviceRelation(9007, 'branding-e-comunicazione', 'Branding e comunicazione'),
      serviceRelation(9005, 'advertising', 'Advertising'),
      serviceRelation(9001, 'siti-web', 'Siti web')
    ],
    seo: {
      title: 'Produzione contenuti per web e campagne',
      description:
        'Content production per siti, social, campagne ed ecommerce: foto, video, copy, visual e asset riutilizzabili.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'Brief e destinazioni',
        description:
          'Sapere dove finirà un contenuto cambia inquadrature, tagli, copy e priorità.'
      },
      {
        title: 'Libreria asset',
        description:
          'Una produzione ordinata genera materiali riutilizzabili, non solo consegne isolate.'
      },
      {
        title: 'Formati dal contenuto madre',
        description:
          'Da uno shooting o da una sessione video possono nascere varianti per sito, social, campagne e vendita.'
      }
    ]
  },
  'concorsi-a-premi': {
    subtitle: 'Concorsi a premi con regia strategica, tecnica e operativa.',
    shortDescription:
      'Progettiamo e gestiamo concorsi a premi integrando meccanica, comunicazione, piattaforme digitali, raccolta dati e coordinamento operativo.',
    excerpt:
      'Un concorso a premi non è solo un’idea promozionale. Richiede una meccanica chiara, strumenti affidabili, comunicazione coerente e attenzione agli aspetti operativi e normativi del progetto.',
    valueProps: [
      {
        title: 'Meccanica comprensibile',
        description:
          'Partecipazione, premi, canali e regole operative devono essere chiari per azienda e utenti.'
      },
      {
        title: 'Sviluppo digitale integrato',
        description:
          'Landing, form, caricamento documenti, verifica partecipazioni e dati vengono progettati attorno al flusso reale.'
      },
      {
        title: 'Comunicazione coordinata',
        description:
          'Concept, visual, materiali, social, advertising e punto vendita devono raccontare la stessa iniziativa.'
      },
      {
        title: 'Gestione responsabile',
        description:
          'Coordiniamo passaggi operativi e documentali senza trasformare la pagina in consulenza legale.'
      }
    ],
    problems: [
      {
        title: 'Troppe parti da coordinare',
        description:
          'Mettiamo insieme idea, materiali, piattaforma, dati, comunicazione e gestione operativa.'
      },
      {
        title: 'Partecipazione complicata',
        description:
          'Il flusso utente deve essere semplice, chiaro e adatto al contesto del concorso.'
      },
      {
        title: 'Dati e privacy da governare',
        description:
          'La raccolta partecipazioni richiede attenzione a moduli, consensi, gestione dati e strumenti.'
      },
      {
        title: 'Promozione scollegata dai canali',
        description:
          'Il concorso funziona meglio quando è integrato con sito, social, advertising e materiali offline.'
      }
    ],
    process: [
      {
        title: 'Obiettivo e meccanica',
        description:
          'Definiamo pubblico, premi, modalità di partecipazione, canali e vincoli del progetto.'
      },
      {
        title: 'Concept e materiali',
        description:
          'Costruiamo identità dell’iniziativa, copy, visual e materiali digitali o fisici.'
      },
      {
        title: 'Piattaforma e dati',
        description:
          'Sviluppiamo landing, form, tracciamenti e flussi di gestione partecipazioni quando necessari.'
      },
      {
        title: 'Coordinamento e supporto',
        description:
          'Accompagniamo lancio, gestione operativa, comunicazione e chiusura dell’iniziativa.'
      }
    ],
    results: [
      {
        label: 'Proof Sirene Blu',
        value: '2024',
        context: 'Caso studio dedicato a ideazione, sviluppo e gestione completa del concorso.'
      },
      {
        label: 'Ambito',
        value: 'concept + piattaforma',
        context: 'Il caso studio cita naming, identità, materiali e piattaforma web dedicata.'
      },
      {
        label: 'Integrazione',
        value: 'online + punto vendita',
        context: 'Il concorso è stato pensato per traffico nei punti vendita e partecipazione digitale.'
      }
    ],
    faq: [
      {
        question: 'Un concorso a premi può essere gestito online?',
        answer:
          'Sì. Le fonti Netmarket descrivono concorsi digitali con landing, form, caricamento scontrini e gestione partecipazioni.'
      },
      {
        question: 'Vi occupate anche degli aspetti normativi?',
        answer:
          'Netmarket coordina gli aspetti operativi e documentali del progetto. La pagina non sostituisce una consulenza legale: il perimetro va definito caso per caso.'
      },
      {
        question: 'Un concorso può essere collegato a social e advertising?',
        answer:
          'Sì, ed è spesso utile. Comunicazione, campagne, sito e materiali aiutano a rendere chiara l’iniziativa e aumentare partecipazione.'
      },
      {
        question: 'Quali meccaniche si possono usare?',
        answer:
          'Le fonti legacy citano concorsi online, instant win, estrazione finale e operazioni a premio. La scelta dipende da obiettivo, pubblico e vincoli.'
      }
    ],
    capabilities: [
      capability(10501, 'meccanica-concorso', 'Meccanica concorso'),
      capability(10502, 'landing-concorso', 'Landing concorso'),
      capability(10503, 'gestione-partecipazioni', 'Gestione partecipazioni'),
      capability(10504, 'concept-promozionale', 'Concept promozionale'),
      capability(10505, 'materiali-punto-vendita', 'Materiali punto vendita'),
      capability(10506, 'supporto-operativo', 'Supporto operativo')
    ],
    technologies: [
      technology(10601, 'form-web', 'Form web'),
      technology(10602, 'database', 'Database'),
      technology(10603, 'analytics', 'Analytics')
    ],
    relatedServices: [
      serviceRelation(9005, 'advertising', 'Advertising'),
      serviceRelation(9008, 'content-production', 'Content production'),
      serviceRelation(9003, 'software-e-integrazioni', 'Software e integrazioni'),
      serviceRelation(9006, 'social-media', 'Social media')
    ],
    seo: {
      title: 'Concorsi a premi digitali e promozionali',
      description:
        'Concorsi a premi con ideazione, meccanica, piattaforma digitale, comunicazione, dati e gestione operativa.',
      noindex: false
    },
    technicalFocus: [
      {
        title: 'Flusso partecipazione',
        description:
          'L’utente deve capire cosa fare, quali dati fornire e cosa succede dopo l’invio.'
      },
      {
        title: 'Dati e consensi',
        description:
          'Form e raccolta dati vanno progettati con attenzione tecnica e operativa, in base al perimetro del concorso.'
      },
      {
        title: 'Coordinamento multicanale',
        description:
          'Punto vendita, sito, social e campagne devono portare alla stessa meccanica senza messaggi contrastanti.'
      }
    ]
  }
};

export function applyServicePilot(service: Service): Service {
  const pilot = servicePilots[service.slug];
  if (!pilot) return service;
  return {
    ...service,
    ...pilot,
    seo: {
      ...service.seo,
      ...pilot.seo
    },
    image: service.image ?? pilot.image,
    hero: {
      ...service.hero,
      ...pilot.hero,
      image: service.hero?.image ?? service.image ?? pilot.hero?.image ?? pilot.image ?? null
    }
  };
}

export function serviceTechnicalFocus(service: Service): Array<{ title: string; description: string }> {
  return servicePilots[service.slug]?.technicalFocus ?? [];
}
