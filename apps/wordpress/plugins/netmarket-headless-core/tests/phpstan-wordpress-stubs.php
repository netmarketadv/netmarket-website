<?php

const ABSPATH = '/tmp';
const MINUTE_IN_SECONDS = 60;

class WP_Post
{
    public int $ID = 0;
    public string $post_type = '';
    public string $post_name = '';
    public string $post_content = '';
}

class WP_Term
{
    public int $term_id = 0;
    public string $slug = '';
    public string $name = '';
}

class WP_Screen
{
    public string $post_type = '';
}

class WP_REST_Request implements ArrayAccess
{
    public function get_param(string $key): mixed
    {
        return null;
    }

    public function get_json_params(): mixed
    {
        return [];
    }

    public function offsetExists(mixed $offset): bool
    {
        return true;
    }

    public function offsetGet(mixed $offset): mixed
    {
        return '';
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
    }

    public function offsetUnset(mixed $offset): void
    {
    }
}

class WP_REST_Response
{
    public function __construct(mixed $data = null, int $status = 200)
    {
    }

    public function header(string $key, string $value): void
    {
    }
}

class WP_Query
{
    /** @var WP_Post[] */
    public array $posts = [];
    public int $found_posts = 0;
    public int $max_num_pages = 0;

    /** @param array<string, mixed> $args */
    public function __construct(array $args)
    {
    }
}

function add_action(...$args): void {}
function add_meta_box(...$args): void {}
function wp_enqueue_media(...$args): void {}
function wp_enqueue_style(...$args): void {}
function wp_enqueue_script(...$args): void {}
function wp_localize_script(...$args): void {}
function register_activation_hook(...$args): void {}
function register_deactivation_hook(...$args): void {}
function register_post_type(...$args): void {}
function register_taxonomy(...$args): void {}
function register_rest_route(...$args): void {}
function load_plugin_textdomain(...$args): void {}
function plugin_basename(string $file): string { return $file; }
function plugins_url(string $path = '', string $plugin = ''): string { return $path; }
function rest_url(string $path = ''): string { return $path; }
function wp_create_nonce(string $action = ''): string { return 'nonce'; }
function deactivate_plugins(string $plugin): void {}
function wp_die(string $message): never { exit($message); }
function flush_rewrite_rules(): void {}
function apply_filters(string $hookName, mixed $value, mixed ...$args): mixed { return $value; }
function esc_html__(string $text, string $domain = ''): string { return $text; }
function __(string $text, string $domain = ''): string { return $text; }
function esc_html(string $text): string { return $text; }
function esc_attr(string $text): string { return $text; }
function esc_attr__(string $text, string $domain = ''): string { return $text; }
function esc_textarea(string $text): string { return $text; }
function esc_url_raw(string $text): string { return $text; }
function sanitize_text_field(string $text): string { return $text; }
function sanitize_textarea_field(string $text): string { return $text; }
function sanitize_email(string $text): string { return $text; }
function sanitize_key(string $text): string { return $text; }
function sanitize_title(string $text): string { return $text; }
function wp_kses_post(string $text): string { return $text; }
function wp_unslash(mixed $value): mixed { return $value; }
function is_email(string $email): string|false { return $email; }
function wp_nonce_field(string $action, string $name): void {}
function wp_verify_nonce(string $nonce, string $action): bool { return true; }
function current_user_can(string $capability, mixed ...$args): bool { return true; }
function get_post_meta(int $postId, string $key, bool $single = false): mixed { return ''; }
function get_option(string $option, mixed $defaultValue = false): mixed { return $defaultValue; }
function get_transient(string $transient): mixed { return false; }
function set_transient(string $transient, mixed $value, int $expiration = 0): bool { return true; }
function update_post_meta(int $postId, string $key, mixed $value): int|bool { return true; }
function delete_post_meta(int $postId, string $metaKey): bool { return true; }
function add_post_meta(int $postId, string $metaKey, mixed $metaValue, bool $unique = false): int|false { return 1; }
function wp_json_encode(mixed $value, int $flags = 0, int $depth = 512): string|false { return json_encode($value, $flags, $depth); }
function wp_mail(string|array $to, string $subject, string $message, string|array $headers = '', string|array $attachments = []): bool { return true; }
function checked(mixed $checked, mixed $current = true, bool $display = true): string { return ''; }
function selected(mixed $selected, mixed $current = true, bool $display = true): string { return ''; }
function absint(mixed $value): int { return abs((int) $value); }
function get_bloginfo(string $show = ''): string { return 'Netmarket'; }
function wp_get_environment_type(): string { return 'local'; }
function get_terms(array $args = []): array { return []; }
function is_wp_error(mixed $thing): bool { return false; }
function get_posts(array $args = []): array { return []; }
function get_the_title(WP_Post $post): string { return ''; }
function get_the_excerpt(WP_Post $post): string { return ''; }
function get_post_time(string $format = 'U', bool $gmt = false, WP_Post|int|null $post = null, bool $translate = false): string|int|false { return ''; }
function get_post_modified_time(string $format = 'U', bool $gmt = false, WP_Post|int|null $post = null, bool $translate = false): string|int|false { return ''; }
function get_post_type(int $postId): string|false { return 'post'; }
function get_post_status(int $postId): string|false { return 'publish'; }
function get_post_thumbnail_id(int $postId): int { return 0; }
function wp_get_attachment_url(int $attachmentId): string|false { return ''; }
function wp_get_attachment_metadata(int $attachmentId): array|false { return false; }
function get_post_mime_type(int $attachmentId): string|false { return false; }
function wp_get_attachment_image_srcset(int $attachmentId): string|false { return false; }
function wp_get_attachment_image_sizes(int $attachmentId): string|false { return false; }
function wp_get_attachment_image(int $attachmentId, string|array $size = 'thumbnail'): string { return ''; }
function get_the_terms(int $postId, string $taxonomy): array|false { return []; }
function get_the_category(int $postId = 0): array { return []; }
function wp_strip_all_tags(string $text, bool $removeBreaks = false): string { return $text; }
function get_current_screen(): WP_Screen|null { return null; }
function post_type_supports(string $postType, string $feature): bool { return true; }
