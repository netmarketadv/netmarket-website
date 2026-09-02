<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Plugin;

final class Activator
{
    public static function activate(): void
    {
        if (! Requirements::passes()) {
            deactivate_plugins(plugin_basename(\Netmarket\HeadlessCore\NMHC_FILE));
            wp_die(esc_html__('Requisiti non soddisfatti per Netmarket Headless Core.', 'netmarket-headless-core'));
        }
        flush_rewrite_rules();
    }
}
