<?php

declare(strict_types=1);

// Isolated WordPress API doubles; exercise persistence failures and download authorization.
require_once __DIR__ . '/../src/Admin/CareerArchive.php';

use Netmarket\HeadlessCore\Admin\CareerArchive;

$posts = [];
$meta = [];
$allowed = true;
$failPost = false;
$failMeta = false;
$nonceValid = true;
$registration = [];

function register_post_type(string $type, array $args): void { $GLOBALS['registration'] = $args; }
function wp_slash(string $value): string { return addslashes($value); }
function wp_insert_post(array $post, bool $error): int {
    if ($GLOBALS['failPost']) { return 0; }
    $GLOBALS['posts'][1] = (object) array_merge($post, ['ID' => 1]);
    return 1;
}
function is_wp_error(mixed $value): bool { return false; }
function add_post_meta(int $id, string $key, mixed $value, bool $unique): int|false {
    if ($GLOBALS['failMeta']) { return false; }
    $GLOBALS['meta'][$id][$key] = $value;
    return 1;
}
function update_post_meta(int $id, string $key, mixed $value): bool { $GLOBALS['meta'][$id][$key] = $value; return true; }
function get_post_meta(int $id, string $key, bool $single): mixed { return $GLOBALS['meta'][$id][$key] ?? ''; }
function wp_delete_post(int $id, bool $force): void { unset($GLOBALS['posts'][$id], $GLOBALS['meta'][$id]); }
function current_user_can(string $cap): bool { return $GLOBALS['allowed'] && $cap === 'manage_options'; }
function absint(mixed $id): int { return abs((int) $id); }
function check_admin_referer(string $action): void { if (! $GLOBALS['nonceValid']) { throw new RuntimeException('nonce'); } }
function get_post(int $id): ?object { return $GLOBALS['posts'][$id] ?? null; }
function wp_die(string $message, string $title, array $args): never { throw new RuntimeException((string) $args['response']); }
function sanitize_file_name(string $name): string { return basename($name); }
function nocache_headers(): void {}
function expect(bool $condition, string $message): void { if (! $condition) { throw new RuntimeException($message); } }
function denied(CareerArchive $archive, string $expected): void {
    try { $archive->download(); } catch (RuntimeException $error) {
        expect($error->getMessage() === $expected, 'Unexpected denial: ' . $error->getMessage());
        return;
    }
    throw new RuntimeException('Download should have been denied');
}

$archive = new CareerArchive();
$archive->register();
expect(!$registration['public'] && !$registration['show_in_rest'], 'Archive must remain private');
expect($registration['capabilities']['read_private_posts'] === 'manage_options', 'Admin-only records');
$path = tempnam(sys_get_temp_dir(), 'nm_cv_test_');
$bytes = "%PDF-1.4\n" . chr(0) . chr(255) . "test\n";
file_put_contents($path, $bytes);
try {
    $id = $archive->save("D'Angelo", 'test@example.test', 'Area: design', $path, 'cv.pdf');
    expect($id === 1 && $posts[1]->post_status === 'private', 'Private record persisted');
    expect(base64_decode($meta[1]['_nm_cv']['data'], true) === $bytes, 'Binary CV round trip');
    expect($meta[1]['_nm_cv']['name'] === 'cv.pdf', 'Original filename retained');
    $archive->notification($id, false);
    expect($meta[1]['_nm_notification'] === 'failed' && isset($meta[1]['_nm_cv']), 'Mail failure must retain CV');
    $archive->notification($id, true);
    expect($meta[1]['_nm_notification'] === 'sent', 'Mail success tracked');
    $_GET['id'] = 1;
    if (($argv[1] ?? '') === '--download') {
        unlink($path);
        $archive->download();
    }
    $process = proc_open([PHP_BINARY, __FILE__, '--download'], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    expect(is_resource($process), 'Start download subprocess');
    $download = stream_get_contents($pipes[1]);
    $downloadErrors = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    expect(proc_close($process) === 0 && $downloadErrors === '' && $download === $bytes, 'Download returns exact binary CV');
    $allowed = false;
    denied($archive, '403');
    $allowed = true;
    $nonceValid = false;
    denied($archive, 'nonce');
    $nonceValid = true;
    $posts[1]->post_status = 'trash';
    denied($archive, '404');
    $posts[1]->post_status = 'private';
    $posts[1]->post_type = 'post';
    denied($archive, '404');
    $posts[1]->post_type = CareerArchive::POST_TYPE;
    $meta[1]['_nm_cv']['data'] = '!invalid!';
    denied($archive, '404');
    $failPost = true;
    expect($archive->save('Test', 'test@example.test', 'Message', $path, 'cv.pdf') === 0, 'Insert failure reported');
    $failPost = false;
    $failMeta = true;
    expect($archive->save('Test', 'test@example.test', 'Message', $path, 'cv.pdf') === 0, 'File storage failure reported');
    expect(!isset($posts[1]), 'Incomplete record removed');
    $failMeta = false;
    file_put_contents($path, '');
    expect($archive->save('Test', 'test@example.test', 'Message', $path, 'cv.pdf') === 0, 'Empty file rejected');
} finally { unlink($path); }
echo "Career archive: persistence, failure handling and authorization passed.\n";
