import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export function usePageantChannel(pageantId, eventsOrHandlers = {}) {
    useEffect(() => {
        if (!pageantId || !window.Echo) return;

        const channel = window.Echo.channel(`pageant.${pageantId}`);

        // Support both array of events (backward compat) and handlers object
        const isArray = Array.isArray(eventsOrHandlers);
        const handlers = isArray
            ? Object.fromEntries(eventsOrHandlers.map(e => [e, null]))
            : eventsOrHandlers;

        const events = Object.keys(handlers);

        events.forEach(event => {
            channel.listen(event, (data) => {
                if (handlers[event]) {
                    handlers[event](data);
                } else {
                    router.reload({ preserveScroll: true });
                }
            });
        });

        return () => {
            window.Echo.leave(`pageant.${pageantId}`);
        };
    }, [pageantId]);
}
