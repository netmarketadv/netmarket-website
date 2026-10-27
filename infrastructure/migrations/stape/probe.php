<?php
// Loaded over stdin by WP-CLI. No file/database writes and no secret reads.
$errors = [];
foreach ($plan['sources'] as $source) {
    $prefix = 'apps/wordpress/plugins/netmarket-headless-core/';
    if (str_starts_with($source['path'], $prefix)) {
        $relative = substr($source['path'], strlen($prefix));
        if (str_contains($relative, '..') || hash_file('sha256', WP_PLUGIN_DIR . '/netmarket-headless-core/' . $relative) !== $source['sha256']) {
            $errors[] = 'Native CMS implementation changed';
        }
    }
}
$registry = new \Netmarket\HeadlessCore\ContentTypes\Registry();
foreach ($plan['records'] as $record) {
    $definition = $registry->get($record['type']);
    if (!$definition || !post_type_exists($record['type'])) {
        $errors[] = 'Missing native content type';
        continue;
    }
    $fields = [];
    foreach ($definition->fields as $field) {
        $fields[$field->key] = $field;
    }
    foreach ($record['meta'] as $name => $value) {
        if (!isset($fields[$name])) {
            $errors[] = 'Unknown native field: ' . $name;
        }
    }
    foreach ($record['terms'] as $taxonomy => $terms) {
        foreach ($terms as $term) {
            $existing = get_term_by('slug', $term['slug'], $taxonomy);
            if (!taxonomy_exists($taxonomy) || ($existing && $existing->name !== $term['name'])) {
                $errors[] = 'Taxonomy conflict: ' . $term['slug'];
            }
        }
    }
    $matches = get_posts(['post_type' => $record['type'], 'post_status' => array_keys(get_post_stati()), 'name' => $record['slug'], 'numberposts' => -1]);
    foreach ($matches as $match) {
        if (get_post_meta($match->ID, '_stape_import_digest', true) !== $digest) {
            $errors[] = 'Existing editorial record: ' . $record['slug'];
        }
    }
}
if (get_option('siteurl') !== 'https://cms.netmarket.it') {
    $errors[] = 'Wrong CMS identity';
}
$runtime = ['php' => PHP_VERSION, 'dom' => class_exists('DOMDocument'), 'fileinfo' => extension_loaded('fileinfo'), 'uploadsWritable' => is_writable(wp_upload_dir(null, false)['basedir'])];
if (PHP_VERSION_ID < 80200 || !$runtime['dom'] || !$runtime['fileinfo'] || !$runtime['uploadsWritable']) {
    $errors[] = 'CMS import runtime unavailable';
}
echo wp_json_encode(['runtime' => $runtime, 'scope' => 'native-wordpress-readonly-preflight', 'digest' => $digest, 'records' => count($plan['records']), 'errors' => $errors, 'writes' => 0]), PHP_EOL;
if ($errors !== []) {
    throw new \RuntimeException('Native CMS plan conflicts; no writes performed.');
}
