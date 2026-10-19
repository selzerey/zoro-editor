<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * Yapılandırma: varsayılanlar + kullanıcı ayarları (derin birleştirme).
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
    }

    /** @return array<string, mixed> */
    public static function defaults(): array
    {
        return [
            'upload' => [
                // Dosyaların yazılacağı klasör (web'den erişilebilir olmalı)
                'path' => getcwd() . '/uploads',
                // Bu klasörün tarayıcıdaki adresi
                'url_base' => '/uploads',
                'max_size' => 20 * 1024 * 1024,
                'allowed' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
                // JPEG/PNG yüklemeleri WebP'ye çevrilsin mi (orijinal yine saklanır)
                'convert_to_webp' => false,
                // Çok büyük görselleri bu genişliğe küçült (0 = kapalı)
                'max_width' => 2560,
                'quality' => 85,
            ],
            // Varyantlar (WebP). Orijinalden küçük olanlar üretilir.
            'variants' => [
                'thumb' => ['width' => 150, 'height' => 150, 'crop' => true, 'quality' => 80],
                'sm' => ['width' => 480, 'height' => null, 'crop' => false, 'quality' => 80],
                'md' => ['width' => 768, 'height' => null, 'crop' => false, 'quality' => 80],
                'lg' => ['width' => 1200, 'height' => null, 'crop' => false, 'quality' => 80],
                'xl' => ['width' => 1920, 'height' => null, 'crop' => false, 'quality' => 82],
            ],
            // Anlık boyutlandırma (/img/w640-q75/2026/10/gorsel.jpg) — sadece bu değerler kabul edilir
            'image_cache' => [
                'path' => null,
                'max_age' => 31536000,
                'widths' => [150, 320, 480, 640, 768, 1024, 1200, 1536, 1920],
                'qualities' => [60, 75, 85],
            ],
            // Metadata (media.json) klasörü — web'den erişime kapatılır
            'data_path' => null,
            // ZORUNLU: yetki kontrolü. fn(string $action): bool
            'auth' => null,
            // İsteğe bağlı CSRF doğrulaması. fn(?string $token): bool  (X-CSRF-Token başlığı)
            'csrf' => null,
            // Farklı alan adından istek atılacaksa izin verilen origin listesi
            'cors' => [],
            // Aynı dosya tekrar yüklenirse mevcut kaydı döndür (SHA-256)
            'dedupe' => true,
            // "Kullanılmayanlar" filtresi için: fn(array $item): int  (kaç yerde kullanılıyor)
            'usage_counter' => null,
            // Dosya yeniden adlandırılınca: fn(string $oldUrl, string $newUrl, array $item): void
            // (ör. veritabanındaki içeriklerde URL'yi güncelle)
            'on_rename' => null,
            // Silmeden önce: fn(array $item): bool  (false = silme)
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
            // Liste dizileri (allowed, widths...) ve varyantlar tamamen değiştirilir
            if (is_array($v) && isset($a[$k]) && is_array($a[$k]) && !array_is_list($v) && $k !== 'variants') {
                $a[$k] = self::merge($a[$k], $v);
            } else {
                $a[$k] = $v;
            }
        }
        return $a;
    }
}
