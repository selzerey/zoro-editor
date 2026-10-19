<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * GD ile görsel işleme: yön düzeltme (EXIF), küçültme, kırpma, WebP varyantları.
 * Yeniden kodlama, dosyaya gizlenmiş içerikleri ve EXIF (konum vb.) verisini de temizler.
 */
final class ImageProcessor
{
    /** @param array<string, array{width:int, height:?int, crop?:bool, quality?:int}> $variants */
    public function __construct(private array $variants = [])
    {
    }

    public static function available(): bool
    {
        return extension_loaded('gd') && function_exists('imagewebp');
    }

    /** @return array{width:int, height:int, mime:string}|null */
    public function inspect(string $path): ?array
    {
        $info = @getimagesize($path);
        if (!$info || $info[0] < 1 || $info[1] < 1) {
            return null;
        }
        return ['width' => (int) $info[0], 'height' => (int) $info[1], 'mime' => (string) $info['mime']];
    }

    /**
     * Yüklenen görseli normalleştir: EXIF yönünü uygula, çok büyükse küçült, yeniden kodla.
     * GIF (animasyon) ve GD'nin açamadığı türler olduğu gibi bırakılır.
     * @return array{width:int, height:int}|null
     */
    public function normalize(string $path, string $mime, int $maxWidth, int $quality, ?string $outPath = null, ?string $outMime = null): ?array
    {
        $outPath ??= $path;
        $outMime ??= $mime;
        if ($mime === 'image/gif' || !self::available()) {
            $i = $this->inspect($path);
            return $i ? ['width' => $i['width'], 'height' => $i['height']] : null;
        }
        $img = $this->load($path, $mime);
        if (!$img) {
            return null;
        }
        $img = $this->applyExifOrientation($img, $path, $mime);
        $w = imagesx($img);
        $h = imagesy($img);
        if ($maxWidth > 0 && $w > $maxWidth) {
            $nh = (int) round($h * $maxWidth / $w);
            $img = $this->resample($img, $maxWidth, $nh);
            [$w, $h] = [$maxWidth, $nh];
        }
        $ok = $this->save($img, $outPath, $outMime, $quality);
        imagedestroy($img);
        return $ok ? ['width' => $w, 'height' => $h] : null;
    }

    /**
     * @return array<string, array{filename:string, width:int, height:int, size:int}>
     */
    public function generateVariants(string $sourcePath, string $mime, string $destDir, string $baseName): array
    {
        if (!self::available() || $mime === 'image/gif') {
            return [];
        }
        $src = $this->load($sourcePath, $mime);
        if (!$src) {
            return [];
        }
        $sw = imagesx($src);
        $sh = imagesy($src);
        $out = [];
        foreach ($this->variants as $name => $o) {
            $tw = (int) $o['width'];
            $th = isset($o['height']) ? (int) $o['height'] : 0;
            $crop = !empty($o['crop']);
            $q = (int) ($o['quality'] ?? 80);
            if (!$crop && $sw <= $tw) {
                continue; // orijinal zaten küçük
            }
            if ($crop && $tw && $th) {
                $img = $this->cropResize($src, $sw, $sh, $tw, $th);
                $fw = $tw;
                $fh = $th;
            } else {
                $fw = $tw;
                $fh = (int) round($sh * $tw / $sw);
                $img = $this->resample($src, $fw, $fh, false);
            }
            $file = "$baseName-$name.webp";
            if (imagewebp($img, "$destDir/$file", $q)) {
                $out[$name] = ['filename' => $file, 'width' => $fw, 'height' => $fh, 'size' => (int) filesize("$destDir/$file")];
            }
            imagedestroy($img);
        }
        imagedestroy($src);
        return $out;
    }

    /** Anlık boyutlandırma. Dönen dizi: [ikili veri, mime] */
    public function resizeOnTheFly(string $sourcePath, int $width, int $quality, string $format): ?array
    {
        $info = $this->inspect($sourcePath);
        if (!$info) {
            return null;
        }
        if ($width >= $info['width'] || $info['mime'] === 'image/gif' || !self::available()) {
            // Küçültmeye gerek yok: orijinali kendi türüyle döndür
            return [(string) file_get_contents($sourcePath), $info['mime']];
        }
        $src = $this->load($sourcePath, $info['mime']);
        if (!$src) {
            return null;
        }
        $h = (int) round($info['height'] * $width / $info['width']);
        $img = $this->resample($src, $width, $h);
        ob_start();
        if ($format === 'webp') {
            imagewebp($img, null, $quality);
            $mime = 'image/webp';
        } elseif ($format === 'avif' && function_exists('imageavif')) {
            imageavif($img, null, $quality);
            $mime = 'image/avif';
        } elseif ($info['mime'] === 'image/png') {
            imagepng($img, null, 7);
            $mime = 'image/png';
        } else {
            imagejpeg($img, null, $quality);
            $mime = 'image/jpeg';
        }
        $data = (string) ob_get_clean();
        imagedestroy($img);
        return [$data, $mime];
    }

    // ───────────────────────── iç işlemler ─────────────────────────

    private function load(string $path, string $mime): ?\GdImage
    {
        $img = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/gif' => @imagecreatefromgif($path),
            'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false,
            'image/avif' => function_exists('imagecreatefromavif') ? @imagecreatefromavif($path) : false,
            default => false,
        };
        return $img instanceof \GdImage ? $img : null;
    }

    private function save(\GdImage $img, string $path, string $mime, int $quality): bool
    {
        return match ($mime) {
            'image/jpeg' => imagejpeg($img, $path, $quality),
            'image/png' => (function () use ($img, $path) {
                imagesavealpha($img, true);
                return imagepng($img, $path, 7);
            })(),
            'image/webp' => imagewebp($img, $path, $quality),
            'image/avif' => function_exists('imageavif') && imageavif($img, $path, $quality),
            default => false,
        };
    }

    private function applyExifOrientation(\GdImage $img, string $path, string $mime): \GdImage
    {
        if ($mime !== 'image/jpeg' || !function_exists('exif_read_data')) {
            return $img;
        }
        $exif = @exif_read_data($path);
        $o = (int) ($exif['Orientation'] ?? 1);
        $rotated = match ($o) {
            3 => imagerotate($img, 180, 0),
            6 => imagerotate($img, -90, 0),
            8 => imagerotate($img, 90, 0),
            default => null,
        };
        if ($rotated instanceof \GdImage) {
            imagedestroy($img);
            return $rotated;
        }
        return $img;
    }

    private function resample(\GdImage $src, int $w, int $h, bool $destroySrc = true): \GdImage
    {
        $dst = imagecreatetruecolor(max(1, $w), max(1, $h));
        $this->transparent($dst);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $w, $h, imagesx($src), imagesy($src));
        if ($destroySrc) {
            imagedestroy($src);
        }
        return $dst;
    }

    private function cropResize(\GdImage $src, int $sw, int $sh, int $tw, int $th): \GdImage
    {
        $sr = $sw / $sh;
        $tr = $tw / $th;
        if ($sr > $tr) {
            $cw = (int) round($sh * $tr);
            $ch = $sh;
            $cx = (int) round(($sw - $cw) / 2);
            $cy = 0;
        } else {
            $cw = $sw;
            $ch = (int) round($sw / $tr);
            $cx = 0;
            $cy = (int) round(($sh - $ch) / 2);
        }
        $dst = imagecreatetruecolor($tw, $th);
        $this->transparent($dst);
        imagecopyresampled($dst, $src, 0, 0, $cx, $cy, $tw, $th, $cw, $ch);
        return $dst;
    }

    private function transparent(\GdImage $img): void
    {
        imagealphablending($img, false);
        imagesavealpha($img, true);
        imagefill($img, 0, 0, imagecolorallocatealpha($img, 0, 0, 0, 127));
    }
}
