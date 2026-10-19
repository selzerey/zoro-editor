<?php
// If you don't use Composer: require __DIR__ . '/zoro-editor/php/autoload.php';
spl_autoload_register(static function (string $class): void {
    $prefix = 'Zoro\\Editor\\';
    if (str_starts_with($class, $prefix)) {
        $file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_file($file)) {
            require $file;
        }
    }
});
