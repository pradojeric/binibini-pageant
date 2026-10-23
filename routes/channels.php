<?php

use App\Models\Pageant;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Live scoring events: only staff and the pageant's own judges may listen.
Broadcast::channel('pageant.{pageant}', function (User $user, Pageant $pageant) {
    return $user->role === 'admin' || $pageant->judges()->whereKey($user->id)->exists();
});
