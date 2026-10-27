<?php

declare(strict_types=1);

// wp eval-file run.php MODE PLAN DIGEST ASSETS JOURNAL CONFIRM
require_once __DIR__ . '/Importer.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$mode = $args[0] ?? 'plan';
$planFile = $args[1] ?? '';
$digest = $args[2] ?? '';
$assets = $args[3] ?? '';
$journal = $args[4] ?? '';
$confirm = $args[5] ?? '';
if (!is_file($planFile) || hash_file('sha256', $planFile) !== $digest) {
    throw new RuntimeException('Exact plan digest mismatch.');
}
if (!in_array($mode, ['plan', 'apply', 'rollback-plan', 'rollback'], true)) {
    throw new RuntimeException('Unknown import operation.');
}
if (!str_starts_with(realpath(dirname($journal)) . '/', dirname(rtrim(ABSPATH, '/')) . '/.netmarket-cms-imports/')) {
    throw new RuntimeException('Recovery journal must be outside document root in the dedicated private directory.');
}
if (in_array($mode, ['apply', 'rollback'], true)) {
    $verb = $mode === 'apply' ? 'IMPORT' : 'ROLLBACK';
    if (getenv('NETMARKET_APPROVED_IMPORT') !== $digest || $confirm !== $verb . ' NETMARKET CMS ' . $digest) {
        throw new RuntimeException('Explicit protected workflow approval and exact confirmation required.');
    }
}
$plan = json_decode(file_get_contents($planFile), true, 512, JSON_THROW_ON_ERROR);
$importer = new \Netmarket\HeadlessCore\Release\Importer($plan, $digest, $assets, $journal);
$result = match ($mode) {
    'apply' => $importer->apply(),
    'rollback-plan' => $importer->rollback(),
    'rollback' => $importer->rollback(true),
    default => $importer->inspect(),
};
echo json_encode($result, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . PHP_EOL;
