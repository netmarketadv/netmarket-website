import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().max(120).optional(),
  email: z.string().trim().email(),
  phone: z.string().max(40).optional(),
  service: z.string().max(120).optional(),
  message: z.string().trim().min(10).max(3000),
  privacyConsent: z.literal(true),
  marketingConsent: z.boolean().optional(),
  website: z.string().max(0).optional(),
  turnstileToken: z.string().optional(),
  utm: z.record(z.string()).optional(),
  sourceUrl: z.string().url(),
  referrer: z.string().optional(),
  elapsedMs: z.number().int().nonnegative().optional()
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;

const CAREER_CV_MAX_BYTES = 5 * 1024 * 1024;
const CAREER_CV_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

async function assertSuccessfulResponse(response: Response): Promise<{ ok: true }> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
      code?: string;
    } | null;
    throw new Error(body?.message || body?.code || 'contact_form_failed');
  }
  return { ok: true };
}

export async function submitContactForm(payload: ContactFormPayload): Promise<{ ok: true }> {
  const parsed = contactFormSchema.parse(payload);
  const cmsUrl = import.meta.env.PUBLIC_CMS_URL || 'https://cms.netmarket.it';
  const response = await fetch(`${cmsUrl}/wp-json/netmarket/v1/forms/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(parsed)
  });
  return assertSuccessfulResponse(response);
}

export async function submitCareerForm(
  payload: ContactFormPayload,
  cv: File
): Promise<{ ok: true }> {
  const parsed = contactFormSchema.parse(payload);
  const extension = cv.name.split('.').pop()?.toLowerCase();
  if (!extension || !CAREER_CV_EXTENSIONS.has(extension)) {
    throw new Error('invalid_cv');
  }
  if (cv.size <= 0 || cv.size > CAREER_CV_MAX_BYTES) {
    throw new Error('invalid_cv_size');
  }

  const body = new FormData();
  Object.entries(parsed).forEach(([key, value]) => {
    if (value === undefined) return;
    body.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  });
  body.append('cv', cv, cv.name);

  const cmsUrl = import.meta.env.PUBLIC_CMS_URL || 'https://cms.netmarket.it';
  const response = await fetch(`${cmsUrl}/wp-json/netmarket/v1/forms/contact`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body
  });
  return assertSuccessfulResponse(response);
}
