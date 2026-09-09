import { afterEach, describe, expect, it, vi } from 'vitest';

import { pushEvent } from '../src/index';

describe('analytics dispatcher', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('queues safe application events and forwards them to the Google tag', () => {
    const gtag = vi.fn();
    const dataLayer: unknown[] = [];
    vi.stubGlobal('window', { dataLayer, gtag });

    pushEvent({
      event: 'cta_click',
      cta_label: 'Parliamone',
      cta_url: '/contatti/',
      cta_location: 'hero'
    });

    expect(dataLayer).toEqual([
      {
        event: 'cta_click',
        cta_label: 'Parliamone',
        cta_url: '/contatti/',
        cta_location: 'hero'
      }
    ]);
    expect(gtag).toHaveBeenCalledWith('event', 'cta_click', {
      cta_label: 'Parliamone',
      cta_url: '/contatti/',
      cta_location: 'hero'
    });
  });

  it('leaves generate_lead to the dedicated conversion tags', () => {
    const gtag = vi.fn();
    const dataLayer: unknown[] = [];
    vi.stubGlobal('window', { dataLayer, gtag });

    pushEvent({ event: 'generate_lead', form_id: 'contact-page', lead_type: 'contact' });

    expect(dataLayer).toHaveLength(1);
    expect(gtag).not.toHaveBeenCalled();
  });
});
