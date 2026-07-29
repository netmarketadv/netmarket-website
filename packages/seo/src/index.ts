export type Robots = 'index, follow' | 'noindex, nofollow' | 'noindex, nofollow, noarchive';

export interface PageMeta {
  title: string;
  description: string;
  canonicalPath?: string;
  siteUrl: string;
  robots: Robots;
  image?: string;
}

export function buildTitle(title: string, siteName = 'Netmarket'): string {
  return title === siteName ? siteName : `${title} | ${siteName}`;
}

export function absoluteCanonical(siteUrl: string, path = '/'): string {
  return new URL(path, siteUrl).toString();
}

export function organizationJsonLd(siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Netmarket',
    url: siteUrl
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
  name: string,
  description: string,
  url: string
): Record<string, unknown> {
  return { '@context': 'https://schema.org', '@type': 'Service', name, description, url };
}

export function articleJsonLd(
  title: string,
  description: string,
  url: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url
  };
}
