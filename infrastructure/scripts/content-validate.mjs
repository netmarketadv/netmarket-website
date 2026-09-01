#!/usr/bin/env node

const baseUrl =
  process.env.CMS_API_BASE_URL || process.env.PUBLIC_CMS_URL
    ? new URL('/wp-json/netmarket/v1/', process.env.CMS_API_BASE_URL || process.env.PUBLIC_CMS_URL)
    : new URL('https://cms.netmarket.it/wp-json/netmarket/v1/');

const endpoints = ['services', 'case-studies', 'clients', 'people', 'insights', 'resources'];
const allowedRelationTypes = new Set([
  'post',
  'nm_service',
  'nm_case_study',
  'nm_client',
  'nm_person',
  'nm_resource',
  'nm_testimonial'
]);

const issues = [];

async function fetchJson(path) {
  const url = new URL(path, baseUrl);
  url.searchParams.set('per_page', '50');
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`${url.toString()} returned ${response.status}`);
  }
  return response.json();
}

function validateMedia(entity, media, field) {
  if (!media) return;
  if (!media.url) issues.push(`${entity}: media ${field} senza URL`);
  if (media.alt === undefined) issues.push(`${entity}: media ${field} senza campo alt`);
}

function validateRelations(entity, relations, field) {
  if (!Array.isArray(relations)) return;
  const seen = new Set();
  for (const relation of relations) {
    if (!relation?.id || !relation?.slug || !relation?.title) {
      issues.push(`${entity}: relazione ${field} incompleta`);
      continue;
    }
    if (seen.has(relation.id))
      issues.push(`${entity}: relazione duplicata ${field}#${relation.id}`);
    seen.add(relation.id);
    if (!allowedRelationTypes.has(relation.type)) {
      issues.push(`${entity}: relazione ${field} punta a tipo non ammesso ${relation.type}`);
    }
  }
}

for (const endpoint of endpoints) {
  const payload = await fetchJson(endpoint);
  if (!Array.isArray(payload.data)) {
    issues.push(`${endpoint}: response senza data[]`);
    continue;
  }
  const slugs = new Set();
  for (const item of payload.data) {
    const entity = `${endpoint}/${item.slug || item.id}`;
    if (!item.slug) issues.push(`${entity}: slug mancante`);
    if (slugs.has(item.slug)) issues.push(`${endpoint}: slug duplicato ${item.slug}`);
    slugs.add(item.slug);
    validateMedia(entity, item.image, 'image');
    if (endpoint === 'clients' && !item.brandName) issues.push(`${entity}: client senza brandName`);
    if (endpoint === 'people' && !item.role) issues.push(`${entity}: person senza ruolo`);
    validateRelations(entity, item.relatedServices, 'relatedServices');
    validateRelations(entity, item.relatedCaseStudies, 'relatedCaseStudies');
    validateRelations(entity, item.services, 'services');
    validateRelations(entity, item.contributors, 'contributors');
  }
}

if (issues.length > 0) {
  console.error(`Content validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Content validation passed.');
