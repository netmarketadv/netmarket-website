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
            new FieldDefinition('social_title', 'Titolo social', 'text'),
            new FieldDefinition('social_description', 'Descrizione social', 'textarea'),
            new FieldDefinition('social_image', 'Immagine social', 'media'),
        ];

        return [
            new ContentTypeDefinition('post', 'Articolo', 'Articoli', [], [
                new FieldDefinition('subtitle', 'Sottotitolo/deck', 'text'),
                new FieldDefinition('author_person', 'Autore editoriale', 'relation', '', false, 0, ['target' => ['nm_person']]),
                new FieldDefinition('featured', 'Articolo in evidenza', 'boolean'),
                new FieldDefinition('priority', 'Priorità', 'integer'),
                new FieldDefinition('related_services', 'Servizi correlati', 'relation_list', '', false, [], ['target' => ['nm_service']]),
                new FieldDefinition('related_case_studies', 'Casi studio correlati', 'relation_list', '', false, [], ['target' => ['nm_case_study']]),
                new FieldDefinition('related_resources', 'Risorse correlate', 'relation_list', '', false, [], ['target' => ['nm_resource']]),
                ...$seo,
            ]),
            new ContentTypeDefinition('nm_service', 'Servizio', 'Servizi', $this->baseArgs('dashicons-megaphone', 'servizi'), [
                new FieldDefinition('subtitle', 'Sottotitolo', 'text'),
                new FieldDefinition('short_description', 'Descrizione breve', 'textarea'),
                new FieldDefinition('hero_image', 'Immagine hero', 'media'),
                new FieldDefinition('value_props', 'Value proposition', 'json', 'JSON controllato con titolo e descrizione.'),
                new FieldDefinition('problems', 'Problemi risolti', 'json', 'JSON controllato con elenco problemi.'),
                new FieldDefinition('process', 'Processo', 'json', 'JSON controllato con step ordinati.'),
                new FieldDefinition('results', 'Risultati/proof', 'json', 'JSON controllato con metriche o proof point.'),
                new FieldDefinition('faq', 'FAQ', 'json', 'JSON controllato: question e answer.'),
                new FieldDefinition('priority', 'Priorità', 'integer'),
                new FieldDefinition('featured', 'Servizio in evidenza', 'boolean'),
                new FieldDefinition('cta_label', 'CTA label', 'text'),
                new FieldDefinition('cta_url', 'CTA URL', 'url'),
                new FieldDefinition('related_services', 'Servizi correlati', 'relation_list', '', false, [], ['target' => ['nm_service']]),
                ...$seo,
            ]),
            new ContentTypeDefinition('nm_case_study', 'Caso studio', 'Casi studio', $this->baseArgs('dashicons-portfolio', 'casi-studio', true), [
                new FieldDefinition('client', 'Cliente', 'relation', '', false, 0, ['target' => ['nm_client']]),
                new FieldDefinition('public_client_name', 'Nome cliente pubblico', 'text'),
                new FieldDefinition('short_description', 'Descrizione breve', 'textarea'),
                new FieldDefinition('cover_image', 'Cover progetto', 'media'),
                new FieldDefinition('project_year', 'Anno progetto', 'integer'),
                new FieldDefinition('project_status', 'Stato progetto', 'select', '', false, 'published', ['choices' => ['draft' => 'Bozza editoriale', 'published' => 'Pubblicato', 'archived' => 'Archiviato']]),
                new FieldDefinition('project_url', 'URL progetto', 'url'),
                new FieldDefinition('context', 'Contesto', 'textarea'),
                new FieldDefinition('challenge', 'Sfida', 'textarea'),
                new FieldDefinition('objectives', 'Obiettivi', 'json'),
                new FieldDefinition('approach', 'Approccio', 'textarea'),
                new FieldDefinition('solution', 'Soluzione', 'textarea'),
                new FieldDefinition('qualitative_result', 'Esito qualitativo', 'textarea', 'Risultato verificato espresso senza metriche inventate.'),
                new FieldDefinition('additional_content', 'Contenuto aggiuntivo', 'textarea', 'Testo legacy preservato quando non classificabile in sezioni strutturate.'),
                new FieldDefinition('numeric_results', 'Risultati numerici', 'json', 'JSON normalizzato: label, value e context.'),
                new FieldDefinition('gallery', 'Media gallery', 'media_gallery', 'Seleziona le immagini nell’ordine narrativo. Alt e didascalia arrivano dalla Media Library.'),
                new FieldDefinition('services', 'Servizi applicati', 'relation_list', '', false, [], ['target' => ['nm_service']]),
                new FieldDefinition('contributors', 'Persone coinvolte', 'relation_list', '', false, [], ['target' => ['nm_person']]),
                new FieldDefinition('related_insights', 'Insight correlati', 'relation_list', '', false, [], ['target' => ['post']]),
                new FieldDefinition('related_case_studies', 'Progetti correlati', 'relation_list', 'Selezione editoriale opzionale. Se vuota, il frontend usa settore e servizi.', false, [], ['target' => ['nm_case_study']]),
                new FieldDefinition('migration_source', 'Migration source', 'text'),
                new FieldDefinition('migration_legacy_id', 'Migration legacy ID', 'integer'),
                new FieldDefinition('migration_legacy_url', 'Migration legacy URL', 'url'),
                new FieldDefinition('migration_version', 'Migration version', 'text'),
                new FieldDefinition('migration_date', 'Migration date', 'text'),
                new FieldDefinition('migration_checksum', 'Migration checksum', 'text'),
                new FieldDefinition('priority', 'Priorità', 'integer'),
                new FieldDefinition('featured', 'Caso studio in evidenza', 'boolean'),
                new FieldDefinition('cta_label', 'CTA label', 'text'),
                new FieldDefinition('cta_url', 'CTA URL', 'url'),
                ...$seo,
            ]),
            new ContentTypeDefinition('nm_client', 'Cliente', 'Clienti', $this->privateArgs('dashicons-groups'), [
                new FieldDefinition('brand_name', 'Nome brand', 'text'),
                new FieldDefinition('logo', 'Logo', 'media'),
                new FieldDefinition('inverse_logo', 'Logo inverso', 'media'),
                new FieldDefinition('official_site', 'Sito ufficiale', 'url'),
                new FieldDefinition('short_description', 'Descrizione breve', 'textarea'),
                new FieldDefinition('visual_scale', 'Scala visiva logo', 'decimal', 'Esempio: 1.08'),
                new FieldDefinition('show_in_marquee', 'Mostra nella striscia clienti', 'boolean'),
                new FieldDefinition('priority', 'Priorità', 'integer'),
            ]),
            new ContentTypeDefinition('nm_person', 'Persona', 'Persone', $this->privateArgs('dashicons-id'), [
                new FieldDefinition('full_name', 'Nome completo', 'text'),
                new FieldDefinition('display_name', 'Nome visuale', 'text'),
                new FieldDefinition('given_name', 'Nome', 'text'),
                new FieldDefinition('family_name', 'Cognome', 'text'),
                new FieldDefinition('role', 'Ruolo', 'text'),
                new FieldDefinition('photo', 'Foto', 'media'),
                new FieldDefinition('focal_point', 'Focal point immagine', 'text', 'Esempio: 50% 34%'),
                new FieldDefinition('linkedin', 'LinkedIn', 'url'),
                new FieldDefinition('short_bio', 'Bio breve', 'textarea'),
                new FieldDefinition('expertise', 'Competenze', 'multiselect', 'Lista separata da virgole.'),
                new FieldDefinition('priority', 'Priorità', 'integer'),
                new FieldDefinition('visible_in_team', 'Visibile nel Team', 'boolean'),
                new FieldDefinition('linked_wp_user', 'Utente WordPress collegato', 'integer'),
            ]),
            new ContentTypeDefinition('nm_landing', 'Landing page', 'Landing page', $this->baseArgs('dashicons-welcome-widgets-menus', 'landing', false), [
                new FieldDefinition('campaign_id', 'Identificativo campagna', 'text', '', true),
                new FieldDefinition('template_variant', 'Template landing', 'select', '', false, 'lead-generation', ['choices' => ['lead-generation' => 'Lead generation', 'service-focused' => 'Service focused', 'campaign' => 'Campaign']]),
                new FieldDefinition('short_description', 'Descrizione breve', 'textarea'),
                new FieldDefinition('hero', 'Hero', 'json'),
                new FieldDefinition('value_proposition', 'Value proposition', 'json'),
                new FieldDefinition('proof', 'Proof', 'json'),
                new FieldDefinition('service', 'Servizio collegato', 'relation', '', false, 0, ['target' => ['nm_service']]),
                new FieldDefinition('case_study', 'Caso studio collegato', 'relation', '', false, 0, ['target' => ['nm_case_study']]),
                new FieldDefinition('testimonial', 'Testimonianza collegata', 'relation', '', false, 0, ['target' => ['nm_testimonial']]),
                new FieldDefinition('primary_cta_label', 'CTA principale label', 'text'),
                new FieldDefinition('primary_cta_url', 'CTA principale URL', 'url'),
                new FieldDefinition('form_type', 'Tipo form', 'select', '', false, 'none', ['choices' => ['none' => 'Nessuno', 'contact' => 'Contatto', 'download' => 'Download']]),
                new FieldDefinition('form_config', 'Configurazione form', 'json'),
                new FieldDefinition('thank_you_url', 'Thank-you URL', 'url'),
                new FieldDefinition('tracking_metadata', 'Tracking metadata', 'json'),
                ...$seo,
            ]),
            new ContentTypeDefinition('nm_testimonial', 'Testimonianza', 'Testimonianze', $this->privateArgs('dashicons-format-quote'), [
                new FieldDefinition('quote', 'Testo testimonianza', 'textarea'),
                new FieldDefinition('author_name', 'Autore', 'text'),
                new FieldDefinition('author_role', 'Ruolo autore', 'text'),
                new FieldDefinition('client', 'Cliente collegato', 'relation', '', false, 0, ['target' => ['nm_client']]),
                new FieldDefinition('source', 'Fonte', 'text'),
                new FieldDefinition('source_url', 'Link fonte', 'url'),
                new FieldDefinition('rating', 'Rating', 'decimal'),
                new FieldDefinition('priority', 'Priorità', 'integer'),
                new FieldDefinition('featured', 'In evidenza', 'boolean'),
                new FieldDefinition('case_study', 'Caso studio collegato', 'relation', '', false, 0, ['target' => ['nm_case_study']]),
                new FieldDefinition('service', 'Servizio collegato', 'relation', '', false, 0, ['target' => ['nm_service']]),
            ]),
            new ContentTypeDefinition('nm_resource', 'Risorsa', 'Risorse', $this->baseArgs('dashicons-media-document', 'risorse', false), [
                new FieldDefinition('description', 'Descrizione', 'textarea'),
                new FieldDefinition('cover', 'Cover', 'media'),
                new FieldDefinition('resource_type', 'Tipo risorsa', 'select', '', false, 'guide', ['choices' => ['pdf' => 'PDF', 'presentation' => 'Presentazione', 'checklist' => 'Checklist', 'guide' => 'Guida', 'template' => 'Template', 'download' => 'Download']]),
                new FieldDefinition('file', 'File', 'media'),
                new FieldDefinition('access_type', 'Accesso', 'select', '', false, 'free', ['choices' => ['free' => 'Free', 'lead-gated' => 'Lead gated', 'future-paid' => 'Future paid']]),
                new FieldDefinition('cta_label', 'CTA label', 'text'),
                new FieldDefinition('cta_url', 'CTA URL', 'url'),
                new FieldDefinition('related_services', 'Servizi correlati', 'relation_list', '', false, [], ['target' => ['nm_service']]),
                new FieldDefinition('related_posts', 'Articoli correlati', 'relation_list', '', false, [], ['target' => ['post']]),
                new FieldDefinition('author_person', 'Autore/persona', 'relation', '', false, 0, ['target' => ['nm_person']]),
                new FieldDefinition('priority', 'Priorità', 'integer'),
                new FieldDefinition('featured', 'In evidenza', 'boolean'),
                ...$seo,
            ]),
        ];
    }

    public function register(): void
    {
        foreach ($this->definitions() as $definition) {
            if (! $definition->enabled) {
                continue;
            }
            if (in_array($definition->key(), ['post', 'page'], true)) {
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
    private function baseArgs(string $icon, string $slug, bool $hasArchive = false): array
    {
        return [
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_rest' => true,
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'rewrite' => ['slug' => 'nm/' . $slug, 'with_front' => false],
            'has_archive' => $hasArchive ? 'nm/' . $slug : false,
            'menu_position' => 24,
            'menu_icon' => $icon,
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'delete_with_user' => false,
            'template_lock' => false,
        ];
    }

    /** @return array<string, mixed> */
    private function privateArgs(string $icon): array
    {
        return [
            'public' => false,
            'publicly_queryable' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'has_archive' => false,
            'menu_position' => 25,
            'menu_icon' => $icon,
            'supports' => ['title', 'editor', 'thumbnail', 'revisions'],
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'delete_with_user' => false,
        ];
    }
}
