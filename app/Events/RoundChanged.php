<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class RoundChanged implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(public int $pageantId, public ?int $round, public int $group)
    {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('pageant.' . $this->pageantId);
    }

    public function broadcastAs(): string
    {
        return 'round.changed';
    }
}
