import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
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

function cacheFilename(path: string): string {
  return `${encodeURIComponent(path.replace(/^\//, ''))}.json`;
}

function collectionPath(name: string): string | undefined {
  if (name === 'services') return '/services?per_page=50&sort=priority';
  if (name === 'case-studies') return '/case-studies?per_page=50&sort=priority';
  if (name === 'insights') return '/insights?per_page=50&sort=date';
  if (name === 'resources') return '/resources?per_page=50&sort=priority';
  if (['clients', 'people', 'testimonials', 'settings'].includes(name)) return `/${name}`;
  return undefined;
}

async function readCachedPayload(path: string, cacheDir: string): Promise<unknown | undefined> {
  const exact = await readCacheFile(path, cacheDir);
  if (exact) return exact;
  return deriveCachedPayload(path, cacheDir);
}

async function readCacheFile(path: string, cacheDir: string): Promise<unknown | undefined> {
  try {
    return JSON.parse(await readFile(join(cacheDir, cacheFilename(path)), 'utf8')) as unknown;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function deriveCachedPayload(path: string, cacheDir: string): Promise<unknown | undefined> {
  const parsed = new URL(path.replace(/^\//, ''), 'https://cache.local/');
  const [collection, slug] = parsed.pathname.replace(/^\//, '').split('/');
  if (!collection) return undefined;
  const canonicalCollection = collectionPath(collection);
  if (!canonicalCollection) return undefined;

  const payload = await readCacheFile(canonicalCollection, cacheDir);
  if (!payload || typeof payload !== 'object' || !('data' in payload)) return payload;
  const data = Array.isArray(payload.data) ? payload.data : [];

  if (slug) {
    return data.find((item) => hasSlug(item, slug));
  }

  const filtered = filterCollection(data, parsed.searchParams);
  const sorted = sortCollection(filtered, parsed.searchParams.get('sort'));
  const perPage = Number(parsed.searchParams.get('per_page') || sorted.length || 1);
  const page = Number(parsed.searchParams.get('page') || 1);
  const start = Math.max(0, page - 1) * perPage;
  return {
    data: sorted.slice(start, start + perPage),
    pagination: {
      page,
      perPage,
      total: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / perPage))
    }
  };
}

function hasSlug(item: unknown, slug: string): boolean {
  return isRecord(item) && item.slug === slug;
}

function filterCollection(items: unknown[], params: URLSearchParams): unknown[] {
  const service = params.get('service');
  if (!service) return items;
  return items.filter((item) => relationListIncludes(item, 'services', service) || relationListIncludes(item, 'relatedServices', service));
}

function relationListIncludes(item: unknown, key: string, slug: string): boolean {
  if (!isRecord(item) || !Array.isArray(item[key])) return false;
  return item[key].some((relation) => hasSlug(relation, slug));
}

function sortCollection(items: unknown[], sort: string | null): unknown[] {
  const copy = [...items];
  if (sort === 'date') {
    return copy.sort((a, b) => comparableDate(b) - comparableDate(a));
  }
  if (sort === 'title') {
    return copy.sort((a, b) => comparableString(a, 'title').localeCompare(comparableString(b, 'title'), 'it'));
  }
  if (sort === 'priority') {
    return copy.sort((a, b) => comparableNumber(a, 'priority') - comparableNumber(b, 'priority') || comparableString(a, 'title').localeCompare(comparableString(b, 'title'), 'it'));
  }
  return copy;
}

function comparableDate(item: unknown): number {
  if (!isRecord(item)) return 0;
  const value = typeof item.publishedAt === 'string' ? item.publishedAt : '';
  return Date.parse(value) || 0;
}

function comparableNumber(item: unknown, key: string): number {
  return isRecord(item) && typeof item[key] === 'number' ? item[key] : 0;
}

function comparableString(item: unknown, key: string): string {
  return isRecord(item) && typeof item[key] === 'string' ? item[key] : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

export async function fetchCms<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema
): Promise<z.output<TSchema>> {
  const env = getServerEnv();
  const publicEnv = getPublicEnv();
  const endpoint = new URL(path.replace(/^\//, ''), env.CMS_API_BASE_URL).toString();
  if (env.CMS_API_CACHE_DIR) {
    const payload = await readCachedPayload(path, env.CMS_API_CACHE_DIR);
    if (payload) return parseEndpoint(path, schema, payload) as z.output<TSchema>;
  }

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
