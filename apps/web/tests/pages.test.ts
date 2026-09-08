import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('agency and contact pages', () => {
  it('registers agency with team, clients and schema', () => {
    const agency = readFileSync(new URL('../src/pages/agenzia.astro', import.meta.url), 'utf8');

    expect(agency).toContain('AboutPage');
    expect(agency).toContain('ClientMarquee');
    expect(agency).toContain('personJsonLd');
    expect(agency).toContain('id="team"');
    expect(agency).toContain('TeamSection');
    expect(agency).toContain('CaseStudyShowcase');
    expect(agency).not.toContain('agency-careers');
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
    expect(contact).toContain('https://maps.app.goo.gl/S9Gb82NiJrYWJsZ67');
    expect(contact).toContain('<h1 id="contact-title" data-reveal="line">');
    expect(contact).not.toContain('Partiamo dal contesto.');
    expect(contact).not.toContain('Cosa succede dopo.');
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
    expect(nod).toContain('id="nod-title" data-reveal="line"');
    expect(nod).toContain('id="nod-reports-title"');
  });

  it('uses the canonical line reveal for headings on light-motion pages', () => {
    const controller = readFileSync(
      new URL('../src/components/motion/MotionController.astro', import.meta.url),
      'utf8'
    );
    const motion = readFileSync(
      new URL('../src/lib/motion/gsap-motion.ts', import.meta.url),
      'utf8'
    );
    const projects = readFileSync(
      new URL('../src/pages/progetti/index.astro', import.meta.url),
      'utf8'
    );

    expect(controller).toContain('useGsapForLines: !fullMotion');
    expect(motion).toContain('lineOnly?: boolean');
    expect(motion).toContain("'motion-gsap-lines'");
    expect(projects).toContain('id="projects-title" data-reveal="line"');
  });
});
