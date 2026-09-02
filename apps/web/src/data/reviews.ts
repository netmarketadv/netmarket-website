import { z } from 'zod';

const reviewSchema = z.object({
  author: z.string().min(1),
  authorHref: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  source: z.literal('Google'),
  text: z.string().min(1)
});

const reviewsSchema = z.array(reviewSchema).min(1);

const rawGoogleReviews = [
  {
    author: 'Svetlana Soboleva',
    authorHref: 'https://www.google.com/maps/contrib/116756284684243695901/reviews',
    avatarUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjVEQtOHo3DwJwjPR2mXLywEcDDlj9IRXxVPeaZ6lgaQeqPrNbI=s128-c0x00000000-cc-rp-mo-ba3',
    rating: 5,
    source: 'Google',
    text: "Esperienza Eccellente con Net Market\n\nHo recentemente avuto il piacere di lavorare con loro per la strategia di marketing digitale della mia azienda e l'esperienza è stata eccezionale. Un team competente e sempre disponibile.\nHanno elaborato una strategia su misura che ha dato risultati significativi in termini di aumento del traffico web e miglioramento della visibilità online.\nMolto aggiornati sulle ultime tendenze, tecniche di marketing e non solo.\nConsiglio vivamente Net Market a chiunque cerchi un partner affidabile e competente."
  },
  {
    author: 'gherardo Gasparin',
    authorHref: 'https://www.google.com/maps/contrib/111666671468066055778/reviews',
    avatarUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjW3T3LPY8AqE35DUfyt8Gq3zQGoTmGoCeqGk-ertOBR0Gx84pUW=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    source: 'Google',
    text: "Dopo tanti anni di ricerca di professionisti del settore ho avuto la fortuna di incontrare dei Veri Professionisti. Tutto lo staff Netmarket Web Agency è sempre raggiungibile, disponibile e presente a studiare, consigliare e realizzare tutte le proposte fatte producendo uno strumento fatto a misura delle proprie esigenze. Un gran bel Team in supporto agli imprenditori."
  },
  {
    author: 'Emma Toso',
    authorHref: 'https://www.google.com/maps/contrib/104949518088114587516/reviews',
    avatarUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjUuT7LnJfyhOEP3drm-xEmKE2JgZb11XXn6tLsvfGoZ4uYwjObD4g=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    source: 'Google',
    text: 'mi piacciono! è una bella squadra di creativi...sanno fare bene il loro mestiere e sono disponibili ad ascoltare i cambiamenti del mercato, bravi continuate così!!!\nEmma'
  },
  {
    author: 'paola malighetti',
    authorHref: 'https://www.google.com/maps/contrib/102015989217644284293/reviews',
    avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocJMM25Qg2zJcbxUK25LGyjYoBPysm_dR0yIJvw_v5tvE8a9hw=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    source: 'Google',
    text: "Bravissimi e soprattutto velocissimi! Sopratutto nei roll\nUp che  sono molto belli e resistenti! Anche nell’ assistenza sono molto bravi!"
  },
  {
    author: 'Pazzo Design',
    authorHref: 'https://www.google.com/maps/contrib/114682359569880501878/reviews',
    avatarUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjUWuwCXhjosa6jh7AOZP1MSSdxhDh5noy1KvrGFUW8kQx295lK3=s128-c0x00000000-cc-rp-mo',
    rating: 5,
    source: 'Google',
    text: "Ottimo team di esperti, preparati e sempre pronti a trovare le soluzioni giuste ad ogni problematica che riguarda l'azienda e le problematiche nel web. Professionisti di alto livello: top!"
  }
] satisfies z.input<typeof reviewsSchema>;

export type GoogleReview = z.infer<typeof reviewSchema>;

export const googleReviews = reviewsSchema.parse(rawGoogleReviews);

export const googleReviewsMeta = {
  retrievedAt: '2026-09-01',
  source: 'Google Place Details API',
  placeId: 'ChIJqQav5mnafkcRWAtHnewoKQo',
  publicProfileHref: 'https://share.google/DPsZDzWohdLvBMwmZ'
} as const;
