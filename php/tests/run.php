<?php
/**
 * Bağımlılıksız PHP testleri:  php php/tests/run.php
 */
declare(strict_types=1);

require dirname(__DIR__) . '/autoload.php';

use Zoro\Editor\{Config, MediaStore, Sanitizer, Support, UserError, Editor};

$pass = 0;
$fail = 0;
function check(string $name, bool $ok, string $detail = ''): void
{
    global $pass, $fail;
    if ($ok) {
        $pass++;
        echo "  \u{2713} $name\n";
    } else {
        $fail++;
        echo "  \u{2717} $name" . ($detail !== '' ? "\n      → $detail" : '') . "\n";
    }
}

echo "Sanitizer\n";
$xss = [
    '<script>alert(1)</script><p>a</p>' => '<p>a</p>',
    '<p onclick="alert(1)">a</p>' => '<p>a</p>',
    '<a href="javascript:alert(1)">x</a>' => '<a>x</a>',
    '<a href="JaVa&#x09;Script:alert(1)">x</a>' => '<a>x</a>',
    '<a href="https://a.com" target="_blank">x</a>' => '<a href="https://a.com" target="_blank" rel="noopener noreferrer">x</a>',
    '<img src="x" onerror="alert(1)">' => '<img src="x">',
    '<img src="data:image/svg+xml,<svg onload=alert(1)>">' => '<img>',
    '<p style="color:red;background:url(javascript:x)">a</p>' => '<p style="color: red;">a</p>',
    '<p style="text-align: center; position: fixed">a</p>' => '<p style="text-align: center;">a</p>',
    '<iframe src="https://evil.com"></iframe>' => '',
    '<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/abc" width="640" height="360"></iframe></div>' => '<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/abc" width="640" height="360"></iframe></div>',
    '<svg><script>alert(1)</script></svg><p>b</p>' => '<p>b</p>',
    '<custom-tag>içerik</custom-tag>' => 'içerik',
    '<img src="/a.jpg" class="aligncenter evil" data-alignment="center" style="display:block;margin-left:auto;margin-right:auto">' => '<img src="/a.jpg" class="aligncenter" data-alignment="center" style="display: block; margin-left: auto; margin-right: auto;">',
    '<p>Türkçe ğüşiöç İ</p>' => '<p>Türkçe ğüşiöç İ</p>',
    '<form action="/x"><input name="a"></form><p>c</p>' => '<p>c</p>',
    '<a href="mailto:a@b.com" rel="nofollow evil">m</a>' => '<a href="mailto:a@b.com" rel="nofollow">m</a>',
    '<!-- yorum --><p>d</p>' => '<p>d</p>',
];
// Mutation-XSS vektörleri: sonuçta olay öznitelikli öğe kalmamalı
$mxss = [
    '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></noscript>',
    '<svg><style><img src=x onerror=alert(1)></style></svg>',
    '<math><mi><table><mglyph><style><img src=x onerror=alert(1)></style></mglyph></table></mi></math>',
    '<form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>',
    '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">x</a>',
    '<p><a href=" javascript:alert(1)">x</a></p>',
    '<img srcset="x 1x, javascript:alert(1) 2x" src="/a.jpg">',
    '<div data-youtube-video><iframe src="javascript:alert(1)"></iframe></div>',
    '<iframe srcdoc="<script>alert(1)</script>" src="https://www.youtube.com/embed/x"></iframe>',
];
$parsers = class_exists(\Dom\HTMLDocument::class) ? ['HTML5 (Dom\HTMLDocument)' => true, 'libxml' => false] : ['libxml' => false];
foreach ($parsers as $label => $html5) {
    Sanitizer::$useHtml5 = $html5;
    echo "  — ayrıştırıcı: $label\n";
    foreach ($xss as $in => $expected) {
        $out = Sanitizer::clean($in);
        check(mb_strimwidth($in, 0, 60, '…'), $out === $expected, "beklenen: $expected\n        gelen:    $out");
    }
    foreach ($mxss as $in) {
        $out = Sanitizer::clean($in);
        $ok = !preg_match('/\son\w+\s*=|javascript:|srcdoc|<script|<style|<svg|<math/i', $out);
        check('mXSS: ' . mb_strimwidth($in, 0, 52, '…'), $ok, "gelen: $out");
    }
}
Sanitizer::$useHtml5 = true;

echo "\nSupport\n";
check('slugify Türkçe', Support::slugify('Kırmızı Şemsiye İSTANBUL.JPG') === 'kirmizi-semsiye-istanbul-jpg' || Support::slugify(Support::basename('Kırmızı Şemsiye İSTANBUL.JPG')) === 'kirmizi-semsiye-istanbul');
check('slugify boş → yedek', Support::slugify('***') === 'gorsel');
check('cleanFolder', Support::cleanFolder('/Blog Yazıları/2026/') === 'blog-yazilari/2026');
try {
    Support::cleanFolder('../../etc');
    check('cleanFolder traversal', false, 'istisna bekleniyordu');
} catch (\InvalidArgumentException) {
    check('cleanFolder traversal reddedilir', true);
}

echo "\nMediaStore\n";
$tmp = sys_get_temp_dir() . '/zoro-test-' . bin2hex(random_bytes(4));
mkdir($tmp);
$store = new MediaStore(new Config(['upload' => ['path' => "$tmp/uploads", 'url_base' => '/uploads'], 'auth' => fn () => true]));

function makeJpeg(string $path, int $w, int $h, int $seed = 0): void
{
    $im = imagecreatetruecolor($w, $h);
    imagefill($im, 0, 0, imagecolorallocate($im, 40 + $seed, 120, 200));
    imagestring($im, 5, 10, 10, "zoro $seed", imagecolorallocate($im, 255, 255, 255));
    imagejpeg($im, $path, 90);
    imagedestroy($im);
}

makeJpeg("$tmp/kedi.jpg", 2000, 1000);
$a = $store->importFile("$tmp/kedi.jpg", 'Sevimli Kedi.jpg', 'Bir kedi');
check('yükleme kaydı', $a['id'] === 1 && $a['alt'] === 'Bir kedi' && $a['mime'] === 'image/jpeg');
check('URL ve dosya', str_starts_with($a['url'], '/uploads/' . date('Y/m') . '/sevimli-kedi') && is_file("$tmp/uploads/" . date('Y/m') . '/' . $a['filename']));
check('max_width küçültmesi (2000→2560 sınırı altı korunur)', $a['width'] === 2000 && $a['height'] === 1000);
$v = (array) $a['variants'];
check('varyantlar üretildi', isset($v['thumb'], $v['sm'], $v['md'], $v['lg'], $v['xl']), implode(',', array_keys($v)));
check('thumb 150x150', ((array) $v['thumb'])['width'] === 150 && ((array) $v['thumb'])['height'] === 150);
check('srcset', is_string($a['srcset']) && str_contains($a['srcset'], ' 480w') && str_contains($a['srcset'], ' 2000w'));
check('sha256 dışarı verilmez', !isset($a['sha256']));

$dup = $store->importFile("$tmp/kedi.jpg", 'kopya.jpg', 'x');
check('aynı dosya tekrar yüklenmez (SHA-256)', ($dup['duplicate'] ?? false) === true && $dup['id'] === 1);

makeJpeg("$tmp/kopek.jpg", 300, 200, 50);
$b = $store->importFile("$tmp/kopek.jpg", 'köpek.jpg', 'Köpek', 'Hayvanlar/Evcil');
check('klasöre yükleme', $b['folder'] === 'hayvanlar/evcil');
$list = $store->list(['folder' => '*']);
check('liste: 2 öğe, en yeni önce', $list['total'] === 2 && $list['items'][0]['id'] === 2);
check('klasör ağacı', array_column($list['folders'], 'path') === ['hayvanlar', 'hayvanlar/evcil']);
check('klasör filtresi', $store->list(['folder' => 'hayvanlar/evcil'])['total'] === 1);
check('kök klasör filtresi', $store->list(['folder' => ''])['total'] === 1);
check('arama (Türkçe)', $store->list(['search' => 'KÖPEK'])['total'] === 1);
check('küçük görselde varyant yok (thumb hariç)', array_keys((array) $b['variants']) === ['thumb']);

$u = $store->update(1, ['alt' => 'Yeni alt', 'caption' => 'Alt yazı', 'filename' => 'Mutlu Kedi']);
check('güncelleme + yeniden adlandırma', $u['alt'] === 'Yeni alt' && str_contains($u['url'], 'mutlu-kedi.jpg'));
check('varyantlar da yeniden adlandırıldı', str_contains(((array) ((array) $u['variants'])['lg'])['url'], 'mutlu-kedi-lg.webp') && is_file("$tmp/uploads/" . date('Y/m') . '/mutlu-kedi-lg.webp'));

check('move', $store->move([1], 'arsiv') === 1 && $store->get(1)['folder'] === 'arsiv');
try {
    $store->deleteFolder('arsiv');
    check('dolu klasör silinmez', false);
} catch (UserError $e) {
    check('dolu klasör silinmez', $e->status() === 409);
}
$store->createFolder('bos-klasor');
$store->deleteFolder('bos-klasor');
check('boş klasör silinir', !in_array('bos-klasor', array_column($store->list()['folders'], 'path'), true));

file_put_contents("$tmp/sahte.jpg", '<?php echo "x"; ?>');
try {
    $store->importFile("$tmp/sahte.jpg", 'sahte.jpg', 'x');
    check('sahte görsel reddedilir', false);
} catch (UserError) {
    check('sahte görsel (PHP içerikli .jpg) reddedilir', true);
}

$path1 = "$tmp/uploads/" . date('Y/m') . '/mutlu-kedi.jpg';
check('silme', $store->delete([1, 2]) === 2 && !is_file($path1) && $store->list()['total'] === 0);
check('yükleme klasörü korumalı (.htaccess)', is_file("$tmp/uploads/.htaccess") && str_contains((string) file_get_contents("$tmp/uploads/.htaccess"), 'engine off'));
check('veri klasörü erişime kapalı', is_file("$tmp/uploads/.zoro/.htaccess"));

// Eski ZoroEditor media.json formatı içe aktarılır
$legacyDir = "$tmp/legacy";
mkdir($legacyDir);
file_put_contents("$legacyDir/media.json", json_encode([['id' => 7, 'filename' => 'eski', 'altText' => 'Eski alt', 'mimeType' => 'image/png', 'storageKey' => '2024/01/eski.png', 'url' => '/u/2024/01/eski.png', 'variants' => [], 'createdAt' => '2024-01-01T00:00:00+00:00']]));
$legacy = new MediaStore(new Config(['upload' => ['path' => $legacyDir, 'url_base' => '/u']]));
$li = $legacy->list()['items'][0] ?? [];
check('eski format geçişi', ($li['alt'] ?? '') === 'Eski alt' && ($li['filename'] ?? '') === 'eski.png' && $li['id'] === 7);

echo "\nEditor::render\n";
$html = Editor::render('icerik', '<p>"merhaba"</p>', ['preset' => 'blog', 'media' => '/zoro/media.php', 'addGroups' => ['embed'], 'script' => '/js/z.js']);
check('textarea + data öznitelikleri', str_contains($html, 'data-zoro-editor') && str_contains($html, 'data-preset="blog"') && str_contains($html, 'data-media-endpoint="/zoro/media.php"') && str_contains($html, 'data-add-groups="embed"'));
check('değer kaçışlı', str_contains($html, '&lt;p&gt;&quot;merhaba&quot;&lt;/p&gt;'));
check('script bir kez', substr_count($html . Editor::render('b', ''), '<script') === 1);

// temizlik
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($tmp, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
foreach ($it as $f) {
    $f->isDir() ? rmdir($f->getPathname()) : unlink($f->getPathname());
}
rmdir($tmp);

echo "\n$pass geçti, $fail başarısız\n";
exit($fail ? 1 : 0);
