import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const payloadPath = join(root, 'data/migrations/insights/insight-transform-dry-run.json');
const dryRun = process.argv.includes('--dry-run');
const skipMedia = process.argv.includes('--skip-media');
const force = process.argv.includes('--force');
const sshHost = process.env.SG_SSH_HOST_ALIAS || 'netmarket-sg';
const cmsPath =
  process.env.SG_CMS_WORDPRESS_PATH || '/home/customer/www/cms.netmarket.it/public_html';

if (!existsSync(payloadPath)) {
  throw new Error(`Missing insight payload: ${payloadPath}`);
}

const workDir = mkdtempSync(join(tmpdir(), 'netmarket-insights-import-'));
const remoteDir = `/tmp/${basename(workDir)}`;
const remotePayload = `${remoteDir}/payload.json`;
const remoteImporter = `${remoteDir}/import.php`;
const localPayload = join(workDir, 'payload.json');
const localImporter = join(workDir, 'import.php');

writeFileSync(localPayload, readFileSync(payloadPath, 'utf8'));
writeFileSync(localImporter, phpImporter(), 'utf8');

run('ssh', [sshHost, `mkdir -p ${quote(remoteDir)}`]);
run('scp', [localPayload, `${sshHost}:${remotePayload}`]);
run('scp', [localImporter, `${sshHost}:${remoteImporter}`]);
run('ssh', [
  sshHost,
  [
    `cd ${quote(cmsPath)}`,
    `NMHC_INSIGHT_PAYLOAD=${quote(remotePayload)} NMHC_INSIGHT_DRY_RUN=${dryRun ? '1' : '0'} NMHC_INSIGHT_SKIP_MEDIA=${skipMedia ? '1' : '0'} NMHC_INSIGHT_FORCE=${force ? '1' : '0'} wp eval-file ${quote(remoteImporter)}`
  ].join(' && ')
]);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status ?? 'unknown'}`);
  }
}

function quote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function phpImporter() {
  return `<?php

$payloadPath = (string) getenv('NMHC_INSIGHT_PAYLOAD');
$dryRun = getenv('NMHC_INSIGHT_DRY_RUN') === '1';
$skipMedia = getenv('NMHC_INSIGHT_SKIP_MEDIA') === '1';
$force = getenv('NMHC_INSIGHT_FORCE') === '1';

if ($payloadPath === '' || ! file_exists($payloadPath)) {
    fwrite(STDERR, "Missing payload file.\\n");
    exit(1);
}

$items = json_decode((string) file_get_contents($payloadPath), true);
if (! is_array($items)) {
    fwrite(STDERR, "Invalid payload JSON.\\n");
    exit(1);
}

if (! $skipMedia) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
}

$summary = [
    'dryRun' => $dryRun,
    'skipMedia' => $skipMedia,
    'force' => $force,
    'total' => count($items),
    'created' => 0,
    'updated' => 0,
    'unchanged' => 0,
    'mediaImported' => 0,
    'mediaReused' => 0,
    'mediaFailed' => [],
    'serviceRelationsResolved' => 0,
    'serviceRelationsDeferred' => 0,
    'errors' => [],
];

foreach ($items as $item) {
    $slug = sanitize_title((string) ($item['slug'] ?? ''));
    if ($slug === '') {
        $summary['errors'][] = 'Skipped item with empty slug.';
        continue;
    }

    $existing = get_page_by_path($slug, OBJECT, 'post');
    $postId = $existing instanceof WP_Post ? (int) $existing->ID : 0;
    $checksum = (string) ($item['migration']['checksum'] ?? '');
    $previousChecksum = $postId > 0 ? (string) get_post_meta($postId, 'nmhc_migration_checksum', true) : '';
    if (! $force && $postId > 0 && $checksum !== '' && $previousChecksum === $checksum) {
        $summary['unchanged']++;
        continue;
    }

    $content = (string) ($item['content'] ?? '');
    $featuredAttachmentId = 0;
    $mediaBySource = [];
    foreach (($item['media'] ?? []) as $media) {
        $sourceUrl = (string) ($media['sourceUrl'] ?? '');
        if ($sourceUrl === '') {
            continue;
        }
        $attachmentId = $skipMedia ? 0 : attachmentForSource($sourceUrl, (string) ($media['alt'] ?? ''), $summary);
        if ($attachmentId > 0) {
            $attachmentUrl = (string) wp_get_attachment_url($attachmentId);
            $mediaBySource[$sourceUrl] = $attachmentUrl;
            $localPath = '/media/insights/legacy/' . (string) ($item['id'] ?? '') . '-' . basename((string) parse_url($sourceUrl, PHP_URL_PATH));
            $content = str_replace($localPath, $attachmentUrl, $content);
            $content = str_replace($sourceUrl, $attachmentUrl, $content);
            if (($media['role'] ?? '') === 'featured') {
                $featuredAttachmentId = $attachmentId;
            }
        }
    }

    $postData = [
        'post_type' => 'post',
        'post_status' => 'publish',
        'post_title' => wp_strip_all_tags((string) ($item['title'] ?? $slug)),
        'post_name' => $slug,
        'post_excerpt' => wp_strip_all_tags((string) ($item['excerpt'] ?? '')),
        'post_content' => $content,
    ];
    if (! empty($item['dates']['published'])) {
        $postData['post_date_gmt'] = gmdate('Y-m-d H:i:s', strtotime((string) $item['dates']['published']));
        $postData['post_date'] = get_date_from_gmt($postData['post_date_gmt']);
    }
    if (! empty($item['dates']['modified'])) {
        $postData['post_modified_gmt'] = gmdate('Y-m-d H:i:s', strtotime((string) $item['dates']['modified']));
        $postData['post_modified'] = get_date_from_gmt($postData['post_modified_gmt']);
    }
    if ($postId > 0) {
        $postData['ID'] = $postId;
    }

    if ($dryRun) {
        $summary[$postId > 0 ? 'updated' : 'created']++;
        continue;
    }

    $savedId = $postId > 0 ? wp_update_post($postData, true) : wp_insert_post($postData, true);
    if (is_wp_error($savedId)) {
        $summary['errors'][] = $slug . ': ' . $savedId->get_error_message();
        continue;
    }
    $postId = (int) $savedId;
    $summary[$existing instanceof WP_Post ? 'updated' : 'created']++;

    assignCategories($postId, $item['categories'] ?? []);
    update_post_meta($postId, 'nmhc_subtitle', '');
    update_post_meta($postId, 'nmhc_featured', ! empty($item['featured']) ? '1' : '');
    update_post_meta($postId, 'nmhc_priority', (int) ($item['priority'] ?? 0));
    update_post_meta($postId, 'nmhc_seo_title', (string) ($item['seo']['title'] ?? $item['title'] ?? ''));
    $metaDescription = clampText(plainText((string) ($item['seo']['description'] ?? $item['excerpt'] ?? '')), 190);
    update_post_meta($postId, 'nmhc_meta_description', $metaDescription);
    update_post_meta($postId, 'nmhc_canonical_override', '');
    update_post_meta($postId, 'nmhc_noindex', ! empty($item['seo']['noindex']) ? '1' : '');
    update_post_meta($postId, 'nmhc_social_title', (string) ($item['seo']['title'] ?? $item['title'] ?? ''));
    update_post_meta($postId, 'nmhc_social_description', $metaDescription);
    update_post_meta($postId, 'nmhc_migration_source', (string) ($item['migration']['source'] ?? ''));
    update_post_meta($postId, 'nmhc_migration_legacy_id', (int) ($item['migration']['legacyId'] ?? $item['id'] ?? 0));
    update_post_meta($postId, 'nmhc_migration_legacy_url', (string) ($item['migration']['legacyUrl'] ?? ''));
    update_post_meta($postId, 'nmhc_migration_version', (string) ($item['migration']['version'] ?? ''));
    update_post_meta($postId, 'nmhc_migration_date', (string) ($item['migration']['date'] ?? ''));
    update_post_meta($postId, 'nmhc_migration_checksum', $checksum);
    update_post_meta($postId, 'nmhc_migration_related_service_slugs', wp_json_encode($item['relatedServices'] ?? []));
    update_post_meta($postId, 'nmhc_migration_media_map', wp_json_encode($mediaBySource));

    if ($featuredAttachmentId > 0) {
        set_post_thumbnail($postId, $featuredAttachmentId);
        update_post_meta($postId, 'nmhc_social_image', $featuredAttachmentId);
    }

    replaceServiceRelations($postId, $item['relatedServices'] ?? [], $summary);
}

echo wp_json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\\n";

function assignCategories(int $postId, array $categories): void {
    $ids = [];
    foreach ($categories as $category) {
        $slug = sanitize_title((string) ($category['slug'] ?? ''));
        $name = (string) ($category['name'] ?? $slug);
        if ($slug === '' || $name === '') {
            continue;
        }
        $term = term_exists($slug, 'category');
        if (! $term) {
            $term = wp_insert_term($name, 'category', ['slug' => $slug]);
        }
        if (is_wp_error($term)) {
            continue;
        }
        $ids[] = (int) (is_array($term) ? $term['term_id'] : $term);
    }
    if ($ids !== []) {
        wp_set_post_terms($postId, $ids, 'category', false);
    }
}

function replaceServiceRelations(int $postId, array $slugs, array &$summary): void {
    delete_post_meta($postId, 'nmhc_related_services');
    foreach (array_unique(array_map('sanitize_title', $slugs)) as $slug) {
        if ($slug === '') {
            continue;
        }
        $service = get_page_by_path($slug, OBJECT, 'nm_service');
        if ($service instanceof WP_Post && $service->post_status === 'publish') {
            add_post_meta($postId, 'nmhc_related_services', (int) $service->ID, false);
            $summary['serviceRelationsResolved']++;
        } else {
            $summary['serviceRelationsDeferred']++;
        }
    }
}

function attachmentForSource(string $sourceUrl, string $alt, array &$summary): int {
    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'meta_key' => '_nmhc_source_url',
        'meta_value' => $sourceUrl,
        'fields' => 'ids',
        'numberposts' => 1,
    ]);
    if (is_array($existing) && isset($existing[0])) {
        $summary['mediaReused']++;
        return (int) $existing[0];
    }

    $attachmentId = media_sideload_image($sourceUrl, 0, $alt, 'id');
    if (is_wp_error($attachmentId)) {
        $summary['mediaFailed'][] = $sourceUrl . ' — ' . $attachmentId->get_error_message();
        return 0;
    }
    $attachmentId = (int) $attachmentId;
    update_post_meta($attachmentId, '_nmhc_source_url', $sourceUrl);
    if ($alt !== '') {
        update_post_meta($attachmentId, '_wp_attachment_image_alt', sanitize_text_field($alt));
    }
    $summary['mediaImported']++;
    return $attachmentId;
}

function clampText(string $value, int $maxLength): string {
    $normalized = preg_replace('/\\s+/u', ' ', trim($value)) ?: '';
    if (mb_strlen($normalized) <= $maxLength) {
        return $normalized;
    }
    $clipped = mb_substr($normalized, 0, $maxLength - 1);
    if (preg_match('/^(.+[.!?])\\s+/u', $clipped, $matches) && mb_strlen($matches[1]) >= 80) {
        return $matches[1];
    }
    $wordBoundary = preg_replace('/\\s+\\S*$/u', '', $clipped) ?: $clipped;
    return $wordBoundary . '…';
}

function plainText(string $value): string {
    $decoded = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $stripped = strip_tags($decoded);
    return preg_replace('/\\s+/u', ' ', trim($stripped)) ?: '';
}
`;
}
