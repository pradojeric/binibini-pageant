import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { 
    TrophyIcon, 
    PlusIcon, 
    EyeIcon, 
    PencilSquareIcon, 
    TrashIcon,
    CalendarIcon,
    UserGroupIcon,
    HashtagIcon
} from "@heroicons/react/24/outline";

export default function PageantIndex({ auth, pageants }) {
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'ongoing':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'completed':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'ms': return 'Ms. Division';
            case 'mr': return 'Mr. Division';
            case 'mr&ms': return 'Mr. & Ms. Division';
            default: return type.toUpperCase();
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <TrophyIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Pageants
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your pageant events</p>
                        </div>
                    </div>
                    <Link
                        href={route("pageants.create")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Pageant
                    </Link>
                </div>
            }
        >
            <Head title="Pageants" />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pageant Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rounds</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {pageants.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <TrophyIcon className="w-16 h-16 mb-4 opacity-10" />
                                            <p className="text-lg font-medium">No pageants found</p>
                                            <p className="text-sm mb-6">Start by creating your first pageant event.</p>
                                            <Link
                                                href={route("pageants.create")}
                                                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                            >
                                                Create your first pageant &rarr;
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pageants.map((pageant) => (
                                    <tr key={pageant.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex-shrink-0 shadow-sm">
                                                    {pageant.background ? (
                                                        <img 
                                                            src={`/storage/${pageant.background}`} 
                                                            alt={pageant.pageant}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <TrophyIcon className="w-6 h-6 opacity-30" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {pageant.pageant}
                                                    </div>
                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <UserGroupIcon className="w-3 h-3" />
                                                        {getTypeLabel(pageant.type)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    <HashtagIcon className="w-3.5 h-3.5" />
                                                    {pageant.rounds} Total Rounds
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Current: Round {pageant.current_round}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(pageant.status)}`}>
                                                {pageant.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                {pageant.updated_at}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={route("pageants.show", pageant.id)}
                                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </Link>
                                                <Link
                                                    href={route("pageants.edit", pageant.id)}
                                                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                    title="Edit Pageant"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete Pageant"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
