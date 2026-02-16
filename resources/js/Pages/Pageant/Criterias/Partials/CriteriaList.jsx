import { useForm } from "@inertiajs/react";
import TableComponent from "@/Components/TableComponent";
import { 
    PencilIcon, 
    TrashIcon,
    ListBulletIcon,
    EyeSlashIcon,
    EyeIcon
} from "@heroicons/react/24/outline";

export default function CriteriaList({ criterias, handleEditMode = () => {} }) {
    const { delete: destroy } = useForm({});
    const showAction = route().current("pageants.criterias.index");

    function deleteCriteria(id) {
        if (confirm("Are you sure you want to delete this criteria?")) {
            destroy(route("criterias.destroy", id), {
                onSuccess: () => {},
                onError: () => alert("Error deleting criteria"),
            });
        }
    }

    return (
        <TableComponent customHeader={true}>
            <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Round</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Percentage</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Scoring</th>
                    {showAction && (
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
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
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
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
                                    title="Scores are hidden from other judges"
                                >
                                    <EyeSlashIcon className="h-3 w-3" />
                                    Hidden
                                </span>
                            ) : (
                                <span 
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800"
                                    title="Scores are public"
                                >
                                    <EyeIcon className="h-3 w-3" />
                                    Public
                                </span>
                            )}
                        </td>
                        {showAction && (
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleEditMode(criteria)}
                                        className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                                        title="Edit Criteria"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteCriteria(criteria.id)}
                                        className="p-1 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                        title="Delete Criteria"
                                    >
                                        <TrashIcon className="h-4 w-4" />
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
                            <p className="text-gray-500 dark:text-gray-400">
                                No criteria defined yet.
                            </p>
                        </td>
                    </tr>
                )}
            </tbody>
        </TableComponent>
    );
}
