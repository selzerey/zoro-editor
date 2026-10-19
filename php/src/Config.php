<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * Configuration: defaults + user settings (deep merge).
 */
final class Config
{
    /** @var array<string, mixed> */
    private array $data;

    /** @param array<string, mixed> $overrides */
    public function __construct(array $overrides = [])
    {
        $this->data = self::merge(self::defaults(), $overrides);
        $up = &$this->data['upload'];
        $up['path'] = rtrim((string) $up['path'], '/\\');
        $up['url_base'] = rtrim((string) $up['url_base'], '/');
        $this->data['data_path'] ??= $up['path'] . '/.zoro';
        $this->data['image_cache']['path'] ??= $up['path'] . '/.cache';
        Lang::$locale = in_array($this->data['locale'] ?? 'en', ['en', 'tr'], true) ? $this->data['locale'] : 'en';
    }

    /** @return array<string, mixed> */
    public static function defaults(): array
    {
        return [
            // Language of messages shown in Finder: 'en' or 'tr'
            'locale' => 'en',
            'upload' => [
                // Folder files are written to (must be web-accessible)
                'path' => getcwd() . '/uploads',
                // Public URL of this folder
                'url_base' => '/uploads',
                'max_size' => 20 * 1024 * 1024,
                'allowed' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
                // Convert JPEG/PNG uploads to WebP (the original is still kept)
                'convert_to_webp' => false,
                // Downscale very large images to this width (0 = off)
                'max_width' => 2560,
                'quality' => 85,
            ],
            // Variants (WebP). Only those smaller than the original are generated.
            'variants' => [
                'thumb' => ['width' => 150, 'height' => 150, 'crop' => true, 'quality' => 80],
                'sm' => ['width' => 480, 'height' => null, 'crop' => false, 'quality' => 80],
                'md' => ['width' => 768, 'height' => null, 'crop' => false, 'quality' => 80],
                'lg' => ['width' => 1200, 'height' => null, 'crop' => false, 'quality' => 80],
                'xl' => ['width' => 1920, 'height' => null, 'crop' => false, 'quality' => 82],
            ],
            // On-the-fly resizing (/img/w640-q75/2026/10/photo.jpg) — only these values are accepted
            'image_cache' => [
                'path' => null,
                'max_age' => 31536000,
                'widths' => [150, 320, 480, 640, 768, 1024, 1200, 1536, 1920],
                'qualities' => [60, 75, 85],
            ],
            // Metadata (media.json) folder — blocked from web access
            'data_path' => null,
            // REQUIRED: authorization check. fn(string $action): bool
            'auth' => null,
            // Optional CSRF check. fn(?string $token): bool  (X-CSRF-Token header)
            'csrf' => null,
            // Allowed origins, if requests come from a different domain
            'cors' => [],
            // Return the existing record when the same file is uploaded again (SHA-256)
            'dedupe' => true,
            // For the "Unused" filter: fn(array $item): int  (how many places use it)
            'usage_counter' => null,
            // When a file is renamed: fn(string $oldUrl, string $newUrl, array $item): void
            // (e.g. update the URL in content stored in the database)
            'on_rename' => null,
            // Before deleting: fn(array $item): bool  (false = don't delete)
            'on_delete' => null,
        ];
    }

    public function get(string $path, mixed $default = null): mixed
    {
        $cur = $this->data;
        foreach (explode('.', $path) as $k) {
            if (!is_array($cur) || !array_key_exists($k, $cur)) {
                return $default;
            }
            $cur = $cur[$k];
        }
        return $cur ?? $default;
    }

    /** @return array<string, mixed> */
    public function all(): array
    {
        return $this->data;
    }

    /**
     * @param array<string, mixed> $a
     * @param array<string, mixed> $b
     * @return array<string, mixed>
     */
    private static function merge(array $a, array $b): array
    {
        foreach ($b as $k => $v) {
            // List arrays (allowed, widths...) and variants are replaced entirely
            if (is_array($v) && isset($a[$k]) && is_array($a[$k]) && !array_is_list($v) && $k !== 'variants') {
                $a[$k] = self::merge($a[$k], $v);
            } else {
                $a[$k] = $v;
            }
        }
        return $a;
    }
}
