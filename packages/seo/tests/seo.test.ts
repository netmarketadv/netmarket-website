import { describe, expect, it } from 'vitest';
import {
  absoluteCanonical,
  articleJsonLd,
  buildTitle,
  caseStudyJsonLd,
  organizationJsonLd,
  personJsonLd,
  serviceJsonLd
} from '../src/index';

describe('seo utilities', () => {
  it('builds titles', () => {
    expect(buildTitle('Ambiente di sviluppo')).toBe('Ambiente di sviluppo | Netmarket');
  });

  it('creates absolute canonicals', () => {
    expect(absoluteCanonical('https://staging.netmarket.it', '/a')).toBe(
      'https://staging.netmarket.it/a'
    );
  });

  it('creates stable person structured data linked to the organization', () => {
    expect(organizationJsonLd('https://staging.netmarket.it')).toMatchObject({
      '@id': 'https://staging.netmarket.it/#organization',
      logo: 'https://staging.netmarket.it/icon-512.png'
    });
    expect(
      personJsonLd('https://staging.netmarket.it', {
        id: 'enrico-paolo-toso',
        name: 'Enrico Paolo Toso',
        givenName: 'Enrico Paolo',
        familyName: 'Toso',
        jobTitle: 'Digital Developer',
        sameAs: ['https://www.linkedin.com/in/enricopaolotoso/'],
        image:
          'https://cms.netmarket.it/wp-content/uploads/2026/09/enrico-toso-digital-developer-netmarket.jpg'
      })
    ).toMatchObject({
      '@type': 'Person',
      '@id': 'https://staging.netmarket.it/#person-enrico-paolo-toso',
      worksFor: {
        '@id': 'https://staging.netmarket.it/#organization'
      },
      sameAs: ['https://www.linkedin.com/in/enricopaolotoso/']
    });
  });

  it('links service schema to the Netmarket organization', () => {
    expect(
      serviceJsonLd(
        'https://staging.netmarket.it',
        'Siti web',
        'Siti aziendali chiari e veloci.',
        'https://staging.netmarket.it/servizi/siti-web/'
      )
    ).toMatchObject({
      '@type': 'Service',
      '@id': 'https://staging.netmarket.it/servizi/siti-web/#service',
      serviceType: 'Siti web',
      provider: { '@id': 'https://staging.netmarket.it/#organization' },
      areaServed: 'Italy'
    });
  });

  it('creates article and case study structured data without fake schema types', () => {
    expect(
      articleJsonLd({
        title: 'Black Friday 2025',
        description: 'Guida per PMI.',
        url: 'https://staging.netmarket.it/insight/black-friday-2025/'
      })
    ).toMatchObject({ '@type': 'Article' });
    expect(
      caseStudyJsonLd(
        'Sirene Blu',
        'App mobile e programma fedelta.',
        'https://staging.netmarket.it/progetti/sirene-blu/'
      )
    ).toMatchObject({ '@type': 'CreativeWork' });
  });
});
