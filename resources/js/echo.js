import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
    // The site is served over both http and https; nginx proxies /app/ to Reverb on each,
    // so match the page's scheme. An http page still falls back to wss (e.g. Firefox HTTPS-Only).
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_TLS_PORT ?? 443,
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
