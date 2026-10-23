import { useState } from "react";
import { useForm } from "@inertiajs/react";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import TableComponent from "@/Components/TableComponent";
import { 
    PencilIcon, 
    TrashIcon,
    ListBulletIcon,
    LockClosedIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";

export default function CriteriaList({ criterias, handleEditMode = () => {}, bare = false }) {
    const { delete: destroy, processing, errors, clearErrors } = useForm({});
    const [pendingDelete, setPendingDelete] = useState(null);
    const showAction = route().current("pageants.criterias.index");

    const closeDelete = () => {
        setPendingDelete(null);
        clearErrors();
    };

    const confirmDelete = () => {
        destroy(route("criterias.destroy", pendingDelete.id), {
            preserveScroll: true,
            onSuccess: closeDelete,
        });
    };

    return (
        <>
        {showAction && (
            <ConfirmDeleteModal
                show={pendingDelete !== null}
                title={`Delete ${pendingDelete?.name ?? "criteria"}?`}
                error={errors.delete}
                processing={processing}
                confirmLabel="Delete Criteria"
                onConfirm={confirmDelete}
                onClose={closeDelete}
            >
                Criteria that already have scores can't be deleted.
            </ConfirmDeleteModal>
        )}
        <TableComponent customHeader={true} bare={bare}>
            <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Criteria</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Percentage</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Scored By</th>
                    {showAction && (
                        <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    )}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {criterias.map((criteria) => (
                    <tr key={criteria.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                    R{criteria.round}
                                </span>
                                <div className="flex flex-col">
                                    <h6 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                        {criteria.name}
                                    </h6>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Group {criteria.group}
                            </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <h6 className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                {criteria.percentage}%
                            </h6>
                        </td>
                        <td className="px-6 py-4 text-center">
                            {criteria.hidden_scoring ? (
                                <span 
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                    title="Only the admin enters scores for this criteria"
                                >
                                    <LockClosedIcon className="h-3 w-3" aria-hidden="true" />
                                    Admin
                                </span>
                            ) : (
                                <span 
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800"
                                    title="Judges enter scores for this criteria"
                                >
                                    <UserGroupIcon className="h-3 w-3" aria-hidden="true" />
                                    Judges
                                </span>
                            )}
                        </td>
                        {showAction && (
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        onClick={() => handleEditMode(criteria)}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                                        title="Edit Criteria"
                                        aria-label={`Edit ${criteria.name}`}
                                    >
                                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <button
                                        onClick={() => setPendingDelete(criteria)}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                        title="Delete Criteria"
                                        aria-label={`Delete ${criteria.name}`}
                                    >
                                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </td>
                        )}
                    </tr>
                ))}

                {criterias.length === 0 && (
                    <tr>
                        <td colSpan={showAction ? 5 : 4} className="px-6 py-12 text-center">
                            <ListBulletIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                                No criteria defined yet.
                            </p>
                        </td>
                    </tr>
                )}
            </tbody>
        </TableComponent>
        </>
    );
}
