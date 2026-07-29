<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Plugin;

final class Deactivator
{
    public static function deactivate(): void
    {
        flush_rewrite_rules();
    }
}
