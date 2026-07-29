import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
  privacyConsent: z.literal(true),
  website: z.string().max(0).optional(),
  turnstileToken: z.string().optional(),
  utm: z.record(z.string()).optional(),
  sourceUrl: z.string().url(),
  referrer: z.string().optional()
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;

export async function submitContactForm(_payload: ContactFormPayload): Promise<never> {
  throw new Error(
    'Endpoint non attivo: POST /netmarket/v1/forms/contact sara implementato lato CMS.'
  );
}
