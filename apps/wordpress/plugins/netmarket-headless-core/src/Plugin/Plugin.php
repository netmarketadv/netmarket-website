<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Plugin;

use Netmarket\HeadlessCore\Admin\MetaBoxes;
use Netmarket\HeadlessCore\ContentTypes\Registry as ContentRegistry;
use Netmarket\HeadlessCore\Rest\Routes;
use Netmarket\HeadlessCore\Taxonomies\Registry as TaxonomyRegistry;

final class Plugin
{
    private static ?self $instance = null;
    private Container $container;

    private function __construct()
    {
        $this->container = new Container();
    }

    public static function instance(): self
    {
        self::$instance ??= new self();
        return self::$instance;
    }

    public function boot(): void
    {
        if (! Requirements::passes()) {
            add_action('admin_notices', [Requirements::class, 'adminNotice']);
            return;
        }

        load_plugin_textdomain(
            'netmarket-headless-core',
            false,
            dirname(plugin_basename(\Netmarket\HeadlessCore\NMHC_FILE)) . '/languages'
        );

        $content = new ContentRegistry();
        $taxonomies = new TaxonomyRegistry();
        $this->container->set(ContentRegistry::class, $content);
        $this->container->set(TaxonomyRegistry::class, $taxonomies);

        add_action('init', [$content, 'register']);
        add_action('init', [$taxonomies, 'register']);
        add_action('add_meta_boxes', [new MetaBoxes($content), 'register']);
        add_action('save_post', [new MetaBoxes($content), 'save'], 10, 2);
        add_action('rest_api_init', [new Routes($content, $taxonomies), 'register']);
    }
}
