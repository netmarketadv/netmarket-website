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
$responseBody = '<html>Challenge</html>';
AdvertisingWebhook::deliver($lead);
check(count($scheduled) === 3, 'HTML challenge must not count as delivery');
$endpoint = '';
AdvertisingWebhook::deliver($lead);
check(count($calls) === 5 && count($scheduled) === 4, 'Missing config must not send elsewhere');
echo "Advertising webhook tests passed.\n";

// Exercise the real contact validator. Privacy remains false so no test can send mail.
require __DIR__ . '/../src/Taxonomies/Registry.php';
require __DIR__ . '/../src/Rest/Routes.php';
function sanitize_text_field(string $value): string { return trim(strip_tags($value)); }
function sanitize_textarea_field(string $value): string { return trim(strip_tags($value)); }
function sanitize_email(string $value): string { return $value; }
function esc_url_raw(string $value): string { return $value; }
function is_email(string $value): bool { return (bool) filter_var($value, FILTER_VALIDATE_EMAIL); }
class WP_REST_Request {
    public function __construct(private array $payload) {}
    public function get_json_params(): array { return $this->payload; }
    public function get_file_params(): array { return []; }
}
class WP_REST_Response {
    public function __construct(public array $data, public int $status) {}
}
$routes = new \Netmarket\HeadlessCore\Rest\Routes(new \Netmarket\HeadlessCore\Taxonomies\Registry());
foreach ([
    ['https://netmarket.it/advertising/', '', true],
    ['https://netmarket.it/advertising/?utm_source=google', '+39 3291234567', true],
    ['https://staging.netmarket.it/advertising/', '329abc', true],
    ['https://netmarket.it/advertising/', '3291234567', false],
    ['https://netmarket.it/contatti/', '', false],
    ['https://netmarket.it/contatti/', '+39 3291234567', false],
] as [$source, $phone, $invalid]) {
    $response = $routes->contactForm(new WP_REST_Request([
        'name' => 'QA Netmarket', 'email' => 'qa@example.invalid', 'phone' => $phone,
        'message' => 'Richiesta tecnica senza invio reale.', 'sourceUrl' => $source,
        'privacyConsent' => false,
    ]));
    check($response->status === 422 && isset($response->data['fields']['privacyConsent']), 'Tests must never deliver leads');
    check(isset($response->data['fields']['phone']) === $invalid, 'Phone validation must match landing policy');
}
echo "Advertising phone validation tests passed.\n";
