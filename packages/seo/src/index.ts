export type Robots = 'index, follow' | 'noindex, nofollow' | 'noindex, nofollow, noarchive';

export interface PageMeta {
  title: string;
  description: string;
  canonicalPath?: string;
  siteUrl: string;
  robots: Robots;
  image?: string;
}

export interface PersonMeta {
  id: string;
  name: string;
  givenName: string;
  familyName: string;
  jobTitle: string;
  sameAs: string[];
  image?: string;
}

export interface OrganizationMeta {
  name?: string;
  legalName?: string;
  url?: string;
  vatId?: string;
}

export interface ArticleMeta {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: PersonMeta;
}

export function buildTitle(title: string, siteName = 'Netmarket'): string {
  return title === siteName ? siteName : `${title} | ${siteName}`;
}

export function absoluteCanonical(siteUrl: string, path = '/'): string {
  return new URL(path, siteUrl).toString();
}

export function organizationJsonLd(
  siteUrl: string,
  organization: OrganizationMeta = {}
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteCanonical(siteUrl, '/#organization'),
    name: organization.name ?? 'Netmarket',
    ...(organization.legalName ? { legalName: organization.legalName } : {}),
    ...(organization.vatId ? { vatID: organization.vatId } : {}),
    url: organization.url ?? siteUrl
  };
}

export function webSiteJsonLd(siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Netmarket',
    url: siteUrl,
    inLanguage: 'it-IT'
  };
}

export function webPageJsonLd(meta: PageMeta): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url: absoluteCanonical(meta.siteUrl, meta.canonicalPath)
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function serviceJsonLd(
  siteUrl: string,
  name: string,
  description: string,
  url: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    provider: { '@id': absoluteCanonical(siteUrl, '/#organization') },
    areaServed: 'Italy'
  };
}

export function articleJsonLd(article: ArticleMeta, siteUrl?: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    ...(article.author && siteUrl ? { author: personJsonLd(siteUrl, article.author) } : {})
  };
}

export function caseStudyJsonLd(
  title: string,
  description: string,
  url: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description,
    url
  };
}

export function personJsonLd(siteUrl: string, person: PersonMeta): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absoluteCanonical(siteUrl, `/#person-${person.id}`),
    name: person.name,
    givenName: person.givenName,
    familyName: person.familyName,
    jobTitle: person.jobTitle,
    worksFor: {
      '@id': absoluteCanonical(siteUrl, '/#organization')
    },
    sameAs: person.sameAs,
    ...(person.image ? { image: person.image } : {})
  };
}
