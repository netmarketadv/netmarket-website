import { readFile, readdir } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = resolve(root, 'apps/web/dist');
const mapPath = resolve(root, 'data/migrations/go-live/legacy-url-map.json');
const canonicalOrigin = 'https://netmarket.it';
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function routeFile(path) {
  if (path === '/') return resolve(dist, 'index.html');
  return resolve(dist, path.replace(/^\//, ''), 'index.html');
}

function pagePath(file) {
  const path = relative(dist, file).replaceAll('\\', '/');
  if (path === 'index.html') return '/';
  if (path === '404.html') return '/404.html';
  return `/${path.replace(/index\.html$/, '')}`;
}

const files = await walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const allowedNoindex = new Set([
  '/404.html',
  '/design-system/',
  '/grazie/',
  '/progetti/app-mobile-programma-fedelta-sirene-blu/',
  '/progetti/sviluppo-crm-custom-venitaly/'
]);

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const path = pagePath(file);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1];

  if (!canonical?.startsWith(canonicalOrigin)) {
    failures.push(`${path}: canonical assente o non production (${canonical ?? 'assente'})`);
  }
  if (canonical?.startsWith('https://www.netmarket.it')) {
    failures.push(`${path}: canonical usa www`);
  }
  if (allowedNoindex.has(path)) {
    if (!robots?.includes('noindex')) failures.push(`${path}: deve essere noindex`);
  } else if (robots !== 'index, follow') {
    failures.push(`${path}: robots production non indexabile (${robots ?? 'assente'})`);
  }
  if (html.includes('staging.netmarket.it') || html.includes('localhost:')) {
    failures.push(`${path}: contiene un riferimento staging/localhost`);
  }

  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch {
      failures.push(`${path}: JSON-LD non valido`);
    }
  }

  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1].split(/[?#]/)[0];
    if (!href || href.startsWith('//') || /\.[a-z0-9]+$/i.test(href)) continue;
    try {
      await readFile(routeFile(href));
    } catch {
      failures.push(`${path}: link interno senza route ${href}`);
    }
  }
}

const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
if (robots !== `User-agent: *\nAllow: /\nSitemap: ${canonicalOrigin}/sitemap-index.xml\n`) {
  failures.push('robots.txt production non conforme');
}

const sitemap = await readFile(resolve(dist, 'sitemap-index.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (!sitemapUrls.includes(`${canonicalOrigin}/nod/`)) failures.push('NOD manca dalla sitemap');
for (const url of sitemapUrls) {
  if (!url.startsWith(`${canonicalOrigin}/`)) failures.push(`sitemap non canonica: ${url}`);
  const path = new URL(url).pathname;
  try {
    await readFile(routeFile(path));
  } catch {
    failures.push(`sitemap punta a route assente: ${path}`);
  }
}

const htaccess = await readFile(resolve(dist, '.htaccess'), 'utf8');
if (/X-Robots-Tag.+noindex/i.test(htaccess)) failures.push('.htaccess production imposta noindex');

const migration = JSON.parse(await readFile(mapPath, 'utf8'));
const oldPaths = new Map(migration.entries.map((entry) => [entry.oldPath, entry]));
for (const entry of migration.entries) {
  if (entry.action === '301') {
    if (!entry.newPath) failures.push(`${entry.oldPath}: redirect senza destinazione`);
    const next = oldPaths.get(entry.newPath);
    if (next?.action === '301') failures.push(`${entry.oldPath}: redirect chain verso ${entry.newPath}`);
    try {
      await readFile(routeFile(entry.newPath));
    } catch {
      failures.push(`${entry.oldPath}: destinazione assente ${entry.newPath}`);
    }
  }
  if (entry.action === '410' && entry.newPath !== null) {
    failures.push(`${entry.oldPath}: 410 con destinazione valorizzata`);
  }
}

const summary = migration.entries.reduce(
  (counts, entry) => ({ ...counts, [entry.action]: (counts[entry.action] ?? 0) + 1 }),
  {}
);

if (failures.length) {
  console.error(`Production readiness FALLITA (${failures.length} problemi):`);
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Production readiness PASS: ${htmlFiles.length} pagine HTML, ${sitemapUrls.length} URL sitemap, ${summary.KEEP ?? 0} keep, ${summary['301'] ?? 0} redirect, ${summary['410'] ?? 0} gone.`
);
