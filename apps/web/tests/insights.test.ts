import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { articleJsonLd } from '@netmarket/seo';
import { prepareArticleContent } from '../src/lib/insights/article-content';

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
    expect(archive).toContain('CollectionPage');
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

    expect(schema['@type']).toEqual(['Article', 'BlogPosting']);
    expect(JSON.stringify(schema)).not.toContain('undefined');
    expect(schema).toMatchObject({
      headline: 'Titolo articolo',
      datePublished: '2026-01-01T00:00:00+00:00',
      dateModified: '2026-01-02T00:00:00+00:00'
    });
  });

  it('prepares a semantic table of contents without regex HTML rewriting', () => {
    const prepared = prepareArticleContent(
      '<p>Introduzione.</p><h3>Primo punto</h3><p>Testo.</p><h3>Primo punto</h3><h3>Conclusioni</h3><h3>Prossimi passi</h3>'
    );

    expect(prepared.headings).toHaveLength(4);
    expect(prepared.headings[0]).toEqual({ id: 'primo-punto', label: 'Primo punto', level: 2 });
    expect(prepared.headings[1]?.id).toBe('primo-punto-2');
    expect(prepared.html).toContain('<h2 id="primo-punto">');
  });

  it('ships category routes, contextual projects and crawlable related cards', () => {
    const category = readFileSync(
      new URL('../src/pages/insight/categoria/[category]/index.astro', import.meta.url),
      'utf8'
    );
    const detail = readFileSync(
      new URL('../src/pages/insight/[slug].astro', import.meta.url),
      'utf8'
    );

    expect(category).toContain('getStaticPaths');
    expect(category).toContain('ItemList');
    expect(detail).toContain('relatedProjects');
    expect(detail).toContain('Approfondimenti correlati');
    expect(detail).toContain('fetchpriority="high"');
  });
});
