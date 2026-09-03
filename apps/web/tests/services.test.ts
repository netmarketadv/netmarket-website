import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { serviceFallbacks } from '../src/data/service-fallbacks';
import {
  getServiceDetailData,
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

  it('uses SEO description before controlled fallbacks', async () => {
    const data = await getServiceDetailData('siti-web');
    expect(data).toBeDefined();
    const description = serviceDescription(data!.service);
    expect(description).toContain('Siti web aziendali');
    expect(description).toContain('Netmarket');
  }, 15_000);

  it('enriches the Siti web pilot with proof, FAQ and real related content', async () => {
    const data = await getServiceDetailData('siti-web');
    expect(data).toBeDefined();
    expect(data!.service.subtitle).toContain('contenuti, tecnologia e marketing');
    expect(data!.service.results).toHaveLength(3);
    expect(data!.service.faq).toHaveLength(6);
    expect(data!.related.caseStudies.map((item) => item.slug)).toEqual(
      expect.arrayContaining([
        'sviluppo-sito-web-allestimenti-fieristici-albertini',
        'sviluppo-sito-web-fotovoltaico-progetto-e'
      ])
    );
    expect(data!.related.insights.length).toBeGreaterThan(0);
    expect(data!.related.insights.every((item) => relationPath(item).startsWith('/insight/'))).toBe(
      true
    );
  }, 15_000);

  it('enriches every non-pilot service with distinct page content', async () => {
    const slugs = [
      'ecommerce',
      'software-e-integrazioni',
      'seo',
      'advertising',
      'social-media',
      'branding-e-comunicazione',
      'content-production',
      'concorsi-a-premi'
    ];

    const pages = await Promise.all(slugs.map((slug) => getServiceDetailData(slug)));

    for (const data of pages) {
      expect(data).toBeDefined();
      expect(data!.service.shortDescription?.length ?? 0).toBeGreaterThan(90);
      expect(data!.service.valueProps.length).toBeGreaterThanOrEqual(4);
      expect(data!.service.problems.length).toBeGreaterThanOrEqual(4);
      expect(data!.service.process.length).toBeGreaterThanOrEqual(4);
      expect(data!.service.results.length).toBeGreaterThanOrEqual(3);
      expect(data!.service.faq.length).toBeGreaterThanOrEqual(4);
      expect(data!.service.relatedServices.length).toBeGreaterThanOrEqual(4);
      expect(data!.service.seo.title).not.toBe(data!.service.title);
      expect((data!.service.seo.description ?? '').length).toBeGreaterThan(90);
      expect(data!.related.insights.length).toBeGreaterThan(0);
    }

    const propositions = pages.map((data) => data!.service.subtitle);
    expect(new Set(propositions).size).toBe(slugs.length);
  }, 15_000);

  it('uses dedicated CMS transparent service visuals in the build fallback', () => {
    const imageBySlug = Object.fromEntries(
      serviceFallbacks.map((service) => [service.slug, service.image])
    );
    expect(imageBySlug['siti-web']?.url).toContain(
      'sviluppo-realizzazione-siti-web_netmarket.png'
    );
    expect(imageBySlug.ecommerce?.url).toContain('sviluppo-ecommerce_netmarket-1.png');
    expect(imageBySlug['branding-e-comunicazione']?.url).toContain(
      'comunicazione-grafica-branding_netmarket.png'
    );
    expect(imageBySlug.advertising?.url).toContain(
      'pubblicita-tradizionale-radio_netmarket-1.png'
    );
    expect(imageBySlug['social-media']?.url).toContain('social-media-management_netmarket.png');
    expect(imageBySlug['concorsi-a-premi']?.mimeType).toBe('image/png');
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
    expect(detail).toContain('ServiceProof');
    expect(detail).toContain('ServiceTechnicalFocus');
    expect(header).toContain('/servizi/siti-web/');
    expect(header).toContain("menuVariant: 'wide'");
    expect(header).toContain("menuVariant: 'compact'");
    expect(header).toContain('/servizi/concorsi-a-premi/');
  });
});
