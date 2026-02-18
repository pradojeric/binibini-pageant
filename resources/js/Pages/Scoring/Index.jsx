import PrimaryButton from "@/Components/PrimaryButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

export default function ScoringIndex({ auth, pageants }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Current Pageants
                </h2>
            }
        >
            <Head title="Pageant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {flash.message && (
                                <div className="block w-full p-2 rounded-sm bg-green-500 text-white mb-6">
                                    {flash.message}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pageants.map((pageant) => {
                                    return (
                                        <Link
                                            key={pageant.id}
                                            href={route(
                                                "scoring.details",
                                                pageant.id
                                            )}
                                            className="group"
                                        >
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col h-full">
                                                <div className="relative h-48 overflow-hidden bg-gray-900">
                                                    <LazyLoadImage
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
                                                        alt={pageant.pageant}
                                                        src={
                                                            `/storage/` +
                                                            pageant.background
                                                        }
                                                        placeholderSrc={`/logo.png`}
                                                        effect="blur"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                                    <div className="absolute bottom-4 left-4 right-4 outline-none">
                                                        <h3 className="text-white text-xl font-bold tracking-wide drop-shadow-md">
                                                            {pageant.pageant}
                                                        </h3>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-5 flex-1 flex flex-col justify-between">
                                                    <div className="flex justify-between items-center mb-4 text-left">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Type</span>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">{pageant.type}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rounds</span>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pageant.rounds} Rounds</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${pageant.status === 'ongoing' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{pageant.status}</span>
                                                        </div>
                                                        <PrimaryButton className="text-xs py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            View Scoring
                                                        </PrimaryButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
