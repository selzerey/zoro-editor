<?php

declare(strict_types=1);

namespace Zoro\Editor;

/** Kullanıcıya gösterilebilecek hata (iç ayrıntı sızdırmaz). */
final class UserError extends \RuntimeException
{
    public function __construct(string $message, private int $status = 400)
    {
        parent::__construct($message);
    }

    public function status(): int
    {
        return $this->status;
    }
}
