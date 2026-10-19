<?php

declare(strict_types=1);

namespace Zoro\Editor;

final class Support
{
    /** Türkçe uyumlu slug: "Kırmızı Şemsiye.JPG" → "kirmizi-semsiye" */
    public static function slugify(string $text, string $fallback = 'gorsel'): string
    {
        $map = [
            'İ' => 'i', 'I' => 'i', 'ı' => 'i', 'Ş' => 's', 'ş' => 's', 'Ğ' => 'g', 'ğ' => 'g',
            'Ü' => 'u', 'ü' => 'u', 'Ö' => 'o', 'ö' => 'o', 'Ç' => 'c', 'ç' => 'c',
        ];
        $text = strtr($text, $map);
        if (function_exists('iconv')) {
            $t = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
            if ($t !== false) {
                $text = $t;
            }
        }
        $text = strtolower($text);
        $text = (string) preg_replace('/[^a-z0-9]+/', '-', $text);
        $text = trim($text, '-');
        $text = substr($text, 0, 120);
        return $text !== '' ? rtrim($text, '-') : $fallback;
    }

    /** Uzantısız dosya adı ("foto.final.jpg" → "foto.final") */
    public static function basename(string $name): string
    {
        return (string) preg_replace('/\.[^.]+$/', '', $name);
    }

    public static function uniqueFilename(string $dir, string $slug, string $ext): string
    {
        $name = "$slug.$ext";
        $i = 1;
        while (file_exists("$dir/$name")) {
            $name = "$slug-$i.$ext";
            $i++;
        }
        return $name;
    }

    public static function ensureDir(string $path): void
    {
        if (!is_dir($path) && !@mkdir($path, 0755, true) && !is_dir($path)) {
            throw new \RuntimeException('Klasör oluşturulamadı: ' . basename($path));
        }
    }

    /** Yükleme klasöründe PHP çalıştırmayı kapatan .htaccess (Apache/LiteSpeed). */
    public static function protectUploadDir(string $path): void
    {
        $file = $path . '/.htaccess';
        if (is_file($file)) {
            return;
        }
        @file_put_contents($file, <<<HT
        # Zoro: yükleme klasöründe betik çalıştırma kapalı
        <IfModule mod_php.c>
            php_flag engine off
        </IfModule>
        <IfModule mod_php7.c>
            php_flag engine off
        </IfModule>
        <IfModule mod_php8.c>
            php_flag engine off
        </IfModule>
        RemoveHandler .php .phtml .phar .php5 .php7 .php8 .pht
        RemoveType .php .phtml .phar
        Options -ExecCGI -Indexes
        <FilesMatch "\.(php\d?|phtml|phar|pht|cgi|pl|py|sh|svg)$">
            Require all denied
        </FilesMatch>
        <FilesMatch "^\.">
            Require all denied
        </FilesMatch>

        HT);
    }

    /** Veri klasörüne tüm erişimi kapat. */
    public static function denyDir(string $path): void
    {
        $file = $path . '/.htaccess';
        if (!is_file($file)) {
            @file_put_contents($file, "Require all denied\nDeny from all\n");
        }
        if (!is_file($path . '/index.html')) {
            @file_put_contents($path . '/index.html', '');
        }
    }

    public static function mimeToExt(string $mime): string
    {
        return match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/avif' => 'avif',
            'application/pdf' => 'pdf',
            'video/mp4' => 'mp4',
            default => 'bin',
        };
    }

    public static function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes . ' B';
        }
        if ($bytes < 1048576) {
            return round($bytes / 1024, 1) . ' KB';
        }
        return round($bytes / 1048576, 1) . ' MB';
    }

    /** Klasör yolu doğrulama: "bloglar/2026" gibi; her parça slug olmalı. */
    public static function cleanFolder(?string $folder): string
    {
        $folder = trim(str_replace('\\', '/', (string) $folder), '/');
        if ($folder === '') {
            return '';
        }
        $parts = [];
        foreach (explode('/', $folder) as $p) {
            $s = self::slugify($p, '');
            if ($s === '') {
                throw new \InvalidArgumentException('Geçersiz klasör adı');
            }
            $parts[] = $s;
        }
        if (count($parts) > 5) {
            throw new \InvalidArgumentException('Klasör derinliği en fazla 5 olabilir');
        }
        return implode('/', $parts);
    }
}
