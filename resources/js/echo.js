import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

// Under Herd (no port in the URL) nginx proxies /app/ to Reverb on 80 and 443. Anywhere else,
// e.g. `artisan serve` on the LAN, connect straight to Reverb's own port on the same host.
const proxied = window.location.port === '';
const reverbPort = import.meta.env.VITE_REVERB_PORT ?? 8080;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: window.location.hostname,
    // Match the page's scheme; an http page still falls back to wss (e.g. Firefox HTTPS-Only).
    wsPort: proxied ? 80 : reverbPort,
    wssPort: proxied ? 443 : reverbPort,
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
