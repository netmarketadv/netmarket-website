import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('project system', () => {
  it('registers project archive and detail routes', () => {
    const archive = readFileSync(
      new URL('../src/pages/progetti/index.astro', import.meta.url),
      'utf8'
    );
    const detail = readFileSync(
      new URL('../src/pages/progetti/[slug].astro', import.meta.url),
      'utf8'
    );
    const header = readFileSync(
      new URL('../src/components/layout/SiteHeader.astro', import.meta.url),
      'utf8'
    );

    expect(archive).toContain('getProjectArchiveData');
    expect(detail).toContain('getStaticPaths');
    expect(detail).toContain('caseStudyJsonLd');
    expect(header).toContain('/progetti/');
  });

  it('ships a migration inventory for the eight discovered legacy case studies', () => {
    const inventory = JSON.parse(
      readFileSync(
        new URL('../../../data/migrations/case-studies/case-study-inventory.json', import.meta.url),
        'utf8'
      )
    ) as Array<{ legacyId: number; legacyUrl: string; migrationStatus: string }>;

    expect(inventory).toHaveLength(8);
    expect(inventory.every((item) => item.legacyUrl.includes('/caso-studio/'))).toBe(true);
    expect(inventory.every((item) => item.migrationStatus)).toBe(true);
  });
});
