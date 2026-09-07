import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('agency and contact pages', () => {
  it('registers agency with team, clients and schema', () => {
    const agency = readFileSync(new URL('../src/pages/agenzia.astro', import.meta.url), 'utf8');

    expect(agency).toContain('AboutPage');
    expect(agency).toContain('ClientMarquee');
    expect(agency).toContain('personJsonLd');
    expect(agency).toContain('id="team"');
    expect(agency).toContain('agency-team__grid');
    expect(agency).toContain('/servizi/siti-web/');
  });

  it('registers contact with a real form endpoint and tracking fields', () => {
    const contact = readFileSync(new URL('../src/pages/contatti.astro', import.meta.url), 'utf8');
    const thanks = readFileSync(new URL('../src/pages/grazie.astro', import.meta.url), 'utf8');
    const form = readFileSync(
      new URL('../src/components/forms/ContactForm.astro', import.meta.url),
      'utf8'
    );

    expect(contact).toContain('ContactForm');
    expect(contact).toContain('ContactPage');
    expect(contact).toContain('PostalAddress');
    expect(contact).toContain('OpeningHoursSpecification');
    expect(form).toContain('submitContactForm');
    expect(form).toContain('contact_form_success');
    expect(form).toContain("window.location.assign('/grazie/')");
    expect(form).toContain('Raccontaci brevemente il progetto');
    expect(form).toContain('marketingConsent: false');
    expect(form).not.toContain('name="marketingConsent"');
    expect(form).toContain('privacyConsent');
    expect(form).toContain('elapsedMs');
    expect(thanks).toContain('Richiesta ricevuta');
    expect(thanks).toContain('data-confetti-canvas');
    expect(thanks).toContain('noindexFollow');
  });

  it('registers the NOD product page with coded product demos', () => {
    const nod = readFileSync(new URL('../src/pages/nod.astro', import.meta.url), 'utf8');
    const demo = readFileSync(
      new URL('../src/components/nod/NodProductDemo.astro', import.meta.url),
      'utf8'
    );

    expect(nod).toContain('nod-logo.svg');
    expect(nod).not.toContain('dashboard-scaled.webp');
    expect(nod).not.toContain('ai-assistant-scaled.webp');
    expect(nod).not.toContain('reports-scaled.webp');
    expect(nod).toContain('sistema operativo commerciale per PMI');
    expect(nod).toContain('featureList');
    expect(demo).toContain("variant === 'leads'");
    expect(demo).toContain("variant === 'assistant'");
    expect(demo).toContain('prefers-reduced-motion');
    expect(nod).toContain('SoftwareApplication');
    expect(nod).toContain('canonicalSiteUrl');
  });
});
