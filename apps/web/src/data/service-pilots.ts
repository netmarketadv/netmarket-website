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
