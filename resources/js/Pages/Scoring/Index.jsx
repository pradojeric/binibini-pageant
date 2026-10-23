import Alert from "@/Components/Alert";
import PrimaryButton from "@/Components/PrimaryButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { divisionsLabel } from "@/Utils/divisions";
import { Head, Link, usePage } from "@inertiajs/react";
import Image from "@/Components/Image";
import { usePageantChannel } from "@/hooks/usePageantChannel";

// Each card listens on its own pageant channel so the status stays live.
function PageantCard({ pageant }) {
    usePageantChannel(pageant.id, ['.round.changed', '.group.changed', '.pageant.ended']);

    return (
        <Link
            href={route("scoring.details", pageant.id)}
            className="group"
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col h-full">
                <div className="relative h-48 overflow-hidden bg-gray-900">
                    <Image
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
                        alt={pageant.pageant}
                        src={
                            `/storage/` +
                            pageant.background
                        }
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
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">{divisionsLabel(pageant.divisions)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rounds</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pageant.rounds} Rounds</span>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${pageant.status === 'Ongoing' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
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
}

export default function ScoringIndex({ auth, pageants }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader icon={TrophyIcon} title="Current Pageants" />}
        >
            <Head title="Pageant" />

            <Breadcrumbs items={[{ label: "Current Pageants" }]} className="mb-6" />
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    {flash.message && (
                        <Alert className="mb-6">{flash.message}</Alert>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pageants.map((pageant) => (
                            <PageantCard key={pageant.id} pageant={pageant} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
