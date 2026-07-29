import type { z } from 'zod';
import { parseEndpoint } from '@netmarket/schemas';
import { getServerEnv } from '@/lib/env';

export async function fetchCms<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const env = getServerEnv();
  const endpoint = new URL(path.replace(/^\//, ''), env.CMS_API_BASE_URL).toString();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (env.CMS_BUILD_TOKEN) headers.Authorization = `Bearer ${env.CMS_BUILD_TOKEN}`;

  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    throw new Error(`CMS endpoint ${path} ha risposto con status ${response.status}.`);
  }
  return parseEndpoint(path, schema, await response.json());
}
