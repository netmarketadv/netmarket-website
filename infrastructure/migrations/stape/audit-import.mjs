import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function auditImportedContent(plan, collections) {
  const media = new Map(plan.media.map((item) => [item.key, item]));
  const mapping = {
    seo_title: 'seo.title',
    meta_description: 'seo.description',
    canonical_override: 'seo.canonical',
    noindex: 'seo.noindex',
    social_title: 'seo.socialTitle',
    social_description: 'seo.socialDescription',
    social_image: 'seo.socialImage',
    priority: 'priority',
    featured: 'featured',
    subtitle: 'subtitle',
    short_description: 'shortDescription',
    hero_image: 'hero.image',
    value_props: 'valueProps',
    problems: 'problems',
    process: 'process',
    results: 'results',
    faq: 'faq',
    public_client_name: 'publicClientName',
    cover_image: 'cover',
    project_year: 'projectYear',
    project_status: 'projectStatus',
    project_url: 'projectUrl',
    context: 'context',
    challenge: 'challenge',
    objectives: 'objectives',
    approach: 'approach',
    solution: 'solution',
    qualitative_result: 'qualitativeResult',
    additional_content: 'additionalContent',
    numeric_results: 'numericResults',
    client: 'client',
    related_services: 'relatedServices',
    services: 'services',
    related_insights: 'relatedInsights',
    related_case_studies: 'relatedCaseStudies',
    gallery: 'gallery'
  };
  let verified = 0;
  function check(expected, actual) {
    if (expected === null) return actual === null;
    if (
      expected &&
      typeof expected === 'object' &&
      !Array.isArray(expected) &&
      'media' in expected
    ) {
      const source = media.get(expected.media);
      if (
        !source ||
        !actual ||
        !Number.isInteger(actual.id) ||
        actual.id <= 0 ||
        actual.alt !== source.alt ||
        actual.mimeType !== source.mimeType
      )
        return false;
      const url = new URL(actual.url);
      return (
        url.origin === 'https://cms.netmarket.it' &&
        (source.existingId
          ? actual.id === source.existingId
          : url.pathname.includes('stape-' + source.key + '-'))
      );
    }
    if (
      expected &&
      typeof expected === 'object' &&
      !Array.isArray(expected) &&
      'record' in expected
    ) {
      const record = plan.records.find((item) => item.type + '/' + item.slug === expected.record);
      return Boolean(
        record &&
        actual &&
        Number.isInteger(actual.id) &&
        actual.id > 0 &&
        actual.slug === record.slug &&
        actual.title === record.title &&
        actual.type === record.type
      );
    }
    if (Array.isArray(expected) && expected.some((item) => item?.record || item?.media))
      return (
        Array.isArray(actual) &&
        expected.length === actual.length &&
        expected.every((item, index) => check(item, actual[index]))
      );
    return isDeepStrictEqual(expected, actual);
  }
  for (const [type, key] of [
    ['nm_service', 'services'],
    ['nm_case_study', 'projects']
  ]) {
    const records = plan.records.filter((item) => item.type === type);
    const items = collections[key];
    if (
      !Array.isArray(items) ||
      items.length !== records.length ||
      new Set(items.map((item) => item.slug)).size !== items.length
    )
      throw new Error('Incomplete or unexpected CMS collection: ' + key);
    for (const record of records) {
      const actual = items.find((item) => item.slug === record.slug);
      const fail = (field) => {
        throw new Error(
          'CMS differs from reviewed plan: ' + type + '/' + record.slug + ':' + field
        );
      };
      if (!actual || actual.title !== record.title || actual.excerpt !== record.excerpt)
        fail('identity/excerpt');
      if (!check(record.thumbnail, actual.image)) fail('thumbnail');
      for (const [name, expected] of Object.entries(record.meta)) {
        if (name === 'cta_label' || name === 'cta_url') continue;
        const field = mapping[name];
        if (!field) fail('unsupported field ' + name);
        let value = field.split('.').reduce((object, key) => object?.[key], actual);
        if (name === 'gallery') value = value?.map((item) => item.media);
        if (!check(expected, value)) fail(name);
      }
      const cta =
        record.meta.cta_label && record.meta.cta_url
          ? { label: record.meta.cta_label, url: record.meta.cta_url }
          : null;
      if (!isDeepStrictEqual(cta, actual.cta)) fail('cta');
      for (const [taxonomy, key] of [
        ['nm_sector', 'sectors'],
        ['nm_capability', 'capabilities'],
        ['nm_technology', 'technologies']
      ]) {
        const normalize = (terms) =>
          terms
            .map(({ slug, name }) => ({ slug, name }))
            .sort((a, b) => a.slug.localeCompare(b.slug));
        if (
          !isDeepStrictEqual(normalize(record.terms[taxonomy] || []), normalize(actual[key] || []))
        )
          fail(taxonomy);
      }
      verified++;
    }
  }
  return { recordsVerified: verified };
}
export async function verifyPublicMedia(collections, fetchImpl = fetch) {
  const media = new Map();
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (value.mimeType && value.url) media.set(value.url, value.mimeType);
    for (const child of Object.values(value)) visit(child);
  };
  visit(collections);
  for (const [url, mimeType] of media) {
    if (new URL(url).origin !== 'https://cms.netmarket.it')
      throw new Error('Unexpected public media origin.');
    const response = await fetchImpl(url, {
      method: 'HEAD',
      redirect: 'error',
      signal: AbortSignal.timeout(30000)
    });
    if (response.status !== 200 || response.headers.get('content-type')?.split(';')[0] !== mimeType)
      throw new Error('Imported media unavailable publicly or has unexpected MIME.');
  }
  return media.size;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const raw = readFileSync('data/releases/stape-cms-import.json');
  const plan = JSON.parse(raw);
  const user = process.env.CMS_BASIC_AUTH_USER;
  const secret = process.env.CMS_BASIC_AUTH_PASSWORD;
  if (!user || !secret) throw new Error('Existing CMS secrets required; no anonymous fallback.');
  const collections = {};
  const digests = {};
  for (const [archive, key] of [
    ['services', 'services'],
    ['case-studies', 'projects']
  ]) {
    const response = await fetch(
      'https://cms.netmarket.it/wp-json/netmarket/v1/' + archive + '?per_page=50&sort=priority',
      {
        headers: {
          Accept: 'application/json',
          Authorization: 'Basic ' + Buffer.from(user + ':' + secret).toString('base64')
        },
        redirect: 'error',
        signal: AbortSignal.timeout(30000)
      }
    );
    if (!response.ok) throw new Error('Authenticated CMS audit failed: HTTP ' + response.status);
    const payload = await response.json();
    collections[key] = payload.data;
    digests[archive] = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }
  const result = {
    ...auditImportedContent(plan, collections),
    publicMediaVerified: await verifyPublicMedia(collections)
  };
  if (process.env.CMS_BUILD_PROVENANCE_PATH) {
    const entries = readFileSync(process.env.CMS_BUILD_PROVENANCE_PATH, 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    for (const [archive, hash] of Object.entries(digests)) {
      const matching = entries.filter(
        (entry) => entry.path === '/' + archive + '?per_page=50&sort=priority'
      );
      if (
        !matching.length ||
        matching.some(
          (entry) => entry.sha256 !== hash || !entry.authenticated || entry.status !== 'ok'
        )
      )
        throw new Error('CMS content changed during candidate build: ' + archive);
    }
  }
  const output =
    process.env.CMS_IMPORT_AUDIT_PATH || 'artifacts/stape-cms-preparation/cms-import-audit.json';
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(
    output,
    JSON.stringify(
      {
        ...result,
        source: 'authenticated-https-reviewed-import',
        planSha256: createHash('sha256').update(raw).digest('hex'),
        sourceSha: process.env.GITHUB_SHA,
        runId: process.env.GITHUB_RUN_ID,
        collectionSha256: digests
      },
      null,
      2
    ) + '\n'
  );
  console.log('Authenticated CMS records match reviewed plan: ' + result.recordsVerified + '.');
}
