import type { PublicEnv } from '@netmarket/config';

// The opaque Stape loader query is tied to this web container, not the server container.
export function isTrackingEnabled(env: PublicEnv): boolean {
  if (env.PUBLIC_DEPLOY_ENV !== 'production' || !env.PUBLIC_ANALYTICS_ENABLED) return false;
  if (env.PUBLIC_GTM_ID !== 'GTM-K782CJ46') {
    throw new Error('Lo snippet Stape richiede PUBLIC_GTM_ID=GTM-K782CJ46.');
  }
  return true;
}
