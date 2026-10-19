<?php
/**
 * Zoro media API settings.
 * Copy this file to "config.php" in the same folder and edit it (config.php is git-ignored).
 */
return [
    // Language of the messages shown in Zoro Finder: 'en' or 'tr'
    'locale' => 'en',

    'upload' => [
        // Folder where files are stored, and the public URL of that folder.
        // Default: /uploads in your site root (when the "zoro" folder sits in the site root: zoro/php → ../../uploads)
        'path' => dirname(__DIR__, 2) . '/uploads',
        'url_base' => '/uploads',
        'max_size' => 20 * 1024 * 1024,
        'allowed' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
        // Convert JPEG/PNG uploads to WebP
        'convert_to_webp' => false,
        // Downscale larger images to this width (0 = off)
        'max_width' => 2560,
    ],

    // REQUIRED — who may upload, edit and delete files? Write your own login check.
    // Without a working "auth" the API answers 403 to every request.
    'auth' => function (string $action): bool {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        return !empty($_SESSION['user_id']);
        // Local testing only:  return in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
    },

    // Optional CSRF check. The editor sends the "X-CSRF-Token" header, read from
    // <meta name="csrf-token" content="..."> or the data-csrf-token attribute.
    // 'csrf' => fn (?string $token) => $token !== null && hash_equals($_SESSION['csrf'] ?? '', $token),

    // Allowed origins when the editor runs on another domain (e.g. a Next.js app):
    // 'cors' => ['https://admin.example.com'],

    // "Unused" filter and "used in N places": count where a file is used
    // 'usage_counter' => fn (array $item) => (int) $pdo->query('SELECT COUNT(*) FROM posts WHERE content LIKE ' . $pdo->quote('%' . basename($item['url']) . '%'))->fetchColumn(),

    // When a file is renamed, update the old URL in your content:
    // 'on_rename' => function (string $old, string $new) use ($pdo) {
    //     $pdo->prepare('UPDATE posts SET content = REPLACE(content, ?, ?)')->execute([$old, $new]);
    // },

    // Return false to prevent a file from being deleted:
    // 'on_delete' => fn (array $item) => true,
];
