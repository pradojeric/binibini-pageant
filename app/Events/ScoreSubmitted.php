<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class ScoreSubmitted implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(public int $pageantId)
    {
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('pageant.' . $this->pageantId);
    }

    public function broadcastAs(): string
    {
        return 'score.submitted';
    }
}
