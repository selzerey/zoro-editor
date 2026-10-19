<?php
/**
 * ZoroEditor — plain PHP example.
 * Run:  php -S 127.0.0.1:8765 -t .   (in the repo root)  →  http://127.0.0.1:8765/examples/php/
 */
declare(strict_types=1);

require __DIR__ . '/../../php/autoload.php';

use Zoro\Editor\Editor;
use Zoro\Editor\Sanitizer;

session_start();
$_SESSION['csrf'] ??= bin2hex(random_bytes(16));

$saved = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && hash_equals($_SESSION['csrf'], (string) ($_POST['_token'] ?? ''))) {
    // ALWAYS sanitize on the server before saving
    $saved = [
        'title' => trim((string) ($_POST['title'] ?? '')),
        'content' => Sanitizer::clean((string) ($_POST['content'] ?? '')),
    ];
}
$content = $saved['content'] ?? '<p>Hello! This content is saved with a plain <strong>PHP</strong> form.</p>';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ZoroEditor PHP example</title>
  <link rel="stylesheet" href="../../dist/zoro-content.css">
  <style>
    body { margin: 0; padding: 24px 16px; background: #f0f0f1; color: #1d2327; font: 15px/1.5 system-ui, sans-serif; }
    main { max-width: 900px; margin: 0 auto; }
    .box { background: #fff; border: 1px solid #dcdcde; border-radius: 6px; padding: 18px; margin-bottom: 16px; }
    label { display: block; font-weight: 600; margin: 0 0 6px; }
    input[type=text] { width: 100%; height: 40px; padding: 0 10px; border: 1px solid #8c8f94; border-radius: 4px; font: inherit; box-sizing: border-box; margin-bottom: 14px; }
    button[type=submit] { margin-top: 14px; min-height: 40px; padding: 0 18px; border: 0; border-radius: 4px; background: #2271b1; color: #fff; font: inherit; cursor: pointer; }
    pre { white-space: pre-wrap; word-break: break-word; background: #f6f7f7; padding: 12px; border-radius: 4px; font-size: 12px; }
  </style>
</head>
<body>
<main>
  <h1>ZoroEditor + PHP</h1>
  <form method="post" class="box" id="yazi-formu">
    <input type="hidden" name="_token" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" value="<?= htmlspecialchars($saved['title'] ?? 'Example post') ?>">
    <label for="zoro-content">Content</label>
    <?= Editor::render('content', $content, [
        'preset' => 'blog',
        'addGroups' => ['embed'],
        'media' => 'media.php',
        'height' => 320,
        'script' => '../../dist/zoro-editor.iife.js',
    ]) ?>
    <button type="submit">Save</button>
  </form>

  <?php if ($saved): ?>
  <section class="box" id="sonuc">
    <h2>Saved (after Sanitizer::clean)</h2>
    <article class="zoro-output"><?= $saved['content'] ?></article>
    <pre><?= htmlspecialchars($saved['content']) ?></pre>
  </section>
  <?php endif; ?>
</main>
</body>
</html>
