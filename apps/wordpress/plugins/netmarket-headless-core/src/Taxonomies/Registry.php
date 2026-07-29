<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Taxonomies;

final class Registry
{
    /** @return TaxonomyDefinition[] */
    public function definitions(): array
    {
        return [
            new TaxonomyDefinition('nm_sector', 'Settore', 'Settori', ['nm_service', 'nm_case_study'], true, ['rewrite' => ['slug' => 'nm/settori']]),
            new TaxonomyDefinition('nm_capability', 'Competenza', 'Competenze', ['nm_service', 'nm_case_study'], false, ['rewrite' => ['slug' => 'nm/competenze']]),
            new TaxonomyDefinition('nm_technology', 'Tecnologia', 'Tecnologie', ['nm_case_study'], false, ['rewrite' => ['slug' => 'nm/tecnologie']]),
        ];
    }

    public function register(): void
    {
        foreach ($this->definitions() as $definition) {
            register_taxonomy($definition->key, $definition->postTypes, array_merge([
                'labels' => [
                    'name' => $definition->plural,
                    'singular_name' => $definition->singular,
                    'search_items' => 'Cerca ' . $definition->plural,
                    'edit_item' => 'Modifica ' . $definition->singular,
                    'add_new_item' => 'Aggiungi ' . $definition->singular,
                ],
                'hierarchical' => $definition->hierarchical,
                'show_ui' => true,
                'show_admin_column' => true,
                'show_in_rest' => true,
                'capabilities' => [
                    'manage_terms' => 'manage_categories',
                    'edit_terms' => 'manage_categories',
                    'delete_terms' => 'manage_categories',
                    'assign_terms' => 'edit_posts',
                ],
            ], $definition->args));
        }
    }
}
