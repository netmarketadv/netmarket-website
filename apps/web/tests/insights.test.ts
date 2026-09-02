import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { articleJsonLd } from '@netmarket/seo';

describe('insight system', () => {
  it('registers archive, paginated archive and article routes', () => {
    const archive = readFileSync(
      new URL('../src/pages/insight/index.astro', import.meta.url),
      'utf8'
    );
    const paginated = readFileSync(
      new URL('../src/pages/insight/[page]/index.astro', import.meta.url),
      'utf8'
    );
    const detail = readFileSync(
      new URL('../src/pages/insight/[slug].astro', import.meta.url),
      'utf8'
    );
    const header = readFileSync(
      new URL('../src/components/layout/SiteHeader.astro', import.meta.url),
      'utf8'
    );

    expect(archive).toContain('getInsightPage');
    expect(paginated).toContain('getStaticPaths');
    expect(detail).toContain('articleJsonLd');
    expect(header).toContain('/insight/');
  });

  it('ships a read-only legacy inventory for the discovered articles', () => {
    const inventory = JSON.parse(
      readFileSync(
        new URL('../../../data/migrations/insights/insight-inventory.json', import.meta.url),
        'utf8'
      )
    ) as Array<{ legacyId: number; slug: string; legacyUrl: string; migrationStatus: string }>;

    expect(inventory).toHaveLength(26);
    expect(inventory.every((item) => item.legacyUrl.startsWith('https://netmarket.it/'))).toBe(
      true
    );
    expect(inventory.every((item) => item.migrationStatus)).toBe(true);
  });

  it('emits clean Article structured data', () => {
    const schema = articleJsonLd({
      title: 'Titolo articolo',
      description: 'Descrizione articolo',
      url: 'https://netmarket.it/insight/titolo-articolo/',
      publishedAt: '2026-01-01T00:00:00+00:00',
      updatedAt: '2026-01-02T00:00:00+00:00'
    });

    expect(schema['@type']).toBe('Article');
    expect(JSON.stringify(schema)).not.toContain('undefined');
    expect(schema).toMatchObject({
      headline: 'Titolo articolo',
      datePublished: '2026-01-01T00:00:00+00:00',
      dateModified: '2026-01-02T00:00:00+00:00'
    });
  });
});
