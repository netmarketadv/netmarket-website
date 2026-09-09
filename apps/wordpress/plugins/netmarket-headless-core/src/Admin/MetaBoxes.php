<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Admin;

use Netmarket\HeadlessCore\Content\Relations;
use Netmarket\HeadlessCore\ContentTypes\Registry;
use WP_Post;

final class MetaBoxes
{
    public function __construct(private readonly Registry $registry)
    {
    }

    public function register(): void
    {
        foreach ($this->registry->definitions() as $definition) {
            if (! $definition->enabled || $definition->fields === []) {
                continue;
            }
            add_meta_box(
                'nmhc_fields',
                __('Campi Netmarket', 'netmarket-headless-core'),
                [$this, 'render'],
                $definition->key(),
                'normal',
                'high'
            );
        }
    }

    public function enqueue(): void
    {
        $screen = function_exists('get_current_screen') ? get_current_screen() : null;
        if (! $screen || ! $this->registry->get($screen->post_type)) {
            return;
        }
        wp_enqueue_media();
        wp_enqueue_style(
            'nmhc-admin',
            plugins_url('assets/css/admin.css', \Netmarket\HeadlessCore\NMHC_FILE),
            [],
            \Netmarket\HeadlessCore\NMHC_VERSION
        );
        wp_enqueue_script(
            'nmhc-admin',
            plugins_url('assets/js/admin.js', \Netmarket\HeadlessCore\NMHC_FILE),
            [],
            \Netmarket\HeadlessCore\NMHC_VERSION,
            true
        );
        wp_localize_script('nmhc-admin', 'nmhcAdmin', [
            'relationEndpoint' => esc_url_raw(rest_url('netmarket/v1/admin/relation-search')),
            'nonce' => wp_create_nonce('wp_rest'),
            'chooseMedia' => __('Scegli media', 'netmarket-headless-core'),
        ]);
    }

    public function render(WP_Post $post): void
    {
        $definition = $this->registry->get($post->post_type);
        if (! $definition) {
            return;
        }
        wp_nonce_field('nmhc_save_meta', 'nmhc_nonce');
        echo '<div class="nmhc-fields">';
        foreach ($definition->fields as $field) {
            $value = $field->type === 'relation_list'
                ? Relations::getMany($post->ID, $field->metaKey())
                : get_post_meta($post->ID, $field->metaKey(), true);
            $value = $value === '' ? $field->default : $value;
            echo '<div class="nmhc-field"><label for="' . esc_attr($field->metaKey()) . '"><strong>' . esc_html($field->label) . '</strong></label>';
            if ($field->description !== '') {
                echo '<span class="description">' . esc_html($field->description) . '</span>';
            }
            $this->renderField($field->metaKey(), $field->type, $value, $field->options);
            echo '</div>';
        }
        $this->renderHealth($post);
        echo '</div>';
    }

    public function save(int $postId, WP_Post $post): void
    {
        if (! isset($_POST['nmhc_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nmhc_nonce'])), 'nmhc_save_meta')) {
            return;
        }
        $doingAutosave = defined('DOING_AUTOSAVE') ? (bool) constant('DOING_AUTOSAVE') : false;
        if ($doingAutosave) {
            return;
        }
        if (! current_user_can('edit_post', $postId)) {
            return;
        }
        $definition = $this->registry->get($post->post_type);
        if (! $definition) {
            return;
        }
        foreach ($definition->fields as $field) {
            $raw = $_POST[$field->metaKey()] ?? null;
            $value = $field->sanitize($raw);
            if ($field->type === 'relation' || $field->type === 'relation_list') {
                $targets = $this->relationTargets($field->options);
                $ids = $field->type === 'relation' ? [$value] : $value;
                $validIds = Relations::validPostIds(array_map('absint', (array) $ids), $targets, false);
                if ($field->type === 'relation_list') {
                    Relations::replaceMany($postId, $field->metaKey(), $validIds);
                    continue;
                }
                update_post_meta($postId, $field->metaKey(), $validIds[0] ?? 0);
                continue;
            }
            if (! $field->validate($value)->valid) {
                continue;
            }
            update_post_meta($postId, $field->metaKey(), $value);
        }
    }

    /** @param array<string, mixed> $options */
    private function renderField(string $name, string $type, mixed $value, array $options): void
    {
        if ($type === 'textarea' || $type === 'richtext' || $type === 'repeater' || $type === 'json') {
            $rows = $type === 'json' ? 8 : 4;
            echo '<textarea id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" rows="' . esc_attr((string) $rows) . '" class="large-text code">' . esc_textarea(is_array($value) ? (string) wp_json_encode($value) : (string) $value) . '</textarea>';
            return;
        }
        if ($type === 'media') {
            $id = absint($value);
            echo '<div class="nmhc-media" data-nmhc-media>';
            echo '<input id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" type="hidden" value="' . esc_attr((string) $id) . '" data-nmhc-media-input />';
            echo '<div class="nmhc-media__preview" data-nmhc-media-preview>';
            if ($id > 0) {
                echo wp_kses_post(wp_get_attachment_image($id, 'thumbnail'));
            }
            echo '</div>';
            echo '<button type="button" class="button" data-nmhc-media-choose>' . esc_html__('Scegli', 'netmarket-headless-core') . '</button> ';
            echo '<button type="button" class="button-link-delete" data-nmhc-media-remove>' . esc_html__('Rimuovi', 'netmarket-headless-core') . '</button>';
            echo '</div>';
            return;
        }
        if ($type === 'media_gallery') {
            $items = is_array($value) ? $value : [];
            $ids = [];
            foreach ($items as $item) {
                if (is_array($item)) {
                    $ids[] = absint($item['mediaId'] ?? $item['media']['id'] ?? 0);
                }
            }
            $ids = array_values(array_filter($ids));
            echo '<div class="nmhc-media-gallery" data-nmhc-media-gallery>';
            echo '<input id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" type="hidden" value="' . esc_attr(implode(',', $ids)) . '" data-nmhc-media-gallery-input />';
            echo '<div class="nmhc-media-gallery__items" data-nmhc-media-gallery-items>';
            foreach ($ids as $id) {
                echo '<button type="button" class="nmhc-media-gallery__item" data-id="' . esc_attr((string) $id) . '" aria-label="' . esc_attr__('Rimuovi immagine', 'netmarket-headless-core') . '">';
                echo wp_kses_post(wp_get_attachment_image($id, 'thumbnail'));
                echo '<span aria-hidden="true">×</span></button>';
            }
            echo '</div>';
            echo '<button type="button" class="button" data-nmhc-media-gallery-choose>' . esc_html__('Scegli immagini', 'netmarket-headless-core') . '</button>';
            echo '</div>';
            return;
        }
        if ($type === 'relation' || $type === 'relation_list') {
            $ids = $type === 'relation' ? [absint($value)] : array_map('absint', (array) $value);
            $targets = implode(',', $this->relationTargets($options));
            echo '<div class="nmhc-relation" data-nmhc-relation data-multiple="' . esc_attr($type === 'relation_list' ? 'true' : 'false') . '" data-targets="' . esc_attr($targets) . '">';
            echo '<input id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" type="hidden" value="' . esc_attr(implode(',', array_filter($ids))) . '" data-nmhc-relation-input />';
            echo '<div class="nmhc-relation__selected" data-nmhc-relation-selected>';
            foreach ($this->relationPosts($ids) as $post) {
                echo '<button type="button" class="nmhc-chip" data-id="' . esc_attr((string) $post->ID) . '">' . esc_html(get_the_title($post)) . '<span aria-hidden="true">×</span></button>';
            }
            echo '</div>';
            echo '<input type="search" class="regular-text" placeholder="' . esc_attr__('Cerca contenuti...', 'netmarket-headless-core') . '" data-nmhc-relation-search />';
            echo '<div class="nmhc-relation__results" data-nmhc-relation-results></div>';
            echo '</div>';
            return;
        }
        if ($type === 'boolean') {
            echo '<input id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" type="checkbox" value="1" ' . checked((bool) $value, true, false) . ' />';
            return;
        }
        if ($type === 'select') {
            echo '<select id="' . esc_attr($name) . '" name="' . esc_attr($name) . '">';
            foreach (($options['choices'] ?? []) as $choice => $label) {
                echo '<option value="' . esc_attr((string) $choice) . '" ' . selected((string) $value, (string) $choice, false) . '>' . esc_html((string) $label) . '</option>';
            }
            echo '</select>';
            return;
        }
        $inputType = in_array($type, ['url', 'email', 'date', 'datetime'], true) ? ($type === 'datetime' ? 'datetime-local' : $type) : 'text';
        echo '<input id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" type="' . esc_attr($inputType) . '" value="' . esc_attr((string) $value) . '" class="regular-text" />';
    }

    /** @param array<string, mixed> $options @return string[] */
    private function relationTargets(array $options): array
    {
        $target = $options['target'] ?? ['post'];
        return array_values(array_filter(array_map('sanitize_key', (array) $target)));
    }

    /** @param int[] $ids @return WP_Post[] */
    private function relationPosts(array $ids): array
    {
        $ids = array_values(array_filter(array_map('absint', $ids)));
        if ($ids === []) {
            return [];
        }
        return get_posts(['post__in' => $ids, 'post_type' => 'any', 'post_status' => 'any', 'orderby' => 'post__in', 'numberposts' => count($ids)]);
    }

    private function renderHealth(WP_Post $post): void
    {
        $warnings = [];
        if (get_post_meta($post->ID, 'nmhc_meta_description', true) === '') {
            $warnings[] = __('Meta description mancante.', 'netmarket-headless-core');
        }
        if (post_type_supports($post->post_type, 'thumbnail') && get_post_thumbnail_id($post->ID) <= 0) {
            $warnings[] = __('Immagine in evidenza mancante.', 'netmarket-headless-core');
        }
        echo '<div class="nmhc-health"><strong>' . esc_html__('Content Health', 'netmarket-headless-core') . '</strong>';
        if ($warnings === []) {
            echo '<p>✓ ' . esc_html__('Campi principali compilati.', 'netmarket-headless-core') . '</p>';
        } else {
            echo '<ul>';
            foreach ($warnings as $warning) {
                echo '<li>⚠ ' . esc_html($warning) . '</li>';
            }
            echo '</ul>';
        }
        echo '</div>';
    }
}
