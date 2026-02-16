import { EnvelopeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import JudgeEdit from "./JudgeEdit";
import { router } from "@inertiajs/react";

function JudgeList({ judges }) {
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

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judge Info</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {judges.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                                No judges registered yet.
                            </td>
                        </tr>
                    ) : (
                        judges.map((judge) => (
                            <tr key={judge.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/50 dark:border-indigo-700/50 shadow-sm">
                                            {judge.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-gray-100">{judge.name}</div>
                                            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-tighter">Judge Account</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700/50 w-fit">
                                        <EnvelopeIcon className="w-3.5 h-3.5" />
                                        {judge.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(judge)}
                                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                            title="Edit Judge"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(judge)}
                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Delete Judge"
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

            {/* Edit Modal */}
            <JudgeEdit
                judge={editingJudge}
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
            />
        </div>
    );
}

export default JudgeList;
