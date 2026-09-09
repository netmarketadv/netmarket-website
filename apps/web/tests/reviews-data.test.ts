import { describe, expect, it } from 'vitest';
import { googleReviews } from '../src/data/reviews';

describe('Google reviews dataset', () => {
  it('contains verified static reviews with the public Google source only', () => {
    expect(googleReviews).toHaveLength(4);
    expect(googleReviews.map((review) => review.author)).not.toContain('Emma Toso');

    for (const review of googleReviews) {
      expect(review.author.length).toBeGreaterThan(0);
      expect(review.text.length).toBeGreaterThan(0);
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.source).toBe('Google');
      expect(review).not.toHaveProperty('publishedAt');
      expect(review).not.toHaveProperty('relativeTime');
    }
  });
});
