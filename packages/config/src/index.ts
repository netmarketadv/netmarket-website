import { z } from 'zod';

export const deployEnvSchema = z.enum(['local', 'staging', 'production']);
export type DeployEnv = z.infer<typeof deployEnvSchema>;
export type RobotsDirective =
  'index, follow' | 'noindex, nofollow' | 'noindex, nofollow, noarchive';

export const publicEnvSchema = z.object({
  PUBLIC_SITE_URL: z.string().url(),
  PUBLIC_CMS_URL: z.string().url(),
  PUBLIC_DEPLOY_ENV: deployEnvSchema.default('local'),
  PUBLIC_ANALYTICS_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  PUBLIC_GTM_ID: z.string().optional().default('')
});

export const serverEnvSchema = z.object({
  CMS_API_BASE_URL: z.string().url(),
  CMS_GRAPHQL_URL: z.string().url().optional().or(z.literal('')),
  CMS_BUILD_TOKEN: z.string().optional().or(z.literal(''))
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validatePublicEnv(input: Record<string, unknown>): PublicEnv {
  const env = publicEnvSchema.parse(input);
  assertAllowedUrls(env);
  return env;
}

export function validateServerEnv(input: Record<string, unknown>, deployEnv: DeployEnv): ServerEnv {
  const server = serverEnvSchema.parse(input);
  if (deployEnv !== 'local' && !server.CMS_API_BASE_URL.includes('cms.netmarket.it')) {
    throw new Error('CMS_API_BASE_URL deve puntare a cms.netmarket.it in staging o production.');
  }
  return server;
}

export function robotsForEnv(env: DeployEnv, editorialNoindex = false): RobotsDirective {
  if (editorialNoindex) return 'noindex, nofollow';
  if (env === 'staging') return 'noindex, nofollow, noarchive';
  if (env === 'local') return 'noindex, nofollow';
  return 'index, follow';
}

function assertAllowedUrls(env: PublicEnv): void {
  if (
    env.PUBLIC_DEPLOY_ENV === 'staging' &&
    !env.PUBLIC_SITE_URL.includes('staging.netmarket.it')
  ) {
    throw new Error('PUBLIC_SITE_URL deve puntare a staging.netmarket.it in staging.');
  }
  if (env.PUBLIC_DEPLOY_ENV !== 'local' && !env.PUBLIC_CMS_URL.includes('cms.netmarket.it')) {
    throw new Error('PUBLIC_CMS_URL deve puntare a cms.netmarket.it fuori dal locale.');
  }
}
