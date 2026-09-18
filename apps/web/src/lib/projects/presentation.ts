import type { CaseStudy, CaseStudyMedia, Metric } from '@netmarket/schemas';

export type ProjectTheme = 'blue' | 'dark' | 'energy' | 'retail' | 'warm' | 'neutral';

export interface ProjectStorySection {
  eyebrow: string;
  title: string;
  body: string;
}

export interface ProjectPresentation {
  heroTitle: string;
  intro: string;
  sector: string;
  projectType: string;
  theme: ProjectTheme;
  story: ProjectStorySection[];
  outcome?: string | undefined;
  metrics: Metric[];
  media: CaseStudyMedia[];
  topics: string[];
}

type EditorialProject = Omit<ProjectPresentation, 'media'> & {
  media?: Array<Partial<Omit<CaseStudyMedia, 'media'>>>;
};

const editorialProjects: Record<string, EditorialProject> = {
  'app-mobile-programma-fedelta-sirene-blu': {
    heroTitle: 'Una fidelity che collega app, negozi e dati.',
    intro:
      'Un ecosistema digitale per portare la carta fedeltà sempre con il cliente e collegare l’esperienza mobile all’operatività di oltre 70 punti vendita.',
    sector: 'Retail',
    projectType: 'App mobile e software custom',
    theme: 'retail',
    story: [
      {
        eyebrow: 'L’esigenza',
        title: 'Rendere la loyalty più accessibile e più utile.',
        body: 'Sirene Blu voleva trasformare il programma fedeltà in uno strumento digitale semplice per il cliente e realmente integrato con i processi dei punti vendita.'
      },
      {
        eyebrow: 'Il sistema',
        title: 'Carta, promozioni e negozi in un’unica esperienza.',
        body: 'Abbiamo sviluppato l’app e l’infrastruttura fidelity collegando anagrafica clienti, accumulo punti, sconti, volantino, ricerca negozi e gestionale casse.'
      }
    ],
    outcome:
      'Il programma ha superato 100.000 iscritti e offre a Sirene Blu una base dati utile per relazione, segmentazione e decisioni commerciali.',
    metrics: [
      { value: '100.000+', label: 'utenti registrati', context: 'nel programma fedeltà Sirene Blu' }
    ],
    media: [
      { layoutHint: 'portrait', alt: 'La nuova app Sirene Blu con carta fedeltà digitale' },
      { layoutHint: 'portrait', alt: 'Carta fedeltà digitale nell’app Sirene Blu' },
      { layoutHint: 'portrait', alt: 'Menu della nuova app Sirene Blu' },
      { layoutHint: 'portrait', alt: 'Ricerca punti vendita nell’app Sirene Blu' },
      { layoutHint: 'portrait', alt: 'Sconti e punti fedeltà nella nuova app Sirene Blu' }
    ],
    topics: ['retail', 'loyalty', 'software', 'integrazioni']
  },
  'sviluppo-crm-custom-venitaly': {
    heroTitle: 'Un CRM costruito sui processi reali.',
    intro:
      'Una piattaforma gestionale su misura, accompagnata da manutenzione continuativa e supporto tecnico nei momenti operativi più delicati.',
    sector: 'Servizi',
    projectType: 'CRM e integrazioni',
    theme: 'blue',
    story: [
      {
        eyebrow: 'Il contesto',
        title: 'Dati e attività avevano bisogno di un unico ambiente.',
        body: 'VENITALY necessitava di uno strumento capace di ordinare attività operative, dati e accessi senza adattare il lavoro a un software generico.'
      },
      {
        eyebrow: 'L’intervento',
        title: 'Sviluppo custom e continuità nel tempo.',
        body: 'Netmarket ha sviluppato il gestionale e continua a seguirlo con manutenzione applicativa, gestione degli account e interventi evolutivi.'
      }
    ],
    outcome:
      'Il CRM sostiene l’operatività quotidiana con accessi controllati, supporto costante e una struttura modellata sulle esigenze del cliente.',
    metrics: [],
    media: [{ alt: 'Interfaccia del CRM custom sviluppato per VENITALY', layoutHint: 'wide' }],
    topics: ['software', 'crm', 'integrazioni', 'processi']
  },
  'sviluppo-sito-web-e-shooting-fotografico-per-rigomar-una-presenza-digitale-piu-autorevole-per-il-mondo-della-produzione-moda':
    {
      heroTitle: 'Una presenza digitale all’altezza della produzione moda.',
      intro:
        'Strategia, sito istituzionale e shooting dedicato per raccontare Rigomar con un linguaggio contemporaneo e credibile nel mercato B2B.',
      sector: 'Moda',
      projectType: 'Sito web e content production',
      theme: 'dark',
      story: [
        {
          eyebrow: 'La necessità',
          title: 'Rendere visibile un valore costruito dietro le quinte.',
          body: 'Rigomar aveva bisogno di spiegare meglio competenze e qualità produttiva nel mondo della moda conto terzi, con una presenza coerente con il proprio posizionamento.'
        },
        {
          eyebrow: 'La risposta',
          title: 'Sito e immagini progettati insieme.',
          body: 'Abbiamo unito struttura, sviluppo web e produzione fotografica per costruire un racconto essenziale, premium e orientato al contatto.'
        }
      ],
      outcome:
        'Il nuovo sito presenta servizi e capacità produttive con maggiore chiarezza e rafforza l’autorevolezza del brand verso interlocutori professionali.',
      metrics: [],
      media: [{ alt: 'Pagina del sito Rigomar dedicata alla produzione moda', layoutHint: 'wide' }],
      topics: ['moda', 'sito-web', 'fotografia', 'b2b']
    },
  'sviluppo-sito-web-allestimenti-fieristici-albertini': {
    heroTitle: 'Un sito che trasforma i progetti in opportunità.',
    intro:
      'Una presenza istituzionale più chiara per valorizzare allestimenti, showroom e arredo contract, con un percorso diretto verso il contatto.',
    sector: 'Allestimenti e contract',
    projectType: 'Sito web e SEO',
    theme: 'neutral',
    story: [
      {
        eyebrow: 'Il punto di partenza',
        title: 'Un’esperienza solida, poco leggibile online.',
        body: 'Albertini doveva rinnovare il modo di presentare servizi, competenze e lavori realizzati, rendendo il portfolio uno strumento commerciale.'
      },
      {
        eyebrow: 'Il progetto',
        title: 'Dall’analisi alla richiesta di catalogo.',
        body: 'Abbiamo curato posizionamento, competitor, SEO research, alberatura e sviluppo del sito, includendo casi studio e invio automatizzato del catalogo.'
      }
    ],
    outcome:
      'La nuova piattaforma è più ordinata, contemporanea e orientata alla generazione di contatti qualificati.',
    metrics: [],
    topics: ['sito-web', 'seo', 'lead-generation', 'b2b']
  },
  'sviluppo-sito-web-fotovoltaico-progetto-e': {
    heroTitle: 'Più chiarezza per il fotovoltaico aziendale.',
    intro:
      'Un sito costruito per rendere comprensibile un’offerta tecnica, sostenere la crescita organica e generare contatti qualificati.',
    sector: 'Energia',
    projectType: 'Sito web, contenuti e SEO',
    theme: 'energy',
    story: [
      {
        eyebrow: 'La sfida',
        title: 'Tradurre competenza tecnica in una scelta più semplice.',
        body: 'Progetto-e aveva bisogno di presentare il fotovoltaico industriale con maggiore chiarezza e di collegare contenuti, SEO e attività commerciali.'
      },
      {
        eyebrow: 'L’intervento',
        title: 'Una struttura pensata per informare e convertire.',
        body: 'Abbiamo lavorato su identità, navigazione, contenuti, landing page, materiali scaricabili e campagne email integrate con Brevo.'
      }
    ],
    outcome:
      'Il sito offre una base più solida per il posizionamento organico e presenta Progetto-e come partner tecnico per imprese e realtà produttive.',
    metrics: [],
    media: [
      {
        alt: 'Installazione e messa in esercizio di un impianto fotovoltaico',
        layoutHint: 'square'
      },
      { alt: 'Impianto fotovoltaico industriale realizzato per un’azienda', layoutHint: 'square' }
    ],
    topics: ['energia', 'sito-web', 'seo', 'lead-generation']
  },
  'sviluppo-e-commerce-per-tavoli-e-sedie-per-la-casa': {
    heroTitle: 'Dal negozio all’ecommerce da oltre 3 milioni.',
    intro:
      'Un’esperienza di acquisto verticale che porta online sessant’anni di competenza nell’arredamento e continua a evolvere insieme al brand.',
    sector: 'Arredamento',
    projectType: 'Ecommerce',
    theme: 'warm',
    story: [
      {
        eyebrow: 'L’ambizione',
        title: 'Portare online un sapere costruito nel negozio.',
        body: 'Pazzo Design voleva trasformare la propria esperienza in un ecommerce nazionale, mantenendo qualità percepita e fiducia anche per un pubblico non nativo digitale.'
      },
      {
        eyebrow: 'La piattaforma',
        title: 'Catalogo, schede e checkout costruiti per scegliere bene.',
        body: 'Abbiamo progettato architettura, varianti, UX di prodotto, checkout e contenuti istituzionali, migliorando nel tempo leggibilità mobile e segnali di fiducia.'
      }
    ],
    outcome:
      'L’ecommerce è diventato un canale commerciale maturo, sostenuto da ottimizzazioni continue e da una struttura adatta alla crescita.',
    metrics: [
      { value: '€3M+', label: 'fatturato ecommerce', context: 'dato 2025 dichiarato dal cliente' },
      { value: '€360', label: 'valore medio ordine', context: 'dato 2025 dichiarato dal cliente' },
      { value: '1,2M+', label: 'utenti attivi', context: 'nel 2025' }
    ],
    media: [
      { alt: 'Ecommerce Pazzo Design per tavoli e sedie', layoutHint: 'wide' },
      { alt: 'Visualizzazione tablet dell’ecommerce Pazzo Design', layoutHint: 'wide' }
    ],
    topics: ['arredamento', 'ecommerce', 'ux', 'crescita']
  },
  'concorso-a-premi-sirene-blu-2024-ideazione-sviluppo-e-gestione-completa': {
    heroTitle: 'Un concorso gestito dalla strategia alla conformità.',
    intro:
      'Concept, piattaforma, materiali e gestione normativa coordinati in un unico progetto per sostenere traffico e partecipazione.',
    sector: 'Retail',
    projectType: 'Concorso a premi e piattaforma web',
    theme: 'retail',
    story: [
      {
        eyebrow: 'L’obiettivo',
        title: 'Portare più persone nei punti vendita.',
        body: 'Sirene Blu voleva incentivare la partecipazione con una meccanica immediata, garantendo allo stesso tempo conformità normativa e corretta gestione dei dati.'
      },
      {
        eyebrow: 'La regia',
        title: 'Creatività, tecnologia e burocrazia nello stesso flusso.',
        body: 'Abbiamo seguito naming, identità, materiali, piattaforma per caricamento scontrini e verifica vincite, oltre agli aspetti operativi, privacy e normativi.'
      }
    ],
    outcome:
      'Un’esperienza coordinata in ogni punto di contatto, progettata per essere semplice per il cliente e governabile per l’azienda.',
    metrics: [],
    media: [
      { alt: 'Materiali di comunicazione del concorso a premi Sirene Blu', layoutHint: 'split' },
      { alt: 'Identità visiva del concorso a premi Sirene Blu', layoutHint: 'split' }
    ],
    topics: ['retail', 'concorso', 'sito-web', 'comunicazione']
  },
  'casi-studio-strategia-digitale-ecommerce-brb': {
    heroTitle: 'Un ecosistema digitale che accelera l’ecommerce.',
    intro:
      'Strategia, contenuti, social media e piattaforma coordinati per trasformare attività separate in un sistema orientato alla crescita.',
    sector: 'Food e integrazione',
    projectType: 'Strategia digitale ed ecommerce',
    theme: 'dark',
    story: [
      {
        eyebrow: 'Il cambio di passo',
        title: 'Da una gestione operativa a una strategia condivisa.',
        body: 'BRB voleva superare una presenza social frammentata e accompagnare il lancio del nuovo ecommerce con posizionamento, contenuti e acquisizione più coerenti.'
      },
      {
        eyebrow: 'Il sistema',
        title: 'Un’identità riconoscibile su ogni canale.',
        body: 'Abbiamo integrato analisi di mercato, strategia multicanale, linea visuale, piano editoriale, sviluppo ecommerce e struttura SEO.'
      }
    ],
    outcome:
      'Nei primi tre mesi dal lancio il nuovo sistema ha migliorato fatturato, ordini, valore medio e prodotti venduti rispetto allo storico.',
    metrics: [
      { value: '+292%', label: 'fatturato ecommerce', context: 'nei primi 3 mesi dal lancio' },
      { value: '+206%', label: 'ordini', context: 'rispetto allo storico' },
      { value: '+39%', label: 'valore medio ordine', context: 'rispetto allo storico' },
      { value: '+364%', label: 'prodotti venduti', context: 'rispetto allo storico' }
    ],
    media: [
      { alt: 'Ecommerce BRB sviluppato da Netmarket', layoutHint: 'wide' },
      { alt: 'Sistema visuale del feed Instagram BRB', layoutHint: 'portrait' }
    ],
    topics: ['ecommerce', 'social-media', 'seo', 'crescita']
  }
};

export function projectPresentation(project: CaseStudy): ProjectPresentation {
  const editorial = editorialProjects[project.slug];
  const fallbackStory = [
    project.challenge && {
      eyebrow: 'L’esigenza',
      title: 'Il punto da risolvere.',
      body: project.challenge
    },
    project.approach && {
      eyebrow: 'L’approccio',
      title: 'Come abbiamo lavorato.',
      body: project.approach
    },
    project.solution && {
      eyebrow: 'La soluzione',
      title: 'La risposta costruita.',
      body: project.solution
    }
  ].filter((item): item is ProjectStorySection => Boolean(item));
  const media = project.gallery.map((item, index) => ({
    ...item,
    ...editorial?.media?.[index],
    media: item.media,
    alt: editorial?.media?.[index]?.alt || item.alt || item.media.alt
  }));

  return {
    heroTitle: editorial?.heroTitle || project.title,
    intro: editorial?.intro || project.shortDescription || project.excerpt || project.context || '',
    sector: editorial?.sector || project.sectors[0]?.name || 'Progetto digitale',
    projectType:
      editorial?.projectType ||
      project.services.map((service) => service.title).join(' e ') ||
      'Caso studio',
    theme: editorial?.theme || 'neutral',
    story: editorial?.story || fallbackStory,
    outcome: project.qualitativeResult || editorial?.outcome,
    metrics: editorial?.metrics.length ? editorial.metrics : project.numericResults,
    media,
    topics: editorial?.topics || [
      ...project.services.map((service) => service.slug),
      ...project.sectors.map((sector) => sector.slug)
    ]
  };
}

export function relatedProjectsFor(
  project: CaseStudy,
  projects: CaseStudy[],
  limit = 3
): CaseStudy[] {
  if (project.relatedCaseStudies.length > 0) {
    const selected = project.relatedCaseStudies
      .map((related) => projects.find((candidate) => candidate.slug === related.slug))
      .filter((candidate): candidate is CaseStudy => Boolean(candidate));
    if (selected.length > 0) return selected.slice(0, limit);
  }

  const current = projectPresentation(project);
  const serviceSlugs = new Set(project.services.map((service) => service.slug));
  const sectorSlugs = new Set(project.sectors.map((sector) => sector.slug));

  return projects
    .filter(
      (candidate) => candidate.slug !== project.slug && candidate.projectStatus === 'published'
    )
    .map((candidate) => {
      const presentation = projectPresentation(candidate);
      const sharedServices = candidate.services.filter((service) =>
        serviceSlugs.has(service.slug)
      ).length;
      const sharedSectors = candidate.sectors.filter((sector) =>
        sectorSlugs.has(sector.slug)
      ).length;
      const sharedTopics = presentation.topics.filter((topic) =>
        current.topics.includes(topic)
      ).length;
      return { candidate, score: sharedServices * 5 + sharedSectors * 4 + sharedTopics * 2 };
    })
    .sort((a, b) => b.score - a.score || a.candidate.priority - b.candidate.priority)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
