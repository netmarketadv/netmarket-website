import { describe, it, expect } from 'vitest';
import {
  redactKnownSecrets,
  assertNoKnownSecrets
} from '../../../infrastructure/scripts/candidate-secrets.mjs';
describe('candidate credentials never leave the runner', () => {
  const secret = 'unit-fixture-secret/value';
  it('redacts literal, escaped and URI-encoded forms from captured build logs', () => {
    const input = secret + ' ' + encodeURIComponent(secret) + ' ' + JSON.stringify(secret);
    const output = redactKnownSecrets(input, [secret]);
    expect(output).not.toContain(secret);
    expect(output).not.toContain(encodeURIComponent(secret));
    expect(output).toContain('[REDACTED]');
  });
  it('rejects exposed values without echoing them in the error', () => {
    expect(() => assertNoKnownSecrets(Buffer.from('bundle:' + secret), [secret])).toThrow(
      'artifact rifiutato'
    );
    try {
      assertNoKnownSecrets(Buffer.from(secret), [secret]);
    } catch (error) {
      expect(error.message).not.toContain(secret);
    }
  });
  it('accepts ordinary public assets and ignores absent optional tokens', () => {
    expect(() =>
      assertNoKnownSecrets(Buffer.from('public frontend'), [secret, '', undefined])
    ).not.toThrow();
  });
});
