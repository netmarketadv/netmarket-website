import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { exportSources } from './export-sources.mjs';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
export async function prepareCmsPlan({ sources, mediaInventory, publicRoot, readRemote }) {
  const media = new Map();
  function mediaRef(asset) {
    if (!asset) return null;
    // IDs in fallback payloads belong to another database or are synthetic: discard all of them.
    const key = sha256(Buffer.from(asset.url + '\n' + asset.alt));
    if (!media.has(key))
      media.set(key, { key, sourceUrl: asset.url, alt: asset.alt, mimeType: asset.mimeType });
    return { media: key };
  }
  const records = [];
  function common(item, type) {
    return {
      type,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt || '',
      content: '',
      meta: {
        seo_title: item.seo.title || '',
        meta_description: item.seo.description || '',
        canonical_override: item.seo.canonical || '',
        noindex: item.seo.noindex,
        social_title: item.seo.socialTitle || '',
        social_description: item.seo.socialDescription || '',
        social_image: mediaRef(item.seo.socialImage),
        priority: item.priority,
        featured: item.featured,
        cta_label: item.cta?.label || '',
        cta_url: item.cta?.url || ''
      },
      thumbnail: mediaRef(item.image),
      terms: Object.fromEntries(
        ['sectors', 'capabilities', 'technologies'].map((key) => [
          { sectors: 'nm_sector', capabilities: 'nm_capability', technologies: 'nm_technology' }[
            key
          ],
          (item[key] || []).map(({ slug, name }) => ({ slug, name }))
        ])
      )
    };
  }
  for (const service of sources.services) {
    const record = common(service, 'nm_service');
    Object.assign(record.meta, {
      subtitle: service.subtitle,
      short_description: service.shortDescription,
      hero_image: mediaRef(service.hero?.image),
      value_props: service.valueProps,
      problems: service.problems,
      process: service.process,
      results: service.results,
      faq: service.faq,
      related_services: service.relatedServices.map(({ slug }) => ({
        record: 'nm_service/' + slug
      }))
    });
    records.push(record);
  }
  for (const project of sources.projects) {
    const client = project.client;
    if (
      client &&
      !records.some((record) => record.type === 'nm_client' && record.slug === client.slug)
    ) {
      records.push({
        type: 'nm_client',
        slug: client.slug,
        title: client.title,
        excerpt: '',
        content: '',
        meta: { brand_name: client.title, logo: mediaRef(client.image) },
        thumbnail: mediaRef(client.image),
        terms: {}
      });
    }
    const record = common(project, 'nm_case_study');
    const mapping = {
      publicClientName: 'public_client_name',
      shortDescription: 'short_description',
      projectYear: 'project_year',
      projectStatus: 'project_status',
      projectUrl: 'project_url',
      context: 'context',
      challenge: 'challenge',
      objectives: 'objectives',
      approach: 'approach',
      solution: 'solution',
      qualitativeResult: 'qualitative_result',
      additionalContent: 'additional_content',
      numericResults: 'numeric_results'
    };
    for (const [from, to] of Object.entries(mapping)) record.meta[to] = project[from] ?? '';
    Object.assign(record.meta, {
      client: client ? { record: 'nm_client/' + client.slug } : 0,
      cover_image: mediaRef(project.cover),
      gallery: project.gallery.map(({ media: asset }) => mediaRef(asset)),
      services: project.services.map(({ slug }) => ({ record: 'nm_service/' + slug })),
      related_insights: project.relatedInsights.map(({ slug }) => ({ record: 'post/' + slug })),
      related_case_studies: project.relatedCaseStudies.map(({ slug }) => ({
        record: 'nm_case_study/' + slug
      }))
    });
    records.push(record);
  }
  for (const item of media.values()) {
    const url = new URL(item.sourceUrl, 'https://netmarket.it');
    if (!['netmarket.it', 'cms.netmarket.it'].includes(url.hostname) || url.protocol !== 'https:')
      throw new Error('Media origin not allowed.');
    const local = item.sourceUrl.startsWith('/')
      ? readFileSync(resolve(publicRoot, '.' + item.sourceUrl))
      : null;
    const remote = await readRemote(url.href);
    if (local && !local.equals(remote))
      throw new Error('Published media differs from versioned media: ' + item.sourceUrl);
    item.sha256 = sha256(remote);
    item.sourceMimeType = item.mimeType;
    if (remote.subarray(0, 4).toString() === 'RIFF' && remote.subarray(8, 12).toString() === 'WEBP')
      item.mimeType = 'image/webp';
    else if (remote.subarray(1, 4).toString() === 'PNG') item.mimeType = 'image/png';
    else if (remote[0] === 255 && remote[1] === 216) item.mimeType = 'image/jpeg';
    item.filename = basename(url.pathname);
    const existing = mediaInventory.filter(
      (candidate) => candidate.sha256 === item.sha256 && candidate.alt === item.alt
    );
    if (existing.length) item.existingId = existing[0].id;
    // Never replace an existing attachment's alt or bytes for this migration.
    item.action = existing.length ? 'reuse' : 'create';
    item.bytes = remote;
  }
  for (const record of records) {
    if (Object.keys(record.meta).some((key) => record.meta[key] === undefined))
      throw new Error('Missing source field: ' + record.slug);
  }
  return { records, media: [...media.values()] };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const output = resolve('artifacts/stape-cms-preparation');
  mkdirSync(resolve(output, 'media'), { recursive: true });
  const sources = await exportSources();
  const plan = await prepareCmsPlan({
    sources,
    mediaInventory: JSON.parse(readFileSync(resolve(output, 'cms-media-readonly.json'), 'utf8')),
    publicRoot: resolve('apps/web/public'),
    readRemote: async (url) => {
      const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error('Media GET failed: ' + response.status + ' ' + url);
      return Buffer.from(await response.arrayBuffer());
    }
  });
  for (const item of plan.media) {
    writeFileSync(resolve(output, 'media', item.key + '-' + item.filename), item.bytes);
    item.assetPath = item.sourceUrl.startsWith('/')
      ? 'apps/web/public' + item.sourceUrl
      : 'data/releases/stape-cms-media/' + item.key + '-' + item.filename;
    if (!item.sourceUrl.startsWith('/')) {
      mkdirSync(resolve('data/releases/stape-cms-media'), { recursive: true });
      writeFileSync(item.assetPath, item.bytes);
    }
    delete item.bytes;
  }
  const sourcePaths = [
    'apps/web/src/data/home.ts',
    'apps/web/src/data/service-fallbacks.ts',
    'apps/web/src/data/service-pilots.ts',
    'apps/web/src/data/service-experiences.ts',
    'apps/web/src/lib/services/content.ts',
    'apps/web/src/lib/projects/content.ts',
    'apps/web/src/lib/projects/presentation.ts',
    'apps/web/src/lib/projects/sirene-blu-media.ts',
    'apps/wordpress/plugins/netmarket-headless-core/src/ContentTypes/Registry.php',
    'apps/wordpress/plugins/netmarket-headless-core/src/Rest/Routes.php',
    'data/migrations/case-studies/case-study-transform-dry-run.json'
  ];
  const result = {
    format: 'stape-cms-v1',
    target: 'https://cms.netmarket.it',
    baseline: '6b2e5524ba43e237229e0f56e86161edd87e1165',
    sourceSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    sources: sourcePaths.map((path) => ({ path, sha256: sha256(readFileSync(path)) })),
    ...plan
  };
  writeFileSync(resolve(output, 'plan.json'), JSON.stringify(result, null, 2) + '\n');
  writeFileSync(resolve(output, 'source-payloads.json'), JSON.stringify(sources, null, 2) + '\n');
  console.log(
    'Prepared ' +
      plan.records.length +
      ' records, ' +
      plan.media.length +
      ' exact media references; no CMS writes.'
  );
}
