import { useForm } from "@inertiajs/react";
import TableComponent from "@/Components/TableComponent";
import { 
    PencilIcon, 
    TrashIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/Utils/cn";

export default function CandidateList({
    candidates,
    handleEditMode = () => {},
}) {
    const { delete: destroy } = useForm({});
    const showAction = route().current("pageants.candidates.index");

    function deleteCandidate(id) {
        if (confirm("Are you sure you want to delete this candidate?")) {
            destroy(route("candidates.destroy", id), {
                onSuccess: () => {},
                onError: () => alert("Error deleting candidate"),
            });
        }
    }

    const getGenderColorClasses = (gender) => {
        switch (gender?.toLowerCase()) {
            case "mr": return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800";
            case "ms": return "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-100 dark:border-pink-800";
            default: return "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-100 dark:border-gray-800";
        }
    };

    return (
        <TableComponent customHeader={true}>
            <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Gender</th>
                    {showAction && (
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    )}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        alt={candidate.full_name}
                                        src={candidate.picture ? `/storage/${candidate.picture}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.full_name)}&background=random`}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-100 dark:border-gray-800 shadow-sm"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                                        {candidate.candidate_number}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h6 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                        {candidate.full_name}
                                    </h6>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {candidate.nickname || "No Nickname"}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span
                                className={cn(
                                    "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                    getGenderColorClasses(candidate.gender)
                                )}
                            >
                                {candidate.gender}
                            </span>
                        </td>
                        {showAction && (
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleEditMode(candidate)}
                                        className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                                        title="Edit Candidate"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteCandidate(candidate.id)}
                                        className="p-1 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                        title="Delete Candidate"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        )}
                    </tr>
                ))}

                {candidates.length === 0 && (
                    <tr>
                        <td colSpan={showAction ? 3 : 2} className="px-6 py-12 text-center">
                            <UserIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No candidates registered yet.
                            </p>
                        </td>
                    </tr>
                )}
            </tbody>
        </TableComponent>
    );
}
