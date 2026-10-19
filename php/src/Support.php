<?php

declare(strict_types=1);

namespace Zoro\Editor;

final class Support
{
    /** Turkish-aware slug: "Kırmızı Şemsiye.JPG" → "kirmizi-semsiye" */
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

    /** File name without extension ("photo.final.jpg" → "photo.final") */
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
            throw new \RuntimeException('Could not create the folder: ' . basename($path));
        }
    }

    /** .htaccess that disables PHP execution in the upload folder (Apache/LiteSpeed). */
    public static function protectUploadDir(string $path): void
    {
        $file = $path . '/.htaccess';
        if (is_file($file)) {
            return;
        }
        @file_put_contents($file, <<<HT
        # Zoro: script execution disabled in the upload folder
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

    /** Block all access to the data folder. */
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

    /** Folder path validation: like "blogs/2026"; every segment must be a slug. */
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
                throw new \InvalidArgumentException(Lang::t('invalid_folder'));
            }
            $parts[] = $s;
        }
        if (count($parts) > 5) {
            throw new \InvalidArgumentException(Lang::t('folder_depth'));
        }
        return implode('/', $parts);
    }
}
