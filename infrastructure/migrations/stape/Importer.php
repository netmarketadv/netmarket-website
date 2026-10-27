<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Release;

use Netmarket\HeadlessCore\ContentTypes\Registry;
use Netmarket\HeadlessCore\Content\Relations;
use RuntimeException;

/** Create-only migration. Existing editorial objects are never overwritten. */
final class Importer
{
    private array $fields = [];
    private array $ids = [];
    private array $mediaIds = [];
    private array $journal;

    public function __construct(private array $plan, private string $digest, private string $assets, private string $journalFile)
    {
        if (get_option('siteurl') !== 'https://cms.netmarket.it' || ($plan['target'] ?? '') !== 'https://cms.netmarket.it' || ($plan['format'] ?? '') !== 'stape-cms-v1') {
            throw new RuntimeException('Canonical CMS and plan format required.');
        }
        if (!preg_match('/^[a-f0-9]{64}$/', $digest)) {
            throw new RuntimeException('Exact approved plan digest required.');
        }
        foreach ($plan['sources'] as $source) {
            $prefix = 'apps/wordpress/plugins/netmarket-headless-core/';
            if (str_starts_with($source['path'], $prefix)) {
                $relative = substr($source['path'], strlen($prefix));
                if (str_contains($relative, '..') || hash_file('sha256', WP_PLUGIN_DIR . '/netmarket-headless-core/' . $relative) !== $source['sha256']) {
                    throw new RuntimeException('Native CMS implementation changed since reviewed plan.');
                }
            }
        }
        foreach ((new Registry())->definitions() as $definition) {
            foreach ($definition->fields as $field) {
                $this->fields[$definition->key()][$field->key] = $field;
            }
        }
        $this->journal = is_file($journalFile) ? json_decode(file_get_contents($journalFile), true, 512, JSON_THROW_ON_ERROR) : [
            'digest' => $digest, 'status' => 'new', 'created' => [], 'terms' => [], 'before' => [],
        ];
        if ($this->journal['digest'] !== $digest) {
            throw new RuntimeException('Journal belongs to another plan.');
        }
    }

    private function posts(array $args): array
    {
        return get_posts(array_merge(['post_status' => array_keys(get_post_stati()), 'numberposts' => -1, 'suppress_filters' => true], $args));
    }

    /** Read-only validation, including every relationship, field and media byte. */
    public function inspect(): array
    {
        $keys = [];
        foreach ($this->plan['records'] as $record) {
            $key = $record['type'] . '/' . $record['slug'];
            if (!in_array($record['type'], ['nm_service', 'nm_case_study', 'nm_client'], true) || !preg_match('/^[a-z0-9-]+$/', $record['slug']) || isset($keys[$key]) || !post_type_exists($record['type'])) {
                throw new RuntimeException('Invalid or duplicate record: ' . $key);
            }
            $keys[$key] = true;
            foreach ($record['meta'] as $name => $value) {
                if (!isset($this->fields[$record['type']][$name])) {
                    throw new RuntimeException('Unknown native CMS field: ' . $name);
                }
            }
            $existing = $this->posts(['post_type' => $record['type'], 'name' => $record['slug']]);
            if ($existing !== []) {
                if (count($existing) !== 1 || get_post_meta($existing[0]->ID, '_stape_import_digest', true) !== $this->digest || !isset($this->journal['created'][(string) $existing[0]->ID])) {
                    throw new RuntimeException('Existing content conflict: ' . $key);
                }
                $this->ids[$key] = (int) $existing[0]->ID;
            }
            foreach ($record['terms'] as $taxonomy => $terms) {
                if (!taxonomy_exists($taxonomy)) {
                    throw new RuntimeException('Unknown taxonomy.');
                }
                foreach ($terms as $term) {
                    $existingTerm = get_term_by('slug', $term['slug'], $taxonomy);
                    if ($existingTerm && $existingTerm->name !== $term['name']) {
                        throw new RuntimeException('Existing taxonomy name conflict: ' . $term['slug']);
                    }
                }
            }
        }
        $mediaKeys = [];
        foreach ($this->plan['media'] as $media) {
            if (!preg_match('/^[a-f0-9]{64}$/', $media['key']) || basename($media['filename']) !== $media['filename'] || isset($mediaKeys[$media['key']])) {
                throw new RuntimeException('Unsafe or duplicate media key.');
            }
            $mediaKeys[$media['key']] = true;
            $file = $this->assets . '/' . $media['key'] . '-' . $media['filename'];
            if (is_link($file) || !is_file($file) || hash_file('sha256', $file) !== $media['sha256']) {
                throw new RuntimeException('Media integrity mismatch: ' . $media['filename']);
            }
            $mime = str_ends_with($file, '.svg') ? 'image/svg+xml' : wp_get_image_mime($file);
            if ($mime !== $media['mimeType'] || !in_array($mime, ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'], true)) {
                throw new RuntimeException('Media MIME mismatch.');
            }
            if ($mime === 'image/svg+xml') {
                $svg = file_get_contents($file);
                $xml = new \DOMDocument();
                if (preg_match('/<!DOCTYPE|<!ENTITY/i', $svg) || !$xml->loadXML($svg, LIBXML_NONET) || $xml->documentElement->localName !== 'svg') {
                    throw new RuntimeException('Unsafe SVG document.');
                }
                foreach ($xml->getElementsByTagName('*') as $node) {
                    if (in_array(strtolower($node->localName), ['script', 'foreignobject', 'iframe', 'object', 'embed'], true)) {
                        throw new RuntimeException('Executable SVG denied.');
                    }
                    if (strtolower($node->localName) === 'style' && preg_match('/@import|url\s*\(|expression\s*\(|javascript:/i', $node->textContent)) {
                        throw new RuntimeException('External or executable SVG stylesheet denied.');
                    }
                    foreach ($node->attributes as $attribute) {
                        if (str_starts_with(strtolower($attribute->name), 'on') || (in_array($attribute->localName, ['href', 'src'], true) && !str_starts_with($attribute->value, '#')) || preg_match('/url\(\s*["\x27]?(?!#)/i', $attribute->value)) {
                            throw new RuntimeException('External or executable SVG reference denied.');
                        }
                    }
                }
            }
            if (isset($media['existingId'])) {
                $id = (int) $media['existingId'];
                if (get_post_type($id) !== 'attachment' || hash_file('sha256', get_attached_file($id)) !== $media['sha256'] || get_post_meta($id, '_wp_attachment_image_alt', true) !== $media['alt']) {
                    throw new RuntimeException('Existing attachment changed.');
                }
                $this->mediaIds[$media['key']] = $id;
            } else {
                $existing = $this->posts(['post_type' => 'attachment', 'meta_key' => '_stape_import_media', 'meta_value' => $media['key']]);
                if ($existing !== []) {
                    if (count($existing) !== 1 || get_post_meta($existing[0]->ID, '_stape_import_digest', true) !== $this->digest || !isset($this->journal['created'][(string) $existing[0]->ID])) {
                        throw new RuntimeException('Existing media conflict.');
                    }
                    $this->mediaIds[$media['key']] = (int) $existing[0]->ID;
                }
            }
        }
        $check = function ($value) use (&$check, $keys, $mediaKeys): void {
            if (!is_array($value)) {
                return;
            }
            if (isset($value['record']) && !isset($keys[$value['record']])) {
                throw new RuntimeException('Unresolved record relationship: ' . $value['record']);
            }
            if (isset($value['media']) && !isset($mediaKeys[$value['media']])) {
                throw new RuntimeException('Unresolved media relationship.');
            }
            foreach ($value as $child) {
                $check($child);
            }
        };
        $check($this->plan['records']);
        return ['records' => count($keys), 'media' => count($mediaKeys), 'existingRecords' => count($this->ids), 'writes' => 0, 'digest' => $this->digest];
    }

    private function save(): void
    {
        $temporary = $this->journalFile . '.tmp';
        if (file_put_contents($temporary, json_encode($this->journal, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)) === false || !chmod($temporary, 0600) || !rename($temporary, $this->journalFile)) {
            throw new RuntimeException('Cannot persist private recovery journal.');
        }
    }

    private function fingerprint(int $id): string
    {
        $post = get_post($id, ARRAY_A);
        $meta = get_post_meta($id);
        ksort($meta);
        $terms = [];
        foreach (get_object_taxonomies($post['post_type']) as $taxonomy) {
            $terms[$taxonomy] = wp_get_object_terms($id, $taxonomy, ['fields' => 'ids']);
        }
        $file = $post['post_type'] === 'attachment' ? get_attached_file($id) : '';
        return hash('sha256', serialize([$post, $meta, $terms, $file !== '' && is_file($file) ? hash_file('sha256', $file) : null]));
    }

    private function checkpoint(int $id): void
    {
        $this->journal['created'][(string) $id] = $this->fingerprint($id);
        $this->save();
    }

    private function resolveValue(mixed $value): mixed
    {
        if (!is_array($value)) {
            return $value;
        }
        if (isset($value['record'])) {
            return $this->ids[$value['record']];
        }
        if (isset($value['media'])) {
            return $this->mediaIds[$value['media']];
        }
        return array_map(fn ($item) => $this->resolveValue($item), $value);
    }

    public function apply(): array
    {
        $summary = $this->inspect();
        if ($this->journal['status'] === 'complete') {
            $this->verifyOwned();
            return $summary + ['unchanged' => true];
        }
        if ($this->journal['status'] !== 'new' || is_file($this->journalFile)) {
            throw new RuntimeException('Incomplete or rolled-back run: inspect recovery journal; no silent resume.');
        }
        // Backup of the exact touched scope: no preexisting post will be overwritten.
        $this->journal['status'] = 'applying';
        $this->journal['before'] = ['existingRecords' => $this->ids, 'reusedMedia' => $this->mediaIds, 'createOnly' => true];
        $this->save();
        foreach ($this->plan['media'] as $media) {
            if (isset($this->mediaIds[$media['key']])) {
                continue;
            }
            $upload = wp_upload_dir();
            if ($upload['error']) {
                throw new RuntimeException('Upload directory unavailable.');
            }
            $filename = wp_unique_filename($upload['path'], 'stape-' . $media['key'] . '-' . $media['filename']);
            $file = $upload['path'] . '/' . $filename;
            // Exclusive creation prevents replacing a preexisting file, including a concurrent import.
            $handle = fopen($file, 'x');
            if (!$handle) {
                throw new RuntimeException('Media destination already exists.');
            }
            $bytes = file_get_contents($this->assets . '/' . $media['key'] . '-' . $media['filename']);
            $written = fwrite($handle, $bytes);
            fclose($handle);
            if ($written !== strlen($bytes)) {
                throw new RuntimeException('Media write incomplete.');
            }
            if (!chmod($file, 0644)) {
                throw new RuntimeException('Cannot set public media permissions.');
            }
            $id = wp_insert_attachment(wp_slash(['post_title' => $media['filename'], 'post_mime_type' => $media['mimeType'], 'post_status' => 'inherit', 'meta_input' => ['_stape_import_digest' => $this->digest, '_stape_import_media' => $media['key']]]), $file, 0, true);
            if (is_wp_error($id)) {
                unlink($file);
                throw new RuntimeException('Attachment creation failed.');
            }
            $this->mediaIds[$media['key']] = $id;
            $this->checkpoint($id);
            update_post_meta($id, '_wp_attachment_image_alt', wp_slash($media['alt']));
            $metadata = wp_generate_attachment_metadata($id, $file);
            wp_update_attachment_metadata($id, $metadata);
            $this->checkpoint($id);
            if (hash_file('sha256', $file) !== $media['sha256']) {
                throw new RuntimeException('CMS changed original media bytes.');
            }
        }
        foreach ($this->plan['records'] as $record) {
            $key = $record['type'] . '/' . $record['slug'];
            $id = wp_insert_post(wp_slash(['post_type' => $record['type'], 'post_status' => 'draft', 'post_name' => $record['slug'], 'post_title' => $record['title'], 'post_excerpt' => $record['excerpt'], 'post_content' => $record['content'], 'meta_input' => ['_stape_import_digest' => $this->digest]]), true);
            if (is_wp_error($id) || get_post($id)->post_name !== $record['slug']) {
                throw new RuntimeException('Record creation failed or slug changed.');
            }
            $this->ids[$key] = $id;
            $this->checkpoint($id);
        }
        foreach ($this->plan['records'] as $record) {
            $id = $this->ids[$record['type'] . '/' . $record['slug']];
            foreach ($record['meta'] as $name => $raw) {
                $field = $this->fields[$record['type']][$name];
                $value = $field->sanitize($this->resolveValue($raw));
                if ($field->type === 'relation_list') {
                    Relations::replaceMany($id, $field->metaKey(), $value);
                } else {
                    update_post_meta($id, $field->metaKey(), wp_slash($value));
                }
                $this->checkpoint($id);
            }
            if ($record['thumbnail']) {
                set_post_thumbnail($id, $this->resolveValue($record['thumbnail']));
                $this->checkpoint($id);
            }
            foreach ($record['terms'] as $taxonomy => $terms) {
                $termIds = [];
                foreach ($terms as $term) {
                    $existing = get_term_by('slug', $term['slug'], $taxonomy);
                    if ($existing) {
                        $termIds[] = $existing->term_id;
                    } else {
                        $created = wp_insert_term($term['name'], $taxonomy, ['slug' => $term['slug']]);
                        if (is_wp_error($created)) {
                            throw new RuntimeException('Term creation failed.');
                        }
                        $termIds[] = $created['term_id'];
                        $this->journal['terms'][] = ['id' => $created['term_id'], 'taxonomy' => $taxonomy, 'slug' => $term['slug'], 'name' => $term['name']];
                        $this->save();
                    }
                }
                if (is_wp_error(wp_set_object_terms($id, $termIds, $taxonomy))) {
                    throw new RuntimeException('Term assignment failed.');
                }
                $this->checkpoint($id);
            }
        }
        // Publish only after all references exist and every record has its complete metadata.
        foreach ($this->plan['records'] as $record) {
            $id = $this->ids[$record['type'] . '/' . $record['slug']];
            if (is_wp_error(wp_update_post(['ID' => $id, 'post_status' => 'publish'], true))) {
                throw new RuntimeException('Publication failed.');
            }
            $this->checkpoint($id);
        }
        $this->journal['status'] = 'complete';
        $this->save();
        unset($summary['writes']);
        return $summary + ['created' => count($this->journal['created']), 'unchanged' => false];
    }

    private function verifyOwned(): void
    {
        foreach ($this->journal['created'] as $id => $fingerprint) {
            if (get_post_meta((int) $id, '_stape_import_digest', true) !== $this->digest || $this->fingerprint((int) $id) !== $fingerprint) {
                throw new RuntimeException('Imported content edited: manual reconciliation required before rollback.');
            }
        }
    }

    public function rollback(bool $execute = false): array
    {
        if (!in_array($this->journal['status'], ['complete', 'applying'], true)) {
            throw new RuntimeException('No matching import journal to roll back.');
        }
        $this->verifyOwned();
        $ids = array_map('intval', array_keys($this->journal['created']));
        // Refuse removing objects another editor has started to use, even if the object itself is unchanged.
        $relationFields = ['_thumbnail_id'];
        foreach ($this->fields as $fields) {
            foreach ($fields as $field) {
                if (in_array($field->type, ['media', 'relation', 'relation_list', 'media_gallery'], true)) {
                    $relationFields[] = $field->metaKey();
                }
            }
        }
        foreach ($this->posts(['post_type' => array_keys(get_post_types()), 'post__not_in' => $ids]) as $post) {
            foreach ($ids as $ownedId) {
                if (get_post_type($ownedId) === 'attachment' && str_contains($post->post_content, (string) wp_get_attachment_url($ownedId))) {
                    throw new RuntimeException('Imported media referenced by external content.');
                }
            }
            foreach (array_unique($relationFields) as $key) {
                foreach (get_post_meta($post->ID, $key, false) as $value) {
                    $values = is_array($value) ? array_column($value, 'mediaId') : [$value];
                    if (array_intersect($ids, array_map('intval', $values))) {
                        throw new RuntimeException('Imported object used outside this batch; rollback refused.');
                    }
                }
            }
        }
        foreach ($this->journal['terms'] as $term) {
            $current = get_term_by('slug', $term['slug'], $term['taxonomy']);
            if (!$current || $current->term_id !== $term['id'] || $current->name !== $term['name'] || array_diff(get_objects_in_term($term['id'], $term['taxonomy']), $ids)) {
                throw new RuntimeException('Imported taxonomy changed or used elsewhere.');
            }
        }
        if ($execute) {
            // Posts first, media second; wp_delete_attachment removes only files owned by that attachment.
            usort($ids, fn (int $a, int $b) => (get_post_type($a) === 'attachment') <=> (get_post_type($b) === 'attachment'));
            foreach ($ids as $id) {
                $deleted = get_post_type($id) === 'attachment' ? wp_delete_attachment($id, true) : wp_delete_post($id, true);
                if (!$deleted) {
                    throw new RuntimeException('Scoped rollback deletion failed; preserve journal for reconciliation.');
                }
            }
            foreach ($this->journal['terms'] as $term) {
                if (is_wp_error(wp_delete_term($term['id'], $term['taxonomy']))) {
                    throw new RuntimeException('Scoped taxonomy rollback failed.');
                }
            }
            $this->journal['status'] = 'rolled_back';
            $this->save();
        }
        return ['digest' => $this->digest, 'objects' => count($ids), 'execute' => $execute];
    }
}
