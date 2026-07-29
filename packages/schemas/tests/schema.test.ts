import { describe, expect, it } from 'vitest';
import { parseEndpoint, serviceSchema } from '../src/index';

describe('shared schemas', () => {
  it('parses service responses', () => {
    expect(
      parseEndpoint('/services', serviceSchema, {
        id: 1,
        slug: 'strategia',
        title: 'Strategia',
        seo: { noindex: false }
      }).slug
    ).toBe('strategia');
  });

  it('reports endpoint and field on invalid data', () => {
    expect(() => parseEndpoint('/services', serviceSchema, { id: 'bad' })).toThrow(
      /\/services: campo id/
    );
  });
});
