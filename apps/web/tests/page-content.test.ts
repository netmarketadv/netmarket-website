import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('homepage source', () => {
  it('contains required Netmarket positioning copy', () => {
    const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
    const dataSource = readFileSync(new URL('../src/data/home.ts', import.meta.url), 'utf8');
    expect(source).toContain('Netmarket');
    expect(source).toContain('Agenzia marketing e siti web a');
    expect(source).toContain('Netmarket, Padova dal 1986');
    expect(source).toContain('Agenzia comunicazione, marketing e tecnologia a Padova');
    expect(source).toContain('nm-heading-marker');
    expect(source).toContain('Non vendiamo canali. Costruiamo un sistema.');
    expect(source).toContain('servicePath(service.slug)');
    expect(source).toContain('home-case-slider');
    expect(source).toContain('projectPath(project.slug)');
    expect(source).not.toContain('insightPath(insight.slug)');
    expect(source).toContain('href="/contatti/"');
    expect(source).toContain('href="/progetti/"');
    expect(source).toContain('href="/servizi/"');
    expect(dataSource).toContain('Siti web ed ecommerce');
    expect(dataSource).toContain('googleBusinessProfile');
    expect(dataSource).toContain('https://share.google/DPsZDzWohdLvBMwmZ');
    expect(dataSource).toContain('cms.netmarket.it/wp-content/uploads/2026/09');
    expect(dataSource).toContain('clientLogos');
    expect(readFileSync(new URL('../src/data/team.ts', import.meta.url), 'utf8')).toContain('Enrico Paolo Toso');
    expect(source).toContain('TeamSection');
    expect(source).toContain('personJsonLd');
    expect(dataSource).not.toContain('Molto cortesi e professionali');
    const headerSource = readFileSync(new URL('../src/components/layout/SiteHeader.astro', import.meta.url), 'utf8');
    expect(headerSource).toContain('/netmarket-logo.svg');
    expect(headerSource).toContain('mega-menu');
    const footerSource = readFileSync(new URL('../src/components/layout/SiteFooter.astro', import.meta.url), 'utf8');
    expect(footerSource).toContain('03618730281');
    expect(footerSource).toContain('Viale della Navigazione Interna');
    expect(footerSource).toContain('NOD');
    expect(footerSource).toContain('Brevo Partner Pioneer 2025');
    expect(footerSource).toContain('iubenda');
  });

  it('uses static Google reviews instead of runtime review rendering', () => {
    const sectionSource = readFileSync(new URL('../src/components/blocks/ReviewsSection.astro', import.meta.url), 'utf8');
    const clientSource = readFileSync(new URL('../src/lib/google-business/reviews.ts', import.meta.url), 'utf8');
    const dataSource = readFileSync(new URL('../src/data/reviews.ts', import.meta.url), 'utf8');
    expect(sectionSource).toContain('googleReviews');
    expect(sectionSource).toContain('ReviewsCarousel');
    expect(dataSource).toContain('Svetlana Soboleva');
    expect(dataSource).not.toContain('Emma Toso');
    expect(dataSource).toContain("source: 'Google'");
    expect(dataSource).toContain('reviewsSchema.parse');
    expect(clientSource).toContain('initReviewsCarousel');
    expect(clientSource).not.toContain('maps.googleapis.com');
    expect(clientSource).not.toContain('fetchFields');
  });

  it('keeps the internal design system noindexed', () => {
    const source = readFileSync(new URL('../src/pages/design-system.astro', import.meta.url), 'utf8');
    expect(source).toContain('design system');
    expect(source).toContain('noindex');
    expect(source).toContain('ClientMarquee');
    expect(source).toContain('TeamSection');
  });
});
