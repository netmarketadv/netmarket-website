<?php

/**
 * Plugin Name: Netmarket Headless Core
 * Description: Content modelling and headless REST foundations for Netmarket.
 * Version: 0.1.0
 * Requires at least: 6.6
 * Requires PHP: 8.2
 * Author: Netmarket
 * Text Domain: netmarket-headless-core
 * Domain Path: /languages
 */

declare(strict_types=1);

namespace Netmarket\HeadlessCore;

if (! defined('ABSPATH')) {
    exit;
}

const NMHC_VERSION = '0.1.0';
const NMHC_FILE = __FILE__;
const NMHC_DIR = __DIR__;

require_once NMHC_DIR . '/src/Support/autoload.php';

register_activation_hook(__FILE__, static function (): void {
    Plugin\Activator::activate();
});

register_deactivation_hook(__FILE__, static function (): void {
    Plugin\Deactivator::deactivate();
});

add_action('plugins_loaded', static function (): void {
    Plugin\Plugin::instance()->boot();
});
