<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Admin;

final class CareerArchive
{
    public const POST_TYPE = 'nm_application';
    private const FILE_TYPE = 'nm_cv_file';
    private const FILE_META = '_nm_cv';

    public function register(): void
    {
        register_post_type(self::POST_TYPE, [
            'labels' => ['name' => 'Candidature', 'singular_name' => 'Candidatura'],
            'public' => false,
            'publicly_queryable' => false,
            'show_ui' => true,
            'show_in_rest' => false,
            'rewrite' => false,
            'supports' => ['title', 'editor'],
            'map_meta_cap' => false,
            'capabilities' => [
                'edit_post' => 'manage_options', 'read_post' => 'manage_options',
                'delete_post' => 'manage_options', 'edit_posts' => 'manage_options',
                'edit_others_posts' => 'manage_options', 'publish_posts' => 'do_not_allow',
                'read_private_posts' => 'manage_options', 'delete_posts' => 'manage_options',
                'delete_private_posts' => 'manage_options', 'delete_published_posts' => 'manage_options',
                'delete_others_posts' => 'manage_options', 'edit_private_posts' => 'manage_options',
                'edit_published_posts' => 'manage_options', 'create_posts' => 'do_not_allow',
            ],
            'menu_icon' => 'dashicons-id-alt',
        ]);
        register_post_type(self::FILE_TYPE, [
            'public' => false, 'publicly_queryable' => false,
            'show_ui' => false, 'show_in_rest' => false, 'rewrite' => false,
            'map_meta_cap' => false,
            'capabilities' => ['read_post' => 'manage_options', 'edit_post' => 'do_not_allow', 'delete_post' => 'do_not_allow'],
        ]);
    }

    public function save(string $name, string $email, string $message, string $path, string $filename): int
    {
        $bytes = file_get_contents($path);
        if ($bytes === false || $bytes === '') {
            return 0;
        }
        $id = wp_insert_post([
            'post_type' => self::POST_TYPE,
            'post_status' => 'private',
            'post_title' => wp_slash($name . ' — ' . $email),
            'post_content' => wp_slash($message),
        ], true);
        if (is_wp_error($id) || ! $id) {
            return 0;
        }
        // Keep file bodies out of the metadata cache used by the admin list.
        $fileId = wp_insert_post([
            'post_type' => self::FILE_TYPE, 'post_status' => 'private',
            'post_parent' => $id, 'post_content' => base64_encode($bytes),
        ], true);
        if (is_wp_error($fileId) || ! $fileId) {
            wp_delete_post($id, true);
            return 0;
        }
        if (! add_post_meta($id, self::FILE_META, ['name' => $filename, 'id' => $fileId], true)) {
            wp_delete_post($fileId, true);
            wp_delete_post($id, true);
            return 0;
        }
        update_post_meta($id, '_nm_notification', 'pending');
        return $id;
    }

    public function notification(int $id, bool $sent): void
    {
        update_post_meta($id, '_nm_notification', $sent ? 'sent' : 'failed');
    }

    public function registerMetaBox(): void
    {
        if (current_user_can('manage_options')) {
            add_meta_box('nm_application_cv', 'Curriculum allegato', [$this, 'metaBox'], self::POST_TYPE, 'normal', 'high');
        }
    }

    public function metaBox(\WP_Post $post): void
    {
        if (! current_user_can('manage_options') || $post->post_type !== self::POST_TYPE) {
            return;
        }
        $file = get_post_meta($post->ID, self::FILE_META, true);
        $filePost = is_array($file) ? get_post(absint($file['id'] ?? 0)) : null;
        if ($post->post_status !== 'private' || ! $filePost || $filePost->post_type !== self::FILE_TYPE || $filePost->post_status !== 'private' || $filePost->post_parent !== $post->ID) {
            echo '<p>Curriculum non disponibile.</p>';
            return;
        }
        $filename = sanitize_file_name((string) ($file['name'] ?? 'curriculum'));
        echo '<p><strong>' . esc_html($filename) . '</strong></p>';
        $url = $this->downloadUrl($post->ID);
        echo '<p><a class="button button-primary" href="' . esc_url($url) . '">Scarica CV</a>';
        if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) === 'pdf') {
            echo ' <a class="button" target="_blank" rel="noopener" href="' . esc_url($this->downloadUrl($post->ID, true)) . '">Apri PDF</a>';
        }
        echo '</p><p>File privato, accessibile solo agli amministratori.</p>';
    }

    private function downloadUrl(int $id, bool $inline = false): string
    {
        return wp_nonce_url(admin_url('admin-post.php?action=nm_download_cv&id=' . $id . ($inline ? '&view=1' : '')), 'nm_download_cv_' . $id);
    }

    public function deleteFile(int $id): void
    {
        $post = get_post($id);
        if (! $post || $post->post_type !== self::POST_TYPE) {
            return;
        }
        $file = get_post_meta($id, self::FILE_META, true);
        $filePost = is_array($file) ? get_post(absint($file['id'] ?? 0)) : null;
        if ($filePost && $filePost->post_type === self::FILE_TYPE && $filePost->post_parent === $id) {
            wp_delete_post($filePost->ID, true);
        }
    }

    /** @param array<string, string> $columns @return array<string, string> */
    public function columns(array $columns): array
    {
        $columns['nm_cv'] = 'Curriculum';
        $columns['nm_notification'] = 'Notifica email';
        return $columns;
    }

    public function column(string $column, int $id): void
    {
        if ($column === 'nm_notification') {
            $status = get_post_meta($id, '_nm_notification', true);
            echo esc_html($status === 'sent' ? 'Inviata' : ($status === 'failed' ? 'Invio fallito · CV salvato' : 'In attesa'));
        }
        if ($column === 'nm_cv' && current_user_can('manage_options')) {
            $url = $this->downloadUrl($id);
            echo '<a href="' . esc_url($url) . '">Scarica CV</a>';
        }
    }

    public function download(): void
    {
        if (! current_user_can('manage_options')) {
            wp_die('Accesso negato.', '', ['response' => 403]);
        }
        $id = absint($_GET['id'] ?? 0);
        check_admin_referer('nm_download_cv_' . $id);
        $post = get_post($id);
        if (! $post || $post->post_type !== self::POST_TYPE || $post->post_status !== 'private') {
            wp_die('Candidatura non disponibile.', '', ['response' => 404]);
        }
        $file = get_post_meta($id, self::FILE_META, true);
        $filePost = is_array($file) ? get_post(absint($file['id'] ?? 0)) : null;
        $bytes = $filePost && $filePost->post_type === self::FILE_TYPE && $filePost->post_status === 'private' && $filePost->post_parent === $id
            ? base64_decode($filePost->post_content, true) : false;
        if ($bytes === false) {
            wp_die('Curriculum non disponibile.', '', ['response' => 404]);
        }
        $filename = sanitize_file_name((string) ($file['name'] ?? 'curriculum'));
        $inline = ($_GET['view'] ?? '') === '1' && strtolower(pathinfo($filename, PATHINFO_EXTENSION)) === 'pdf';
        nocache_headers();
        header('Content-Type: ' . ($inline ? 'application/pdf' : 'application/octet-stream'));
        header('X-Content-Type-Options: nosniff');
        header('Content-Disposition: ' . ($inline ? 'inline' : 'attachment') . "; filename=\"curriculum\"; filename*=UTF-8''" . rawurlencode($filename));
        header('Content-Length: ' . strlen($bytes));
        echo $bytes;
        exit;
    }
}
