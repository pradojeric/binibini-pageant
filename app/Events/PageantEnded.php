<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class PageantEnded implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(public int $pageantId)
    {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('pageant.' . $this->pageantId);
    }

    public function broadcastAs(): string
    {
        return 'pageant.ended';
    }
}
