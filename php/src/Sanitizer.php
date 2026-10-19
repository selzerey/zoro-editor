<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * Sunucu tarafı HTML temizleyici — editörün ürettiği etiketlere izin verir, gerisini atar.
 * Tarayıcıdaki kontroller atlatılabilir; veritabanına yazmadan önce MUTLAKA bunu çağır:
 *
 *   $temiz = \Zoro\Editor\Sanitizer::clean($_POST['icerik']);
 */
final class Sanitizer
{
    /** etiket => izinli öznitelikler */
    private const TAGS = [
        'p' => ['style'], 'br' => [], 'hr' => [],
        'h1' => ['style', 'id'], 'h2' => ['style', 'id'], 'h3' => ['style', 'id'], 'h4' => ['style', 'id'], 'h5' => ['style', 'id'], 'h6' => ['style', 'id'],
        'strong' => [], 'b' => [], 'em' => [], 'i' => [], 'u' => [], 's' => [], 'del' => [], 'strike' => [], 'sub' => [], 'sup' => [],
        'code' => [], 'pre' => [], 'blockquote' => [], 'mark' => ['style', 'data-color'], 'span' => ['style'],
        'ul' => [], 'ol' => ['start', 'type'], 'li' => [],
        'a' => ['href', 'title', 'target', 'rel'],
        'img' => ['src', 'alt', 'title', 'width', 'height', 'srcset', 'sizes', 'loading', 'decoding', 'class', 'style', 'data-alignment', 'role'],
        'figure' => ['class', 'style', 'data-alignment'], 'figcaption' => ['class'],
        'table' => ['style'], 'colgroup' => [], 'col' => ['style', 'span'], 'thead' => [], 'tbody' => [], 'tfoot' => [], 'tr' => [],
        'th' => ['colspan', 'rowspan', 'colwidth', 'style'], 'td' => ['colspan', 'rowspan', 'colwidth', 'style'],
        'div' => ['data-youtube-video', 'class'],
        'iframe' => ['src', 'width', 'height', 'allowfullscreen', 'allow', 'frameborder', 'title', 'loading', 'referrerpolicy'],
    ];

    /** İçeriğiyle birlikte silinecek etiketler. */
    private const DROP = ['script', 'style', 'noscript', 'template', 'object', 'embed', 'applet', 'form', 'input', 'button', 'select', 'textarea', 'svg', 'math', 'link', 'meta', 'base', 'head', 'title', 'frame', 'frameset'];

    private const CSS = ['text-align', 'color', 'background-color', 'display', 'margin', 'margin-left', 'margin-right', 'width', 'min-width', 'max-width', 'float'];

    /** @var list<string> */
    private const IFRAME_HOSTS = ['www.youtube-nocookie.com', 'youtube-nocookie.com', 'www.youtube.com', 'youtube.com', 'player.vimeo.com'];

    public static function clean(string $html): string
    {
        $html = trim($html);
        if ($html === '') {
            return '';
        }
        $wrapped = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div id="__zoro_root">' . $html . '</div></body></html>';
        // PHP 8.4+: tarayıcılarla aynı HTML5 ayrıştırıcısı (mutation-XSS'e karşı). Eski sürümler: libxml.
        if (self::$useHtml5 && class_exists(\Dom\HTMLDocument::class)) {
            $doc = \Dom\HTMLDocument::createFromString($wrapped, LIBXML_NOERROR);
        } else {
            $doc = new \DOMDocument('1.0', 'UTF-8');
            $prev = libxml_use_internal_errors(true);
            $doc->loadHTML('<?xml encoding="UTF-8">' . $wrapped, LIBXML_NONET | LIBXML_COMPACT | LIBXML_HTML_NODEFDTD);
            libxml_clear_errors();
            libxml_use_internal_errors($prev);
        }
        $root = $doc->getElementById('__zoro_root');
        if (!$root) {
            return '';
        }
        self::walk($root);
        $out = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $out .= $doc instanceof \DOMDocument ? $doc->saveHTML($child) : $doc->saveHtml($child);
        }
        return trim($out);
    }

    /** Testler için: false = eski (libxml) ayrıştırıcıyı zorla. */
    public static bool $useHtml5 = true;

    /** @param \DOMNode|\Dom\Node $node */
    private static function walk(object $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            $type = $child->nodeType;
            if ($type === XML_COMMENT_NODE || $type === XML_PI_NODE || $type === XML_CDATA_SECTION_NODE) {
                $node->removeChild($child);
                continue;
            }
            if ($type !== XML_ELEMENT_NODE) {
                continue;
            }
            $tag = strtolower((string) ($child->localName ?? $child->tagName));
            if (in_array($tag, self::DROP, true)) {
                $node->removeChild($child);
                continue;
            }
            if (!isset(self::TAGS[$tag]) || str_contains($tag, ':')) {
                // Bilinmeyen etiket: kendisini at, içeriğini koru
                self::walk($child);
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);
                continue;
            }
            self::cleanAttributes($child, $tag);
            if ($tag === 'iframe' && !$child->hasAttribute('src')) {
                $node->removeChild($child);
                continue;
            }
            self::walk($child);
        }
    }

    /** @param \DOMElement|\Dom\Element $el */
    private static function cleanAttributes(object $el, string $tag): void
    {
        $allowed = self::TAGS[$tag];
        foreach (iterator_to_array($el->attributes) as $attr) {
            $name = strtolower($attr->name);
            $value = trim($attr->value);
            if (!in_array($name, $allowed, true) || str_starts_with($name, 'on')) {
                $el->removeAttribute($attr->name);
                continue;
            }
            $clean = match ($name) {
                'href' => self::url($value, true),
                'src' => $tag === 'iframe' ? self::iframeSrc($value) : self::url($value, false),
                'srcset' => self::srcset($value),
                'style' => self::style($value),
                'class' => self::classes($value),
                'target' => $value === '_blank' ? '_blank' : null,
                'rel' => self::rel($value),
                'width', 'height', 'colspan', 'rowspan', 'start', 'span' => ctype_digit($value) && (int) $value < 10000 ? $value : null,
                'colwidth' => preg_match('/^[\d,]+$/', $value) ? $value : null,
                'loading' => in_array($value, ['lazy', 'eager'], true) ? $value : null,
                'decoding' => in_array($value, ['async', 'sync', 'auto'], true) ? $value : null,
                'data-alignment' => in_array($value, ['left', 'center', 'right'], true) ? $value : null,
                'role' => $value === 'presentation' ? 'presentation' : null,
                'type' => in_array($value, ['1', 'a', 'A', 'i', 'I'], true) ? $value : null,
                'id' => preg_match('/^[a-z][\w-]{0,80}$/i', $value) ? $value : null,
                'data-youtube-video', 'allowfullscreen' => '',
                'frameborder' => '0',
                'allow' => 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                'referrerpolicy' => 'strict-origin-when-cross-origin',
                default => mb_substr($value, 0, 500),
            };
            if ($clean === null || ($clean === '' && !in_array($name, ['alt', 'data-youtube-video', 'allowfullscreen'], true))) {
                $el->removeAttribute($attr->name);
            } else {
                $el->setAttribute($attr->name, $clean);
            }
        }
        // target=_blank bağlantılarına noopener zorunlu
        if ($tag === 'a' && $el->getAttribute('target') === '_blank') {
            $rel = preg_split('/\s+/', (string) $el->getAttribute('rel'), -1, PREG_SPLIT_NO_EMPTY) ?: [];
            $el->setAttribute('rel', implode(' ', array_unique([...$rel, 'noopener', 'noreferrer'])));
        }
        if ($tag === 'div' && !$el->hasAttribute('data-youtube-video')) {
            $el->removeAttribute('class');
        }
    }

    public static function url(string $url, bool $allowMail): ?string
    {
        $u = (string) preg_replace('/[\x00-\x20\x7F]+/', '', html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        if ($u === '') {
            return null;
        }
        if (preg_match('#^(/|\#|\?|\.)#', $u)) {
            return str_starts_with($u, '//') ? 'https:' . $u : $url;
        }
        if (!preg_match('/^([a-z][a-z0-9+.-]*):/i', $u, $m)) {
            return $url; // şemasız göreli adres
        }
        $scheme = strtolower($m[1]);
        $ok = $allowMail ? ['http', 'https', 'mailto', 'tel', 'sms', 'ftp'] : ['http', 'https'];
        return in_array($scheme, $ok, true) ? $url : null;
    }

    private static function iframeSrc(string $src): ?string
    {
        $u = self::url($src, false);
        if ($u === null) {
            return null;
        }
        $host = strtolower((string) parse_url(str_starts_with($u, '//') ? 'https:' . $u : $u, PHP_URL_HOST));
        return in_array($host, self::IFRAME_HOSTS, true) ? $u : null;
    }

    private static function srcset(string $v): ?string
    {
        $parts = [];
        foreach (explode(',', $v) as $p) {
            $p = trim($p);
            if ($p === '') {
                continue;
            }
            $bits = preg_split('/\s+/', $p);
            $url = self::url((string) $bits[0], false);
            if ($url === null || (isset($bits[1]) && !preg_match('/^\d+(\.\d+)?[wx]$/', $bits[1]))) {
                return null;
            }
            $parts[] = $url . (isset($bits[1]) ? ' ' . $bits[1] : '');
        }
        return $parts ? implode(', ', $parts) : null;
    }

    private static function style(string $css): ?string
    {
        $out = [];
        foreach (explode(';', $css) as $decl) {
            if (!str_contains($decl, ':')) {
                continue;
            }
            [$prop, $val] = array_map('trim', explode(':', $decl, 2));
            $prop = strtolower($prop);
            if (!in_array($prop, self::CSS, true)) {
                continue;
            }
            // url(), expression(), javascript:, @import, \ kaçışları yasak
            if (preg_match('/url\s*\(|expression|javascript|@import|\\\\|behavior|<|>/i', $val)) {
                continue;
            }
            if (!preg_match('/^[#\w\s.,%()+-]{1,80}$/', $val)) {
                continue;
            }
            $out[] = "$prop: $val";
        }
        return $out ? implode('; ', $out) . ';' : null;
    }

    private static function classes(string $v): ?string
    {
        $ok = array_filter(preg_split('/\s+/', $v) ?: [], fn ($c) => in_array($c, ['alignleft', 'aligncenter', 'alignright', 'alignnone', 'wp-caption', 'wp-caption-text'], true));
        return $ok ? implode(' ', $ok) : null;
    }

    private static function rel(string $v): ?string
    {
        $ok = array_filter(preg_split('/\s+/', strtolower($v)) ?: [], fn ($r) => in_array($r, ['noopener', 'noreferrer', 'nofollow', 'sponsored', 'ugc', 'external'], true));
        return $ok ? implode(' ', array_unique($ok)) : null;
    }
}
