<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Content;

final class Relations
{
    /**
     * @param int[] $ids
     * @param string[] $postTypes
     * @return int[]
     */
    public static function validPostIds(array $ids, array $postTypes, bool $publishedOnly = false): array
    {
        $valid = [];
        foreach (array_values(array_unique(array_map('absint', $ids))) as $id) {
            if ($id <= 0) {
                continue;
            }
            $postType = get_post_type($id);
            if (! is_string($postType) || ! in_array($postType, $postTypes, true)) {
                continue;
            }
            if ($publishedOnly && get_post_status($id) !== 'publish') {
                continue;
            }
            $valid[] = $id;
        }
        return $valid;
    }

    /** @param int[] $ids */
    public static function replaceMany(int $postId, string $metaKey, array $ids): void
    {
        delete_post_meta($postId, $metaKey);
        foreach (array_values(array_unique(array_map('absint', $ids))) as $id) {
            if ($id > 0) {
                add_post_meta($postId, $metaKey, $id, false);
            }
        }
    }

    /** @return int[] */
    public static function getMany(int $postId, string $metaKey): array
    {
        return array_values(array_unique(array_map('absint', get_post_meta($postId, $metaKey, false))));
    }

    /**
     * @param string[] $postTypes
     * @return array<int, array{id:int,slug:string,title:string,type:string,image:array<string,mixed>|null}>
     */
    public static function summaries(array $ids, array $postTypes, bool $publishedOnly = true): array
    {
        $valid = self::validPostIds($ids, $postTypes, $publishedOnly);
        if ($valid === []) {
            return [];
        }
        $posts = get_posts([
            'post__in' => $valid,
            'post_type' => $postTypes,
            'post_status' => $publishedOnly ? 'publish' : 'any',
            'orderby' => 'post__in',
            'numberposts' => count($valid),
        ]);
        return array_map(static fn (\WP_Post $post): array => self::summary($post), $posts);
    }

    /** @return array{id:int,slug:string,title:string,type:string,image:array<string,mixed>|null} */
    public static function summary(\WP_Post $post): array
    {
        return [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'title' => get_the_title($post),
            'type' => $post->post_type,
            'image' => Media::featured($post->ID),
        ];
    }
}
