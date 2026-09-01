import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { serviceFallbacks } from '../src/data/service-fallbacks';
import {
  relationPath,
  serviceDescription,
  servicePath,
  textItems
} from '../src/lib/services/content';

describe('service system', () => {
  it('ships the initial service set as schema-valid build fallback', () => {
    expect(serviceFallbacks.map((service) => service.slug)).toEqual([
      'siti-web',
      'ecommerce',
      'software-e-integrazioni',
      'seo',
      'advertising',
      'social-media',
      'branding-e-comunicazione',
      'content-production',
      'concorsi-a-premi'
    ]);
    expect(serviceFallbacks.every((service) => service.seo.noindex === false)).toBe(true);
  });

  it('builds crawlable service and related paths', () => {
    expect(servicePath('siti-web')).toBe('/servizi/siti-web/');
    expect(
      relationPath({
        id: 1,
        slug: 'seo',
        title: 'SEO',
        type: 'nm_service'
      })
    ).toBe('/servizi/seo/');
    expect(
      relationPath({
        id: 2,
        slug: 'sirene-blu',
        title: 'Sirene Blu',
        type: 'nm_case_study'
      })
    ).toBe('/progetti/sirene-blu/');
  });

  it('normalizes CMS structured text groups safely', () => {
    expect(textItems([{ title: 'Analisi', description: 'Scenario e obiettivi.' }])).toEqual([
      { title: 'Analisi', description: 'Scenario e obiettivi.' }
    ]);
    expect(textItems(['Voce libera'])).toEqual([{ title: 'Voce libera' }]);
  });

  it('uses SEO description before controlled fallbacks', () => {
    const service = serviceFallbacks[0];
    expect(service).toBeDefined();
    expect(serviceDescription(service!)).toBe(service!.seo.description);
  });

  it('registers archive, detail and navigation entry points', () => {
    const archive = readFileSync(
      new URL('../src/pages/servizi/index.astro', import.meta.url),
      'utf8'
    );
    const detail = readFileSync(
      new URL('../src/pages/servizi/[slug].astro', import.meta.url),
      'utf8'
    );
    const header = readFileSync(
      new URL('../src/components/layout/SiteHeader.astro', import.meta.url),
      'utf8'
    );
    expect(archive).toContain('ServiceArchiveHero');
    expect(archive).toContain('ServiceIndex');
    expect(detail).toContain('getStaticPaths');
    expect(detail).toContain('serviceJsonLd');
    expect(header).toContain('/servizi/siti-web/');
  });
});
