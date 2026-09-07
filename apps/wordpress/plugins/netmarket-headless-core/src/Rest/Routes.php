<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Rest;

use Netmarket\HeadlessCore\Content\Media;
use Netmarket\HeadlessCore\Content\Relations;
use Netmarket\HeadlessCore\Taxonomies\Registry as TaxonomyRegistry;
use WP_REST_Request;
use WP_REST_Response;

final class Routes
{
    public const NAMESPACE = 'netmarket/v1';
    private const CONTACT_TO_EMAIL = 'segreteria@netmarket.it';
    private const CONTACT_CC_EMAIL = 'enrico@netmarket.it';
    private const CONTACT_FROM_EMAIL = 'segreteria@netmarket.it';
    private const CONTACT_FROM_NAME = 'Netmarket';

    public function __construct(private readonly TaxonomyRegistry $taxonomies)
    {
    }

    public function register(): void
    {
        register_rest_route(self::NAMESPACE, '/health', ['methods' => 'GET', 'callback' => [$this, 'health'], 'permission_callback' => '__return_true']);
        register_rest_route(self::NAMESPACE, '/settings', ['methods' => 'GET', 'callback' => [$this, 'settings'], 'permission_callback' => '__return_true']);
        register_rest_route(self::NAMESPACE, '/taxonomies', ['methods' => 'GET', 'callback' => [$this, 'taxonomies'], 'permission_callback' => '__return_true']);
        register_rest_route(self::NAMESPACE, '/forms/contact', ['methods' => 'POST', 'callback' => [$this, 'contactForm'], 'permission_callback' => '__return_true']);
        register_rest_route(self::NAMESPACE, '/admin/relation-search', ['methods' => 'GET', 'callback' => [$this, 'relationSearch'], 'permission_callback' => fn (): bool => current_user_can('edit_posts'), 'args' => ['search' => ['type' => 'string', 'required' => true], 'types' => ['type' => 'string', 'required' => true]]]);

        foreach ($this->routes() as $route => $postType) {
            register_rest_route(self::NAMESPACE, '/' . $route, ['methods' => 'GET', 'callback' => fn (WP_REST_Request $request) => $this->collection($request, $postType), 'permission_callback' => '__return_true', 'args' => $this->collectionArgs()]);
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
        return $this->json([
            'siteName' => get_bloginfo('name'),
            'payoff' => 'Comunichiamo valore.',
            'locale' => 'it-IT',
            'environment' => wp_get_environment_type(),
            'company' => [
                'brandName' => 'Netmarket',
                'legalName' => 'Netmarket Srl',
                'vatId' => '03618730281',
            ],
            'contact' => [
                'address' => 'Viale della Navigazione Interna, 51/b, 35129, Padova (PD)',
            ],
            'social' => [],
        ]);
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

    public function contactForm(WP_REST_Request $request): WP_REST_Response
    {
        $requestId = function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : uniqid('nmhc_', true);
        $payload = $request->get_json_params();
        if (! is_array($payload)) {
            $this->logContactEvent($requestId, 'invalid_payload');
            return new WP_REST_Response(['code' => 'invalid_payload', 'message' => 'Richiesta non valida.'], 400);
        }

        $name = sanitize_text_field((string) ($payload['name'] ?? ''));
        $company = sanitize_text_field((string) ($payload['company'] ?? ''));
        $email = sanitize_email((string) ($payload['email'] ?? ''));
        $phone = sanitize_text_field((string) ($payload['phone'] ?? ''));
        $service = sanitize_text_field((string) ($payload['service'] ?? ''));
        $message = sanitize_textarea_field((string) ($payload['message'] ?? ''));
        $website = sanitize_text_field((string) ($payload['website'] ?? ''));
        $privacy = (bool) ($payload['privacyConsent'] ?? false);
        $marketing = (bool) ($payload['marketingConsent'] ?? false);
        $sourceUrl = esc_url_raw((string) ($payload['sourceUrl'] ?? ''));
        $referrer = esc_url_raw((string) ($payload['referrer'] ?? ''));
        $utm = is_array($payload['utm'] ?? null) ? $payload['utm'] : [];
        $elapsedMs = isset($payload['elapsedMs']) ? (int) $payload['elapsedMs'] : 0;

        $errors = [];
        if ($website !== '') {
            $errors['website'] = 'bot_detected';
        }
        if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
            $errors['name'] = 'invalid_name';
        }
        if ($email === '' || ! is_email($email)) {
            $errors['email'] = 'invalid_email';
        }
        if (mb_strlen($company) > 120) {
            $errors['company'] = 'invalid_company';
        }
        if (mb_strlen($phone) > 40) {
            $errors['phone'] = 'invalid_phone';
        }
        if ($service !== '' && ! preg_match('/^[a-z0-9-]{1,120}$/', $service)) {
            $errors['service'] = 'invalid_service';
        }
        if (mb_strlen($message) < 10 || mb_strlen($message) > 3000) {
            $errors['message'] = 'invalid_message';
        }
        if ($sourceUrl === '' || mb_strlen($sourceUrl) > 500) {
            $errors['sourceUrl'] = 'invalid_source';
        }
        if ($referrer !== '' && mb_strlen($referrer) > 500) {
            $errors['referrer'] = 'invalid_referrer';
        }
        if ($elapsedMs > 0 && $elapsedMs < 1800) {
            $errors['website'] = 'too_fast';
        }
        if (! $privacy) {
            $errors['privacyConsent'] = 'privacy_required';
        }
        if ($this->looksLikeSpam($message . ' ' . $name . ' ' . $company)) {
            $errors['message'] = 'spam_pattern';
        }
        if ($errors !== []) {
            $this->logContactEvent($requestId, 'validation_failed');
            return new WP_REST_Response(['code' => 'validation_failed', 'message' => 'Controlla i campi evidenziati.', 'fields' => $errors], 422);
        }

        $ip = $this->requestIp();
        $rateKey = 'nmhc_contact_' . md5($ip . '|' . strtolower($email));
        $attempts = (int) get_transient($rateKey);
        if ($attempts >= 3) {
            $this->logContactEvent($requestId, 'rate_limited');
            return new WP_REST_Response(['code' => 'rate_limited', 'message' => 'Troppe richieste ravvicinate.'], 429);
        }
        set_transient($rateKey, $attempts + 1, 10 * MINUTE_IN_SECONDS);

        $recipient = $this->contactToEmail();
        $cc = $this->contactCcEmail();
        $from = $this->contactFromEmail();
        $subject = sprintf('Nuova richiesta dal sito Netmarket - %s', $this->sanitizeHeaderValue($name));
        $body = $this->contactEmailBody([
            'Nome' => $name,
            'Email' => $email,
            'Azienda' => $company,
            'Telefono' => $phone,
            'Servizio' => $service,
            'Marketing' => $marketing ? 'si' : 'no',
            'Pagina di provenienza' => $sourceUrl,
            'Referrer' => $referrer,
            'UTM' => $this->sanitizeStringMap($utm),
            'Data/ora' => gmdate('c'),
            'Request ID' => $requestId,
            'Messaggio' => $message,
        ]);
        $headers = [
            'Content-Type: text/plain; charset=UTF-8',
            'From: ' . self::CONTACT_FROM_NAME . ' <' . $from . '>',
            'Reply-To: ' . $this->sanitizeHeaderValue($name) . ' <' . $email . '>',
        ];
        if ($cc !== '') {
            $headers[] = 'Cc: ' . $cc;
        }

        $sent = wp_mail($recipient, $subject, $body, $headers);
        if (! $sent) {
            $this->logContactEvent($requestId, 'mail_failed');
            return new WP_REST_Response(['code' => 'mail_failed', 'message' => 'Invio non disponibile. Riprova più tardi.'], 500);
        }

        $this->logContactEvent($requestId, 'sent');
        return $this->json(['success' => true]);
    }

    public function collection(WP_REST_Request $request, string $postType): WP_REST_Response
    {
        $page = max(1, (int) $request->get_param('page'));
        $perPageParam = $request->get_param('per_page') ?? $request->get_param('perPage');
        $perPage = min(50, max(1, (int) ($perPageParam ?: 10)));
        $query = new \WP_Query(array_merge([
            'post_type' => $postType,
            'post_status' => 'publish',
            'paged' => $page,
            'posts_per_page' => $perPage,
            'no_found_rows' => false,
        ], $this->queryFilters($request, $postType)));
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
        $base = [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'title' => get_the_title($post),
            'excerpt' => get_the_excerpt($post),
            'image' => Media::featured($post->ID),
            'sectors' => $this->terms($post->ID, 'nm_sector'),
            'capabilities' => $this->terms($post->ID, 'nm_capability'),
            'technologies' => $this->terms($post->ID, 'nm_technology'),
            'seo' => $this->seo($post->ID, get_the_title($post), get_the_excerpt($post)),
        ];

        return match ($post->post_type) {
            'nm_service' => array_merge($base, $this->servicePayload($post)),
            'nm_case_study' => array_merge($base, $this->caseStudyPayload($post)),
            'nm_client' => array_merge($base, $this->clientPayload($post)),
            'nm_person' => array_merge($base, $this->personPayload($post)),
            'nm_resource' => array_merge($base, $this->resourcePayload($post)),
            'nm_testimonial' => array_merge($base, $this->testimonialPayload($post)),
            'nm_landing' => array_merge($base, $this->landingPayload($post)),
            'post' => array_merge($base, $this->insightPayload($post)),
            default => $base,
        };
    }

    /** @return array<string, mixed> */
    private function collectionArgs(): array
    {
        return [
            'page' => ['type' => 'integer', 'default' => 1],
            'per_page' => ['type' => 'integer', 'default' => 10, 'maximum' => 50],
            'perPage' => ['type' => 'integer', 'default' => 10, 'maximum' => 50],
            'featured' => ['type' => 'boolean'],
            'service' => ['type' => 'string'],
            'sector' => ['type' => 'string'],
            'technology' => ['type' => 'string'],
            'client' => ['type' => 'string'],
            'author' => ['type' => 'string'],
            'sort' => ['type' => 'string', 'enum' => ['date', 'priority', 'title']],
        ];
    }

    /** @return array<string, string> */
    private function routes(): array
    {
        return [
            'services' => 'nm_service',
            'case-studies' => 'nm_case_study',
            'clients' => 'nm_client',
            'people' => 'nm_person',
            'insights' => 'post',
            'resources' => 'nm_resource',
            'testimonials' => 'nm_testimonial',
        ];
    }

    /** @return array<string, mixed> */
    private function queryFilters(WP_REST_Request $request, string $postType): array
    {
        $args = [];
        $metaQuery = [];
        $taxQuery = [];
        if ($request->get_param('featured') !== null) {
            $metaQuery[] = ['key' => 'nmhc_featured', 'value' => (bool) $request->get_param('featured') ? '1' : ''];
        }
        foreach (['sector' => 'nm_sector', 'technology' => 'nm_technology'] as $param => $taxonomy) {
            $slug = sanitize_title((string) $request->get_param($param));
            if ($slug !== '') {
                $taxQuery[] = ['taxonomy' => $taxonomy, 'field' => 'slug', 'terms' => [$slug]];
            }
        }
        if ($postType === 'nm_case_study') {
            $this->relationFilter($request, $metaQuery, 'service', 'nmhc_services', 'nm_service');
            $this->relationFilter($request, $metaQuery, 'client', 'nmhc_client', 'nm_client');
        }
        if ($postType === 'post') {
            $this->relationFilter($request, $metaQuery, 'service', 'nmhc_related_services', 'nm_service');
            $this->relationFilter($request, $metaQuery, 'author', 'nmhc_author_person', 'nm_person');
        }
        if ($metaQuery !== []) {
            $args['meta_query'] = $metaQuery;
        }
        if ($taxQuery !== []) {
            $args['tax_query'] = $taxQuery;
        }
        $sort = (string) ($request->get_param('sort') ?: 'date');
        if ($sort === 'priority') {
            $args['meta_key'] = 'nmhc_priority';
            $args['orderby'] = ['meta_value_num' => 'ASC', 'date' => 'DESC'];
        } elseif ($sort === 'title') {
            $args['orderby'] = 'title';
            $args['order'] = 'ASC';
        }
        return $args;
    }

    /** @param array<int, array<string, mixed>> $metaQuery */
    private function relationFilter(WP_REST_Request $request, array &$metaQuery, string $param, string $metaKey, string $postType): void
    {
        $slug = sanitize_title((string) $request->get_param($param));
        if ($slug === '') {
            return;
        }
        $posts = get_posts(['name' => $slug, 'post_type' => $postType, 'post_status' => 'publish', 'numberposts' => 1]);
        if ($posts !== []) {
            $metaQuery[] = ['key' => $metaKey, 'value' => (string) $posts[0]->ID, 'compare' => '='];
        }
    }

    public function relationSearch(WP_REST_Request $request): WP_REST_Response
    {
        $types = array_values(array_filter(array_map('sanitize_key', explode(',', (string) $request->get_param('types')))));
        $search = sanitize_text_field((string) $request->get_param('search'));
        $posts = get_posts(['s' => $search, 'post_type' => $types ?: ['post'], 'post_status' => ['publish', 'draft', 'private'], 'numberposts' => 12]);
        return $this->json(array_map(static fn (\WP_Post $post): array => ['id' => $post->ID, 'title' => get_the_title($post), 'type' => $post->post_type], $posts));
    }

    /** @return array<string, mixed> */
    private function servicePayload(\WP_Post $post): array
    {
        return [
            'subtitle' => $this->metaString($post->ID, 'subtitle'),
            'shortDescription' => $this->metaString($post->ID, 'short_description'),
            'hero' => ['image' => Media::asset($this->metaInt($post->ID, 'hero_image'))],
            'valueProps' => $this->metaArray($post->ID, 'value_props'),
            'problems' => $this->metaArray($post->ID, 'problems'),
            'process' => $this->metaArray($post->ID, 'process'),
            'results' => $this->metaArray($post->ID, 'results'),
            'faq' => $this->metaArray($post->ID, 'faq'),
            'priority' => $this->metaInt($post->ID, 'priority'),
            'featured' => $this->metaBool($post->ID, 'featured'),
            'cta' => $this->link($post->ID, 'cta_label', 'cta_url'),
            'relatedServices' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_related_services'), ['nm_service']),
            'relatedCaseStudies' => $this->reverseSummaries('nm_case_study', 'nmhc_services', $post->ID),
        ];
    }

    /** @return array<string, mixed> */
    private function caseStudyPayload(\WP_Post $post): array
    {
        $clientId = $this->metaInt($post->ID, 'client');
        return [
            'client' => $clientId > 0 ? Relations::summaries([$clientId], ['nm_client'])[0] ?? null : null,
            'publicClientName' => $this->metaString($post->ID, 'public_client_name'),
            'shortDescription' => $this->metaString($post->ID, 'short_description'),
            'cover' => Media::asset($this->metaInt($post->ID, 'cover_image')),
            'projectYear' => $this->metaInt($post->ID, 'project_year'),
            'projectStatus' => $this->metaString($post->ID, 'project_status') ?: 'published',
            'projectUrl' => $this->metaString($post->ID, 'project_url'),
            'context' => $this->metaString($post->ID, 'context'),
            'challenge' => $this->metaString($post->ID, 'challenge'),
            'objectives' => $this->metaArray($post->ID, 'objectives'),
            'approach' => $this->metaString($post->ID, 'approach'),
            'solution' => $this->metaString($post->ID, 'solution'),
            'qualitativeResult' => $this->metaString($post->ID, 'qualitative_result'),
            'additionalContent' => $this->metaString($post->ID, 'additional_content'),
            'numericResults' => $this->metaArray($post->ID, 'numeric_results'),
            'gallery' => $this->caseStudyGallery($post->ID),
            'services' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_services'), ['nm_service']),
            'contributors' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_contributors'), ['nm_person']),
            'relatedInsights' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_related_insights'), ['post']),
            'relatedCaseStudies' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_related_case_studies'), ['nm_case_study']),
            'priority' => $this->metaInt($post->ID, 'priority'),
            'featured' => $this->metaBool($post->ID, 'featured'),
            'cta' => $this->link($post->ID, 'cta_label', 'cta_url'),
        ];
    }

    /** @return array<string, mixed> */
    private function clientPayload(\WP_Post $post): array
    {
        return [
            'brandName' => $this->metaString($post->ID, 'brand_name') ?: get_the_title($post),
            'logo' => Media::asset($this->metaInt($post->ID, 'logo')),
            'inverseLogo' => Media::asset($this->metaInt($post->ID, 'inverse_logo')),
            'officialSite' => $this->metaString($post->ID, 'official_site'),
            'shortDescription' => $this->metaString($post->ID, 'short_description'),
            'visualScale' => $this->metaFloat($post->ID, 'visual_scale') ?: 1,
            'showInMarquee' => $this->metaBool($post->ID, 'show_in_marquee'),
            'priority' => $this->metaInt($post->ID, 'priority'),
        ];
    }

    /** @return array<string, mixed> */
    private function personPayload(\WP_Post $post): array
    {
        $fullName = $this->metaString($post->ID, 'full_name') ?: get_the_title($post);
        return [
            'fullName' => $fullName,
            'displayName' => $this->metaString($post->ID, 'display_name') ?: $fullName,
            'givenName' => $this->metaString($post->ID, 'given_name'),
            'familyName' => $this->metaString($post->ID, 'family_name'),
            'role' => $this->metaString($post->ID, 'role'),
            'photo' => Media::asset($this->metaInt($post->ID, 'photo'), $this->metaString($post->ID, 'focal_point')),
            'linkedin' => $this->metaString($post->ID, 'linkedin'),
            'shortBio' => $this->metaString($post->ID, 'short_bio'),
            'expertise' => $this->metaArray($post->ID, 'expertise'),
            'priority' => $this->metaInt($post->ID, 'priority'),
            'visibleInTeam' => $this->metaBool($post->ID, 'visible_in_team'),
            'linkedWpUser' => $this->metaInt($post->ID, 'linked_wp_user'),
        ];
    }

    /** @return array<string, mixed> */
    private function resourcePayload(\WP_Post $post): array
    {
        return [
            'description' => $this->metaString($post->ID, 'description'),
            'cover' => Media::asset($this->metaInt($post->ID, 'cover')),
            'resourceType' => $this->metaString($post->ID, 'resource_type') ?: 'guide',
            'file' => Media::asset($this->metaInt($post->ID, 'file')),
            'accessType' => $this->metaString($post->ID, 'access_type') ?: 'free',
            'cta' => $this->link($post->ID, 'cta_label', 'cta_url'),
            'relatedServices' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_related_services'), ['nm_service']),
            'relatedPosts' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_related_posts'), ['post']),
            'authorPerson' => Relations::summaries([$this->metaInt($post->ID, 'author_person')], ['nm_person'])[0] ?? null,
            'priority' => $this->metaInt($post->ID, 'priority'),
            'featured' => $this->metaBool($post->ID, 'featured'),
        ];
    }

    /** @return array<string, mixed> */
    private function testimonialPayload(\WP_Post $post): array
    {
        return [
            'quote' => $this->metaString($post->ID, 'quote'),
            'authorName' => $this->metaString($post->ID, 'author_name'),
            'authorRole' => $this->metaString($post->ID, 'author_role'),
            'client' => Relations::summaries([$this->metaInt($post->ID, 'client')], ['nm_client'])[0] ?? null,
            'source' => $this->metaString($post->ID, 'source'),
            'sourceUrl' => $this->metaString($post->ID, 'source_url'),
            'rating' => $this->metaFloat($post->ID, 'rating'),
            'priority' => $this->metaInt($post->ID, 'priority'),
            'featured' => $this->metaBool($post->ID, 'featured'),
            'caseStudy' => Relations::summaries([$this->metaInt($post->ID, 'case_study')], ['nm_case_study'])[0] ?? null,
            'service' => Relations::summaries([$this->metaInt($post->ID, 'service')], ['nm_service'])[0] ?? null,
        ];
    }

    /** @return array<string, mixed> */
    private function landingPayload(\WP_Post $post): array
    {
        return [
            'campaignId' => $this->metaString($post->ID, 'campaign_id'),
            'templateVariant' => $this->metaString($post->ID, 'template_variant') ?: 'lead-generation',
            'shortDescription' => $this->metaString($post->ID, 'short_description'),
            'hero' => $this->metaArray($post->ID, 'hero'),
            'valueProposition' => $this->metaArray($post->ID, 'value_proposition'),
            'proof' => $this->metaArray($post->ID, 'proof'),
            'service' => Relations::summaries([$this->metaInt($post->ID, 'service')], ['nm_service'])[0] ?? null,
            'caseStudy' => Relations::summaries([$this->metaInt($post->ID, 'case_study')], ['nm_case_study'])[0] ?? null,
            'testimonial' => Relations::summaries([$this->metaInt($post->ID, 'testimonial')], ['nm_testimonial'])[0] ?? null,
            'primaryCta' => $this->link($post->ID, 'primary_cta_label', 'primary_cta_url'),
            'formType' => $this->metaString($post->ID, 'form_type') ?: 'none',
            'formConfig' => $this->metaArray($post->ID, 'form_config'),
            'thankYouUrl' => $this->metaString($post->ID, 'thank_you_url'),
            'trackingMetadata' => $this->metaArray($post->ID, 'tracking_metadata'),
        ];
    }

    /** @return array<string, mixed> */
    private function insightPayload(\WP_Post $post): array
    {
        return [
            'content' => apply_filters('the_content', $post->post_content),
            'subtitle' => $this->metaString($post->ID, 'subtitle'),
            'authorPerson' => Relations::summaries([$this->metaInt($post->ID, 'author_person')], ['nm_person'])[0] ?? null,
            'publishedAt' => get_post_time(DATE_ATOM, true, $post),
            'modifiedAt' => get_post_modified_time(DATE_ATOM, true, $post),
            'categories' => array_map(static fn (\WP_Term $term): array => ['id' => $term->term_id, 'slug' => $term->slug, 'name' => $term->name], get_the_category($post->ID)),
            'readingTime' => $this->readingTime($post),
            'featured' => $this->metaBool($post->ID, 'featured'),
            'priority' => $this->metaInt($post->ID, 'priority'),
            'relatedServices' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_related_services'), ['nm_service']),
            'relatedCaseStudies' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_related_case_studies'), ['nm_case_study']),
            'relatedResources' => Relations::summaries(Relations::getMany($post->ID, 'nmhc_related_resources'), ['nm_resource']),
        ];
    }

    /** @return array<int, array{id:int,slug:string,name:string,taxonomy:string}> */
    private function terms(int $postId, string $taxonomy): array
    {
        $terms = get_the_terms($postId, $taxonomy);
        if (! is_array($terms)) {
            return [];
        }
        return array_map(static fn (\WP_Term $term): array => ['id' => $term->term_id, 'slug' => $term->slug, 'name' => $term->name, 'taxonomy' => $taxonomy], $terms);
    }

    /** @return array<string, mixed> */
    private function seo(int $postId, string $title, string $excerpt): array
    {
        return [
            'title' => $this->metaString($postId, 'seo_title') ?: $title,
            'description' => $this->metaString($postId, 'meta_description') ?: $excerpt,
            'canonical' => $this->metaString($postId, 'canonical_override'),
            'noindex' => $this->metaBool($postId, 'noindex'),
            'socialTitle' => $this->metaString($postId, 'social_title'),
            'socialDescription' => $this->metaString($postId, 'social_description'),
            'socialImage' => Media::asset($this->metaInt($postId, 'social_image')),
        ];
    }

    /** @return array<int, array<string,mixed>> */
    private function reverseSummaries(string $postType, string $metaKey, int $targetId): array
    {
        $posts = get_posts(['post_type' => $postType, 'post_status' => 'publish', 'meta_key' => $metaKey, 'meta_value' => (string) $targetId, 'numberposts' => 6]);
        return array_map(static fn (\WP_Post $post): array => Relations::summary($post), $posts);
    }

    /** @return array{label:string,url:string}|null */
    private function link(int $postId, string $labelKey, string $urlKey): ?array
    {
        $label = $this->metaString($postId, $labelKey);
        $url = $this->metaString($postId, $urlKey);
        return $label !== '' && $url !== '' ? ['label' => $label, 'url' => $url] : null;
    }

    private function metaString(int $postId, string $key): string
    {
        return (string) get_post_meta($postId, 'nmhc_' . $key, true);
    }

    private function metaInt(int $postId, string $key): int
    {
        return absint(get_post_meta($postId, 'nmhc_' . $key, true));
    }

    private function metaFloat(int $postId, string $key): float
    {
        $value = get_post_meta($postId, 'nmhc_' . $key, true);
        return is_numeric($value) ? (float) $value : 0.0;
    }

    private function metaBool(int $postId, string $key): bool
    {
        return (bool) get_post_meta($postId, 'nmhc_' . $key, true);
    }

    /** @return array<int|string, mixed> */
    private function metaArray(int $postId, string $key): array
    {
        $value = get_post_meta($postId, 'nmhc_' . $key, true);
        return is_array($value) ? $value : [];
    }

    /** @return array<int, array<string, mixed>> */
    private function caseStudyGallery(int $postId): array
    {
        $items = $this->metaArray($postId, 'gallery');
        $gallery = [];
        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }
            $media = isset($item['media']) && is_array($item['media'])
                ? $item['media']
                : Media::asset(absint($item['mediaId'] ?? 0));
            if (! is_array($media)) {
                continue;
            }
            $layoutHint = sanitize_key((string) ($item['layoutHint'] ?? 'wide'));
            if (! in_array($layoutHint, ['wide', 'portrait', 'square', 'split', 'device', 'detail'], true)) {
                $layoutHint = 'wide';
            }
            $gallery[] = [
                'media' => $media,
                'alt' => sanitize_text_field((string) ($item['alt'] ?? $media['alt'] ?? '')),
                'caption' => sanitize_text_field((string) ($item['caption'] ?? '')),
                'aspectRatio' => sanitize_text_field((string) ($item['aspectRatio'] ?? '')),
                'layoutHint' => $layoutHint,
            ];
        }
        return $gallery;
    }

    private function readingTime(\WP_Post $post): int
    {
        $words = str_word_count(wp_strip_all_tags((string) $post->post_content));
        return max(1, (int) ceil($words / 220));
    }

    private function requestIp(): string
    {
        $forwarded = sanitize_text_field((string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''));
        $remote = sanitize_text_field((string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'));
        $candidate = trim(explode(',', $forwarded)[0] ?: $remote);
        return filter_var($candidate, FILTER_VALIDATE_IP) ? $candidate : '0.0.0.0';
    }

    private function looksLikeSpam(string $value): bool
    {
        if (preg_match_all('~https?://~i', $value) > 2) {
            return true;
        }
        return (bool) preg_match('~\[(url|link)=|<a\s|viagra|casino|crypto\s+investment~i', $value);
    }

    private function contactToEmail(): string
    {
        $email = sanitize_email((string) apply_filters('nmhc_contact_to_email', self::CONTACT_TO_EMAIL));
        return $email !== '' ? $email : self::CONTACT_TO_EMAIL;
    }

    private function contactCcEmail(): string
    {
        $email = sanitize_email((string) apply_filters('nmhc_contact_cc_email', self::CONTACT_CC_EMAIL));
        return $email !== '' ? $email : self::CONTACT_CC_EMAIL;
    }

    private function contactFromEmail(): string
    {
        $from = sanitize_email((string) apply_filters('nmhc_contact_from_email', self::CONTACT_FROM_EMAIL));
        return $from !== '' ? $from : self::CONTACT_TO_EMAIL;
    }

    private function sanitizeHeaderValue(string $value): string
    {
        return trim(str_replace(["\r", "\n"], ' ', sanitize_text_field($value)));
    }

    /** @param array<string, mixed> $fields */
    private function contactEmailBody(array $fields): string
    {
        $lines = [];
        foreach ($fields as $label => $value) {
            if (is_array($value)) {
                if ($value === []) {
                    continue;
                }
                $value = wp_json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }
            $text = trim((string) $value);
            if ($text === '') {
                continue;
            }
            if ($label === 'Messaggio') {
                $lines[] = '';
                $lines[] = 'Messaggio:';
                $lines[] = $text;
                continue;
            }
            $lines[] = $label . ': ' . $text;
        }
        return implode("\n", $lines);
    }

    private function logContactEvent(string $requestId, string $status): void
    {
        error_log(sprintf('[netmarket contact] request_id=%s status=%s', $requestId, $status));
    }

    /** @param array<mixed> $values @return array<string, string> */
    private function sanitizeStringMap(array $values): array
    {
        $allowedKeys = [
            'utm_source' => true,
            'utm_medium' => true,
            'utm_campaign' => true,
            'utm_content' => true,
            'utm_term' => true,
            'gclid' => true,
            'fbclid' => true,
            'ttclid' => true,
            'oppref' => true,
        ];
        $sanitized = [];
        foreach ($values as $key => $value) {
            $safeKey = sanitize_key((string) $key);
            if ($safeKey === '' || ! isset($allowedKeys[$safeKey])) {
                continue;
            }
            $sanitized[$safeKey] = mb_substr(sanitize_text_field((string) $value), 0, 180);
        }
        return $sanitized;
    }

    private function json(array $data): WP_REST_Response
    {
        $response = new WP_REST_Response($data);
        $response->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        return $response;
    }
}
