<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class GroupChanged implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(public int $pageantId, public int $round, public int $group)
    {
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('pageant.' . $this->pageantId);
    }

    public function broadcastAs(): string
    {
        return 'group.changed';
    }
}
