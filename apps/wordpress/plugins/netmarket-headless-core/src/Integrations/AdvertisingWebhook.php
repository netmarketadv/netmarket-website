<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Integrations;

/** Server-only delivery; the endpoint credential is an unautoloaded CMS option. */
final class AdvertisingWebhook
{
    public const HOOK = 'nmhc_advertising_webhook_retry';

    public static function isAdvertising(string $source): bool
    {
        $parts = parse_url($source);
        return is_array($parts) && ($parts['scheme'] ?? '') === 'https'
            && in_array($parts['host'] ?? '', ['netmarket.it', 'staging.netmarket.it'], true)
            && rtrim($parts['path'] ?? '', '/') === '/advertising';
    }

    public static function validEndpoint(string $url): bool
    {
        $parts = parse_url($url);
        return is_array($parts) && ($parts['scheme'] ?? '') === 'https'
            && ($parts['host'] ?? '') === 'nod.netmarket.it'
            && ($parts['path'] ?? '') === '/functions/inboundWebhook'
            && ! isset($parts['user']) && ! isset($parts['pass']) && ! isset($parts['port']);
    }

    /** @param array<string, mixed> $lead */
    public static function deliver(array $lead, int $attempt = 0): void
    {
        $url = (string) get_option('nmhc_advertising_webhook_url', '');
        $status = 'configuration_missing';
        if (self::validEndpoint($url)) {
            $response = wp_remote_post($url, [
                'timeout' => 12,
                'redirection' => 0,
                'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
                'body' => wp_json_encode($lead),
            ]);
            $code = is_wp_error($response) ? 0 : wp_remote_retrieve_response_code($response);
            $body = is_wp_error($response) ? null : json_decode(wp_remote_retrieve_body($response), true);
            $accepted = $code >= 200 && $code < 300 && is_array($body)
                && ! (is_array($body) && (isset($body['error']) || ($body['success'] ?? true) === false));
            $status = $accepted ? 'delivered' : 'delivery_failed';
            if ($accepted) {
                self::log($lead, $status);
                return;
            }
        }
        if ($attempt < 5) {
            $scheduled = wp_schedule_single_event(time() + 60 * (2 ** $attempt), self::HOOK, [$lead, $attempt + 1], true);
            $status = is_wp_error($scheduled) || ! $scheduled ? 'retry_schedule_failed' : $status . '_retry_scheduled';
        } else {
            $status .= '_exhausted';
        }
        self::log($lead, $status);
    }

    /** @param array<string, mixed> $lead */
    private static function log(array $lead, string $status): void
    {
        // Never log the endpoint, response body, or contact data.
        error_log(sprintf('[netmarket webhook] request_id=%s status=%s', (string) ($lead['request_id'] ?? ''), $status));
    }
}
