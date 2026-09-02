<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Content;

final class Media
{
    /** @return array<string, mixed>|null */
    public static function featured(int $postId): ?array
    {
        $id = get_post_thumbnail_id($postId);
        return $id > 0 ? self::asset($id) : null;
    }

    /** @return array<string, mixed>|null */
    public static function asset(int $attachmentId, string $focalPoint = ''): ?array
    {
        if ($attachmentId <= 0) {
            return null;
        }
        $url = wp_get_attachment_url($attachmentId);
        if (! is_string($url) || $url === '') {
            return null;
        }
        $meta = wp_get_attachment_metadata($attachmentId);
        $mime = get_post_mime_type($attachmentId);
        return [
            'id' => $attachmentId,
            'url' => $url,
            'alt' => get_post_meta($attachmentId, '_wp_attachment_image_alt', true) ?: '',
            'width' => is_array($meta) && isset($meta['width']) ? (int) $meta['width'] : null,
            'height' => is_array($meta) && isset($meta['height']) ? (int) $meta['height'] : null,
            'mimeType' => is_string($mime) ? $mime : null,
            'srcset' => wp_get_attachment_image_srcset($attachmentId) ?: null,
            'sizes' => wp_get_attachment_image_sizes($attachmentId) ?: null,
            'focalPoint' => $focalPoint !== '' ? $focalPoint : null,
        ];
    }
}
