import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export function usePageantChannel(pageantId, events = []) {
    useEffect(() => {
        if (!pageantId || !window.Echo) return;

        const channel = window.Echo.channel(`pageant.${pageantId}`);

        const allEvents = events.length > 0 ? events : [
            '.score.submitted',
            '.round.changed',
            '.group.changed',
            '.scores.reset',
            '.pageant.ended',
        ];

        allEvents.forEach(event => {
            channel.listen(event, () => {
                router.reload({ preserveScroll: true });
            });
        });

        return () => {
            window.Echo.leave(`pageant.${pageantId}`);
        };
    }, [pageantId]);
}
