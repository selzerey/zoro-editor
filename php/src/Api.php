<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * Zoro Finder REST API'si (tek dosya uç noktası).
 *
 *   GET  ?action=list&page=1&limit=40&search=&folder=&type=&sort=newest&filter=
 *   POST ?action=upload          multipart: file, alt, folder
 *   POST ?action=update&id=5     JSON: {alt, caption, title, filename}
 *   POST ?action=delete          JSON: {ids: [1,2]}
 *   POST ?action=move            JSON: {ids: [1,2], folder: "blog"}
 *   POST ?action=folder-create   JSON: {path: "blog/2026"}
 *   POST ?action=folder-delete   JSON: {path: "blog/2026"}
 *
 * Tüm değiştirici işlemler POST'tur (PATCH/DELETE'i engelleyen paylaşımlı hostinglerde de çalışır).
 */
final class Api
{
    private Config $config;
    private ?MediaStore $store = null;

    /** @param array<string,mixed>|Config $config */
    public function __construct(array|Config $config)
    {
        $this->config = $config instanceof Config ? $config : new Config($config);
    }

    public static function run(array|Config $config): never
    {
        (new self($config))->handle();
        exit;
    }

    public function handle(): void
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->cors($method);
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store');

        try {
            $action = (string) ($_GET['action'] ?? 'list');
            $readOnly = in_array($action, ['list', 'get'], true);
            if (!$readOnly && $method !== 'POST') {
                throw new UserError('Bu işlem için POST gerekli.', 405);
            }
            $this->authorize($action, $readOnly);
            $store = $this->store();

            $result = match ($action) {
                'list' => $store->list([
                    'page' => (int) ($_GET['page'] ?? 1),
                    'limit' => (int) ($_GET['limit'] ?? 40),
                    'search' => (string) ($_GET['search'] ?? ''),
                    'folder' => isset($_GET['folder']) ? (string) $_GET['folder'] : null,
                    'type' => (string) ($_GET['type'] ?? ''),
                    'sort' => (string) ($_GET['sort'] ?? 'newest'),
                    'filter' => (string) ($_GET['filter'] ?? ''),
                ]),
                'get' => ['item' => $store->get((int) ($_GET['id'] ?? 0)) ?? throw new UserError('Medya bulunamadı.', 404)],
                'upload' => $this->upload($store),
                'update' => ['item' => $store->update((int) ($_GET['id'] ?? 0), $this->body())],
                'delete' => ['deleted' => $store->delete($this->ids())],
                'move' => ['moved' => $store->move($this->ids(), (string) ($this->body()['folder'] ?? ''))],
                'folder-create' => ['path' => $store->createFolder((string) ($this->body()['path'] ?? ''))],
                'folder-delete' => (function () use ($store) {
                    $store->deleteFolder((string) ($this->body()['path'] ?? ''));
                    return ['success' => true];
                })(),
                default => throw new UserError('Bilinmeyen işlem.', 404),
            };
            $this->json(['success' => true] + $result, $action === 'upload' ? 201 : 200);
        } catch (UserError $e) {
            $this->json(['error' => $e->getMessage()], $e->status());
        } catch (\InvalidArgumentException $e) {
            $this->json(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            error_log('[zoro-editor] ' . $e::class . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
            $this->json(['error' => 'Sunucu hatası. Ayrıntı için sunucu günlüğüne bakın.'], 500);
        }
    }

    private function store(): MediaStore
    {
        return $this->store ??= new MediaStore($this->config);
    }

    /** @return array<string,mixed> */
    private function upload(MediaStore $store): array
    {
        $file = $_FILES['file'] ?? $_FILES['image'] ?? null; // "image": eski ZoroEditor uyumu
        if (!is_array($file)) {
            // post_max_size aşılınca PHP $_FILES ve $_POST'u boş bırakır
            $len = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
            throw new UserError($len > 0 ? 'Dosya sunucu sınırını aşıyor (post_max_size).' : 'Dosya bulunamadı.', 413);
        }
        $alt = trim((string) ($_POST['alt'] ?? $_POST['altText'] ?? ''));
        if ($alt === '' && ($this->config->get('require_alt', true))) {
            throw new UserError('ALT metni zorunludur.', 422);
        }
        $item = $store->upload($file, $alt, (string) ($_POST['folder'] ?? ''));
        return ['item' => $item, 'image' => $item];
    }

    private function authorize(string $action, bool $readOnly): void
    {
        $auth = $this->config->get('auth');
        if (!is_callable($auth)) {
            throw new UserError('Zoro media API is not configured: define "auth" in php/config.php.', 403);
        }
        if (!$auth($action)) {
            throw new UserError('Yetkiniz yok.', 403);
        }
        $csrf = $this->config->get('csrf');
        if (!$readOnly && is_callable($csrf)) {
            $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['_token'] ?? null;
            if (!$csrf(is_string($token) ? $token : null)) {
                throw new UserError('Oturum doğrulaması başarısız (CSRF). Sayfayı yenileyin.', 419);
            }
        }
    }

    private function cors(string $method): void
    {
        $allowed = (array) $this->config->get('cors', []);
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '' && (in_array('*', $allowed, true) || in_array($origin, $allowed, true))) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, X-Requested-With, Authorization');
        }
        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    /** @return array<string,mixed> */
    private function body(): array
    {
        static $cache = null;
        if ($cache !== null) {
            return $cache;
        }
        $raw = (string) file_get_contents('php://input');
        $data = $raw !== '' ? json_decode($raw, true) : null;
        return $cache = is_array($data) ? $data : $_POST;
    }

    /** @return list<int> */
    private function ids(): array
    {
        $ids = $this->body()['ids'] ?? [];
        if (!is_array($ids) || !$ids) {
            throw new UserError('Dosya seçilmedi.', 422);
        }
        return array_values(array_map('intval', $ids));
    }

    /** @param array<string,mixed> $data */
    private function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    }
}
