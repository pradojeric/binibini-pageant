import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import JudgeCreate from "@/Pages/Judges/Partials/JudgeCreate";
import JudgeList from "@/Pages/Judges/Partials/JudgeList";
import { Head } from "@inertiajs/react";
import { 
    UsersIcon, 
    UserPlusIcon,
    ListBulletIcon
} from "@heroicons/react/24/outline";

export default function JudgeIndex({ auth, judges }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <UsersIcon className="w-6 h-6" />
                    </div>
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                        Judges Management
                    </h2>
                </div>
            }
        >
            <Head title="Judges Management" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Add Judge Form */}
                <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
                            <UserPlusIcon className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-gray-900 dark:text-white">Add New Judge</h3>
                        </div>
                        <div className="p-6">
                            <JudgeCreate />
                        </div>
                    </div>
                </div>

                {/* Right Column: Judges List */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ListBulletIcon className="w-5 h-5 text-indigo-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Registered Judges</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 uppercase tracking-wider">
                                {judges.length} Total
                            </span>
                        </div>
                        <div className="p-0"> {/* Remove padding for table */}
                            <JudgeList judges={judges} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
