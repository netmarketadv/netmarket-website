import { describe, expect, it } from 'vitest';
import { robotsForEnv } from '@netmarket/config';

describe('robots policy', () => {
  it('keeps staging noindexed', () => {
    expect(robotsForEnv('staging')).toBe('noindex, nofollow, noarchive');
  });
});
