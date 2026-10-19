# Zoro Finder media API contract

Finder's default `RestMediaAdapter` sends requests to a single endpoint with an `?action=` parameter. Any backend that implements this contract (PHP, Laravel, Next.js, Express, …) works with Finder. Ready-made implementations:

- PHP: `php/src/Api.php` (entry point `php/public/media.php`)
- Next.js: `examples/nextjs/app/api/media/route.ts`

All mutating actions use `POST`, so the API also works on shared hosts that block `PATCH` / `DELETE`. Requests carry `X-Requested-With: XMLHttpRequest` and, when configured, an `X-CSRF-Token` header. Errors are always `{ "error": "message" }` with a suitable HTTP status; the message is shown to the user.

## Media item

```json
{
  "id": 12,
  "url": "/uploads/2026/10/sea.jpg",
  "filename": "sea.jpg",
  "alt": "Sea view",
  "caption": "",
  "title": "",
  "mime": "image/jpeg",
  "size": 245120,
  "width": 2000,
  "height": 1250,
  "folder": "landscapes",
  "variants": {
    "thumb": { "url": "/uploads/2026/10/sea-thumb.webp", "width": 150, "height": 150, "size": 5120 },
    "md":    { "url": "/uploads/2026/10/sea-md.webp", "width": 768, "height": 480, "size": 40960 },
    "lg":    { "url": "/uploads/2026/10/sea-lg.webp", "width": 1200, "height": 750, "size": 81920 }
  },
  "srcset": "/uploads/2026/10/sea-md.webp 768w, /uploads/2026/10/sea-lg.webp 1200w, /uploads/2026/10/sea.jpg 2000w",
  "createdAt": "2026-10-19T14:02:11+03:00",
  "usageCount": 3
}
```

Only `id`, `url` and `filename` are required. When `variants.thumb` exists it is used in the grid; `variants.lg` (or the `insertVariant` option) is inserted into the editor; `srcset` is built from the variants when missing. When `usageCount` is present, the "Unused" filter appears. If your backend uses different field names, map them with `media.transform` (the legacy names `altText`, `originalFilename`, `alt_text`, `mime_type`, `file_size` are recognised automatically).

## Actions

| Request | Body | Response |
|---|---|---|
| `GET ?action=list&page=1&limit=40&search=&folder=&type=&sort=newest&filter=` | — | `{ items: Item[], total, hasMore, folders?: [{ path, name, count }] }` |
| `POST ?action=upload` | multipart: `file`, `alt`, `folder` | `201 { item }` (`item.duplicate = true` for an identical file) |
| `POST ?action=update&id=12` | JSON `{ alt?, caption?, title?, filename? }` | `{ item }` |
| `POST ?action=delete` | JSON `{ ids: [1, 2] }` | `{ deleted }` |
| `POST ?action=move` | JSON `{ ids: [1, 2], folder: "blog/2026" }` | `{ moved }` |
| `POST ?action=folder-create` | JSON `{ path: "blog/2026" }` | `{ path }` |
| `POST ?action=folder-delete` | JSON `{ path }` | `{ success }` (`409` when the folder is not empty) |

`folder`: omitted = all folders, `""` = root folder, `"a/b"` = that folder.
`sort`: `newest | oldest | name | size`. `filter`: `"" | unused`. `type`: `"" | image | video | document`.

If your backend does not support `update`, `delete`, `move` or the folder actions, write a custom `MediaAdapter` without those methods — Finder hides the related buttons.
