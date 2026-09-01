import { describe, expect, it } from 'vitest';
import { absoluteCanonical, buildTitle, organizationJsonLd, personJsonLd } from '../src/index';

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
      '@id': 'https://staging.netmarket.it/#organization'
    });
    expect(
      personJsonLd('https://staging.netmarket.it', {
        id: 'enrico-paolo-toso',
        name: 'Enrico Paolo Toso',
        givenName: 'Enrico Paolo',
        familyName: 'Toso',
        jobTitle: 'Digital Developer',
        sameAs: ['https://www.linkedin.com/in/enricopaolotoso/'],
        image: 'https://cms.netmarket.it/wp-content/uploads/2026/09/enrico-toso-digital-developer-netmarket.jpg'
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
});
