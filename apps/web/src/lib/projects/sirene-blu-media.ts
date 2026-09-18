import type { CaseStudy, CaseStudyMedia, MediaAsset } from '@netmarket/schemas';

// Approved Drive export / DEF / APPLE, July 2026. Keep CMS and fallback in sync.
const descriptions = [
  'La nuova app Sirene Blu con carta fedeltà digitale',
  'Accesso alla carta fedeltà nella nuova app Sirene Blu',
  'Menu della nuova app Sirene Blu',
  'Mappa dei punti vendita nella nuova app Sirene Blu',
  'Sconti e punti fedeltà nella nuova app Sirene Blu'
];

const gallery: CaseStudyMedia[] = descriptions.map((alt, index) => ({
  layoutHint: 'portrait',
  alt,
  media: {
    id: 631200 + index,
    url: `/media/case-studies/sirene-blu-app/0${index + 1}.webp`,
    alt,
    width: 900,
    height: 1948,
    mimeType: 'image/webp'
  }
}));

export const sireneBluCover: MediaAsset = gallery[0]!.media;

export function withCurrentProjectMedia(project: CaseStudy): CaseStudy {
  if (project.slug !== 'app-mobile-programma-fedelta-sirene-blu') return project;
  return {
    ...project,
    image: sireneBluCover,
    cover: sireneBluCover,
    gallery,
    seo: { ...project.seo, socialImage: sireneBluCover }
  };
}
