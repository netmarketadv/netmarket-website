#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const legacy = readJson('data/final-audit/legacy-site-inventory.json');
const staging = readJson('data/final-audit/staging-site-inventory.json');
const insightRedirects = readJson('data/migrations/insights/redirects-insights.json', []);
const caseRedirects = readJson('data/migrations/case-studies/redirects-case-studies.json', []);
const insightUrlMap = readJson('data/migrations/insights/insight-url-map.json', []);
const caseUrlMap = readJson('data/migrations/case-studies/case-study-url-map.json', []);

const stagingPaths = new Set(staging.pages.filter((page) => page.status === 200).map((page) => pathOf(page.url)));
const redirectMap = new Map();

for (const redirect of insightRedirects) {
  redirectMap.set(redirect.from, {
    ...redirect,
    source: redirect.source || 'insight-migration-v1',
    reason: redirect.reason || 'Legacy article moved to Insight architecture',
    verified: stagingPaths.has(redirect.to)
  });
}

for (const redirect of caseRedirects) {
  redirectMap.set(redirect.from, {
    ...redirect,
    source: redirect.source || 'case-study-migration-v1',
    reason: redirect.reason || 'Legacy case study moved to Projects architecture',
    verified: stagingPaths.has(redirect.to)
  });
}

const urlMap = new Map();
for (const item of insightUrlMap) {
  urlMap.set(pathOf(item.oldUrl), {
    newUrl: item.newUrl,
    migrationStatus: item.status,
    contentType: 'Insight',
    reason: 'Imported legacy article to CMS Insight/post'
  });
}
for (const item of caseUrlMap) {
  urlMap.set(pathOf(item.legacyUrl), {
    newUrl: item.newPath,
    migrationStatus: item.status,
    contentType: 'Case Study',
    reason: 'Mapped legacy case study to Projects'
  });
}

const manualRoutes = [
  {
    from: '/nod-by-netmarket/',
    to: '/nod/',
    contentType: 'Landing',
    action: 'MANUAL_REVIEW',
    reason: 'NOD exists on legacy and is linked in new footer, but /nod/ is 404 on staging.'
  },
  {
    from: '/contattaci/',
    to: '/contatti/',
    contentType: 'ContactPage',
    action: 'REDIRECT',
    reason: 'Legacy contact URL should converge to new contact route.'
  }
];

const matrix = [
  ...legacy.pages.map((page) => decisionFor(page)),
  ...manualRoutes.map((route) => ({
    legacy_url: new URL(route.from, legacy.baseUrl).toString(),
    new_url: route.to,
    content_type: route.contentType,
    action: route.action,
    redirect_status: route.action === 'REDIRECT' ? 301 : null,
    reason: route.reason,
    traffic_importance: null,
    backlink_importance: null,
    content_status: 'manual',
    migration_status: 'manual',
    manual_review: route.action === 'MANUAL_REVIEW'
  }))
];

const redirectsMaster = [...redirectMap.values()]
  .concat(
    matrix
      .filter((item) => item.action === 'REDIRECT' && item.new_url && !redirectMap.has(pathOf(item.legacy_url)))
      .map((item) => ({
        from: pathOf(item.legacy_url),
        to: item.new_url,
        status: item.redirect_status || 301,
        source: 'final-audit',
        reason: item.reason,
        verified: stagingPaths.has(item.new_url)
      }))
  )
  .sort((a, b) => a.from.localeCompare(b.from, 'it'));

const manualReview = [
  ...matrix
    .filter((item) => item.manual_review || item.action === 'MANUAL_REVIEW')
    .map((item) => ({
      category: categoryFor(item),
      url: item.legacy_url,
      issue: item.reason,
      severity: severityFor(item),
      suggestedAction: item.action
    })),
  ...staging.pages
    .filter((page) => page.status >= 400 || page.imagesMissingAlt > 0 || duplicateH1(page))
    .slice(0, 80)
    .map((page) => ({
      category: page.status >= 400 ? 'TECHNICAL' : 'CONTENT',
      url: page.url,
      issue:
        page.status >= 400
          ? `Staging URL returns ${page.status}.`
          : `${page.imagesMissingAlt} images missing alt or intentionally decorative alt need review.`,
      severity: page.status >= 400 ? 'HIGH' : 'MEDIUM',
      suggestedAction: page.status >= 400 ? 'Fix link or create target page' : 'Verify decorative images vs content images'
    }))
];

writeJson('data/final-audit/url-decision-matrix.json', matrix);
writeJson('data/migrations/redirects-master.json', redirectsMaster);
writeJson('data/final-audit/manual-review.json', manualReview);

writeMd('docs/final-audit/url-decision-matrix.md', urlDecisionMarkdown(matrix));
writeMd('docs/final-audit/redirects-master.md', redirectsMarkdown(redirectsMaster));
writeMd('docs/final-audit/manual-review.md', manualReviewMarkdown(manualReview));
writeMd('docs/final-audit/discovery-summary.md', discoveryMarkdown({ legacy, staging, matrix, redirectsMaster, manualReview }));

console.log(
  JSON.stringify(
    {
      legacyPages: legacy.pages.length,
      stagingPages: staging.pages.length,
      matrix: matrix.length,
      redirects: redirectsMaster.length,
      unverifiedRedirects: redirectsMaster.filter((item) => !item.verified).length,
      manualReview: manualReview.length
    },
    null,
    2
  )
);

function decisionFor(page) {
  const path = pathOf(page.url);
  const mapped = urlMap.get(path);
  if (mapped) {
    return entry(page, {
      newUrl: mapped.newUrl,
      contentType: mapped.contentType,
      action: 'REDIRECT',
      redirectStatus: 301,
      reason: mapped.reason,
      migrationStatus: mapped.migrationStatus,
      manualReview: !stagingPaths.has(mapped.newUrl)
    });
  }
  if (page.status === 404) {
    return entry(page, {
      newUrl: null,
      contentType: guessContentType(path),
      action: 'REMOVE_410',
      redirectStatus: null,
      reason: 'Legacy URL already returns 404 during crawl; keep out of redirect map unless logs/backlinks prove value.',
      migrationStatus: 'not_migrated',
      manualReview: true
    });
  }
  if (path === '/') {
    return entry(page, {
      newUrl: '/',
      contentType: 'Homepage',
      action: 'KEEP',
      redirectStatus: null,
      reason: 'Homepage maps to new homepage.',
      migrationStatus: 'template_ready',
      manualReview: false
    });
  }
  if (path === '/contatti/' || path === '/contattaci/') {
    return entry(page, {
      newUrl: '/contatti/',
      contentType: 'ContactPage',
      action: path === '/contatti/' ? 'KEEP' : 'REDIRECT',
      redirectStatus: path === '/contatti/' ? null : 301,
      reason: 'Contact intent maps to new contact route.',
      migrationStatus: 'template_ready',
      manualReview: false
    });
  }
  if (path.includes('privacy') || path.includes('cookie')) {
    return entry(page, {
      newUrl: page.canonical || page.url,
      contentType: 'Legal',
      action: 'MANUAL_REVIEW',
      redirectStatus: null,
      reason: 'Legal content should remain controlled by iubenda/legal source.',
      migrationStatus: 'external_policy',
      manualReview: true
    });
  }
  if (/tag|category|feed|author|wp-json/i.test(path)) {
    return entry(page, {
      newUrl: null,
      contentType: guessContentType(path),
      action: 'NOINDEX',
      redirectStatus: null,
      reason: 'Archive/system URL should not become a strategic public page unless explicitly planned.',
      migrationStatus: 'not_migrated',
      manualReview: false
    });
  }
  if (page.preliminaryAction === 'MIGRATE') {
    const target = guessNewUrl(path);
    return entry(page, {
      newUrl: target,
      contentType: guessContentType(path),
      action: target && stagingPaths.has(target) ? 'REDIRECT' : 'MANUAL_REVIEW',
      redirectStatus: target && stagingPaths.has(target) ? 301 : null,
      reason: target ? 'Likely maps to an existing strategic new route.' : 'Relevant legacy content needs editorial mapping.',
      migrationStatus: target && stagingPaths.has(target) ? 'template_ready' : 'needs_mapping',
      manualReview: !target || !stagingPaths.has(target)
    });
  }
  return entry(page, {
    newUrl: null,
    contentType: guessContentType(path),
    action: page.wordCount < 120 || !page.description ? 'MANUAL_REVIEW' : 'MERGE',
    redirectStatus: null,
    reason: page.wordCount < 120 || !page.description ? 'Needs human review for value/equity.' : 'Content may be merged into strategic routes.',
    migrationStatus: 'needs_review',
    manualReview: true
  });
}

function entry(page, decision) {
  return {
    legacy_url: page.url,
    new_url: decision.newUrl,
    content_type: decision.contentType,
    action: decision.action,
    redirect_status: decision.redirectStatus,
    reason: decision.reason,
    traffic_importance: null,
    backlink_importance: null,
    content_status: page.ok ? '200' : String(page.status),
    migration_status: decision.migrationStatus,
    manual_review: decision.manualReview
  };
}

function guessNewUrl(path) {
  if (/caso-studio/.test(path)) return path.replace('/caso-studio/', '/progetti/');
  if (/e-?commerce/i.test(path)) return '/servizi/ecommerce/';
  if (/siti|sito-web|web-agency|realizzazione-siti/i.test(path)) return '/servizi/siti-web/';
  if (/seo/i.test(path)) return '/servizi/seo/';
  if (/social/i.test(path)) return '/servizi/social-media/';
  if (/concorsi|premi/i.test(path)) return '/servizi/concorsi-a-premi/';
  if (/branding|comunicazione|immagine-coordinata/i.test(path)) return '/servizi/branding-e-comunicazione/';
  if (/agenzia|chi-siamo|web-agency/i.test(path)) return '/agenzia/';
  if (/contatti|contattaci/i.test(path)) return '/contatti/';
  return null;
}

function guessContentType(path) {
  if (path === '/') return 'Homepage';
  if (/caso-studio/.test(path)) return 'Case Study';
  if (/servizi|siti|ecommerce|seo|social|marketing|branding|comunicazione|concorsi|software/i.test(path)) return 'Service';
  if (/contatti|contattaci/i.test(path)) return 'ContactPage';
  if (/agenzia|chi-siamo|web-agency/i.test(path)) return 'AgencyPage';
  if (/privacy|cookie|legal/i.test(path)) return 'Legal';
  if (/tag|category|feed|author/i.test(path)) return 'Archive';
  return 'Page';
}

function categoryFor(item) {
  if (item.content_type === 'Legal') return 'LEGAL';
  if (item.action === 'REMOVE_410' || item.action === 'REDIRECT') return 'URL';
  if (item.content_type === 'Case Study') return 'CASE STUDY';
  if (item.content_type === 'Service') return 'SEO';
  return 'CONTENT';
}

function severityFor(item) {
  if (item.action === 'REMOVE_410' || item.new_url === '/nod/') return 'HIGH';
  if (item.content_type === 'Legal') return 'HIGH';
  return 'MEDIUM';
}

function duplicateH1(page) {
  return page.h1[0] === 'Archivi o Insight.';
}

function discoveryMarkdown({ legacy, staging, matrix, redirectsMaster, manualReview }) {
  return `# Final Audit Discovery Summary

Generated: ${new Date().toISOString()}

## Scope Completed

- Read internal governance, design, motion, content architecture, service, project, insight, agency, contact, REST, SEO, accessibility, performance and analytics docs.
- Crawled legacy production read-only: ${legacy.pages.length} URLs.
- Crawled staging: ${staging.pages.length} URLs.
- Audited local CMS cache and confirmed current headless content availability.
- Built preliminary URL decision matrix and redirect master map without applying production changes.

## Key Findings

- Legacy inventory found ${legacy.summary.ok} OK URLs, ${legacy.summary.errors} errors and ${legacy.summary.missingDescription} pages missing meta description.
- Staging inventory found ${staging.summary.ok} OK URLs and ${staging.summary.errors} error. Current staging 404: \`/nod/\`.
- CMS API cache currently exposes 26 insights, but 0 services, 0 case studies, 0 clients, 0 people, 0 resources and 0 testimonials.
- Services and projects still rely on validated fallback data during build; insight content is now imported in CMS.
- Staging pages emit no missing titles/descriptions/H1 in the crawl, but image alt usage needs manual review because decorative and content images are mixed.
- Duplicate paginated Insight H1 detected: \`Archivi o Insight.\` on paginated archive pages.

## Generated Outputs

- \`data/final-audit/legacy-site-inventory.json\`
- \`docs/final-audit/legacy-site-inventory.md\`
- \`data/final-audit/staging-site-inventory.json\`
- \`docs/final-audit/staging-site-inventory.md\`
- \`data/final-audit/url-decision-matrix.json\`
- \`docs/final-audit/url-decision-matrix.md\`
- \`data/migrations/redirects-master.json\`
- \`docs/final-audit/redirects-master.md\`
- \`data/final-audit/manual-review.json\`
- \`docs/final-audit/manual-review.md\`

## Preliminary Counts

- URL decision rows: ${matrix.length}
- Redirect candidates: ${redirectsMaster.length}
- Unverified redirect targets: ${redirectsMaster.filter((item) => !item.verified).length}
- Manual review items: ${manualReview.length}

## Current Blockers For Go-Live Readiness

- CMS is not yet the source of truth for services, case studies, clients, people, resources and testimonials.
- \`/nod/\` is linked on staging but returns 404.
- Redirect strategy is prepared but not validated against real traffic/backlink data.
- No Search Console, GA4 or Bing data exports found in this audit pass.
`;
}

function urlDecisionMarkdown(items) {
  return `# URL Decision Matrix

Generated: ${new Date().toISOString()}

Traffic and backlink importance are intentionally left empty because no Search Console, Analytics or backlink exports were available in the repository during this pass.

| Legacy URL | New URL | Type | Action | Redirect | Reason | Content | Migration | Manual review |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
${items
  .map(
    (item) =>
      `| ${item.legacy_url} | ${item.new_url || '-'} | ${item.content_type} | ${item.action} | ${item.redirect_status || '-'} | ${escapeMd(item.reason)} | ${item.content_status} | ${item.migration_status} | ${item.manual_review ? 'yes' : 'no'} |`
  )
  .join('\n')}
`;
}

function redirectsMarkdown(items) {
  return `# Redirects Master

Generated: ${new Date().toISOString()}

No redirect has been applied to production. This is a candidate map for go-live preparation.

| From | To | Status | Source | Verified target | Reason |
| --- | --- | ---: | --- | --- | --- |
${items
  .map(
    (item) =>
      `| ${item.from} | ${item.to} | ${item.status} | ${item.source} | ${item.verified ? 'yes' : 'no'} | ${escapeMd(item.reason)} |`
  )
  .join('\n')}
`;
}

function manualReviewMarkdown(items) {
  return `# Manual Review

Generated: ${new Date().toISOString()}

| Category | Severity | URL | Issue | Suggested action |
| --- | --- | --- | --- | --- |
${items
  .map(
    (item) =>
      `| ${item.category} | ${item.severity} | ${item.url} | ${escapeMd(item.issue)} | ${escapeMd(item.suggestedAction)} |`
  )
  .join('\n')}
`;
}

function readJson(path, fallback) {
  const full = join(root, path);
  if (!existsSync(full)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing JSON file: ${path}`);
  }
  return JSON.parse(readFileSync(full, 'utf8'));
}

function writeJson(path, value) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(path, value) {
  write(path, value);
}

function write(path, value) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, value);
}

function pathOf(url) {
  return new URL(url, legacy.baseUrl).pathname;
}

function escapeMd(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
