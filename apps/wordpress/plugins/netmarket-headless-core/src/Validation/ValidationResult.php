<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Validation;

final class ValidationResult
{
    public function __construct(public readonly bool $valid, public readonly string $message = '')
    {
    }

    public static function ok(): self
    {
        return new self(true);
    }

    public static function error(string $message): self
    {
        return new self(false, $message);
    }
}
