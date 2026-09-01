import { describe, expect, it } from 'vitest';
import {
  caseStudyCollectionSchema,
  caseStudySchema,
  clientSchema,
  insightSchema,
  mediaAssetSchema,
  paginationSchema,
  parseEndpoint,
  personSchema,
  resourceSchema,
  seoMetadataSchema,
  serviceSchema
} from '../src/index';

const seo = { title: 'SEO title', description: 'SEO description', noindex: false };
const image = {
  id: 10,
  url: 'https://cms.netmarket.it/wp-content/uploads/2026/09/example.webp',
  alt: 'Example image',
  width: 1200,
  height: 800,
  mimeType: 'image/webp'
};
const relation = { id: 1, slug: 'siti-web', title: 'Siti web', type: 'nm_service', image };

describe('shared schemas', () => {
  it('parses media and SEO metadata', () => {
    expect(mediaAssetSchema.parse(image).id).toBe(10);
    expect(seoMetadataSchema.parse(seo).noindex).toBe(false);
  });

  it('parses service responses with normalized relations', () => {
    const parsed = parseEndpoint('/services/siti-web', serviceSchema, {
      id: 1,
      slug: 'siti-web',
      title: 'Siti web',
      seo,
      relatedServices: [relation],
      relatedCaseStudies: []
    });
    expect((parsed.relatedServices ?? []).at(0)?.slug).toBe('siti-web');
  });

  it('parses client and person entities', () => {
    expect(
      clientSchema.parse({
        id: 2,
        slug: 'despar',
        title: 'Despar',
        brandName: 'Despar',
        logo: image,
        visualScale: 1.08,
        showInMarquee: true,
        seo
      }).brandName
    ).toBe('Despar');
    expect(
      personSchema.parse({
        id: 3,
        slug: 'enrico-paolo-toso',
        title: 'Enrico Paolo Toso',
        fullName: 'Enrico Paolo Toso',
        displayName: 'Enrico',
        photo: image,
        visibleInTeam: true,
        seo
      }).visibleInTeam
    ).toBe(true);
  });

  it('parses case study, insight, and resource entities', () => {
    expect(
      caseStudySchema.parse({
        id: 4,
        slug: 'sirene-blu',
        title: 'Sirene Blu',
        client: relation,
        projectStatus: 'published',
        services: [relation],
        numericResults: [{ label: 'Conversioni', value: '+292%' }],
        seo
      }).services
    ).toHaveLength(1);
    expect(
      insightSchema.parse({
        id: 5,
        slug: 'black-friday-2025',
        title: 'Black Friday 2025',
        readingTime: 4,
        seo
      }).readingTime
    ).toBe(4);
    expect(
      resourceSchema.parse({
        id: 6,
        slug: 'checklist-seo',
        title: 'Checklist SEO',
        resourceType: 'checklist',
        accessType: 'lead-gated',
        seo
      }).accessType
    ).toBe('lead-gated');
  });

  it('parses paginated WordPress API contract samples', () => {
    expect(
      parseEndpoint('/case-studies', caseStudyCollectionSchema, {
        data: [
          {
            id: 4,
            slug: 'sirene-blu',
            title: 'Sirene Blu',
            client: null,
            services: [relation],
            seo
          }
        ],
        pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 }
      }).data[0]?.slug
    ).toBe('sirene-blu');
    expect(paginationSchema.parse({ page: 1, perPage: 50, total: 0, totalPages: 0 }).perPage).toBe(
      50
    );
  });

  it('reports endpoint and field on invalid data', () => {
    expect(() => parseEndpoint('/services', serviceSchema, { id: 'bad' })).toThrow(
      /\/services: campo id/
    );
  });
});
