<?php

declare(strict_types=1);

namespace Zoro\Editor;

/** Error that is safe to show to the user (leaks no internal details). */
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
