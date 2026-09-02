import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('agency and contact pages', () => {
  it('registers agency with team, clients and schema', () => {
    const agency = readFileSync(new URL('../src/pages/agenzia.astro', import.meta.url), 'utf8');

    expect(agency).toContain('TeamSection');
    expect(agency).toContain('ClientMarquee');
    expect(agency).toContain('personJsonLd');
    expect(agency).toContain('id="team"');
  });

  it('registers contact with a real form endpoint and tracking fields', () => {
    const contact = readFileSync(new URL('../src/pages/contatti.astro', import.meta.url), 'utf8');
    const form = readFileSync(
      new URL('../src/components/forms/ContactForm.astro', import.meta.url),
      'utf8'
    );

    expect(contact).toContain('ContactForm');
    expect(contact).toContain('ContactPage');
    expect(form).toContain('submitContactForm');
    expect(form).toContain('contact_form_success');
    expect(form).toContain('privacyConsent');
  });
});
