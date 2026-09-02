import type {
  CaseStudy,
  Insight,
  MediaAsset,
  RelationSummary,
  Resource,
  Service
} from '@netmarket/schemas';
import {
  getCaseStudies,
  getInsights,
  getResources,
  getService,
  getServices
} from '@/lib/api/client';
import { cmsMedia } from '@/data/home';
import { serviceFallbacks } from '@/data/service-fallbacks';

export type ServiceSource = 'cms' | 'fallback';

export interface ServiceArchiveData {
  services: Service[];
  source: ServiceSource;
}

export interface ServiceDetailData {
  service: Service;
  source: ServiceSource;
  related: {
    caseStudies: RelationSummary[];
    insights: RelationSummary[];
    resources: RelationSummary[];
    services: RelationSummary[];
  };
}

export interface TextItem {
  title: string;
  description?: string;
}

const relationLimits = {
  caseStudies: 3,
  insights: 3,
  resources: 3,
  services: 4
};

const serviceVisuals: Record<string, { id: number; url: string; alt: string }> = {
  'siti-web': {
    id: 99101,
    url: cmsMedia.services.websites,
    alt: 'Visual servizio sviluppo e realizzazione siti web Netmarket'
  },
  ecommerce: {
    id: 99102,
    url: cmsMedia.services.ecommerce,
    alt: 'Visual servizio sviluppo ecommerce Netmarket'
  },
  seo: {
    id: 99104,
    url: cmsMedia.services.marketing,
    alt: 'Visual servizio SEO e marketing digitale Netmarket'
  },
  advertising: {
    id: 99105,
    url: cmsMedia.services.advertising,
    alt: 'Visual servizio advertising e pubblicità Netmarket'
  },
  'social-media': {
    id: 99106,
    url: cmsMedia.services.social,
    alt: 'Visual servizio social media management Netmarket'
  },
  'branding-e-comunicazione': {
    id: 99107,
    url: cmsMedia.services.branding,
    alt: 'Visual servizio comunicazione grafica e branding Netmarket'
  },
  'concorsi-a-premi': {
    id: 99109,
    url: cmsMedia.services.contests,
    alt: 'Visual servizio concorsi a premi Netmarket'
  }
};

let archiveDataPromise: Promise<ServiceArchiveData> | undefined;

function byPriority(a: Service, b: Service): number {
  return a.priority - b.priority || a.title.localeCompare(b.title, 'it');
}

function warningMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toRelation(content: CaseStudy | Insight | Resource): RelationSummary {
  return {
    id: content.id,
    slug: content.slug,
    title: content.title,
    type: contentTypeFor(content),
    image: content.image ?? null
  };
}

function contentTypeFor(content: CaseStudy | Insight | Resource): string {
  if ('projectStatus' in content) return 'nm_case_study';
  if ('resourceType' in content) return 'nm_resource';
  return 'post';
}

async function fromCms(): Promise<Service[]> {
  const collection = await getServices({ perPage: 50, sort: 'priority' });
  return collection.data
    .filter((service) => service.slug && service.title)
    .map(withServiceVisual)
    .sort(byPriority);
}

export async function getServiceArchiveData(): Promise<ServiceArchiveData> {
  archiveDataPromise ??= loadServiceArchiveData();
  return archiveDataPromise;
}

async function loadServiceArchiveData(): Promise<ServiceArchiveData> {
  try {
    const services = await fromCms();
    if (services.length > 0) return { services, source: 'cms' };
  } catch (error) {
    console.warn(
      `[services] CMS services unavailable, using local build fallback: ${warningMessage(error)}`
    );
  }
  return { services: serviceFallbacks.map(withServiceVisual).sort(byPriority), source: 'fallback' };
}

export async function getServiceDetailData(slug: string): Promise<ServiceDetailData | undefined> {
  try {
    const service = withServiceVisual(await getService(slug));
    return {
      service,
      source: 'cms',
      related: await resolveRelated(service)
    };
  } catch (error) {
    console.warn(
      `[services] CMS service "${slug}" unavailable, trying local build fallback: ${warningMessage(error)}`
    );
  }

  const service = serviceFallbacks.map(withServiceVisual).find((item) => item.slug === slug);
  if (!service) return undefined;
  return {
    service,
    source: 'fallback',
    related: {
      caseStudies: [],
      insights: [],
      resources: [],
      services: service.relatedServices.slice(0, relationLimits.services)
    }
  };
}

export async function resolveRelated(service: Service): Promise<ServiceDetailData['related']> {
  const [caseStudies, insights, resources] = await Promise.all([
    resolveCaseStudies(service),
    resolveInsights(service.slug),
    resolveResources(service.slug)
  ]);

  return {
    caseStudies,
    insights,
    resources,
    services: service.relatedServices.slice(0, relationLimits.services)
  };
}

async function resolveCaseStudies(service: Service): Promise<RelationSummary[]> {
  if (service.relatedCaseStudies.length > 0) {
    return service.relatedCaseStudies.slice(0, relationLimits.caseStudies);
  }
  try {
    const collection = await getCaseStudies({
      service: service.slug,
      perPage: relationLimits.caseStudies,
      sort: 'priority'
    });
    return collection.data.slice(0, relationLimits.caseStudies).map(toRelation);
  } catch (error) {
    console.warn(
      `[services] Related case studies unavailable for "${service.slug}": ${warningMessage(error)}`
    );
    return [];
  }
}

async function resolveInsights(slug: string): Promise<RelationSummary[]> {
  try {
    const collection = await getInsights({
      service: slug,
      perPage: relationLimits.insights,
      sort: 'priority'
    });
    return collection.data.slice(0, relationLimits.insights).map(toRelation);
  } catch (error) {
    console.warn(`[services] Related insights unavailable for "${slug}": ${warningMessage(error)}`);
    return [];
  }
}

async function resolveResources(slug: string): Promise<RelationSummary[]> {
  try {
    const collection = await getResources({
      service: slug,
      perPage: relationLimits.resources,
      sort: 'priority'
    });
    return collection.data.slice(0, relationLimits.resources).map(toRelation);
  } catch (error) {
    console.warn(
      `[services] Related resources unavailable for "${slug}": ${warningMessage(error)}`
    );
    return [];
  }
}

export function servicePath(slug: string): string {
  return `/servizi/${slug}/`;
}

export function relationPath(relation: RelationSummary): string {
  if (relation.type === 'nm_case_study') return `/progetti/${relation.slug}/`;
  if (relation.type === 'post') return `/insight/${relation.slug}/`;
  if (relation.type === 'nm_resource') return `/risorse/${relation.slug}/`;
  if (relation.type === 'nm_service') return servicePath(relation.slug);
  return '#contatti';
}

function serviceVisualAsset(slug: string): MediaAsset | null {
  const visual = serviceVisuals[slug];
  if (!visual) return null;
  return {
    id: visual.id,
    url: visual.url,
    alt: visual.alt,
    width: 1400,
    height: 900,
    mimeType: 'image/png'
  };
}

function withServiceVisual(service: Service): Service {
  const visual = serviceVisualAsset(service.slug);
  if (!visual) return service;
  return {
    ...service,
    image: visual,
    hero: {
      ...service.hero,
      image: visual
    },
    seo: {
      ...service.seo,
      socialImage: service.seo.socialImage ?? visual
    }
  };
}

export function serviceDescription(service: Service): string {
  return (
    service.seo.description ||
    service.shortDescription ||
    service.excerpt ||
    service.subtitle ||
    'Servizio Netmarket per aziende che vogliono comunicare e crescere con metodo.'
  );
}

export function serviceLead(service: Service): string {
  return (
    service.shortDescription ||
    service.excerpt ||
    service.subtitle ||
    'Un servizio Netmarket costruito attorno a obiettivi, contenuti e continuità operativa.'
  );
}

export function textItems(items: unknown[]): TextItem[] {
  return items
    .map((item) => {
      if (typeof item === 'string') return { title: item };
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = typeof record.title === 'string' ? record.title : '';
      const description =
        typeof record.description === 'string'
          ? record.description
          : typeof record.text === 'string'
            ? record.text
            : undefined;
      return title ? { title, description } : null;
    })
    .filter((item): item is TextItem => Boolean(item));
}
