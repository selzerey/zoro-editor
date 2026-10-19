# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Use GitHub's private reporting instead: **Security → Report a vulnerability** on this repository.

Include the affected version, the steps or payload to reproduce, and the impact. You will get an answer as soon as possible; fixes are released together with an advisory.

## Scope

- XSS through editor output that passes `Sanitizer::clean()`
- Bypasses of the media API (`auth`, CSRF, upload type detection, path traversal)
- Ways to execute code through uploaded files
- Denial of service through the on-the-fly image endpoint

## Hardening checklist for sites using ZoroEditor

- Sanitize HTML on the server before saving it (`\Zoro\Editor\Sanitizer::clean()` or `sanitize-html` in Node).
- Configure `auth` (and `csrf` for cookie sessions) in `php/config.php`.
- Keep `php/config.php` out of version control (it is in `.gitignore`).
- On Nginx, deny script execution in the upload folder (see the README).
- Keep PHP up to date; PHP 8.4+ enables the HTML5 parser in the sanitizer.
