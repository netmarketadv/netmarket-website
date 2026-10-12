import { describe, expect, it } from 'vitest';
import { nextAutomaticChoice } from '../src/lib/advertising-prefill';
import { composeContactMessage } from '../src/lib/contact-context';

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
  it('does not let channel context satisfy project description validation', () => {
    for (const message of ['', '   ', 'ciao', 'a'.repeat(3001)]) {
      expect(() => composeContactMessage(message, 'Google Ads e Meta Ads')).toThrow();
    }
    expect(composeContactMessage('  Vendiamo prodotti artigianali.  ', 'Meta Ads')).toBe(
      'Canale di interesse: Meta Ads\n\nVendiamo prodotti artigianali.'
    );
    expect(composeContactMessage('Testo scritto dal cliente.', '')).toBe(
      'Testo scritto dal cliente.'
    );
  });
});
