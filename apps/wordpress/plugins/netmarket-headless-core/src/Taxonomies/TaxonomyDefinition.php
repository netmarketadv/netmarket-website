<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Taxonomies;

final class TaxonomyDefinition
{
    /** @param string[] $postTypes @param array<string, mixed> $args */
    public function __construct(
        public readonly string $key,
        public readonly string $singular,
        public readonly string $plural,
        public readonly array $postTypes,
        public readonly bool $hierarchical,
        public readonly array $args = [],
    ) {
    }
}
