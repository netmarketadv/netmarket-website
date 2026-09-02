<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\ContentTypes;

use Netmarket\HeadlessCore\Contracts\DefinitionInterface;
use Netmarket\HeadlessCore\Fields\FieldDefinition;

final class ContentTypeDefinition implements DefinitionInterface
{
    /** @param FieldDefinition[] $fields @param array<string, mixed> $args */
    public function __construct(
        private readonly string $key,
        public readonly string $singular,
        public readonly string $plural,
        public readonly array $args,
        public readonly array $fields = [],
        public readonly bool $enabled = true,
    ) {
    }

    public function key(): string
    {
        return $this->key;
    }

    /** @return array<string, mixed> */
    public function labels(): array
    {
        return [
            'name' => $this->plural,
            'singular_name' => $this->singular,
            'add_new_item' => 'Aggiungi ' . $this->singular,
            'edit_item' => 'Modifica ' . $this->singular,
            'new_item' => 'Nuovo ' . $this->singular,
            'view_item' => 'Vedi ' . $this->singular,
            'search_items' => 'Cerca ' . $this->plural,
            'not_found' => 'Nessun contenuto trovato',
            'not_found_in_trash' => 'Nessun contenuto nel cestino',
        ];
    }
}
