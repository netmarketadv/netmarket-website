import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const migrationVersion = 'case-study-migration-v1';
const source = 'https://netmarket.it/wp-json/wp/v2/caso-studio';
const rawDir = 'data/migrations/case-studies/raw';
const outputDir = 'data/migrations/case-studies';
const docsDir = 'docs/migration';
const collectionPath = join(rawDir, 'legacy-caso-studio-page-1.json');
const write = process.argv.includes('--write');

const serviceMap = {
  'analisi strategica': 'seo',
  'concorsi a premi': 'concorsi-a-premi',
  'gestione operativa': 'concorsi-a-premi',
  manutenzione: 'software-e-integrazioni',
  seo: 'seo',
  shooting: 'content-production',
  socialmedia: 'social-media',
  'social media': 'social-media',
  strategia: '',
  studio: '',
  'supporto documentale': '',
  'sviluppo app': 'software-e-integrazioni',
  'sviluppo e-commerce': 'ecommerce',
  'sviluppo ecommerce': 'ecommerce',
  'sviluppo sito web': 'siti-web',
  'sviluppo software': 'software-e-integrazioni',
  'sviluppo web': 'siti-web',
  'software custom': 'software-e-integrazioni',
  'programma fedelta': 'software-e-integrazioni',
  'programma fedeltà': 'software-e-integrazioni'
};

const clientMap = {
  'app-mobile-programma-fedelta-sirene-blu': 'Sirene Blu',
  'concorso-a-premi-sirene-blu-2024-ideazione-sviluppo-e-gestione-completa': 'Sirene Blu',
  'sviluppo-crm-custom-venitaly': 'VENITALY',
  'sviluppo-sito-web-e-shooting-fotografico-per-rigomar-una-presenza-digitale-piu-autorevole-per-il-mondo-della-produzione-moda':
    'Rigomar',
  'sviluppo-sito-web-allestimenti-fieristici-albertini': 'Albertini Allestimenti',
  'sviluppo-sito-web-fotovoltaico-progetto-e': 'Progetto-e',
  'sviluppo-e-commerce-per-tavoli-e-sedie-per-la-casa': 'Pazzo Design',
  'casi-studio-strategia-digitale-ecommerce-brb': 'BRB'
};

function fail(message) {
  console.error(`[CASE-STUDY MIGRATION] ${message}`);
  process.exit(1);
}

function decode(value = '') {
  return value
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(html = '') {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  );
}

function checksum(value) {
  return createHash('sha256').update(value).digest('hex');
}

function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([a-zA-Z:-]+)=["']([^"']*)["']/g)) {
    result[match[1].toLowerCase()] = match[2];
  }
  return result;
}

function imageTags(html = '') {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
}

function normalizeUrl(url = '') {
  return url.replace(/-\d+x\d+(?=\.(jpg|jpeg|png|webp|gif)$)/i, '');
}

function mediaFromContent(html = '') {
  const seen = new Set();
  const media = [];
  for (const tag of imageTags(html)) {
    const data = attrs(tag);
    const url = data.src || '';
    if (!url.includes('/wp-content/uploads/')) continue;
    if (/logo-netmarket|favicon|cropped-|blank|avatar/i.test(url)) continue;
    const normalized = normalizeUrl(url);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    media.push({
      sourceUrl: url,
      normalizedSourceUrl: normalized,
      filename: basename(new URL(url).pathname),
      alt: decode(data.alt || ''),
      caption: '',
      isLogo: /logo/i.test(url),
      checksumSource: normalized
    });
  }
  return media;
}

function headings(html = '') {
  return [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: stripHtml(match[2])
  }));
}

function explicitServiceLabels(item) {
  return headings(item.content?.rendered || '')
    .filter((heading) => heading.level === 4)
    .map((heading) => heading.text)
    .filter(Boolean);
}

function mapServices(labels) {
  const services = [];
  const unmapped = [];
  for (const label of labels) {
    const key = label.toLowerCase().replace(/\s+/g, ' ').trim();
    const slug = serviceMap[key];
    if (slug) {
      if (!services.includes(slug)) services.push(slug);
    } else {
      unmapped.push(label);
    }
  }
  return { services, unmapped };
}

function metricsFromText(text) {
  const metrics = [];
  const matches = text.matchAll(/([+>]?\s?\d+(?:[.,]\d+)?\s?(?:%|mila|milioni|M€|€))/gi);
  for (const match of matches) {
    const raw = match[1].replace(/\s+/g, ' ').trim();
    if (/^\d{4}$/.test(raw)) continue;
    if (!metrics.some((metric) => metric.value === raw)) {
      metrics.push({ value: raw, label: 'Risultato dichiarato' });
    }
  }
  return metrics.slice(0, 4);
}

function extractSections(item) {
  const html = item.content?.rendered || '';
  const text = stripHtml(html);
  const h = headings(html);
  return {
    context: item.excerpt?.rendered ? stripHtml(item.excerpt.rendered) : '',
    challenge: '',
    objectives: [],
    approach: h.some((heading) => /come lo abbiamo sviluppato|come lo abbiamo realizzato/i.test(heading.text))
      ? text
      : '',
    solution: '',
    additionalContent: text,
    numericResults: /risultat/i.test(text) ? metricsFromText(text) : []
  };
}

function canonicalPath(url) {
  return new URL(url).pathname;
}

if (!existsSync(collectionPath)) {
  fail(`Snapshot mancante: ${collectionPath}`);
}

const sourceItems = JSON.parse(readFileSync(collectionPath, 'utf8'));
if (!Array.isArray(sourceItems)) fail('Snapshot collection non valida.');

const inventory = [];
const transformed = [];
const redirects = [];
const urlMap = [];
const encounteredServices = {};

for (const item of sourceItems) {
  const rawPath = join(rawDir, `${item.id}.json`);
  const htmlPath = join(rawDir, `${item.id}.html`);
  if (!existsSync(rawPath)) fail(`Raw JSON mancante per ${item.id}`);
  if (!existsSync(htmlPath)) fail(`Raw HTML mancante per ${item.id}`);

  const content = item.content?.rendered || '';
  const text = stripHtml(content);
  const labels = explicitServiceLabels(item);
  const serviceMapping = mapServices(labels);
  for (const label of labels) {
    encounteredServices[label] = serviceMap[label.toLowerCase().replace(/\s+/g, ' ').trim()] || null;
  }
  const media = mediaFromContent(content);
  const featured = item._embedded?.['wp:featuredmedia']?.[0] || null;
  const featuredImage = featured?.source_url || '';
  const seo = item.yoast_head_json || {};
  const legacyIndexable = seo.robots?.index !== 'noindex';
  const newPath = `/progetti/${item.slug}/`;
  const warnings = [];
  if (!legacyIndexable) warnings.push('legacy_noindex');
  if (serviceMapping.unmapped.length > 0) warnings.push('unmapped_service');
  if (media.some((entry) => !entry.alt && !entry.isLogo)) warnings.push('missing_alt');
  if (!clientMap[item.slug]) warnings.push('client_manual_review');
  if (!featuredImage) warnings.push('missing_featured_image');

  inventory.push({
    legacyId: item.id,
    legacyUrl: item.link,
    legacySlug: item.slug,
    title: decode(item.title?.rendered || ''),
    status: item.status,
    publishDate: item.date,
    modifiedDate: item.modified,
    client: clientMap[item.slug] || '',
    featuredImage,
    mediaCount: media.filter((entry) => !entry.isLogo).length,
    contentLength: content.length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    seoTitle: seo.title || '',
    metaDescription: seo.description || '',
    canonical: seo.canonical || '',
    robots: seo.robots || {},
    services: serviceMapping.services,
    unmappedServices: serviceMapping.unmapped,
    migrationStatus: warnings.length ? 'ready_with_warnings' : 'ready',
    warnings
  });

  const sections = extractSections(item);
  transformed.push({
    migration: {
      version: migrationVersion,
      source,
      legacyId: item.id,
      legacyUrl: item.link,
      sourceChecksum: checksum(JSON.stringify(item))
    },
    postType: 'nm_case_study',
    slug: item.slug,
    title: decode(item.title?.rendered || ''),
    content: {
      shortDescription: sections.context,
      context: sections.context,
      challenge: sections.challenge,
      objectives: sections.objectives,
      approach: sections.approach,
      solution: sections.solution,
      additionalContent: sections.additionalContent,
      numericResults: sections.numericResults
    },
    client: clientMap[item.slug] || null,
    services: serviceMapping.services,
    unmappedServices: serviceMapping.unmapped,
    seo: {
      title: seo.title || '',
      description: seo.description || '',
      noindex: !legacyIndexable,
      legacyCanonical: seo.canonical || '',
      socialTitle: seo.og_title || '',
      socialDescription: seo.og_description || '',
      socialImage: seo.og_image?.[0]?.url || featuredImage
    },
    media: {
      featuredImage,
      gallery: media.filter((entry) => !entry.isLogo),
      clientLogo: media.find((entry) => entry.isLogo) || null
    },
    newUrl: `https://staging.netmarket.it${newPath}`,
    futureProductionUrl: `https://netmarket.it${newPath}`,
    warnings
  });

  urlMap.push({
    legacyUrl: item.link,
    newPath,
    futureProductionUrl: `https://netmarket.it${newPath}`,
    status: warnings.includes('legacy_noindex') ? 'migrate_noindex' : 'migrate',
    redirectRequired: true
  });
  redirects.push({
    from: canonicalPath(item.link),
    to: newPath,
    status: 301,
    source: migrationVersion,
    reason: 'Legacy case study path to new projects architecture',
    verified: false
  });
}

const duplicateSlugs = inventory
  .map((item) => item.legacySlug)
  .filter((slug, index, all) => all.indexOf(slug) !== index);
if (duplicateSlugs.length > 0) fail(`Slug duplicati: ${duplicateSlugs.join(', ')}`);

const missingRaw = inventory.filter((item) => !existsSync(join(rawDir, `${item.legacyId}.json`)));
if (missingRaw.length > 0) fail(`Raw mancanti: ${missingRaw.map((item) => item.legacyId).join(', ')}`);

const summary = {
  migrationVersion,
  source,
  total: inventory.length,
  indexable: inventory.filter((item) => item.robots.index !== 'noindex').length,
  legacyNoindex: inventory.filter((item) => item.robots.index === 'noindex').length,
  ready: inventory.filter((item) => item.migrationStatus === 'ready').length,
  readyWithWarnings: inventory.filter((item) => item.migrationStatus === 'ready_with_warnings').length,
  encounteredServices
};

function markdownTable(rows) {
  const header = '| Case Study | Legacy URL | Client | Media | Services | Status | Warnings |';
  const divider = '| --- | --- | --- | ---: | --- | --- | --- |';
  const body = rows.map((item) =>
    `|${[
      item.title,
      item.legacyUrl,
      item.client || 'MANUAL REVIEW',
      String(item.mediaCount),
      item.services.join(', ') || '-',
      item.migrationStatus,
      item.warnings.join(', ') || '-'
    ]
      .map((value) => ` ${String(value).replace(/\|/g, '\\|')} `)
      .join('|')}|`
  );
  return [header, divider, ...body].join('\n');
}

function urlMarkdown(rows) {
  return [
    '# Case Study URL Map',
    '',
    '| Legacy URL | Future URL | Status | Redirect |',
    '| --- | --- | --- | --- |',
    ...rows.map(
      (item) =>
        `| ${item.legacyUrl} | ${item.futureProductionUrl} | ${item.status} | ${item.redirectRequired ? '301 candidate' : '-'} |`
    ),
    ''
  ].join('\n');
}

if (write) {
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(docsDir, { recursive: true });
  writeFileSync(join(outputDir, 'case-study-inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`);
  writeFileSync(join(outputDir, 'case-study-transform-dry-run.json'), `${JSON.stringify(transformed, null, 2)}\n`);
  writeFileSync(join(outputDir, 'redirects-case-studies.json'), `${JSON.stringify(redirects, null, 2)}\n`);
  writeFileSync(join(outputDir, 'service-map.json'), `${JSON.stringify(encounteredServices, null, 2)}\n`);
  writeFileSync(join(outputDir, 'case-study-url-map.json'), `${JSON.stringify(urlMap, null, 2)}\n`);
  writeFileSync(
    join(docsDir, 'case-study-legacy-inventory.md'),
    [
      '# Case Study Legacy Inventory',
      '',
      `Source: ${source}`,
      `Migration version: ${migrationVersion}`,
      `Total legacy REST items: ${summary.total}`,
      `Indexable legacy items: ${summary.indexable}`,
      `Legacy noindex items: ${summary.legacyNoindex}`,
      '',
      markdownTable(inventory),
      ''
    ].join('\n')
  );
  writeFileSync(join(docsDir, 'case-study-url-map.md'), urlMarkdown(urlMap));
}

console.log(JSON.stringify(summary, null, 2));
