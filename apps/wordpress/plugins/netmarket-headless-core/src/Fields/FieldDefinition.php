<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Fields;

use Netmarket\HeadlessCore\Validation\ValidationResult;

final class FieldDefinition
{
    /**
     * @param array<string, mixed> $options
     * @param callable|null $sanitizeCallback
     * @param callable|null $validateCallback
     * @param array<string, mixed> $restSchema
     */
    public function __construct(
        public readonly string $key,
        public readonly string $label,
        public readonly string $type,
        public readonly string $description = '',
        public readonly bool $required = false,
        public readonly mixed $default = null,
        public readonly array $options = [],
        public readonly mixed $sanitizeCallback = null,
        public readonly mixed $validateCallback = null,
        public readonly array $restSchema = [],
    ) {
    }

    public function metaKey(): string
    {
        return 'nmhc_' . $this->key;
    }

    public function sanitize(mixed $value): mixed
    {
        if (is_callable($this->sanitizeCallback)) {
            return call_user_func($this->sanitizeCallback, $value);
        }

        return Sanitizer::sanitize($this->type, $value, $this->options);
    }

    public function validate(mixed $value): ValidationResult
    {
        if ($this->required && ($value === null || $value === '' || $value === [])) {
            return ValidationResult::error(sprintf('%s è obbligatorio.', $this->label));
        }
        if (is_callable($this->validateCallback)) {
            return call_user_func($this->validateCallback, $value);
        }
        return ValidationResult::ok();
    }
}
