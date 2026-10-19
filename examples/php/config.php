<?php
// Example settings — start from php/config.example.php in a real project.
$base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/examples/php/media.php')), '/');

return [
    'upload' => [
        'path' => __DIR__ . '/uploads',
        'url_base' => $base . '/uploads',
    ],
    // Example: allow requests from this computer only. Use a real login check in production!
    'auth' => fn (string $action): bool => in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true),
];
