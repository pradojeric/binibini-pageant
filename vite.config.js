import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        cors: {
            // allow .test domains, localhost, 127.0.0.1 and IPv6 loopback
            origin: /^https?:\/\/(?:(?:.+\.)?test|localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/
        },
        host: '127.0.0.1',
        strictPort: true,
        hmr: {
            host: 'binibini-pageant.test',
            protocol: 'ws',
        },
    },
});
