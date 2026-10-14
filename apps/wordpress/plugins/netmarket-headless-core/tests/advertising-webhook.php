<?php

declare(strict_types=1);

require __DIR__ . '/../src/Integrations/AdvertisingWebhook.php';
use Netmarket\HeadlessCore\Integrations\AdvertisingWebhook;

$endpoint = 'https://nod.netmarket.it/functions/inboundWebhook?source_id=test&key=test';
$responseCode = 200;
$responseBody = '{"success":true}';
$calls = [];
$scheduled = [];
function get_option(string $key, mixed $default = false): mixed { global $endpoint; return $endpoint; }
function wp_json_encode(mixed $data): string { return json_encode($data, JSON_THROW_ON_ERROR); }
function wp_remote_post(string $url, array $args): array { global $calls; $calls[] = [$url, $args]; return []; }
function is_wp_error(mixed $value): bool { return false; }
function wp_remote_retrieve_response_code(mixed $response): int { global $responseCode; return $responseCode; }
function wp_remote_retrieve_body(mixed $response): string { global $responseBody; return $responseBody; }
function wp_schedule_single_event(int $time, string $hook, array $args, bool $wpError): bool { global $scheduled; $scheduled[] = [$hook, $args]; return true; }
function check(bool $condition, string $message): void { if (! $condition) { throw new RuntimeException($message); } }

check(AdvertisingWebhook::isAdvertising('https://netmarket.it/advertising/?utm_source=test'), 'Landing must match');
foreach (['https://evil.example/advertising/', 'https://netmarket.it/contatti/', 'https://netmarket.it/advertising-v2/', 'https://netmarket.it/advertising/other'] as $source) {
    check(! AdvertisingWebhook::isAdvertising($source), 'Unrelated forms must be excluded');
}
foreach (['http://nod.netmarket.it/functions/inboundWebhook', 'https://nod.netmarket.it.evil.example/functions/inboundWebhook', 'https://user@nod.netmarket.it/functions/inboundWebhook'] as $url) {
    check(! AdvertisingWebhook::validEndpoint($url), 'Reject unsafe destination');
}
$lead = ['request_id' => 'test-request-id', 'email' => 'test@example.invalid', 'objective' => 'contatti-preventivi', 'channel' => 'Google Ads'];
AdvertisingWebhook::deliver($lead);
check(count($calls) === 1 && $scheduled === [], 'Successful delivery must not retry');
check(json_decode($calls[0][1]['body'], true) === $lead, 'JSON payload must preserve fields');
check($calls[0][1]['redirection'] === 0, 'Credentials must not follow redirects');
$responseCode = 503;
AdvertisingWebhook::deliver($lead);
check(count($scheduled) === 1 && $scheduled[0][1] === [$lead, 1], 'Failure must retry same request ID');
$responseCode = 200;
$responseBody = '{"success":false}';
AdvertisingWebhook::deliver($lead);
check(count($scheduled) === 2, 'Application failure must retry');
AdvertisingWebhook::deliver($lead, 5);
check(count($scheduled) === 2, 'Retries must be bounded');
$endpoint = '';
AdvertisingWebhook::deliver($lead);
check(count($calls) === 4 && count($scheduled) === 3, 'Missing config must not send elsewhere');
echo "Advertising webhook tests passed.\n";
