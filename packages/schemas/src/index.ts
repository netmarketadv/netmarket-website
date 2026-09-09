import { z } from 'zod';

const assetUrlSchema = z
  .string()
  .url()
  .or(z.string().regex(/^\/(?!\/)/));

export const mediaAssetSchema = z.object({
  id: z.number().int().nonnegative(),
  url: assetUrlSchema,
  alt: z.string(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  srcset: z.string().nullable().optional(),
  sizes: z.string().nullable().optional(),
  focalPoint: z.string().nullable().optional()
});

export const imageAssetSchema = mediaAssetSchema;

export const seoMetadataSchema = z.object({
  title: z.string().max(90).optional(),
  description: z.string().max(190).optional(),
  canonical: z.string().url().or(z.literal('')).optional(),
  noindex: z.boolean().default(false),
  socialTitle: z.string().optional(),
  socialDescription: z.string().optional(),
  socialImage: mediaAssetSchema.nullable().optional()
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive().max(50),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative()
});

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), pagination: paginationSchema });

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

export const relationSummarySchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  type: z.string(),
  image: mediaAssetSchema.nullable().optional()
});

export const linkSchema = z.object({
  label: z.string(),
  url: z.string().url()
});

export const metricSchema = z.object({
  label: z.string(),
  value: z.string(),
  context: z.string().optional()
});

export const caseStudyMediaSchema = z.object({
  media: mediaAssetSchema,
  alt: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.string().optional(),
  layoutHint: z.enum(['wide', 'portrait', 'square', 'split', 'device', 'detail']).default('wide')
});

export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string()
});

const baseContentSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional(),
  image: mediaAssetSchema.nullable().optional(),
  sectors: z.array(taxonomySchema).default([]),
  capabilities: z.array(taxonomySchema).default([]),
  technologies: z.array(taxonomySchema).default([]),
  seo: seoMetadataSchema
});

export const serviceSchema = baseContentSchema.extend({
  subtitle: z.string().optional(),
  shortDescription: z.string().optional(),
  hero: z.object({ image: mediaAssetSchema.nullable().optional() }).optional(),
  valueProps: z.array(z.unknown()).default([]),
  problems: z.array(z.unknown()).default([]),
  process: z.array(z.unknown()).default([]),
  results: z.array(metricSchema).or(z.array(z.unknown())).default([]),
  faq: z.array(faqItemSchema).or(z.array(z.unknown())).default([]),
  priority: z.number().int().default(0),
  featured: z.boolean().default(false),
  cta: linkSchema.nullable().optional(),
  relatedServices: z.array(relationSummarySchema).default([]),
  relatedCaseStudies: z.array(relationSummarySchema).default([])
});

export const clientSchema = baseContentSchema.extend({
  brandName: z.string(),
  logo: mediaAssetSchema.nullable().optional(),
  inverseLogo: mediaAssetSchema.nullable().optional(),
  officialSite: z.string().url().or(z.literal('')).optional(),
  shortDescription: z.string().optional(),
  visualScale: z.number().positive().default(1),
  showInMarquee: z.boolean().default(false),
  priority: z.number().int().default(0)
});

export const personSchema = baseContentSchema.extend({
  fullName: z.string(),
  displayName: z.string(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  role: z.string().optional(),
  photo: mediaAssetSchema.nullable().optional(),
  linkedin: z.string().url().or(z.literal('')).optional(),
  shortBio: z.string().optional(),
  expertise: z.array(z.string()).default([]),
  priority: z.number().int().default(0),
  visibleInTeam: z.boolean().default(false),
  linkedWpUser: z.number().int().nonnegative().default(0)
});

export const caseStudySchema = baseContentSchema.extend({
  client: relationSummarySchema.nullable().optional(),
  publicClientName: z.string().optional(),
  shortDescription: z.string().optional(),
  cover: mediaAssetSchema.nullable().optional(),
  projectYear: z.number().int().default(0),
  projectStatus: z.enum(['draft', 'published', 'archived']).default('published'),
  projectUrl: z.string().url().or(z.literal('')).optional(),
  context: z.string().optional(),
  challenge: z.string().optional(),
  objectives: z.array(z.unknown()).default([]),
  approach: z.string().optional(),
  solution: z.string().optional(),
  qualitativeResult: z.string().optional(),
  additionalContent: z.string().optional(),
  numericResults: z.array(metricSchema).default([]),
  gallery: z.array(caseStudyMediaSchema).default([]),
  services: z.array(relationSummarySchema).default([]),
  contributors: z.array(relationSummarySchema).default([]),
  relatedInsights: z.array(relationSummarySchema).default([]),
  relatedCaseStudies: z.array(relationSummarySchema).default([]),
  priority: z.number().int().default(0),
  featured: z.boolean().default(false),
  cta: linkSchema.nullable().optional()
});

export const testimonialSchema = baseContentSchema.extend({
  quote: z.string().optional(),
  authorName: z.string().optional(),
  authorRole: z.string().optional(),
  client: relationSummarySchema.nullable().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().url().or(z.literal('')).optional(),
  rating: z.number().min(0).max(5).default(0),
  priority: z.number().int().default(0),
  featured: z.boolean().default(false),
  caseStudy: relationSummarySchema.nullable().optional(),
  service: relationSummarySchema.nullable().optional()
});

export const resourceSchema = baseContentSchema.extend({
  description: z.string().optional(),
  cover: mediaAssetSchema.nullable().optional(),
  resourceType: z
    .enum(['pdf', 'presentation', 'checklist', 'guide', 'template', 'download'])
    .default('guide'),
  file: mediaAssetSchema.nullable().optional(),
  accessType: z.enum(['free', 'lead-gated', 'future-paid']).default('free'),
  cta: linkSchema.nullable().optional(),
  relatedServices: z.array(relationSummarySchema).default([]),
  relatedPosts: z.array(relationSummarySchema).default([]),
  authorPerson: relationSummarySchema.nullable().optional(),
  priority: z.number().int().default(0),
  featured: z.boolean().default(false)
});

export const insightSchema = baseContentSchema.extend({
  content: z.string().optional(),
  subtitle: z.string().optional(),
  authorPerson: relationSummarySchema.nullable().optional(),
  publishedAt: z.string().optional(),
  modifiedAt: z.string().optional(),
  categories: z
    .array(z.object({ id: z.number().int(), slug: z.string(), name: z.string() }))
    .default([]),
  readingTime: z.number().int().positive(),
  featured: z.boolean().default(false),
  priority: z.number().int().default(0),
  relatedServices: z.array(relationSummarySchema).default([]),
  relatedCaseStudies: z.array(relationSummarySchema).default([]),
  relatedResources: z.array(relationSummarySchema).default([])
});

export const landingPageSchema = baseContentSchema.extend({
  campaignId: z.string(),
  templateVariant: z
    .enum(['lead-generation', 'service-focused', 'campaign'])
    .default('lead-generation'),
  shortDescription: z.string().optional(),
  hero: z.array(z.unknown()).or(z.record(z.string(), z.unknown())).default({}),
  valueProposition: z.array(z.unknown()).or(z.record(z.string(), z.unknown())).default({}),
  proof: z.array(z.unknown()).or(z.record(z.string(), z.unknown())).default({}),
  service: relationSummarySchema.nullable().optional(),
  caseStudy: relationSummarySchema.nullable().optional(),
  testimonial: relationSummarySchema.nullable().optional(),
  primaryCta: linkSchema.nullable().optional(),
  formType: z.enum(['none', 'contact', 'download']).default('none'),
  formConfig: z.array(z.unknown()).or(z.record(z.string(), z.unknown())).default({}),
  thankYouUrl: z.string().url().or(z.literal('')).optional(),
  trackingMetadata: z.array(z.unknown()).or(z.record(z.string(), z.unknown())).default({})
});

export const siteSettingsSchema = z.object({
  siteName: z.string(),
  payoff: z.string(),
  locale: z.literal('it-IT'),
  environment: z.enum(['local', 'staging', 'production']),
  company: z
    .object({
      brandName: z.string().optional(),
      legalName: z.string().optional(),
      vatId: z.string().optional()
    })
    .optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      hours: z.string().optional()
    })
    .optional(),
  social: z.record(z.string(), z.string().url()).optional()
});

export const serviceCollectionSchema = paginatedSchema(serviceSchema);
export const caseStudyCollectionSchema = paginatedSchema(caseStudySchema);
export const clientCollectionSchema = paginatedSchema(clientSchema);
export const personCollectionSchema = paginatedSchema(personSchema);
export const insightCollectionSchema = paginatedSchema(insightSchema);
export const resourceCollectionSchema = paginatedSchema(resourceSchema);
export const testimonialCollectionSchema = paginatedSchema(testimonialSchema);

export type Service = z.infer<typeof serviceSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Client = z.infer<typeof clientSchema>;
export type Person = z.infer<typeof personSchema>;
export type Insight = z.infer<typeof insightSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type LandingPage = z.infer<typeof landingPageSchema>;
export type Taxonomy = z.infer<typeof taxonomySchema>;
export type SeoMetadata = z.infer<typeof seoMetadataSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type CaseStudyMedia = z.infer<typeof caseStudyMediaSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type RelationSummary = z.infer<typeof relationSummarySchema>;

export function parseEndpoint<T>(endpoint: string, schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.join('.') || 'root';
    throw new Error(`Risposta CMS non valida per ${endpoint}: campo ${field}`);
  }
  return parsed.data;
}
