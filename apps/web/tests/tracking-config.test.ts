import { describe, expect, it } from 'vitest';
import type { PublicEnv } from '@netmarket/config';
import { isTrackingEnabled } from '../src/lib/tracking-config';

const env: PublicEnv = {
  PUBLIC_SITE_URL: 'https://netmarket.it',
  PUBLIC_CMS_URL: 'https://cms.netmarket.it',
  PUBLIC_DEPLOY_ENV: 'production',
  PUBLIC_ANALYTICS_ENABLED: true,
  PUBLIC_GTM_ID: 'GTM-K782CJ46',
  PUBLIC_GOOGLE_MAPS_API_KEY: '',
  PUBLIC_GOOGLE_PLACE_ID: ''
};

describe('Stape tracking configuration', () => {
  it('enables the supplied web container in production', () => {
    expect(isTrackingEnabled(env)).toBe(true);
  });

  it.each(['local', 'staging'] as const)(
    'disables both snippets in %s even with analytics enabled',
    (environment) => {
      expect(isTrackingEnabled({ ...env, PUBLIC_DEPLOY_ENV: environment })).toBe(false);
    }
  );

  it('respects disabled analytics', () => {
    expect(isTrackingEnabled({ ...env, PUBLIC_ANALYTICS_ENABLED: false })).toBe(false);
  });

  it('rejects a different web or server container instead of silently loading the wrong container', () => {
    expect(() => isTrackingEnabled({ ...env, PUBLIC_GTM_ID: 'GTM-MB32L54C' })).toThrow(
      'GTM-K782CJ46'
    );
  });
});
