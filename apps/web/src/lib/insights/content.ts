import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import type { Insight, MediaAsset, RelationSummary } from '@netmarket/schemas';
import { insightSchema } from '@netmarket/schemas';
import { getInsight, getInsights } from '@/lib/api/client';

export type InsightSource = 'cms' | 'migration-snapshot';

export interface InsightArchiveData {
  insights: Insight[];
  source: InsightSource;
  totalPages: number;
}

export interface InsightDetailData {
  insight: Insight;
  source: InsightSource;
  related: RelationSummary[];
}

type MigrationInsight = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  dates: { published: string; modified: string };
  author: { legacyName: string };
  categories: Array<{ id: number; slug: string; name: string }>;
  relatedServices: string[];
  media: Array<{ sourceUrl: string; alt: string; role: string }>;
  seo: { title?: string; description?: string; noindex?: boolean };
  readingTime: number;
  priority: number;
  featured: boolean;
};

const perPage = 9;
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

let archivePromise: Promise<InsightArchiveData> | undefined;

function warningMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function byDate(a: Insight, b: Insight): number {
  return (Date.parse(b.publishedAt || '') || 0) - (Date.parse(a.publishedAt || '') || 0);
}

export async function getInsightArchiveData(): Promise<InsightArchiveData> {
  archivePromise ??= loadArchive();
  return archivePromise;
}

async function loadArchive(): Promise<InsightArchiveData> {
  try {
    const first = await getInsights({ page: 1, perPage, sort: 'date' });
    if (first.data.length > 0) {
      const pages = [first.data];
      for (let page = 2; page <= first.pagination.totalPages; page += 1) {
        const next = await getInsights({ page, perPage, sort: 'date' });
        pages.push(next.data);
      }
      return {
        insights: pages.flat().sort(byDate),
        totalPages: Math.max(1, first.pagination.totalPages),
        source: 'cms'
      };
    }
  } catch (error) {
    console.warn(
      `[insights] CMS unavailable, using migration snapshot fallback: ${warningMessage(error)}`
    );
  }

  const insights = fallbackInsights().sort(byDate);
  return {
    insights,
    source: 'migration-snapshot',
    totalPages: Math.max(1, Math.ceil(insights.length / perPage))
  };
}

export async function getInsightPage(page = 1): Promise<InsightArchiveData> {
  const archive = await getInsightArchiveData();
  const start = (page - 1) * perPage;
  return {
    ...archive,
    insights: archive.insights.slice(start, start + perPage)
  };
}

export async function getInsightDetailData(slug: string): Promise<InsightDetailData | undefined> {
  try {
    const insight = await getInsight(slug);
    return { insight, source: 'cms', related: await relatedFor(slug) };
  } catch (error) {
    console.warn(
      `[insights] CMS insight "${slug}" unavailable, trying snapshot fallback: ${warningMessage(error)}`
    );
  }
  const insights = fallbackInsights().sort(byDate);
  const insight = insights.find((item) => item.slug === slug);
  if (!insight) return undefined;
  return {
    insight,
    source: 'migration-snapshot',
    related: insights
      .filter((item) => item.slug !== slug)
      .slice(0, 3)
      .map(toInsightRelation)
  };
}

async function relatedFor(slug: string): Promise<RelationSummary[]> {
  const { insights } = await getInsightArchiveData();
  return insights
    .filter((insight) => insight.slug !== slug)
    .slice(0, 3)
    .map(toInsightRelation);
}

function fallbackInsights(): Insight[] {
  const file = resolve(
    process.cwd(),
    '../../data/migrations/insights/insight-transform-dry-run.json'
  );
  const raw = JSON.parse(readFileSync(file, 'utf8')) as MigrationInsight[];
  return raw.map(toInsight);
}

function toInsight(item: MigrationInsight): Insight {
  const image = item.media.find((media) => media.role === 'featured');
  const asset = image ? mediaAsset(item.id, image.sourceUrl, image.alt || item.title) : null;
  const description = clampText(item.seo.description || item.excerpt || item.title, 190);
  return insightSchema.parse({
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    image: asset,
    sectors: [],
    capabilities: [],
    technologies: [],
    seo: {
      title: item.seo.title || item.title,
      description,
      noindex: Boolean(item.seo.noindex),
      socialImage: asset
    },
    content: removeMissingImages(item.content),
    subtitle: '',
    authorPerson: null,
    publishedAt: item.dates.published,
    modifiedAt: item.dates.modified,
    categories: item.categories,
    readingTime: item.readingTime,
    featured: item.featured,
    priority: item.priority,
    relatedServices: item.relatedServices.map((slug) => ({
      id: stableId(slug),
      slug,
      title: serviceTitles[slug] || slug,
      type: 'nm_service'
    })),
    relatedCaseStudies: [],
    relatedResources: []
  });
}

function mediaAsset(id: number, sourceUrl: string, alt: string): MediaAsset | null {
  const filename = `${id}-${basename(new URL(sourceUrl).pathname)}`;
  const localPath = resolve(process.cwd(), `public/media/insights/legacy/${filename}`);
  if (!existsSync(localPath)) return null;
  return {
    id,
    url: `/media/insights/legacy/${filename}`,
    alt,
    width: null,
    height: null,
    mimeType: mimeType(filename)
  };
}

function removeMissingImages(markup: string): string {
  return markup.replace(
    /<img[^>]+src=["']\/media\/insights\/legacy\/([^"']+)["'][^>]*>/gi,
    (_match, filename) => {
      const localPath = resolve(process.cwd(), `public/media/insights/legacy/${filename}`);
      return existsSync(localPath) ? _match : '';
    }
  );
}

export function toInsightRelation(insight: Insight): RelationSummary {
  return {
    id: insight.id,
    slug: insight.slug,
    title: insight.title,
    type: 'post',
    image: insight.image ?? null
  };
}

function stableId(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function mimeType(filename: string): string {
  if (filename.endsWith('.svg')) return 'image/svg+xml';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

function clampText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  const clipped = normalized.slice(0, maxLength - 1);
  const sentence = clipped.match(/^(.+[.!?])\s+/);
  if (sentence?.[1] && sentence[1].length >= 80) return sentence[1];
  const wordBoundary = clipped.replace(/\s+\S*$/, '');
  return `${wordBoundary || clipped}…`;
}

export function insightPath(slug: string): string {
  return `/insight/${slug}/`;
}

export function insightDescription(insight: Insight): string {
  return insight.seo.description || insight.excerpt || 'Approfondimento Netmarket.';
}

export function formatDate(value?: string): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));
}
