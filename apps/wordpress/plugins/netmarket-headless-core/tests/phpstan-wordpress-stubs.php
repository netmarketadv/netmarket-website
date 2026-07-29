<?php

const ABSPATH = '/tmp';

class WP_Post
{
    public int $ID = 0;
    public string $post_type = '';
    public string $post_name = '';
}

class WP_REST_Request implements ArrayAccess
{
    public function get_param(string $key): mixed
    {
        return null;
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
function register_activation_hook(...$args): void {}
function register_deactivation_hook(...$args): void {}
function register_post_type(...$args): void {}
function register_taxonomy(...$args): void {}
function register_rest_route(...$args): void {}
function load_plugin_textdomain(...$args): void {}
function plugin_basename(string $file): string { return $file; }
function deactivate_plugins(string $plugin): void {}
function wp_die(string $message): never { exit($message); }
function flush_rewrite_rules(): void {}
function esc_html__(string $text, string $domain = ''): string { return $text; }
function __(string $text, string $domain = ''): string { return $text; }
function esc_html(string $text): string { return $text; }
function esc_attr(string $text): string { return $text; }
function esc_textarea(string $text): string { return $text; }
function esc_url_raw(string $text): string { return $text; }
function sanitize_text_field(string $text): string { return $text; }
function sanitize_textarea_field(string $text): string { return $text; }
function sanitize_email(string $text): string { return $text; }
function sanitize_key(string $text): string { return $text; }
function sanitize_title(string $text): string { return $text; }
function wp_kses_post(string $text): string { return $text; }
function wp_unslash(mixed $value): mixed { return $value; }
function wp_nonce_field(string $action, string $name): void {}
function wp_verify_nonce(string $nonce, string $action): bool { return true; }
function current_user_can(string $capability, mixed ...$args): bool { return true; }
function get_post_meta(int $postId, string $key, bool $single = false): mixed { return ''; }
function update_post_meta(int $postId, string $key, mixed $value): int|bool { return true; }
function wp_json_encode(mixed $value): string|false { return json_encode($value); }
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
