import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

// Connect straight to Reverb's own port on whatever host served the page: binibini-pageant.test
// under Herd, or the LAN IP under `artisan serve`. Herd's nginx does not proxy /app/ to Reverb.
const reverbPort = import.meta.env.VITE_REVERB_PORT ?? 8080;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: window.location.hostname,
    // Match the page's scheme; Reverb serves plain ws, so a wss fallback (e.g. Firefox HTTPS-Only) fails.
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: window.location.protocol === 'https:',
    enabledTransports: ['ws', 'wss'],
    // Authorize private channels through axios: it sends the current XSRF cookie,
    // while the page has no csrf-token meta tag and Inertia never reloads one.
    authorizer: (channel) => ({
        authorize: (socketId, callback) => {
            window.axios
                .post('/broadcasting/auth', { socket_id: socketId, channel_name: channel.name })
                .then((response) => callback(null, response.data))
                .catch((error) => callback(error));
        },
    }),
});
