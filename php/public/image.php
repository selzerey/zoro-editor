<?php
/**
 * On-the-fly image resizing: /img/w640-q75/2026/10/photo.jpg
 * Apache .htaccess:  RewriteRule ^img/(.*)$ zoro/php/public/image.php?p=$1 [L,QSA]
 * Nginx:            location /img/ { rewrite ^/img/(.*)$ /zoro/php/public/image.php?p=$1 last; }
 */
declare(strict_types=1);

$autoload = dirname(__DIR__, 2) . '/vendor/autoload.php';
require is_file($autoload) ? $autoload : dirname(__DIR__) . '/autoload.php';

\Zoro\Editor\ImageServer::run(require dirname(__DIR__) . '/config.php');
