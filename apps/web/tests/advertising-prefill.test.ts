import { describe, expect, it } from 'vitest';
import { nextAutomaticChoice } from '../src/lib/advertising-prefill';
import { contactFormSchema } from '../src/lib/api/forms';

describe('advertising comparison form choices', () => {
  it('replaces an earlier generated choice with the next CTA choice', () => {
    const first = nextAutomaticChoice({ value: '', automatic: null, edited: false }, 'google');
    expect(nextAutomaticChoice(first, 'meta').value).toBe('meta');
  });
  it('preserves manual choices, including reselecting the same generated value', () => {
    expect(
      nextAutomaticChoice({ value: 'google', automatic: 'google', edited: true }, 'meta').value
    ).toBe('google');
    expect(
      nextAutomaticChoice({ value: 'restored', automatic: null, edited: false }, 'meta').value
    ).toBe('restored');
  });
  it('allows a new suggestion after the visitor clears the field', () => {
    expect(nextAutomaticChoice({ value: '', automatic: null, edited: true }, 'meta').value).toBe(
      'meta'
    );
  });
  it('requires a valid channel and accepts an optional message only on advertising', () => {
    const payload = {
      name: 'QA Test',
      email: 'qa@example.invalid',
      privacyConsent: true,
      sourceUrl: 'https://netmarket.it/advertising/',
      message: '',
      channel: 'Meta Ads'
    };
    expect(contactFormSchema.safeParse(payload).success).toBe(true);
    expect(contactFormSchema.safeParse({ ...payload, message: 'Ciao' }).success).toBe(true);
    for (const channel of [undefined, '', 'email']) {
      expect(contactFormSchema.safeParse({ ...payload, channel }).success).toBe(false);
    }
    expect(
      contactFormSchema.safeParse({ ...payload, sourceUrl: 'https://netmarket.it/contatti/' })
        .success
    ).toBe(false);
    expect(contactFormSchema.safeParse({ ...payload, message: 'a'.repeat(3001) }).success).toBe(
      false
    );
  });
});
