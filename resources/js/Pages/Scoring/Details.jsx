import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Head, Link, usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Image from "@/Components/Image";
import { usePageantChannel } from "@/hooks/usePageantChannel";

// Card badge per group state; only the active group the judge hasn't locked yet opens.
const STATUS_BADGE = {
    active: { label: "Active Now", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    closed: { label: "Closed", className: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400" },
};

export default function ScoringDetails({ auth, pageant, groupCriterias, submittedCriteriaIds = [] }) {
    const { flash } = usePage().props;

    const findCriteriaForGroup = (eventRound, eventGroup) => {
        for (const [roundName, groups] of Object.entries(groupCriterias)) {
            for (const [groupName, items] of Object.entries(groups)) {
                if (items[0].round == eventRound && groupName == eventGroup) {
                    return items[0];
                }
            }
        }
        return null;
    };

    usePageantChannel(pageant.id, {
        '.round.changed': null,
        '.pageant.ended': null,
        '.group.changed': (data) => {
            const criteria = findCriteriaForGroup(data.round, data.group);
            if (criteria) {
                router.visit(route('scoring.score', { pageant: pageant.id, criteria: criteria.criteria_id || criteria.id }));
            } else {
                router.reload({ preserveScroll: true });
            }
        },
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader icon={InformationCircleIcon} title="Pageant Details" subtitle={pageant.pageant} />}
        >
            <Head title="Pageant Details" />

            <Breadcrumbs items={[{ label: "Current Pageants", href: route("scoring.index") }, { label: pageant.pageant }]} className="mb-6" />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 ">
                    {flash.message && (
                        <div className="block w-full p-2 rounded-sm bg-green-500 text-white mb-6">
                            {flash.message}
                        </div>
                    )}

                    <div className="space-y-10">
                        {Object.entries(groupCriterias).map(
                            ([roundName, groups]) => (
                                <div key={`round-` + roundName} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="uppercase dark:text-white text-3xl font-black tracking-tighter">
                                            {roundName}
                                        </h2>
                                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {Object.entries(groups).map(
                                            ([groupName, items]) => {
                                                const isCurrent = pageant.current_round == items[0].round && pageant.current_group == groupName;
                                                const isSubmitted = items.some((crit) => submittedCriteriaIds.includes(crit.id));
                                                const status = isSubmitted ? "submitted" : isCurrent ? "active" : "closed";
                                                const isOpen = status === "active";
                                                const Card = isOpen ? Link : "div";
                                                const cardProps = isOpen
                                                    ? { href: route("scoring.score", { pageant: pageant.id, criteria: items[0].id }) }
                                                    : { "aria-disabled": true };
                                                return (
                                                    <div key={`group-` + groupName}>
                                                        <Card
                                                            {...cardProps}
                                                            className={`group block h-full ${isOpen ? "" : "cursor-not-allowed opacity-70"}`}
                                                        >
                                                            <div className={`relative flex flex-col h-full rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                                                                isCurrent 
                                                                ? "border-green-500 shadow-lg shadow-green-500/10 scale-[1.02]" 
                                                                : "border-gray-100 dark:border-gray-800"
                                                            }`}>
                                                                <div className="relative h-40 bg-gray-900">
                                                                    <Image
                                                                        className={`w-full h-full object-cover transition-transform duration-700 opacity-60 ${isOpen ? "group-hover:scale-110" : ""}`}
                                                                        src={`/storage/` + pageant.background}
                                                                        alt={roundName}
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
                                                                    
                                                                    {isCurrent && (
                                                                        <div className="absolute top-3 right-3">
                                                                            <span className="flex h-3 w-3 relative">
                                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="p-4 bg-white dark:bg-gray-800 flex-1 flex flex-col justify-between">
                                                                    <div>
                                                                        <h3 className="text-gray-900 dark:text-white font-bold uppercase tracking-wide mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                                                                            {groupName}
                                                                        </h3>
                                                                        <ul className="space-y-1.5 px-1 text-left">
                                                                            {items.map((crit) => (
                                                                                <li key={`crit-` + crit.id} className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                                    {crit.name}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    
                                                                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-end">
                                                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                                                            STATUS_BADGE[status].className
                                                                        }`}>
                                                                            {STATUS_BADGE[status].label}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
