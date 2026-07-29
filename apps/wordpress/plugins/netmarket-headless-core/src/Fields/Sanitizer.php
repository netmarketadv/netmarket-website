<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Fields;

final class Sanitizer
{
    /** @param array<string, mixed> $options */
    public static function sanitize(string $type, mixed $value, array $options = []): mixed
    {
        return match ($type) {
            'textarea' => sanitize_textarea_field((string) $value),
            'richtext' => wp_kses_post((string) $value),
            'url' => esc_url_raw((string) $value),
            'email' => sanitize_email((string) $value),
            'integer', 'media', 'relation' => absint($value),
            'decimal' => is_numeric($value) ? (float) $value : 0.0,
            'boolean' => (bool) $value,
            'select' => self::sanitizeChoice((string) $value, $options),
            'multiselect' => array_values(array_map(static fn (mixed $item): string => sanitize_key((string) $item), (array) $value)),
            'date', 'datetime' => sanitize_text_field((string) $value),
            'repeater' => self::sanitizeRepeater($value),
            default => sanitize_text_field((string) $value),
        };
    }

    /** @param array<string, mixed> $options */
    private static function sanitizeChoice(string $value, array $options): string
    {
        $choices = isset($options['choices']) && is_array($options['choices']) ? array_keys($options['choices']) : [];
        $value = sanitize_key($value);
        return in_array($value, $choices, true) ? $value : '';
    }

    /** @return array<int, array<string, string>> */
    private static function sanitizeRepeater(mixed $value): array
    {
        $rows = is_string($value) ? json_decode(wp_unslash($value), true) : $value;
        if (! is_array($rows)) {
            return [];
        }
        $clean = [];
        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }
            $clean[] = array_map(static fn (mixed $item): string => sanitize_text_field((string) $item), $row);
        }
        return $clean;
    }
}
