export const designDecisions = [
  [
    'Contenere una sezione',
    'Container + Section + Stack',
    'Standard o wide; ritmo standard o compatto.'
  ],
  [
    'Aprire una sezione',
    'SectionHeading',
    'Sinistra predefinita; centro solo per una sezione focalizzata.'
  ],
  ['Proporre un’azione', 'Button', 'Primary, secondary, inverse. Due dimensioni, stati comuni.'],
  [
    'Controllo con sola icona',
    'IconButton',
    'Nome accessibile obbligatorio; bersaglio minimo 44 px.'
  ],
  [
    'Mostrare un progetto correlato',
    'ProjectCard',
    'Immagine 4:3, categoria esterna, titolo e sintesi.'
  ],
  ['Chiudere con un contatto', 'ContactCTA', 'Superficie scura o chiara; una sola azione.'],
  [
    'Raccogliere un primo indirizzo',
    'CTAInlineForm',
    'Solo dove il contatto breve è utile; poi il form completo.'
  ],
  [
    'Raccogliere una richiesta',
    'ContactForm / CareerForm',
    'Flussi diversi; un unico stile per campi, errori e conferme.'
  ],
  [
    'Mostrare fiducia',
    'ClientMarquee / ReviewsSection',
    'Loghi e recensioni hanno contenuto e comportamenti distinti.'
  ],
  [
    'Presentare le persone',
    'TeamSection',
    'PersonCard è interna alla sezione, non un secondo standard.'
  ],
  [
    'Rispondere a domande',
    'FAQBlock',
    'Un solo accordion condiviso con tastiera e stato esplicito.'
  ],
  ['Animare contenuti', 'data-reveal', 'Preset documentati. Nessun wrapper Astro alternativo.']
] as const;
