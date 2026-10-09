// Attribution is optional: denied/corrupt storage must never break a contact request.
export const trackingKeys = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'ttclid',
  'oppref'
];
export function readContactAttribution(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem('nm_contact_tracking') || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([key, value]) =>
          [...trackingKeys, 'referrer', 'sourceUrl'].includes(key) && typeof value === 'string'
      )
    );
  } catch {
    return {};
  }
}
export function collectContactAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  // A new campaign starts a new attribution set; never mix an old Google click with a Meta click.
  const hasCampaign = trackingKeys.some((key) => params.has(key));
  const next = hasCampaign ? {} : readContactAttribution();
  for (const key of trackingKeys) {
    const value = params.get(key);
    if (value) next[key] = value.slice(0, 180);
  }
  if (!next.referrer && document.referrer) next.referrer = document.referrer;
  if (!next.sourceUrl) next.sourceUrl = window.location.href;
  return next;
}
export function persistContactAttribution(): void {
  try {
    sessionStorage.setItem('nm_contact_tracking', JSON.stringify(collectContactAttribution()));
  } catch {
    /* Optional storage. */
  }
}
