import { describe, expect, it } from 'vitest';
import { robotsForEnv, validatePublicEnv } from '../src/index';

describe('environment validation', () => {
  it('allows local defaults', () => {
    expect(
      validatePublicEnv({
        PUBLIC_SITE_URL: 'http://localhost:4321',
        PUBLIC_CMS_URL: 'https://cms.netmarket.it',
        PUBLIC_DEPLOY_ENV: 'local'
      }).PUBLIC_DEPLOY_ENV
    ).toBe('local');
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
});
