<?php
/**
 * Zoro Finder API endpoint.
 * In the editor:  media: { endpoint: '/zoro/php/public/media.php' }
 */
declare(strict_types=1);

$autoload = dirname(__DIR__, 2) . '/vendor/autoload.php';
require is_file($autoload) ? $autoload : dirname(__DIR__) . '/autoload.php';

$configFile = dirname(__DIR__) . '/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'php/config.php not found. Copy php/config.example.php to php/config.php and set the "auth" callback.'], JSON_UNESCAPED_UNICODE);
    exit;
}

\Zoro\Editor\Api::run(require $configFile);
