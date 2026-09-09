import { describe, expect, it } from 'vitest';
import { robotsForEnv } from '@netmarket/config';

describe('robots policy', () => {
  it('keeps staging noindexed', () => {
    expect(robotsForEnv('staging')).toBe('noindex, nofollow, noarchive');
  });

  it('keeps public pages indexable in production', () => {
    expect(robotsForEnv('production')).toBe('index, follow');
    expect(robotsForEnv('production')).not.toMatch(/noindex|nofollow|noarchive/);
  });
});
