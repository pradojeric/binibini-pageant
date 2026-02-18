import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function ScoringDetails({ auth, pageant, groupCriterias }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {pageant.pageant}
                </h2>
            }
        >
            <Head title="Pageant Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                                                        return (
                                                            <div key={`group-` + groupName}>
                                                                <Link
                                                                    href={route(
                                                                        "scoring.score",
                                                                        {
                                                                            pageant: pageant.id,
                                                                            criteria: items[0].id,
                                                                        }
                                                                    )}
                                                                    className="group block h-full"
                                                                >
                                                                    <div className={`relative flex flex-col h-full rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                                                                        isCurrent 
                                                                        ? "border-green-500 shadow-lg shadow-green-500/10 scale-[1.02]" 
                                                                        : "border-gray-100 dark:border-gray-800"
                                                                    }`}>
                                                                        <div className="relative h-40 bg-gray-900">
                                                                            <LazyLoadImage
                                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                                                                                src={`/storage/` + pageant.background}
                                                                                placeholderSrc="/logo.png"
                                                                                alt={roundName}
                                                                                effect="blur"
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
                                                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                                                                                    isCurrent ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500"
                                                                                }`}>
                                                                                    {isCurrent ? "Active Now" : "Available"}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Link>
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
