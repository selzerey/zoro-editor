<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * PHP sayfalarında tek satırla editör:
 *
 *   <?= \Zoro\Editor\Editor::render('icerik', $yazi['icerik'], ['preset' => 'blog', 'media' => '/zoro/media.php']) ?>
 *
 * Script etiketi sayfada yalnızca bir kez basılır.
 */
final class Editor
{
    /** Varsayılan betik adresi (kendi sunucundaki dist/zoro-editor.iife.js ya da CDN). */
    public static string $scriptUrl = 'https://cdn.jsdelivr.net/gh/selzerey/zoro-editor@v1.0.0/dist/zoro-editor.iife.js';

    private static bool $scriptPrinted = false;

    /**
     * @param array{
     *   preset?: string, groups?: list<string>, addGroups?: list<string>, removeGroups?: list<string>,
     *   media?: string|false, height?: int, placeholder?: string, theme?: string, locale?: string,
     *   maxLength?: int, autosave?: string, readOnly?: bool, id?: string, csrf?: string,
     *   options?: array<string,mixed>, script?: string|false
     * } $o
     */
    public static function render(string $name, ?string $value = '', array $o = []): string
    {
        $attrs = [
            'name' => $name,
            'id' => $o['id'] ?? 'zoro-' . preg_replace('/[^a-z0-9_-]/i', '-', $name),
            'data-zoro-editor' => '',
        ];
        $map = ['preset' => 'data-preset', 'height' => 'data-height', 'placeholder' => 'data-placeholder', 'theme' => 'data-theme', 'skin' => 'data-skin', 'locale' => 'data-locale', 'maxLength' => 'data-max-length', 'autosave' => 'data-autosave', 'csrf' => 'data-csrf-token'];
        foreach ($map as $k => $attr) {
            if (isset($o[$k]) && $o[$k] !== '') {
                $attrs[$attr] = (string) $o[$k];
            }
        }
        foreach (['groups' => 'data-groups', 'addGroups' => 'data-add-groups', 'removeGroups' => 'data-remove-groups'] as $k => $attr) {
            if (!empty($o[$k])) {
                $attrs[$attr] = implode(',', (array) $o[$k]);
            }
        }
        if (array_key_exists('media', $o)) {
            if ($o['media'] === false) {
                $attrs['data-media'] = 'false';
            } elseif (is_string($o['media'])) {
                $attrs['data-media-endpoint'] = $o['media'];
            }
        }
        if (!empty($o['readOnly'])) {
            $attrs['data-readonly'] = 'true';
        }
        if (!empty($o['options'])) {
            $attrs['data-options'] = json_encode($o['options'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        $html = '<textarea';
        foreach ($attrs as $k => $v) {
            $html .= ' ' . $k . ($v === '' ? '' : '="' . self::e((string) $v) . '"');
        }
        $html .= '>' . self::e((string) $value) . '</textarea>';

        $script = $o['script'] ?? self::$scriptUrl;
        if ($script !== false && !self::$scriptPrinted) {
            self::$scriptPrinted = true;
            $html .= "\n" . self::script((string) $script);
        }
        return $html;
    }

    /** Sadece script etiketi (editörleri kendin yerleştiriyorsan). */
    public static function script(?string $src = null): string
    {
        self::$scriptPrinted = true;
        return '<script src="' . self::e($src ?? self::$scriptUrl) . '" defer></script>';
    }

    private static function e(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
