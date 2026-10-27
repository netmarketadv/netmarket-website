function forms(values) {
  return [
    ...new Set(
      values
        .filter((value) => typeof value === 'string' && value.length > 0)
        .flatMap((value) => [value, JSON.stringify(value).slice(1, -1), encodeURIComponent(value)])
    )
  ].sort((a, b) => b.length - a.length);
}
export function redactKnownSecrets(text, values) {
  for (const marker of forms(values)) text = text.split(marker).join('[REDACTED]');
  return text;
}
export function assertNoKnownSecrets(bytes, values) {
  const text = bytes.toString('utf8');
  if (forms(values).some((marker) => text.includes(marker))) {
    throw new Error('Secret rilevato nel frontend: artifact rifiutato.');
  }
}
