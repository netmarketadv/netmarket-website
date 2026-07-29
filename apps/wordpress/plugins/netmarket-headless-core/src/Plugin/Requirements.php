<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Plugin;

final class Requirements
{
    public const MIN_PHP = '8.2';
    public const MIN_WP = '6.6';

    public static function passes(): bool
    {
        global $wp_version;
        return version_compare(self::currentPhpVersion(), self::MIN_PHP, '>=')
            && version_compare((string) $wp_version, self::MIN_WP, '>=');
    }

    public static function adminNotice(): void
    {
        echo '<div class="notice notice-error"><p>';
        echo esc_html__('Netmarket Headless Core richiede PHP 8.2+ e WordPress 6.6+.', 'netmarket-headless-core');
        echo '</p></div>';
    }

    private static function currentPhpVersion(): string
    {
        return phpversion() ?: '0.0';
    }
}
