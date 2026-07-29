import { z } from 'zod';

export const imageAssetSchema = z.object({
  id: z.number().int().nonnegative(),
  url: z.string().url(),
  alt: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional()
});

export const seoMetadataSchema = z.object({
  title: z.string().max(70).optional(),
  description: z.string().max(170).optional(),
  canonical: z.string().url().optional(),
  noindex: z.boolean().default(false)
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative()
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  status: z.number().int()
});

export const taxonomySchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  taxonomy: z.enum(['nm_sector', 'nm_capability', 'nm_technology'])
});

const linkSchema = z.object({ label: z.string(), url: z.string().url() }).partial();

export const serviceSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  priority: z.number().int().optional(),
  featured: z.boolean().default(false),
  cta: linkSchema.optional(),
  relatedServices: z.array(z.number().int()).default([]),
  relatedCaseStudies: z.array(z.number().int()).default([]),
  seo: seoMetadataSchema
});

export const caseStudySchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  publicClientName: z.string().optional(),
  excerpt: z.string().optional(),
  projectYear: z.number().int().optional(),
  projectUrl: z.string().url().optional(),
  numericResults: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  services: z.array(z.number().int()).default([]),
  technologies: z.array(z.number().int()).default([]),
  cta: linkSchema.optional(),
  seo: seoMetadataSchema
});

export const landingPageSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  campaignId: z.string(),
  excerpt: z.string().optional(),
  primaryCta: linkSchema.optional(),
  formType: z.enum(['none', 'contact', 'download']).default('none'),
  thankYouUrl: z.string().url().optional(),
  seo: seoMetadataSchema
});

export const siteSettingsSchema = z.object({
  siteName: z.string(),
  payoff: z.string(),
  locale: z.literal('it-IT'),
  environment: z.enum(['local', 'staging', 'production'])
});

export type Service = z.infer<typeof serviceSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type LandingPage = z.infer<typeof landingPageSchema>;
export type Taxonomy = z.infer<typeof taxonomySchema>;
export type SeoMetadata = z.infer<typeof seoMetadataSchema>;
export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export function parseEndpoint<T>(endpoint: string, schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.join('.') || 'root';
    throw new Error(`Risposta CMS non valida per ${endpoint}: campo ${field}`);
  }
  return parsed.data;
}
