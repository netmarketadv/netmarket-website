#!/usr/bin/env node

const origin = 'https://netmarket.it';
const routes = [
  '/',
  '/servizi/',
  '/servizi/siti-web/',
  '/servizi/ecommerce/',
  '/servizi/seo/',
  '/agenzia/',
  '/progetti/',
  '/insight/',
  '/nod/',
  '/contatti/',
  '/progetti/sviluppo-sito-web-fotovoltaico-progetto-e/',
  '/insight/migliore-web-agency-padova/'
];
const failures = [];

const getAttribute = (tag, attribute) =>
  tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];

const findElementByAttribute = (html, element, attribute, expectedValue) =>
  [...html.matchAll(new RegExp(`<${element}\\b[^>]*>`, 'gi'))]
    .map(([tag]) => tag)
    .find((tag) => getAttribute(tag, attribute)?.toLowerCase() === expectedValue);

for (const route of routes) {
  const response = await fetch(`${origin}${route}`, { headers: { 'cache-control': 'no-cache' } });
  const html = await response.text();
  const canonicalTag = findElementByAttribute(html, 'link', 'rel', 'canonical');
  const descriptionTag = findElementByAttribute(html, 'meta', 'name', 'description');
  const openGraphTitleTag = findElementByAttribute(html, 'meta', 'property', 'og:title');
  const robotsTag = findElementByAttribute(html, 'meta', 'name', 'robots');
  const canonical = canonicalTag ? getAttribute(canonicalTag, 'href') : undefined;
  const description = descriptionTag ? getAttribute(descriptionTag, 'content') : undefined;
  const robotsContent = robotsTag ? getAttribute(robotsTag, 'content') : undefined;
  if (response.status !== 200) failures.push(`${route}: HTTP ${response.status}`);
  if (canonical !== `${origin}${route}`)
    failures.push(`${route}: canonical ${canonical ?? 'assente'}`);
  if (!/<title>[^<]{8,}<\/title>/i.test(html)) failures.push(`${route}: title assente`);
  if (!description || description.length < 40) failures.push(`${route}: description assente`);
  if (!openGraphTitleTag) failures.push(`${route}: OG assente`);
  if (robotsContent?.toLowerCase().includes('noindex')) failures.push(`${route}: noindex`);
  if (html.includes('staging.netmarket.it') || html.includes('localhost:'))
    failures.push(`${route}: riferimento non production`);
  for (const block of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      JSON.parse(block[1]);
    } catch {
      failures.push(`${route}: JSON-LD invalido`);
    }
  }
}

const robots = await fetch(`${origin}/robots.txt`);
const robotsBody = await robots.text();
if (robots.status !== 200 || /Disallow:\s*\//i.test(robotsBody))
  failures.push('robots.txt non indexabile');
if (!robotsBody.includes(`Sitemap: ${origin}/sitemap-index.xml`))
  failures.push('robots.txt sitemap errata');

const sitemap = await fetch(`${origin}/sitemap-index.xml`);
const sitemapBody = await sitemap.text();
if (sitemap.status !== 200 || !sitemapBody.includes(`${origin}/nod/`))
  failures.push('sitemap production non conforme');
if (sitemapBody.includes('staging.netmarket.it')) failures.push('sitemap contiene staging');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`SEO smoke production PASS: ${routes.length} pagine, robots e sitemap.`);
