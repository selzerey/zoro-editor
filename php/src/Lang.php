<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * Messages shown to users by the media API (Finder displays them).
 * Set the language with 'locale' => 'en' | 'tr' in php/config.php.
 */
final class Lang
{
    public static string $locale = 'en';

    private const MESSAGES = [
        'en' => [
            'post_required' => 'This action requires POST.',
            'not_found' => 'Media not found.',
            'unknown_action' => 'Unknown action.',
            'server_error' => 'Server error. See the server log for details.',
            'post_max_size' => 'The file exceeds the server limit (post_max_size).',
            'no_file' => 'No file was received.',
            'alt_required' => 'Alt text is required.',
            'not_configured' => 'Zoro media API is not configured: define "auth" in php/config.php.',
            'forbidden' => 'You are not allowed to do this.',
            'csrf' => 'Session check failed (CSRF). Please reload the page.',
            'nothing_selected' => 'No file selected.',
            'upload_max_filesize' => 'The file exceeds the server limit (upload_max_filesize).',
            'upload_partial' => 'The file was only partly uploaded. Please try again.',
            'upload_failed' => 'The file could not be uploaded (code {code}).',
            'invalid_upload' => 'Invalid upload.',
            'empty_file' => 'The file is empty.',
            'too_large' => 'The file is too large. Maximum: {max}.',
            'unsupported_type' => 'Unsupported file type: {mime}',
            'broken_image' => 'The image could not be read (damaged file).',
            'invalid_filename' => 'Invalid file name.',
            'folder_required' => 'A folder name is required.',
            'folder_not_empty' => 'The folder is not empty.',
            'invalid_folder' => 'Invalid folder name.',
            'folder_depth' => 'Folders can be nested at most 5 levels deep.',
            'image_not_found' => 'Image not found',
            'image_failed' => 'The image could not be processed',
            'bad_request' => 'Bad request',
        ],
        'tr' => [
            'post_required' => 'Bu işlem için POST gerekli.',
            'not_found' => 'Medya bulunamadı.',
            'unknown_action' => 'Bilinmeyen işlem.',
            'server_error' => 'Sunucu hatası. Ayrıntı için sunucu günlüğüne bakın.',
            'post_max_size' => 'Dosya sunucu sınırını aşıyor (post_max_size).',
            'no_file' => 'Dosya bulunamadı.',
            'alt_required' => 'ALT metni zorunludur.',
            'not_configured' => 'Zoro medya API yapılandırılmamış: php/config.php içinde "auth" tanımlayın.',
            'forbidden' => 'Bu işlem için yetkiniz yok.',
            'csrf' => 'Oturum doğrulaması başarısız (CSRF). Sayfayı yenileyin.',
            'nothing_selected' => 'Dosya seçilmedi.',
            'upload_max_filesize' => 'Dosya sunucu sınırını aşıyor (upload_max_filesize).',
            'upload_partial' => 'Dosya yarım yüklendi, tekrar deneyin.',
            'upload_failed' => 'Dosya yüklenemedi (kod {code}).',
            'invalid_upload' => 'Geçersiz yükleme.',
            'empty_file' => 'Dosya boş.',
            'too_large' => 'Dosya çok büyük. En fazla {max}.',
            'unsupported_type' => 'Desteklenmeyen dosya türü: {mime}',
            'broken_image' => 'Görsel okunamadı (bozuk dosya).',
            'invalid_filename' => 'Geçersiz dosya adı.',
            'folder_required' => 'Klasör adı gerekli.',
            'folder_not_empty' => 'Klasör boş değil.',
            'invalid_folder' => 'Geçersiz klasör adı.',
            'folder_depth' => 'Klasör derinliği en fazla 5 olabilir.',
            'image_not_found' => 'Görsel bulunamadı',
            'image_failed' => 'Görsel işlenemedi',
            'bad_request' => 'Geçersiz istek',
        ],
    ];

    /** @param array<string, string|int> $vars */
    public static function t(string $key, array $vars = []): string
    {
        $text = self::MESSAGES[self::$locale][$key] ?? self::MESSAGES['en'][$key] ?? $key;
        foreach ($vars as $k => $v) {
            $text = str_replace('{' . $k . '}', (string) $v, $text);
        }
        return $text;
    }
}
