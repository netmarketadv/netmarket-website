import { describe, expect, it } from 'vitest';
import { robotsForEnv, validatePublicEnv, validateServerEnv } from '../src/index';

describe('environment validation', () => {
  it('allows local defaults', () => {
    expect(
      validatePublicEnv({
        PUBLIC_SITE_URL: 'http://localhost:4321',
        PUBLIC_CMS_URL: 'https://cms.netmarket.it',
        PUBLIC_DEPLOY_ENV: 'local'
      })
    ).toMatchObject({
      PUBLIC_DEPLOY_ENV: 'local',
      PUBLIC_GOOGLE_MAPS_API_KEY: '',
      PUBLIC_GOOGLE_PLACE_ID: ''
    });
  });

  it('rejects staging URLs that do not target staging', () => {
    expect(() =>
      validatePublicEnv({
        PUBLIC_SITE_URL: 'https://netmarket.it',
        PUBLIC_CMS_URL: 'https://cms.netmarket.it',
        PUBLIC_DEPLOY_ENV: 'staging'
      })
    ).toThrow(/staging.netmarket.it/);
  });

  it('returns safe robots directives by environment', () => {
    expect(robotsForEnv('staging')).toContain('noarchive');
    expect(robotsForEnv('production')).toBe('index, follow');
  });

  it('requires the proprietary CMS REST namespace outside local', () => {
    expect(() =>
      validateServerEnv(
        {
          CMS_API_BASE_URL: 'https://cms.netmarket.it/wp-json/',
          CMS_GRAPHQL_URL: '',
          CMS_BUILD_TOKEN: '',
          CMS_BASIC_AUTH_USER: '',
          CMS_BASIC_AUTH_PASSWORD: ''
        },
        'staging'
      )
    ).toThrow(/wp-json\/netmarket\/v1/);

    expect(
      validateServerEnv(
        {
          CMS_API_BASE_URL: 'https://cms.netmarket.it/wp-json/netmarket/v1/',
          CMS_GRAPHQL_URL: '',
          CMS_BUILD_TOKEN: '',
          CMS_BASIC_AUTH_USER: '',
          CMS_BASIC_AUTH_PASSWORD: ''
        },
        'staging'
      )
    ).toMatchObject({
      CMS_API_BASE_URL: 'https://cms.netmarket.it/wp-json/netmarket/v1/'
    });
  });
});
