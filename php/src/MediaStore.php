<?php

declare(strict_types=1);

namespace Zoro\Editor;

/**
 * File-based media library (no database needed).
 * Metadata: {data_path}/media.json — every write happens under a file lock.
 * Folders are virtual: moving a file doesn't change its URL, so links in content don't break.
 */
final class MediaStore
{
    private string $uploadPath;
    private string $urlBase;
    private string $dataFile;
    private ImageProcessor $images;

    public function __construct(private Config $config)
    {
        $this->uploadPath = (string) $config->get('upload.path');
        $this->urlBase = (string) $config->get('upload.url_base');
        $dataPath = (string) $config->get('data_path');
        Support::ensureDir($this->uploadPath);
        Support::protectUploadDir($this->uploadPath);
        Support::ensureDir($dataPath);
        Support::denyDir($dataPath);
        $this->dataFile = $dataPath . '/media.json';
        $this->images = new ImageProcessor((array) $config->get('variants', []));
    }

    // ───────────────────────── Reading ─────────────────────────

    /**
     * @param array{page?:int, limit?:int, search?:string, folder?:?string, type?:string, sort?:string, filter?:string} $p
     * @return array{items: list<array<string,mixed>>, total:int, page:int, limit:int, hasMore:bool, folders: list<array<string,mixed>>}
     */
    public function list(array $p = []): array
    {
        $db = $this->read();
        $items = $db['items'];
        $page = max(1, (int) ($p['page'] ?? 1));
        $limit = min(100, max(1, (int) ($p['limit'] ?? 40)));

        if (array_key_exists('folder', $p) && $p['folder'] !== null && $p['folder'] !== '*') {
            $folder = Support::cleanFolder((string) $p['folder']);
            $items = array_filter($items, fn ($m) => ($m['folder'] ?? '') === $folder);
        }
        $type = (string) ($p['type'] ?? '');
        if ($type !== '') {
            $items = array_filter($items, fn ($m) => match ($type) {
                'image' => str_starts_with((string) $m['mime'], 'image/'),
                'video' => str_starts_with((string) $m['mime'], 'video/'),
                'document' => !str_starts_with((string) $m['mime'], 'image/') && !str_starts_with((string) $m['mime'], 'video/'),
                default => true,
            });
        }
        $search = trim((string) ($p['search'] ?? ''));
        if ($search !== '') {
            $q = mb_strtolower($search, 'UTF-8');
            $items = array_filter($items, function ($m) use ($q) {
                $hay = mb_strtolower(implode(' ', [$m['filename'] ?? '', $m['alt'] ?? '', $m['caption'] ?? '', $m['originalFilename'] ?? '']), 'UTF-8');
                return str_contains($hay, $q);
            });
        }
        $counter = $this->config->get('usage_counter');
        if (is_callable($counter)) {
            $items = array_map(function ($m) use ($counter) {
                $m['usageCount'] = (int) $counter($m);
                return $m;
            }, $items);
            if (($p['filter'] ?? '') === 'unused') {
                $items = array_filter($items, fn ($m) => $m['usageCount'] === 0);
            }
        }
        $items = array_values($items);
        $sort = (string) ($p['sort'] ?? 'newest');
        usort($items, fn ($a, $b) => match ($sort) {
            'oldest' => [$a['createdAt'], $a['id']] <=> [$b['createdAt'], $b['id']],
            'name' => strnatcasecmp((string) $a['filename'], (string) $b['filename']),
            'size' => ($b['size'] ?? 0) <=> ($a['size'] ?? 0),
            default => [$b['createdAt'], $b['id']] <=> [$a['createdAt'], $a['id']],
        });

        $total = count($items);
        $offset = ($page - 1) * $limit;
        return [
            'items' => array_map([$this, 'publicItem'], array_slice($items, $offset, $limit)),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'hasMore' => $offset + $limit < $total,
            'folders' => $this->folderList($db),
        ];
    }

    /** @return array<string,mixed>|null */
    public function get(int $id): ?array
    {
        foreach ($this->read()['items'] as $m) {
            if ((int) $m['id'] === $id) {
                return $this->publicItem($m);
            }
        }
        return null;
    }

    // ───────────────────────── Upload ─────────────────────────

    /**
     * Handles the $_FILES['file'] entry.
     * @param array{name?:string, tmp_name?:string, error?:int, size?:int} $file
     * @return array<string,mixed>
     */
    public function upload(array $file, string $alt, string $folder = ''): array
    {
        $err = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($err !== UPLOAD_ERR_OK) {
            throw new UserError(match ($err) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => Lang::t('upload_max_filesize'),
                UPLOAD_ERR_PARTIAL => Lang::t('upload_partial'),
                UPLOAD_ERR_NO_FILE => Lang::t('nothing_selected'),
                default => Lang::t('upload_failed', ['code' => $err]),
            });
        }
        $tmp = (string) ($file['tmp_name'] ?? '');
        if (!is_uploaded_file($tmp)) {
            throw new UserError(Lang::t('invalid_upload'));
        }
        return $this->importFile($tmp, (string) ($file['name'] ?? 'dosya'), $alt, $folder, true);
    }

    /**
     * Adds a file already on the server to the library (bulk import, tests).
     * @return array<string,mixed>
     */
    public function importFile(string $sourcePath, string $originalName, string $alt, string $folder = '', bool $moveUploaded = false): array
    {
        $alt = trim(mb_substr($alt, 0, 300));
        $folder = Support::cleanFolder($folder);
        $maxSize = (int) $this->config->get('upload.max_size');
        $size = (int) @filesize($sourcePath);
        if ($size <= 0) {
            throw new UserError(Lang::t('empty_file'));
        }
        if ($size > $maxSize) {
            throw new UserError(Lang::t('too_large', ['max' => Support::formatBytes($maxSize)]));
        }

        // Detect the type from the content (don't trust what the client says)
        $mime = (string) (new \finfo(FILEINFO_MIME_TYPE))->file($sourcePath);
        $allowed = (array) $this->config->get('upload.allowed');
        if (!in_array($mime, $allowed, true)) {
            throw new UserError(Lang::t('unsupported_type', ['mime' => $mime]));
        }
        $isImage = str_starts_with($mime, 'image/');
        $info = $isImage ? $this->images->inspect($sourcePath) : null;
        if ($isImage && !$info) {
            throw new UserError(Lang::t('broken_image'));
        }

        $hash = hash_file('sha256', $sourcePath) ?: '';
        if ($this->config->get('dedupe') && $hash !== '') {
            foreach ($this->read()['items'] as $m) {
                if (($m['sha256'] ?? '') === $hash && is_file($this->pathOf($m))) {
                    if ($moveUploaded) {
                        @unlink($sourcePath);
                    }
                    $out = $this->publicItem($m);
                    $out['duplicate'] = true;
                    return $out;
                }
            }
        }

        $ym = date('Y/m');
        $dir = $this->uploadPath . '/' . $ym;
        Support::ensureDir($dir);
        $slug = Support::slugify(Support::basename($originalName));
        $convert = $this->config->get('upload.convert_to_webp') && in_array($mime, ['image/jpeg', 'image/png'], true) && ImageProcessor::available();
        $finalMime = $convert ? 'image/webp' : $mime;
        $filename = Support::uniqueFilename($dir, $slug, Support::mimeToExt($finalMime));
        $dest = "$dir/$filename";

        $tmpDest = $dest . '.part';
        $moved = $moveUploaded ? move_uploaded_file($sourcePath, $tmpDest) : copy($sourcePath, $tmpDest);
        if (!$moved) {
            throw new \RuntimeException('Could not save the uploaded file.');
        }

        $dims = null;
        if ($isImage) {
            $dims = $this->images->normalize($tmpDest, $mime, (int) $this->config->get('upload.max_width', 0), (int) $this->config->get('upload.quality', 85), $dest, $finalMime);
            if ($dims && is_file($dest)) {
                @unlink($tmpDest);
            } else {
                // GD couldn't open it (e.g. no AVIF support) — keep the original
                rename($tmpDest, $dest);
                $dims = $info ? ['width' => $info['width'], 'height' => $info['height']] : null;
            }
        } else {
            rename($tmpDest, $dest);
        }

        $base = Support::basename($filename);
        $variants = [];
        if ($isImage) {
            foreach ($this->images->generateVariants($dest, $finalMime, $dir, $base) as $name => $v) {
                $variants[$name] = ['url' => "{$this->urlBase}/$ym/{$v['filename']}", 'width' => $v['width'], 'height' => $v['height'], 'size' => $v['size']];
            }
        }

        return $this->mutate(function (array &$db) use ($filename, $originalName, $alt, $finalMime, $dest, $dims, $ym, $variants, $hash, $folder) {
            $id = ++$db['seq'];
            $record = [
                'id' => $id,
                'filename' => $filename,
                'originalFilename' => $originalName,
                'alt' => $alt,
                'caption' => '',
                'title' => '',
                'mime' => $finalMime,
                'size' => (int) filesize($dest),
                'width' => $dims['width'] ?? null,
                'height' => $dims['height'] ?? null,
                'folder' => $folder,
                'storageKey' => "$ym/$filename",
                'url' => "{$this->urlBase}/$ym/$filename",
                'variants' => (object) $variants,
                'sha256' => $hash,
                'createdAt' => date('c'),
            ];
            $db['items'][] = $record;
            if ($folder !== '') {
                $this->addFolderPaths($db, $folder);
            }
            return $this->publicItem($record);
        });
    }

    // ───────────────────────── Update ─────────────────────────

    /**
     * @param array{alt?:string, caption?:string, title?:string, filename?:string} $data
     * @return array<string,mixed>
     */
    public function update(int $id, array $data): array
    {
        $renamed = null;
        $result = $this->mutate(function (array &$db) use ($id, $data, &$renamed) {
            foreach ($db['items'] as &$m) {
                if ((int) $m['id'] !== $id) {
                    continue;
                }
                foreach (['alt' => 300, 'caption' => 1000, 'title' => 300] as $k => $max) {
                    if (array_key_exists($k, $data)) {
                        $m[$k] = trim(mb_substr((string) $data[$k], 0, $max));
                    }
                }
                if (!empty($data['filename'])) {
                    $renamed = $this->renameFiles($m, (string) $data['filename']);
                }
                return $this->publicItem($m);
            }
            throw new UserError(Lang::t('not_found'), 404);
        });
        if ($renamed) {
            $hook = $this->config->get('on_rename');
            if (is_callable($hook)) {
                $hook($renamed[0], $renamed[1], $result);
            }
        }
        return $result;
    }

    /**
     * @param array<string,mixed> $m
     * @return array{0:string,1:string}|null [oldUrl, newUrl]
     */
    private function renameFiles(array &$m, string $newName): ?array
    {
        $slug = Support::slugify(Support::basename($newName), '');
        if ($slug === '') {
            throw new UserError(Lang::t('invalid_filename'));
        }
        $oldPath = $this->pathOf($m);
        $dir = dirname($oldPath);
        $ext = pathinfo((string) $m['filename'], PATHINFO_EXTENSION);
        if ($slug === Support::basename((string) $m['filename'])) {
            return null;
        }
        $newFile = Support::uniqueFilename($dir, $slug, $ext);
        if (!@rename($oldPath, "$dir/$newFile")) {
            throw new \RuntimeException('Could not rename the file.');
        }
        $oldBase = Support::basename((string) $m['filename']);
        $newBase = Support::basename($newFile);
        $ym = dirname((string) $m['storageKey']);
        $variants = (array) $m['variants'];
        foreach ($variants as $k => $v) {
            $v = (array) $v;
            $vf = basename((string) $v['url']);
            $nvf = $newBase . substr($vf, strlen($oldBase));
            if (@rename("$dir/$vf", "$dir/$nvf")) {
                $v['url'] = "{$this->urlBase}/$ym/$nvf";
            }
            $variants[$k] = $v;
        }
        $oldUrl = (string) $m['url'];
        $m['filename'] = $newFile;
        $m['storageKey'] = "$ym/$newFile";
        $m['url'] = "{$this->urlBase}/$ym/$newFile";
        $m['variants'] = (object) $variants;
        return [$oldUrl, (string) $m['url']];
    }

    /** @param list<int> $ids */
    public function delete(array $ids): int
    {
        $hook = $this->config->get('on_delete');
        $ids = array_map('intval', $ids);
        return $this->mutate(function (array &$db) use ($ids, $hook) {
            $n = 0;
            $keep = [];
            foreach ($db['items'] as $m) {
                if (!in_array((int) $m['id'], $ids, true)) {
                    $keep[] = $m;
                    continue;
                }
                if (is_callable($hook) && $hook($this->publicItem($m)) === false) {
                    $keep[] = $m;
                    continue;
                }
                $path = $this->pathOf($m);
                @unlink($path);
                foreach ((array) $m['variants'] as $v) {
                    @unlink(dirname($path) . '/' . basename((string) ((array) $v)['url']));
                }
                $n++;
            }
            $db['items'] = $keep;
            return $n;
        });
    }

    /** @param list<int> $ids */
    public function move(array $ids, string $folder): int
    {
        $folder = Support::cleanFolder($folder);
        $ids = array_map('intval', $ids);
        return $this->mutate(function (array &$db) use ($ids, $folder) {
            $n = 0;
            foreach ($db['items'] as &$m) {
                if (in_array((int) $m['id'], $ids, true)) {
                    $m['folder'] = $folder;
                    $n++;
                }
            }
            if ($folder !== '') {
                $this->addFolderPaths($db, $folder);
            }
            return $n;
        });
    }

    public function createFolder(string $path): string
    {
        $path = Support::cleanFolder($path);
        if ($path === '') {
            throw new UserError(Lang::t('folder_required'));
        }
        $this->mutate(function (array &$db) use ($path) {
            $this->addFolderPaths($db, $path);
        });
        return $path;
    }

    public function deleteFolder(string $path): void
    {
        $path = Support::cleanFolder($path);
        $this->mutate(function (array &$db) use ($path) {
            foreach ($db['items'] as $m) {
                $f = (string) ($m['folder'] ?? '');
                if ($f === $path || str_starts_with($f, $path . '/')) {
                    throw new UserError(Lang::t('folder_not_empty'), 409);
                }
            }
            $db['folders'] = array_values(array_filter($db['folders'], fn ($f) => $f !== $path && !str_starts_with($f, $path . '/')));
        });
    }

    // ───────────────────────── Helpers ─────────────────────────

    /** Public output format (sha256 and server paths are hidden). */
    public function publicItem(array $m): array
    {
        $variants = (array) ($m['variants'] ?? []);
        $srcset = [];
        foreach ($variants as $k => $v) {
            $v = (array) $v;
            if ($k !== 'thumb' && !empty($v['width'])) {
                $srcset[] = $v['url'] . ' ' . $v['width'] . 'w';
            }
        }
        if ($srcset && !empty($m['width'])) {
            $srcset[] = $m['url'] . ' ' . $m['width'] . 'w';
        }
        $out = [
            'id' => (int) $m['id'],
            'url' => (string) $m['url'],
            'filename' => (string) $m['filename'],
            'alt' => (string) ($m['alt'] ?? ''),
            'caption' => (string) ($m['caption'] ?? ''),
            'title' => (string) ($m['title'] ?? ''),
            'mime' => (string) ($m['mime'] ?? ''),
            'size' => (int) ($m['size'] ?? 0),
            'width' => isset($m['width']) ? (int) $m['width'] : null,
            'height' => isset($m['height']) ? (int) $m['height'] : null,
            'folder' => (string) ($m['folder'] ?? ''),
            'variants' => (object) $variants,
            'srcset' => count($srcset) > 1 ? implode(', ', $srcset) : null,
            'createdAt' => (string) ($m['createdAt'] ?? ''),
        ];
        if (isset($m['usageCount'])) {
            $out['usageCount'] = (int) $m['usageCount'];
        }
        return $out;
    }

    /** @param array<string,mixed> $m */
    private function pathOf(array $m): string
    {
        $key = str_replace(['..', "\0"], '', (string) $m['storageKey']);
        return $this->uploadPath . '/' . ltrim($key, '/');
    }

    /** @param array{folders: list<string>} $db */
    private function addFolderPaths(array &$db, string $path): void
    {
        $parts = explode('/', $path);
        for ($i = 1; $i <= count($parts); $i++) {
            $p = implode('/', array_slice($parts, 0, $i));
            if (!in_array($p, $db['folders'], true)) {
                $db['folders'][] = $p;
            }
        }
        sort($db['folders']);
    }

    /** @return list<array{path:string,name:string,count:int}> */
    private function folderList(array $db): array
    {
        $counts = [];
        foreach ($db['items'] as $m) {
            $f = (string) ($m['folder'] ?? '');
            if ($f !== '') {
                $counts[$f] = ($counts[$f] ?? 0) + 1;
            }
        }
        return array_map(fn ($f) => ['path' => $f, 'name' => basename($f), 'count' => $counts[$f] ?? 0], $db['folders']);
    }

    /** @return array{seq:int, items:list<array<string,mixed>>, folders:list<string>} */
    private function read(): array
    {
        if (!is_file($this->dataFile)) {
            return $this->migrateLegacy() ?? ['seq' => 0, 'items' => [], 'folders' => []];
        }
        $fh = fopen($this->dataFile, 'rb');
        if (!$fh) {
            throw new \RuntimeException('Could not read the media metadata file.');
        }
        flock($fh, LOCK_SH);
        $raw = stream_get_contents($fh);
        flock($fh, LOCK_UN);
        fclose($fh);
        return $this->decode((string) $raw);
    }

    /**
     * Read-modify-write under a lock.
     * @template T
     * @param callable(array &$db): T $fn
     * @return T
     */
    private function mutate(callable $fn): mixed
    {
        if (!is_file($this->dataFile)) {
            $initial = $this->migrateLegacy() ?? ['seq' => 0, 'items' => [], 'folders' => []];
            @file_put_contents($this->dataFile, json_encode($initial), LOCK_EX);
        }
        $fh = fopen($this->dataFile, 'c+b');
        if (!$fh || !flock($fh, LOCK_EX)) {
            throw new \RuntimeException('Could not lock the media metadata file.');
        }
        try {
            $db = $this->decode((string) stream_get_contents($fh));
            $result = $fn($db);
            $json = json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
            ftruncate($fh, 0);
            rewind($fh);
            fwrite($fh, $json);
            fflush($fh);
            return $result;
        } finally {
            flock($fh, LOCK_UN);
            fclose($fh);
        }
    }

    /** @return array{seq:int, items:list<array<string,mixed>>, folders:list<string>} */
    private function decode(string $raw): array
    {
        $data = $raw !== '' ? json_decode($raw, true) : null;
        if (!is_array($data)) {
            return ['seq' => 0, 'items' => [], 'folders' => []];
        }
        if (array_is_list($data)) {
            $data = ['items' => $data]; // old format: plain list
        }
        $items = array_map([$this, 'upgradeRecord'], (array) ($data['items'] ?? []));
        $seq = (int) ($data['seq'] ?? 0);
        foreach ($items as $m) {
            $seq = max($seq, (int) $m['id']);
        }
        return ['seq' => $seq, 'items' => $items, 'folders' => array_values((array) ($data['folders'] ?? []))];
    }

    /** Legacy ZoroEditor record (altText, filename without extension) → new format. */
    private function upgradeRecord(array $m): array
    {
        if (isset($m['altText']) && !isset($m['alt'])) {
            $m['alt'] = $m['altText'];
        }
        if (isset($m['mimeType']) && !isset($m['mime'])) {
            $m['mime'] = $m['mimeType'];
        }
        if (isset($m['fileSize']) && !isset($m['size'])) {
            $m['size'] = $m['fileSize'];
        }
        if (!empty($m['storageKey'])) {
            $m['filename'] = basename((string) $m['storageKey']);
        }
        unset($m['altText'], $m['mimeType'], $m['fileSize'], $m['srcset'], $m['slug']);
        $m['variants'] = $m['variants'] ?? [];
        $m['folder'] = $m['folder'] ?? '';
        $m['createdAt'] = $m['createdAt'] ?? date('c');
        return $m;
    }

    /** Import the old version's uploads/media/media.json file. */
    private function migrateLegacy(): ?array
    {
        $legacy = $this->uploadPath . '/media.json';
        if (!is_file($legacy)) {
            return null;
        }
        return $this->decode((string) file_get_contents($legacy));
    }
}
