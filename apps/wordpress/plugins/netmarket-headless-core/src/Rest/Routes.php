<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Rest;

use Netmarket\HeadlessCore\ContentTypes\Registry as ContentRegistry;
use Netmarket\HeadlessCore\Taxonomies\Registry as TaxonomyRegistry;
use WP_REST_Request;
use WP_REST_Response;

final class Routes
{
    public const NAMESPACE = 'netmarket/v1';

    public function __construct(private readonly ContentRegistry $content, private readonly TaxonomyRegistry $taxonomies)
    {
    }

    public function register(): void
    {
        register_rest_route(self::NAMESPACE, '/health', ['methods' => 'GET', 'callback' => [$this, 'health'], 'permission_callback' => '__return_true']);
        register_rest_route(self::NAMESPACE, '/settings', ['methods' => 'GET', 'callback' => [$this, 'settings'], 'permission_callback' => '__return_true']);
        register_rest_route(self::NAMESPACE, '/taxonomies', ['methods' => 'GET', 'callback' => [$this, 'taxonomies'], 'permission_callback' => '__return_true']);
        foreach (['services' => 'nm_service', 'case-studies' => 'nm_case_study'] as $route => $postType) {
            register_rest_route(self::NAMESPACE, '/' . $route, ['methods' => 'GET', 'callback' => fn (WP_REST_Request $request) => $this->collection($request, $postType), 'permission_callback' => '__return_true', 'args' => $this->paginationArgs()]);
            register_rest_route(self::NAMESPACE, '/' . $route . '/(?P<slug>[a-z0-9-]+)', ['methods' => 'GET', 'callback' => fn (WP_REST_Request $request) => $this->single($request, $postType), 'permission_callback' => '__return_true']);
        }
        register_rest_route(self::NAMESPACE, '/landing-pages/(?P<slug>[a-z0-9-]+)', ['methods' => 'GET', 'callback' => fn (WP_REST_Request $request) => $this->single($request, 'nm_landing'), 'permission_callback' => '__return_true']);
    }

    public function health(): WP_REST_Response
    {
        return $this->json([
            'status' => 'ok',
            'plugin' => 'netmarket-headless-core',
            'version' => \Netmarket\HeadlessCore\NMHC_VERSION,
        ]);
    }

    public function settings(): WP_REST_Response
    {
        return $this->json(['siteName' => get_bloginfo('name'), 'payoff' => 'Comunichiamo valore.', 'locale' => 'it-IT', 'environment' => wp_get_environment_type()]);
    }

    public function taxonomies(): WP_REST_Response
    {
        $items = [];
        foreach ($this->taxonomies->definitions() as $taxonomy) {
            $terms = get_terms(['taxonomy' => $taxonomy->key, 'hide_empty' => false]);
            if (is_wp_error($terms)) {
                continue;
            }
            foreach ($terms as $term) {
                $items[] = ['id' => $term->term_id, 'slug' => $term->slug, 'name' => $term->name, 'taxonomy' => $taxonomy->key];
            }
        }
        return $this->json($items);
    }

    public function collection(WP_REST_Request $request, string $postType): WP_REST_Response
    {
        $page = max(1, (int) $request->get_param('page'));
        $perPage = min(50, max(1, (int) $request->get_param('per_page')));
        $query = new \WP_Query(['post_type' => $postType, 'post_status' => 'publish', 'paged' => $page, 'posts_per_page' => $perPage, 'no_found_rows' => false]);
        $items = array_map(fn (\WP_Post $post): array => $this->serializePost($post), $query->posts);
        return $this->json(['data' => $items, 'pagination' => ['page' => $page, 'perPage' => $perPage, 'total' => (int) $query->found_posts, 'totalPages' => (int) $query->max_num_pages]]);
    }

    public function single(WP_REST_Request $request, string $postType): WP_REST_Response
    {
        $posts = get_posts(['name' => sanitize_title((string) $request['slug']), 'post_type' => $postType, 'post_status' => 'publish', 'numberposts' => 1]);
        if ($posts === []) {
            return new WP_REST_Response(['code' => 'not_found', 'message' => 'Contenuto non trovato.', 'status' => 404], 404);
        }
        return $this->json($this->serializePost($posts[0]));
    }

    /** @return array<string, mixed> */
    private function serializePost(\WP_Post $post): array
    {
        $definition = $this->content->get($post->post_type);
        $meta = [];
        $fields = $definition ? $definition->fields : [];
        foreach ($fields as $field) {
            $value = get_post_meta($post->ID, $field->metaKey(), true);
            $meta[$field->key] = $value === '' ? $field->default : $value;
        }
        return [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'title' => get_the_title($post),
            'excerpt' => get_the_excerpt($post),
            'meta' => $meta,
            'seo' => [
                'title' => $meta['seo_title'] ?? '',
                'description' => $meta['meta_description'] ?? '',
                'canonical' => $meta['canonical_override'] ?? '',
                'noindex' => (bool) ($meta['noindex'] ?? false),
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function paginationArgs(): array
    {
        return ['page' => ['type' => 'integer', 'default' => 1], 'per_page' => ['type' => 'integer', 'default' => 10, 'maximum' => 50]];
    }

    private function json(array $data): WP_REST_Response
    {
        $response = new WP_REST_Response($data);
        $response->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        return $response;
    }
}
