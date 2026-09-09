export type Robots =
  'index, follow' | 'noindex, follow' | 'noindex, nofollow' | 'noindex, nofollow, noarchive';

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
  logo?: string;
}

export type AreaServed =
  | string
  | {
      '@type': 'City' | 'Country';
      name: string;
    };

export interface ArticleMeta {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: PersonMeta;
  image?: string;
}

export function buildTitle(title: string, siteName = 'Netmarket'): string {
  const normalizedTitle = title.trim();
  return normalizedTitle === siteName || normalizedTitle.endsWith(`| ${siteName}`)
    ? normalizedTitle
    : `${normalizedTitle} | ${siteName}`;
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
    legalName: organization.legalName ?? 'Netmarket Srl',
    vatID: organization.vatId ?? '03618730281',
    logo: organization.logo ?? absoluteCanonical(siteUrl, '/icon-512.png'),
    url: organization.url ?? siteUrl,
    foundingDate: '1986',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Viale della Navigazione Interna, 51/b',
      postalCode: '35129',
      addressLocality: 'Padova',
      addressRegion: 'PD',
      addressCountry: 'IT'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'segreteria@netmarket.it',
      contactType: 'customer service',
      availableLanguage: 'Italian'
    },
    sameAs: [
      'https://www.linkedin.com/company/netmarket-s.r.l./',
      'https://www.instagram.com/netmarket.it/',
      'https://www.facebook.com/Netmarket.adv/'
    ]
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
  url: string,
  serviceType = name,
  areaServed: AreaServed | AreaServed[] = 'Italy'
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description,
    url,
    serviceType,
    provider: { '@id': absoluteCanonical(siteUrl, '/#organization') },
    areaServed
  };
}

export function articleJsonLd(article: ArticleMeta, siteUrl?: string): Record<string, unknown> {
  const organizationId = siteUrl ? absoluteCanonical(siteUrl, '/#organization') : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'BlogPosting'],
    '@id': `${article.url}#article`,
    headline: article.title,
    description: article.description,
    url: article.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': article.url },
    inLanguage: 'it-IT',
    ...(article.image ? { image: article.image } : {}),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    ...(article.author && siteUrl
      ? { author: personJsonLd(siteUrl, article.author) }
      : organizationId
        ? { author: { '@id': organizationId } }
        : {}),
    ...(organizationId ? { publisher: { '@id': organizationId } } : {})
  };
}

export function caseStudyJsonLd(
  title: string,
  description: string,
  url: string,
  details: {
    client?: string;
    year?: number;
    sector?: string;
    services?: string[];
    result?: string;
    image?: string;
    providerId?: string;
  } = {}
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description,
    url,
    ...(details.image ? { image: details.image } : {}),
    ...(details.year ? { dateCreated: String(details.year) } : {}),
    ...(details.client ? { about: { '@type': 'Organization', name: details.client } } : {}),
    ...(details.sector ? { genre: details.sector } : {}),
    ...(details.services?.length ? { keywords: details.services.join(', ') } : {}),
    ...(details.result ? { abstract: details.result } : {}),
    ...(details.providerId ? { provider: { '@id': details.providerId } } : {})
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
