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

export async function fetchCms<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const env = getServerEnv();
  const endpoint = new URL(path.replace(/^\//, ''), env.CMS_API_BASE_URL).toString();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (env.CMS_BUILD_TOKEN) headers.Authorization = `Bearer ${env.CMS_BUILD_TOKEN}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const response = await fetch(endpoint, { headers, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
  if (!response.ok) {
    throw new Error(`CMS endpoint ${path} ha risposto con status ${response.status}.`);
  }
  try {
    return parseEndpoint(path, schema, await response.json());
  } catch (error) {
    if (getPublicEnv().PUBLIC_DEPLOY_ENV === 'local') {
      console.error(error);
    }
    throw error;
  }
}

export const getSettings = () => fetchCms('/settings', siteSettingsSchema);
export const getServices = () => fetchCms('/services', serviceCollectionSchema);
export const getService = (slug: string) => fetchCms(`/services/${slug}`, serviceSchema);
export const getCaseStudies = () => fetchCms('/case-studies', caseStudyCollectionSchema);
export const getCaseStudy = (slug: string) => fetchCms(`/case-studies/${slug}`, caseStudySchema);
export const getClients = () => fetchCms('/clients', clientCollectionSchema);
export const getPeople = () => fetchCms('/people', personCollectionSchema);
export const getInsights = () => fetchCms('/insights', insightCollectionSchema);
export const getInsight = (slug: string) => fetchCms(`/insights/${slug}`, insightSchema);
export const getResources = () => fetchCms('/resources', resourceCollectionSchema);
export const getResource = (slug: string) => fetchCms(`/resources/${slug}`, resourceSchema);
export const getTestimonials = () => fetchCms('/testimonials', testimonialCollectionSchema);
