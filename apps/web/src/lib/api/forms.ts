import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2),
  company: z.string().max(120).optional(),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  service: z.string().max(120).optional(),
  message: z.string().min(10),
  privacyConsent: z.literal(true),
  marketingConsent: z.boolean().optional(),
  website: z.string().max(0).optional(),
  turnstileToken: z.string().optional(),
  utm: z.record(z.string()).optional(),
  sourceUrl: z.string().url(),
  referrer: z.string().optional()
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;

export async function submitContactForm(payload: ContactFormPayload): Promise<{ ok: true }> {
  const parsed = contactFormSchema.parse(payload);
  const cmsUrl = import.meta.env.PUBLIC_CMS_URL || 'https://cms.netmarket.it';
  const response = await fetch(`${cmsUrl}/wp-json/netmarket/v1/forms/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(parsed)
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
      code?: string;
    } | null;
    throw new Error(body?.message || body?.code || 'contact_form_failed');
  }
  return { ok: true };
}
