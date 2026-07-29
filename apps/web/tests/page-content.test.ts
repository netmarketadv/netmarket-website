import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('staging page source', () => {
  it('contains required Netmarket copy', () => {
    const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
    expect(source).toContain('Netmarket');
    expect(source).toContain('Comunichiamo valore.');
    expect(source).toContain('nuovo ambiente di sviluppo');
  });
});
