<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\ContentTypes;

use Netmarket\HeadlessCore\Fields\FieldDefinition;

final class Registry
{
    /** @return ContentTypeDefinition[] */
    public function definitions(): array
    {
        $seo = [
            new FieldDefinition('seo_title', 'Titolo SEO', 'text', 'Titolo massimo consigliato 70 caratteri.'),
            new FieldDefinition('meta_description', 'Meta description', 'textarea', 'Descrizione massimo consigliato 170 caratteri.'),
            new FieldDefinition('canonical_override', 'Canonical override', 'url', 'URL canonico alternativo, se necessario.'),
            new FieldDefinition('noindex', 'Noindex', 'boolean', 'Esclude il contenuto dagli indici quando esposto al frontend.'),
        ];

        return [
            new ContentTypeDefinition('nm_service', 'Servizio', 'Servizi', $this->baseArgs('dashicons-megaphone', 'servizi'), [
                new FieldDefinition('subtitle', 'Sottotitolo', 'text'),
                new FieldDefinition('short_description', 'Descrizione breve', 'textarea'),
                new FieldDefinition('priority', 'Priorità', 'integer'),
                new FieldDefinition('featured', 'Servizio in evidenza', 'boolean'),
                new FieldDefinition('cta_label', 'CTA label', 'text'),
                new FieldDefinition('cta_url', 'CTA URL', 'url'),
                new FieldDefinition('related_services', 'Servizi correlati', 'multiselect'),
                new FieldDefinition('related_case_studies', 'Casi studio correlati', 'multiselect'),
                ...$seo,
            ]),
            new ContentTypeDefinition('nm_case_study', 'Caso studio', 'Casi studio', $this->baseArgs('dashicons-portfolio', 'casi-studio'), [
                new FieldDefinition('public_client_name', 'Nome cliente pubblico', 'text'),
                new FieldDefinition('short_description', 'Descrizione breve', 'textarea'),
                new FieldDefinition('project_year', 'Anno progetto', 'integer'),
                new FieldDefinition('project_url', 'URL progetto', 'url'),
                new FieldDefinition('numeric_results', 'Risultati numerici', 'repeater', 'JSON normalizzato: label e value per riga.'),
                new FieldDefinition('applied_services', 'Servizi applicati', 'multiselect'),
                new FieldDefinition('applied_technologies', 'Tecnologie applicate', 'multiselect'),
                new FieldDefinition('cta_label', 'CTA label', 'text'),
                new FieldDefinition('cta_url', 'CTA URL', 'url'),
                ...$seo,
            ]),
            new ContentTypeDefinition('nm_landing', 'Landing page', 'Landing page', $this->baseArgs('dashicons-welcome-widgets-menus', 'landing'), [
                new FieldDefinition('campaign_id', 'Identificativo campagna', 'text', '', true),
                new FieldDefinition('short_description', 'Descrizione breve', 'textarea'),
                new FieldDefinition('primary_cta_label', 'CTA principale label', 'text'),
                new FieldDefinition('primary_cta_url', 'CTA principale URL', 'url'),
                new FieldDefinition('form_type', 'Tipo form', 'select', '', false, 'none', ['choices' => ['none' => 'Nessuno', 'contact' => 'Contatto', 'download' => 'Download']]),
                new FieldDefinition('thank_you_url', 'Thank-you URL', 'url'),
                ...$seo,
            ]),
            new ContentTypeDefinition('nm_testimonial', 'Testimonianza', 'Testimonianze', $this->baseArgs('dashicons-format-quote', 'testimonianze'), [], false),
            new ContentTypeDefinition('nm_resource', 'Risorsa', 'Risorse', $this->baseArgs('dashicons-media-document', 'risorse'), [], false),
        ];
    }

    public function register(): void
    {
        foreach ($this->definitions() as $definition) {
            if (! $definition->enabled) {
                continue;
            }
            register_post_type($definition->key(), array_merge($definition->args, ['labels' => $definition->labels()]));
        }
    }

    public function get(string $postType): ?ContentTypeDefinition
    {
        foreach ($this->definitions() as $definition) {
            if ($definition->key() === $postType) {
                return $definition;
            }
        }
        return null;
    }

    /** @return array<string, mixed> */
    private function baseArgs(string $icon, string $slug): array
    {
        return [
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_rest' => true,
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'rewrite' => ['slug' => 'nm/' . $slug, 'with_front' => false],
            'has_archive' => false,
            'menu_position' => 24,
            'menu_icon' => $icon,
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'delete_with_user' => false,
            'template_lock' => false,
        ];
    }
}
