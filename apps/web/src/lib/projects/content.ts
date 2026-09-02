import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CaseStudy, MediaAsset, RelationSummary } from '@netmarket/schemas';
import { caseStudySchema } from '@netmarket/schemas';
import { getCaseStudies, getCaseStudy } from '@/lib/api/client';
import { getPublicEnv } from '@/lib/env';

type ProjectSource = 'cms' | 'migration-snapshot';

type MigrationMedia = {
  sourceUrl: string;
  filename: string;
  alt: string;
  caption?: string;
};

type MigrationProject = {
  migration: { legacyId: number };
  slug: string;
  title: string;
  client: string | null;
  services: string[];
  seo: {
    title?: string;
    description?: string;
    noindex?: boolean;
    socialImage?: string;
  };
  content: {
    shortDescription?: string;
    context?: string;
    challenge?: string;
    objectives?: unknown[];
    approach?: string;
    solution?: string;
    additionalContent?: string;
    numericResults?: unknown[];
  };
  media: {
    featuredImage?: string;
    gallery: MigrationMedia[];
    clientLogo?: MigrationMedia | null;
  };
  warnings: string[];
};

export interface ProjectArchiveData {
  projects: CaseStudy[];
  source: ProjectSource;
}

export interface ProjectDetailData {
  project: CaseStudy;
  source: ProjectSource;
  nextProject: RelationSummary | undefined;
}

const serviceTitles: Record<string, string> = {
  advertising: 'Advertising',
  'branding-e-comunicazione': 'Branding e comunicazione',
  'concorsi-a-premi': 'Concorsi a premi',
  'content-production': 'Content production',
  ecommerce: 'Ecommerce',
  seo: 'SEO',
  'siti-web': 'Siti web',
  'social-media': 'Social media',
  'software-e-integrazioni': 'Software e integrazioni'
};

let archiveDataPromise: Promise<ProjectArchiveData> | undefined;

function warningMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function byPriority(a: CaseStudy, b: CaseStudy): number {
  return a.priority - b.priority || b.projectYear - a.projectYear || a.title.localeCompare(b.title, 'it');
}

export async function getProjectArchiveData(): Promise<ProjectArchiveData> {
  archiveDataPromise ??= loadArchiveData();
  return archiveDataPromise;
}

async function loadArchiveData(): Promise<ProjectArchiveData> {
  try {
    const collection = await getCaseStudies({ perPage: 50, sort: 'priority' });
    if (collection.data.length > 0) {
      return { projects: collection.data.sort(byPriority), source: 'cms' };
    }
  } catch (error) {
    console.warn(
      `[projects] CMS case studies unavailable, using migration snapshot fallback: ${warningMessage(error)}`
    );
  }

  return { projects: fallbackProjects().sort(byPriority), source: 'migration-snapshot' };
}

export async function getProjectDetailData(slug: string): Promise<ProjectDetailData | undefined> {
  try {
    const project = await getCaseStudy(slug);
    return { project, source: 'cms', nextProject: await nextProjectFor(slug) };
  } catch (error) {
    console.warn(
      `[projects] CMS case study "${slug}" unavailable, trying migration snapshot fallback: ${warningMessage(error)}`
    );
  }

  const projects = fallbackProjects().sort(byPriority);
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];
  if (!project) return undefined;
  const next = projects[(index + 1) % projects.length];
  return {
    project,
    source: 'migration-snapshot',
    nextProject: next ? toProjectRelation(next) : undefined
  };
}

async function nextProjectFor(slug: string): Promise<RelationSummary | undefined> {
  const { projects } = await getProjectArchiveData();
  const index = projects.findIndex((project) => project.slug === slug);
  const next = projects[(index + 1) % projects.length];
  return next && next.slug !== slug ? toProjectRelation(next) : undefined;
}

function fallbackProjects(): CaseStudy[] {
  const file = resolve(process.cwd(), '../../data/migrations/case-studies/case-study-transform-dry-run.json');
  const raw = JSON.parse(readFileSync(file, 'utf8')) as MigrationProject[];
  return raw.map(toCaseStudy);
}

function toCaseStudy(item: MigrationProject): CaseStudy {
  const cover = item.media.featuredImage ? mediaAsset(item, item.media.featuredImage, item.title) : null;
  return caseStudySchema.parse({
    id: item.migration.legacyId,
    slug: item.slug,
    title: item.title,
    excerpt: item.content.shortDescription,
    image: cover,
    seo: {
      title: item.seo.title || item.title,
      description: item.seo.description || item.content.shortDescription || '',
      noindex: Boolean(item.seo.noindex),
      socialImage: cover
    },
    client: item.client
      ? {
          id: stableId(item.client),
          slug: slugify(item.client),
          title: item.client,
          type: 'nm_client',
          image: item.media.clientLogo ? mediaFromEntry(item, item.media.clientLogo, item.client) : null
        }
      : null,
    publicClientName: item.client || '',
    shortDescription: item.content.shortDescription,
    cover,
    projectYear: Number(item.slug.match(/20\d{2}/)?.[0] || 0),
    projectStatus: 'published',
    context: item.content.context,
    challenge: item.content.challenge,
    objectives: item.content.objectives || [],
    approach: item.content.approach,
    solution: item.content.solution,
    additionalContent: item.content.additionalContent,
    numericResults: item.content.numericResults || [],
    gallery: item.media.gallery.map((entry, index) => ({
      media: mediaFromEntry(item, entry, item.title, index + 1000),
      alt: entry.alt,
      caption: entry.caption || '',
      layoutHint: 'wide'
    })),
    services: item.services.map((slug) => ({
      id: stableId(slug),
      slug,
      title: serviceTitles[slug] || slug,
      type: 'nm_service'
    })),
    contributors: [],
    relatedInsights: [],
    priority: item.migration.legacyId,
    featured: !item.seo.noindex,
    cta: null
  });
}

function mediaFromEntry(
  item: MigrationProject,
  entry: MigrationMedia,
  fallbackAlt: string,
  offset = 0
): MediaAsset {
  return mediaAsset(item, entry.sourceUrl, entry.alt || fallbackAlt, offset);
}

function mediaAsset(item: MigrationProject, sourceUrl: string, alt: string, offset = 0): MediaAsset {
  const env = getPublicEnv();
  const filename = new URL(sourceUrl).pathname.split('/').pop() || 'media';
  return {
    id: item.migration.legacyId + offset,
    url: new URL(`/media/case-studies/legacy/${item.migration.legacyId}-${filename}`, env.PUBLIC_SITE_URL).toString(),
    alt,
    width: null,
    height: null,
    mimeType: mimeType(filename)
  };
}

export function toProjectRelation(project: CaseStudy): RelationSummary {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    type: 'nm_case_study',
    image: project.cover ?? project.image ?? null
  };
}

function stableId(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function mimeType(filename: string): string {
  if (filename.endsWith('.svg')) return 'image/svg+xml';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

export function projectPath(slug: string): string {
  return `/progetti/${slug}/`;
}

export function projectClient(project: CaseStudy): string {
  return project.client?.title || project.publicClientName || 'Cliente';
}

export function projectDescription(project: CaseStudy): string {
  return (
    project.seo.description ||
    project.shortDescription ||
    project.excerpt ||
    project.context ||
    'Caso studio Netmarket.'
  );
}

export function projectCategory(project: CaseStudy): string {
  return project.services[0]?.title || 'Caso studio';
}
