<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * On-the-fly image resizing:  /img/w640-q75/2026/10/photo.jpg
 * Only the width/quality lists from the config are accepted (prevents attacks that fill
 * disk/CPU by generating unlimited variants); the requested value is rounded up to the next allowed one.
 */
final class ImageServer
{
    private Config $config;

    /** @param array<string,mixed>|Config $config */
    public function __construct(array|Config $config)
    {
        $this->config = $config instanceof Config ? $config : new Config($config);
    }

    public static function run(array|Config $config, ?string $path = null): never
    {
        (new self($config))->serve($path ?? (string) ($_SERVER['PATH_INFO'] ?? $_GET['p'] ?? ''));
        exit;
    }

    public function serve(string $path): void
    {
        $path = trim(str_replace('\\', '/', $path), '/');
        if ($path === '' || str_contains($path, '..') || str_contains($path, "\0")) {
            $this->fail(400);
        }
        $parts = explode('/', $path, 2);
        if (count($parts) < 2 || !preg_match('/^(?:w(\d+))?-?(?:q(\d+))?$/', $parts[0], $m)) {
            $this->fail(400);
        }
        $width = $this->snap((int) ($m[1] ?? 0) ?: 768, (array) $this->config->get('image_cache.widths'));
        $quality = $this->snap((int) ($m[2] ?? 0) ?: 75, (array) $this->config->get('image_cache.qualities'));

        $root = realpath((string) $this->config->get('upload.path'));
        $source = $root ? realpath($root . '/' . $parts[1]) : false;
        if (!$root || !$source || !str_starts_with($source, $root . DIRECTORY_SEPARATOR) || !is_file($source)) {
            $this->fail(404);
        }

        $accept = (string) ($_SERVER['HTTP_ACCEPT'] ?? '');
        $format = str_contains($accept, 'image/avif') && function_exists('imageavif') ? 'avif' : (str_contains($accept, 'image/webp') ? 'webp' : 'orig');
        $maxAge = (int) $this->config->get('image_cache.max_age', 31536000);
        $cacheDir = (string) $this->config->get('image_cache.path');
        Support::ensureDir($cacheDir);
        Support::denyDir($cacheDir);
        $key = sha1($parts[1] . '|' . filemtime($source) . "|$width|$quality|$format");
        $cacheFile = "$cacheDir/" . substr($key, 0, 2) . "/$key";

        header('Vary: Accept');
        header("Cache-Control: public, max-age=$maxAge, immutable");
        header('X-Content-Type-Options: nosniff');

        if (is_file($cacheFile) && is_file("$cacheFile.type")) {
            $this->send((string) file_get_contents("$cacheFile.type"), $cacheFile);
            return;
        }
        $res = (new ImageProcessor())->resizeOnTheFly($source, $width, $quality, $format);
        if ($res === null) {
            $this->fail(415);
        }
        [$data, $mime] = $res;
        Support::ensureDir(dirname($cacheFile));
        file_put_contents($cacheFile, $data, LOCK_EX);
        file_put_contents("$cacheFile.type", $mime, LOCK_EX);
        header("Content-Type: $mime");
        header('Content-Length: ' . strlen($data));
        echo $data;
    }

    /** @param list<int> $allowed */
    private function snap(int $value, array $allowed): int
    {
        sort($allowed);
        foreach ($allowed as $a) {
            if ($value <= $a) {
                return (int) $a;
            }
        }
        return (int) end($allowed);
    }

    private function send(string $mime, string $file): void
    {
        header("Content-Type: $mime");
        header('Content-Length: ' . filesize($file));
        readfile($file);
    }

    private function fail(int $code): never
    {
        http_response_code($code);
        header('Content-Type: text/plain; charset=utf-8');
        echo match ($code) {
            404 => Lang::t('image_not_found'),
            415 => Lang::t('image_failed'),
            default => Lang::t('bad_request'),
        };
        exit;
    }
}
