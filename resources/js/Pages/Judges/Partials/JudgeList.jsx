import { EnvelopeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import JudgeEdit from "./JudgeEdit";
import { router } from "@inertiajs/react";

// readOnly hides edit/delete, e.g. on the pageant page where deleting would remove the judge's account everywhere.
function JudgeList({ judges, readOnly = false }) {
    const [editingJudge, setEditingJudge] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleEdit = (judge) => {
        setEditingJudge(judge);
        setShowEditModal(true);
    };

    const handleDelete = (judge) => {
        if (confirm(`Are you sure you want to delete ${judge.name}? This will perform a soft delete.`)) {
            router.delete(route("judges.destroy", judge.id));
        }
    };

    const columnCount = readOnly ? 2 : 3;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Judge</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                        {!readOnly && (
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {judges.length === 0 ? (
                        <tr>
                            <td colSpan={columnCount} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                No judges registered yet.
                            </td>
                        </tr>
                    ) : (
                        judges.map((judge) => (
                            <tr key={judge.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/50 dark:border-indigo-700/50" aria-hidden="true">
                                            {judge.name.charAt(0)}
                                        </div>
                                        <div className="font-bold text-gray-900 dark:text-gray-100">{judge.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700/50 w-fit">
                                        <EnvelopeIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                        {judge.email}
                                    </div>
                                </td>
                                {!readOnly && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(judge)}
                                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                title="Edit Judge"
                                                aria-label={`Edit ${judge.name}`}
                                            >
                                                <PencilSquareIcon className="w-5 h-5" aria-hidden="true" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(judge)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                                title="Delete Judge"
                                                aria-label={`Delete ${judge.name}`}
                                            >
                                                <TrashIcon className="w-5 h-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {!readOnly && (
                <JudgeEdit
                    judge={editingJudge}
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
}

export default JudgeList;
