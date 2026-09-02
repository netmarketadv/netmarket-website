import type { z } from 'zod';
import {
  caseStudyCollectionSchema,
  caseStudySchema,
  clientCollectionSchema,
  insightCollectionSchema,
  insightSchema,
  parseEndpoint,
  personCollectionSchema,
  resourceCollectionSchema,
  resourceSchema,
  serviceCollectionSchema,
  serviceSchema,
  siteSettingsSchema,
  testimonialCollectionSchema
} from '@netmarket/schemas';
import { getPublicEnv, getServerEnv } from '@/lib/env';

type CollectionParams = {
  page?: number;
  perPage?: number;
  featured?: boolean;
  sort?: 'date' | 'priority' | 'title';
  service?: string;
  sector?: string;
  technology?: string;
  client?: string;
  author?: string;
};

function withParams(path: string, params: CollectionParams = {}): string {
const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.perPage) search.set('per_page', String(params.perPage));
  if (params.featured !== undefined) search.set('featured', String(params.featured));
  if (params.sort) search.set('sort', params.sort);
  if (params.service) search.set('service', params.service);
  if (params.sector) search.set('sector', params.sector);
  if (params.technology) search.set('technology', params.technology);
  if (params.client) search.set('client', params.client);
  if (params.author) search.set('author', params.author);
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

const cmsHeaders = {
  Accept: 'application/json',
  'User-Agent': 'NetmarketBuildBot/1.0 (+https://staging.netmarket.it)'
};

export async function fetchCms<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema
): Promise<z.output<TSchema>> {
  const env = getServerEnv();
  const publicEnv = getPublicEnv();
  const endpoint = new URL(path.replace(/^\//, ''), env.CMS_API_BASE_URL).toString();
  const headers: Record<string, string> = { ...cmsHeaders };
  if (env.CMS_BUILD_TOKEN) {
    headers.Authorization = `Bearer ${env.CMS_BUILD_TOKEN}`;
  } else if (env.CMS_BASIC_AUTH_USER && env.CMS_BASIC_AUTH_PASSWORD) {
    headers.Authorization = `Basic ${btoa(`${env.CMS_BASIC_AUTH_USER}:${env.CMS_BASIC_AUTH_PASSWORD}`)}`;
  }
  if (!headers.Authorization && endpoint.includes('cms.netmarket.it')) {
    throw new Error(`CMS endpoint ${path} skipped because CMS credentials are not configured.`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const response = await fetch(endpoint, { headers, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
  if (!response.ok) {
    throw new Error(`CMS endpoint ${path} ha risposto con status ${response.status}.`);
  }
  try {
    return parseEndpoint(path, schema, await response.json()) as z.output<TSchema>;
  } catch (error) {
    if (publicEnv.PUBLIC_DEPLOY_ENV === 'local') {
      console.error(error);
    }
    throw error;
  }
}

export const getSettings = () => fetchCms('/settings', siteSettingsSchema);
export const getServices = (params?: CollectionParams) =>
  fetchCms(withParams('/services', params), serviceCollectionSchema);
export const getService = (slug: string) => fetchCms(`/services/${slug}`, serviceSchema);
export const getCaseStudies = (params?: CollectionParams) =>
  fetchCms(withParams('/case-studies', params), caseStudyCollectionSchema);
export const getCaseStudy = (slug: string) => fetchCms(`/case-studies/${slug}`, caseStudySchema);
export const getClients = () => fetchCms('/clients', clientCollectionSchema);
export const getPeople = () => fetchCms('/people', personCollectionSchema);
export const getInsights = (params?: CollectionParams) =>
  fetchCms(withParams('/insights', params), insightCollectionSchema);
export const getInsight = (slug: string) => fetchCms(`/insights/${slug}`, insightSchema);
export const getResources = (params?: CollectionParams) =>
  fetchCms(withParams('/resources', params), resourceCollectionSchema);
export const getResource = (slug: string) => fetchCms(`/resources/${slug}`, resourceSchema);
export const getTestimonials = () => fetchCms('/testimonials', testimonialCollectionSchema);
