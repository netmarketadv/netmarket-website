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
            'relation_list' => self::sanitizeIdList($value),
            'multiselect' => self::sanitizeTextList($value),
            'date', 'datetime' => sanitize_text_field((string) $value),
            'repeater' => self::sanitizeRepeater($value),
            'json' => self::sanitizeJson($value),
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

    /** @return int[] */
    private static function sanitizeIdList(mixed $value): array
    {
        $items = is_string($value) ? explode(',', wp_unslash($value)) : (array) $value;
        $ids = [];
        foreach ($items as $item) {
            $id = absint($item);
            if ($id > 0) {
                $ids[] = $id;
            }
        }
        return array_values(array_unique($ids));
    }

    /** @return string[] */
    private static function sanitizeTextList(mixed $value): array
    {
        $items = is_string($value) ? explode(',', wp_unslash($value)) : (array) $value;
        $clean = [];
        foreach ($items as $item) {
            $text = sanitize_text_field((string) $item);
            if ($text !== '') {
                $clean[] = $text;
            }
        }
        return array_values(array_unique($clean));
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

    /** @return array<string, mixed>|array<int, mixed> */
    private static function sanitizeJson(mixed $value): array
    {
        $decoded = is_string($value) ? json_decode(wp_unslash($value), true) : $value;
        if (! is_array($decoded)) {
            return [];
        }
        return self::sanitizeJsonValue($decoded);
    }

    /** @return mixed */
    private static function sanitizeJsonValue(mixed $value): mixed
    {
        if (is_array($value)) {
            $clean = [];
            foreach ($value as $key => $item) {
                $clean[is_int($key) ? $key : sanitize_key((string) $key)] = self::sanitizeJsonValue($item);
            }
            return $clean;
        }
        if (is_bool($value) || is_int($value) || is_float($value) || $value === null) {
            return $value;
        }
        return sanitize_text_field((string) $value);
    }
}
