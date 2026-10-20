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
    public function __construct(public array $data, public int $status = 200) {}
    public function header(string $name, string $value): void {}
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

// All outbound transports are mocked; no email or lead reaches a real recipient.
const MINUTE_IN_SECONDS = 60;
$mailCalls = [];
function get_transient(string $key): int { return 0; }
function set_transient(string $key, mixed $value, int $ttl): bool { return true; }
function apply_filters(string $name, mixed $value): mixed { return $value; }
function wp_mail(string $to, string $subject, string $body, array $headers, array $attachments): bool {
    global $mailCalls;
    $mailCalls[] = compact('to', 'subject', 'body', 'headers');
    return true;
}
$payload = ['name' => 'QA Test', 'email' => 'qa@example.invalid', 'phone' => '3290000000',
    'sourceUrl' => 'https://netmarket.it/advertising/', 'privacyConsent' => true,
    'channel' => 'Meta Ads', 'message' => ''];
$response = $routes->contactForm(new WP_REST_Request($payload));
check($response->status === 200, 'Optional blank message must succeed');
check(count($mailCalls) === 1, 'One email per successful submission');
check($mailCalls[0]['to'] === 'segreteria@netmarket.it', 'Correct To recipient');
check(in_array('Cc: enrico@netmarket.it', $mailCalls[0]['headers'], true), 'Enrico must receive CC');
check(in_array('Cc: giacomo@netmarket.it', $mailCalls[0]['headers'], true), 'Giacomo must receive CC');
check(str_contains($mailCalls[0]['body'], 'Canale di interesse: Meta Ads'), 'Email includes the selected channel');
foreach (['', 'Invalid'] as $channel) {
    $response = $routes->contactForm(new WP_REST_Request(array_merge($payload, ['channel' => $channel])));
    check($response->status === 422 && isset($response->data['fields']['channel']), 'Reject missing or invalid channel');
}
check(count($mailCalls) === 1, 'Invalid channel must never send mail');
$response = $routes->contactForm(new WP_REST_Request(array_merge($payload, ['sourceUrl' => 'https://netmarket.it/contatti/'])));
check($response->status === 422 && isset($response->data['fields']['message']), 'Other forms still require message');
echo "Advertising optional message, channel and mail routing tests passed.\n";
