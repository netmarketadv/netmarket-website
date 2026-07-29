<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Admin;

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

    public function render(WP_Post $post): void
    {
        $definition = $this->registry->get($post->post_type);
        if (! $definition) {
            return;
        }
        wp_nonce_field('nmhc_save_meta', 'nmhc_nonce');
        echo '<div class="nmhc-fields">';
        foreach ($definition->fields as $field) {
            $value = get_post_meta($post->ID, $field->metaKey(), true);
            $value = $value === '' ? $field->default : $value;
            echo '<p><label for="' . esc_attr($field->metaKey()) . '"><strong>' . esc_html($field->label) . '</strong></label><br />';
            if ($field->description !== '') {
                echo '<span class="description">' . esc_html($field->description) . '</span><br />';
            }
            $this->renderField($field->metaKey(), $field->type, $value, $field->options);
            echo '</p>';
        }
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
            if (! $field->validate($value)->valid) {
                continue;
            }
            update_post_meta($postId, $field->metaKey(), $value);
        }
    }

    /** @param array<string, mixed> $options */
    private function renderField(string $name, string $type, mixed $value, array $options): void
    {
        if ($type === 'textarea' || $type === 'richtext' || $type === 'repeater') {
            echo '<textarea id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" rows="4" class="large-text">' . esc_textarea(is_array($value) ? wp_json_encode($value) : (string) $value) . '</textarea>';
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
}
