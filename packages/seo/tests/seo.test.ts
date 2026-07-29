import { describe, expect, it } from 'vitest';
import { absoluteCanonical, buildTitle } from '../src/index';

describe('seo utilities', () => {
  it('builds titles', () => {
    expect(buildTitle('Ambiente di sviluppo')).toBe('Ambiente di sviluppo | Netmarket');
  });

  it('creates absolute canonicals', () => {
    expect(absoluteCanonical('https://staging.netmarket.it', '/a')).toBe(
      'https://staging.netmarket.it/a'
    );
  });
});
