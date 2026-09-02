import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from 'node:https';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const rawDir = join(root, 'data/migrations/insights/raw');
const outputDir = join(root, 'data/migrations/insights');
const docsDir = join(root, 'docs/migration');
const mediaDir = join(root, 'apps/web/public/media/insights/legacy');
const write = process.argv.includes('--write');
const noMedia = process.argv.includes('--no-media');
const migrationVersion = 'insight-migration-v1';
const source = 'https://netmarket.it/wp-json/wp/v2/posts';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function text(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripAttributes(markup = '') {
  return markup
    .replace(/\s(?:class|style|id|data-[a-z0-9_-]+|elementor-[a-z0-9_-]+)="[^"]*"/gi, '')
    .replace(/\s(?:class|style|id|data-[a-z0-9_-]+|elementor-[a-z0-9_-]+)='[^']*'/gi, '')
    .replace(/\s(?:width|height)="[^"]*"/gi, '');
}

function cleanContent(markup = '') {
  return stripAttributes(markup)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\[\/?[a-z][^\]]*\]/gi, '')
    .replace(/<\/?div[^>]*>/gi, '')
    .replace(/<\/?section[^>]*>/gi, '')
    .replace(/<\/?article[^>]*>/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/\sloading="[^"]*"/gi, '')
    .replace(/\sdecoding="[^"]*"/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractImages(markup = '', embeddedMedia = []) {
  const images = new Map();
  for (const match of markup.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
    const src = match[1];
    const alt = match[0].match(/\salt=["']([^"']*)["']/i)?.[1] || '';
    if (src && !images.has(src)) images.set(src, { sourceUrl: src, alt });
  }
  for (const media of embeddedMedia) {
    const src = media?.source_url;
    if (!src || images.has(src)) continue;
    images.set(src, {
      sourceUrl: src,
      alt: media?.alt_text || media?.title?.rendered || ''
    });
  }
  return [...images.values()].filter((image) => image.sourceUrl.includes('/wp-content/uploads/'));
}

function featured(post) {
  const media = post?._embedded?.['wp:featuredmedia']?.[0];
  if (!media?.source_url) return null;
  return {
    sourceUrl: media.source_url,
    alt: media.alt_text || media.title?.rendered || post.title?.rendered || ''
  };
}

function categoryMap(categories) {
  const allowed = new Map();
  for (const category of categories) {
    if (category.slug === 'uncategorized' || category.count === 0) continue;
    allowed.set(category.id, {
      id: category.id,
      slug: category.slug,
      name: category.name
    });
  }
  return allowed;
}

const serviceByCategory = {
  'e-commerce': ['ecommerce'],
  seo: ['seo'],
  'siti-web': ['siti-web'],
  'web-development': ['software-e-integrazioni'],
  social: ['social-media'],
  marketing: ['advertising'],
  'marketing-online': ['advertising'],
  'ux-and-ui': ['branding-e-comunicazione'],
  'intelligenza-artificiale': ['software-e-integrazioni']
};

function relatedServices(categories) {
  return [...new Set(categories.flatMap((category) => serviceByCategory[category.slug] || []))];
}

function checksum(post, content) {
  return createHash('sha256')
    .update(JSON.stringify({ id: post.id, modified: post.modified_gmt, content }))
    .digest('hex');
}

function localMediaUrl(postId, sourceUrl) {
  const name = basename(new URL(sourceUrl).pathname);
  return `/media/insights/legacy/${postId}-${name}`;
}

function rewriteImageSources(markup, postId) {
  return markup.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (all, before, src, after) => {
    if (!src.includes('/wp-content/uploads/')) return all;
    return `${before}${localMediaUrl(postId, src)}${after}`;
  });
}

function statusFor(item) {
  return item.warnings.length > 0 ? 'success_with_warnings' : 'success';
}

async function download(url, dest) {
  if (existsSync(dest)) return;
  await new Promise((resolve, reject) => {
    get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        download(new URL(response.headers.location, url).toString(), dest).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed ${response.statusCode}: ${url}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        writeFileSync(dest, Buffer.concat(chunks));
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(docsDir, { recursive: true });
  mkdirSync(mediaDir, { recursive: true });

  const posts = readJson(join(rawDir, 'legacy-posts-page-1.json'));
  const categories = readJson(join(rawDir, 'legacy-categories.json'));
  const users = readJson(join(rawDir, 'legacy-users.json'));
  const categoriesById = categoryMap(categories);
  const userById = new Map(users.map((user) => [user.id, user]));

  const transformed = posts.map((post, index) => {
    const clean = cleanContent(post.content?.rendered || '');
    const postCategories = (post.categories || [])
      .map((id) => categoriesById.get(id))
      .filter(Boolean);
    const feat = featured(post);
    const contentImages = extractImages(
      post.content?.rendered || '',
      post._embedded?.['wp:featuredmedia'] || []
    );
    const media = [
      ...(feat ? [{ ...feat, role: 'featured' }] : []),
      ...contentImages.map((image) => ({ ...image, role: 'content' }))
    ];
    const warnings = [];
    if (!feat) warnings.push('missing_featured_image');
    if (media.some((image) => !image.alt)) warnings.push('missing_alt');
    if (!userById.get(post.author)) warnings.push('author_unresolved');
    if (postCategories.length === 0) warnings.push('category_unresolved');
    const seo = post.yoast_head_json || {};
    const rewrittenContent = rewriteImageSources(clean, post.id);
    return {
      migration: {
        source,
        legacyId: post.id,
        legacyUrl: post.link,
        version: migrationVersion,
        date: new Date().toISOString(),
        checksum: checksum(post, rewrittenContent)
      },
      id: post.id,
      slug: post.slug,
      title: text(post.title?.rendered),
      excerpt: text(post.excerpt?.rendered),
      content: rewrittenContent,
      dates: {
        published: post.date_gmt,
        modified: post.modified_gmt
      },
      author: {
        legacyId: post.author,
        legacyName: userById.get(post.author)?.name || '',
        legacySlug: userById.get(post.author)?.slug || '',
        person: null
      },
      categories: postCategories,
      relatedServices: relatedServices(postCategories),
      media,
      seo: {
        title: seo.title || text(post.title?.rendered),
        description: seo.description || text(post.excerpt?.rendered),
        canonical: seo.canonical || post.link,
        noindex: Array.isArray(seo.robots) ? seo.robots.includes('noindex') : false,
        ogImage: seo.og_image?.[0]?.url || feat?.sourceUrl || ''
      },
      readingTime: Math.max(1, Math.ceil(text(clean).split(/\s+/).filter(Boolean).length / 220)),
      priority: index + 1,
      featured: index === 0,
      warnings,
      status: warnings.length ? 'success_with_warnings' : 'success'
    };
  });

  if (write) {
    writeFileSync(
      join(outputDir, 'insight-inventory.json'),
      JSON.stringify(
        transformed.map((item) => ({
          legacyId: item.id,
          legacyUrl: item.migration.legacyUrl,
          slug: item.slug,
          title: item.title,
          publishDate: item.dates.published,
          modifiedDate: item.dates.modified,
          author: item.author.legacyName || 'unresolved',
          categories: item.categories.map((category) => category.name),
          featuredImage: item.media.find((image) => image.role === 'featured')?.sourceUrl || '',
          contentLength: text(item.content).length,
          seoTitle: item.seo.title,
          metaDescription: item.seo.description,
          canonical: item.seo.canonical,
          migrationStatus: item.status,
          warnings: item.warnings
        })),
        null,
        2
      )
    );
    writeFileSync(
      join(outputDir, 'insight-transform-dry-run.json'),
      JSON.stringify(transformed, null, 2)
    );
    writeFileSync(
      join(outputDir, 'insight-url-map.json'),
      JSON.stringify(
        transformed.map((item) => ({
          oldUrl: item.migration.legacyUrl,
          newUrl: `/insight/${item.slug}/`,
          redirectRequired: true,
          status: item.status,
          warnings: item.warnings
        })),
        null,
        2
      )
    );
    writeFileSync(
      join(outputDir, 'redirects-insights.json'),
      JSON.stringify(
        transformed.map((item) => ({
          from: new URL(item.migration.legacyUrl).pathname,
          to: `/insight/${item.slug}/`,
          status: 301
        })),
        null,
        2
      )
    );

    const inventoryRows = transformed.map(
      (item) =>
        `| ${item.id} | ${item.migration.legacyUrl} | ${item.slug} | ${item.title.replace(/\|/g, '\\|')} | ${item.dates.published} | ${item.author.legacyName || 'unresolved'} | ${item.categories.map((category) => category.name).join(', ') || '-'} | ${item.media.length} | ${text(item.content).length} | ${item.status} | ${item.warnings.join(', ') || '-'} |`
    );
    writeFileSync(
      join(docsDir, 'insight-legacy-inventory.md'),
      `# Insight Legacy Inventory

Source: ${source}
Migration version: ${migrationVersion}
Total legacy posts: ${transformed.length}

| ID | Legacy URL | Slug | Title | Published | Author | Categories | Media | Content length | Status | Warnings |
| ---: | --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- |
${inventoryRows.join('\n')}
`
    );
    writeFileSync(
      join(docsDir, 'insight-url-map.md'),
      `# Insight URL Map

| OLD URL | NEW URL | 301 REQUIRED | STATUS | WARNINGS |
| --- | --- | --- | --- | --- |
${transformed.map((item) => `| ${item.migration.legacyUrl} | /insight/${item.slug}/ | yes | ${item.status} | ${item.warnings.join(', ') || '-'} |`).join('\n')}
`
    );
    writeFileSync(
      join(docsDir, 'insight-migration-report.md'),
      `# Insight Migration Report

Generated from public read-only REST snapshots. The content is preserved conservatively: headings, paragraphs, lists, links and images are kept, while legacy wrappers, inline styles, scripts and shortcode-like fragments are removed.

## Summary

- Legacy posts found: ${transformed.length}
- Success: ${transformed.filter((item) => item.status === 'success').length}
- Success with warnings: ${transformed.filter((item) => item.status === 'success_with_warnings').length}
- Public legacy author: ${users.map((user) => user.name).join(', ') || 'none'}
- Person matches: 0 automatic matches

## Manual Review

${
  transformed
    .filter((item) => item.warnings.length)
    .map((item) => `- ${item.title}: ${item.warnings.join(', ')}`)
    .join('\n') || '- No warnings.'
}
`
    );

    if (!noMedia) {
      for (const item of transformed) {
        for (const image of item.media) {
          const filename = basename(new URL(image.sourceUrl).pathname);
          const ext = extname(filename);
          if (!ext) continue;
          await download(image.sourceUrl, join(mediaDir, `${item.id}-${filename}`));
        }
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        migrationVersion,
        source,
        total: transformed.length,
        success: transformed.filter((item) => item.status === 'success').length,
        successWithWarnings: transformed.filter((item) => item.status === 'success_with_warnings')
          .length,
        unresolvedAuthors: transformed.filter((item) => item.warnings.includes('author_unresolved'))
          .length,
        categories: [
          ...new Set(
            transformed.flatMap((item) => item.categories.map((category) => category.slug))
          )
        ].sort()
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
