#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const args = new Map(
  process.argv
    .slice(2)
    .map((arg) => arg.split('='))
    .filter(([key, value]) => key && value)
);

const site = args.get('--site') || 'legacy';
const baseUrl = args.get('--base-url') || (site === 'staging' ? 'https://staging.netmarket.it' : 'https://netmarket.it');
const maxPages = Number(args.get('--max-pages') || 250);
const outputJson =
  args.get('--output-json') ||
  join(root, `data/final-audit/${site === 'staging' ? 'staging-site-inventory' : 'legacy-site-inventory'}.json`);
const outputMd =
  args.get('--output-md') ||
  join(root, `docs/final-audit/${site === 'staging' ? 'staging-site-inventory' : 'legacy-site-inventory'}.md`);

const seen = new Set();
const queue = [];
const inventory = [];
const discovered = {
  sitemaps: [],
  rest: [],
  internal: [],
  pdfs: []
};

await main();

async function main() {
  const base = normalizeUrl(baseUrl);
  enqueue(base);
  await discoverFromSitemaps(base);
  await discoverFromWordPressRest(base);

  while (queue.length > 0 && inventory.length < maxPages) {
    const url = queue.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const record = await auditUrl(url, base);
    inventory.push(record);
    for (const link of record.internalLinks) {
      if (link.endsWith('.pdf')) {
        discovered.pdfs.push(link);
        continue;
      }
      enqueue(link);
    }
  }

  const result = {
    site,
    baseUrl: base,
    crawledAt: new Date().toISOString(),
    maxPages,
    discovered,
    pages: inventory,
    summary: summarize(inventory)
  };
  write(outputJson, `${JSON.stringify(result, null, 2)}\n`);
  write(outputMd, markdown(result));
  console.log(JSON.stringify(result.summary, null, 2));
}

async function discoverFromSitemaps(base) {
  const candidates = ['/sitemap_index.xml', '/sitemap.xml', '/wp-sitemap.xml'];
  for (const path of candidates) {
    const url = new URL(path, base).toString();
    const response = await fetchText(url);
    if (!response.ok || !response.text.includes('<')) continue;
    const sitemapUrls = [...response.text.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) =>
      decodeXml(match[1].trim())
    );
    discovered.sitemaps.push({ url, status: response.status, count: sitemapUrls.length });
    for (const sitemapUrl of sitemapUrls) {
      if (sitemapUrl.endsWith('.xml')) {
        const nested = await fetchText(sitemapUrl);
        if (nested.ok) {
          const nestedUrls = [...nested.text.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) =>
            decodeXml(match[1].trim())
          );
          discovered.sitemaps.push({ url: sitemapUrl, status: nested.status, count: nestedUrls.length });
          nestedUrls.forEach(enqueue);
        }
      } else {
        enqueue(sitemapUrl);
      }
    }
  }
}

async function discoverFromWordPressRest(base) {
  const endpoints = ['/wp-json/wp/v2/pages?per_page=100', '/wp-json/wp/v2/posts?per_page=100'];
  for (const path of endpoints) {
    const url = new URL(path, base).toString();
    const response = await fetchJson(url);
    if (!response.ok || !Array.isArray(response.json)) {
      discovered.rest.push({ url, status: response.status, count: 0 });
      continue;
    }
    discovered.rest.push({ url, status: response.status, count: response.json.length });
    for (const item of response.json) {
      if (typeof item?.link === 'string') enqueue(item.link);
    }
  }
}

async function auditUrl(url, base) {
  const started = Date.now();
  const response = await fetchText(url);
  const finalUrl = response.url || url;
  const contentType = response.headers['content-type'] || '';
  const html = response.text || '';
  const status = response.status;
  const title = text(matchContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const description = attrMeta(html, 'description');
  const robots = attrMeta(html, 'robots');
  const canonical = attrLink(html, 'canonical');
  const h1 = headings(html, 'h1');
  const h2 = headings(html, 'h2');
  const og = openGraph(html);
  const structuredData = jsonLd(html);
  const images = extractImages(html, finalUrl);
  const links = extractLinks(html, finalUrl);
  const internalLinks = links
    .filter((link) => isInternal(link.href, base))
    .map((link) => normalizeUrl(link.href))
    .filter((href) => href.startsWith(base));
  const externalLinks = links.filter((link) => !isInternal(link.href, base)).map((link) => link.href);
  const bodyText = text(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
  return {
    url,
    finalUrl,
    status,
    ok: status >= 200 && status < 300,
    redirected: normalizeUrl(url) !== normalizeUrl(finalUrl),
    contentType,
    elapsedMs: Date.now() - started,
    title,
    description,
    canonical,
    robots,
    h1,
    h2,
    wordCount: wordCount(bodyText),
    images,
    imageCount: images.length,
    imagesMissingAlt: images.filter((image) => image.alt === '').length,
    internalLinks: unique(internalLinks),
    externalLinks: unique(externalLinks),
    structuredData,
    openGraph: og,
    preliminaryAction: preliminaryAction({ url, status, title, h1, canonical, robots, wordCount: wordCount(bodyText) })
  };
}

function enqueue(value) {
  if (!value) return;
  const normalized = normalizeUrl(value);
  if (!normalized.startsWith(normalizeUrl(baseUrl))) return;
  if (seen.has(normalized) || queue.includes(normalized)) return;
  if (/\.(jpg|jpeg|png|webp|gif|svg|css|js|woff2?|zip)$/i.test(new URL(normalized).pathname)) return;
  queue.push(normalized);
}

async function fetchText(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NetmarketFinalAuditBot/1.0 (+https://staging.netmarket.it)' },
      redirect: 'follow'
    });
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      text: await response.text()
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      url,
      headers: {},
      text: '',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function fetchJson(url) {
  const response = await fetchText(url);
  try {
    return { ...response, json: JSON.parse(response.text) };
  } catch {
    return { ...response, json: null };
  }
}

function matchContent(html, regex) {
  return html.match(regex)?.[1] || '';
}

function attrMeta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return decodeHtml(
    html.match(new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)["']`, 'i'))?.[1] ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${escaped}["']`, 'i'))?.[1] ||
      ''
  );
}

function attrLink(html, rel) {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return decodeHtml(
    html.match(new RegExp(`<link[^>]+rel=["']${escaped}["'][^>]+href=["']([^"']*)["']`, 'i'))?.[1] || ''
  );
}

function headings(html, tag) {
  return unique(
    [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
      .map((match) => text(match[1]))
      .filter(Boolean)
  );
}

function extractImages(html, pageUrl) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => {
    const raw = match[0];
    const src = attr(raw, 'src') || attr(raw, 'data-src') || '';
    return {
      src: src ? normalizeUrl(new URL(src, pageUrl).toString()) : '',
      alt: decodeHtml(attr(raw, 'alt')),
      loading: attr(raw, 'loading'),
      width: attr(raw, 'width'),
      height: attr(raw, 'height')
    };
  });
}

function extractLinks(html, pageUrl) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      href: normalizeUrl(new URL(decodeHtml(match[1]), pageUrl).toString()),
      text: text(match[2])
    }))
    .filter((link) => !link.href.startsWith('mailto:') && !link.href.startsWith('tel:'));
}

function attr(markup, name) {
  return decodeHtml(markup.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] || '');
}

function openGraph(html) {
  const entries = [...html.matchAll(/<meta[^>]+property=["']og:([^"']+)["'][^>]+content=["']([^"']*)["'][^>]*>/gi)];
  return Object.fromEntries(entries.map((match) => [match[1], decodeHtml(match[2])]));
}

function jsonLd(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => {
      try {
        const data = JSON.parse(match[1].trim());
        if (Array.isArray(data)) return data.map((item) => item?.['@type'] || 'unknown').join(',');
        return data?.['@type'] || data?.['@graph']?.map((item) => item?.['@type']).filter(Boolean).join(',') || 'unknown';
      } catch {
        return 'invalid';
      }
    }
  );
}

function preliminaryAction(page) {
  const path = new URL(page.url).pathname;
  if (page.status >= 500 || page.status === 0) return 'MANUAL_REVIEW';
  if (page.status === 404) return 'REMOVE_410';
  if (page.status >= 300 && page.status < 400) return 'REDIRECT';
  if (/wp-json|wp-content|wp-admin|feed|tag|category/i.test(path)) return 'NOINDEX';
  if (/contatti|agenzia|servizi|progetti|insight|siti|ecommerce|seo|social|marketing|comunicazione|concorsi/i.test(path)) {
    return 'MIGRATE';
  }
  if (!page.title || page.h1.length === 0 || page.wordCount < 120) return 'MANUAL_REVIEW';
  return 'KEEP';
}

function summarize(pages) {
  return {
    site,
    baseUrl: normalizeUrl(baseUrl),
    pages: pages.length,
    ok: pages.filter((page) => page.ok).length,
    redirects: pages.filter((page) => page.redirected).length,
    errors: pages.filter((page) => page.status >= 400 || page.status === 0).length,
    missingTitle: pages.filter((page) => !page.title).length,
    missingDescription: pages.filter((page) => !page.description).length,
    missingH1: pages.filter((page) => page.h1.length === 0).length,
    duplicateH1Urls: duplicateValues(pages, (page) => page.h1[0] || '').length,
    imagesMissingAlt: pages.reduce((sum, page) => sum + page.imagesMissingAlt, 0),
    actions: pages.reduce((acc, page) => {
      acc[page.preliminaryAction] = (acc[page.preliminaryAction] || 0) + 1;
      return acc;
    }, {})
  };
}

function markdown(result) {
  const rows = result.pages
    .map(
      (page) =>
        `| ${page.status} | ${escapeMd(new URL(page.url).pathname)} | ${escapeMd(page.title || '-')} | ${escapeMd(page.description || '-')} | ${escapeMd(page.h1[0] || '-')} | ${page.wordCount} | ${page.imageCount} | ${page.imagesMissingAlt} | ${page.structuredData.join(', ') || '-'} | ${page.preliminaryAction} |`
    )
    .join('\n');
  return `# ${result.site === 'staging' ? 'Staging' : 'Legacy'} Site Inventory

Base URL: ${result.baseUrl}
Crawled at: ${result.crawledAt}
Max pages: ${result.maxPages}

## Summary

\`\`\`json
${JSON.stringify(result.summary, null, 2)}
\`\`\`

## Discovery

- Sitemap sources: ${result.discovered.sitemaps.map((item) => `${item.url} (${item.count})`).join(', ') || 'none'}
- REST sources: ${result.discovered.rest.map((item) => `${item.url} (${item.count})`).join(', ') || 'none'}
- PDF links discovered: ${unique(result.discovered.pdfs).length}

## Pages

| Status | Path | Title | Description | H1 | Words | Images | Missing alt | JSON-LD | Preliminary action |
| ---: | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |
${rows}
`;
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function wordCount(value) {
  return value.split(/\s+/).filter(Boolean).length;
}

function text(value = '') {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function decodeHtml(value = '') {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function decodeXml(value = '') {
  return decodeHtml(value);
}

function isInternal(url, base) {
  return new URL(url).hostname === new URL(base).hostname;
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '/');
  }
  return url.toString();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function duplicateValues(items, getter) {
  const counts = new Map();
  for (const item of items) {
    const value = getter(item);
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts].filter(([, count]) => count > 1);
}

function escapeMd(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
