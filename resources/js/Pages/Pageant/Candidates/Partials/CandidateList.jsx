import TableComponent from "@/Components/TableComponent";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm } from "@inertiajs/react";

export default function CandidateList({
    candidates,
    handleEditMode = () => {},
}) {
    const { delete: destroy } = useForm({});
    const showAction = route().current("pageants.candidates.index");

    const headers = ["Name", "Gender"];

    if (showAction) {
        headers.push("Action");
    }

    function deleteCandidate(id) {
        // alert(id);
        destroy(route("candidates.destroy", id), {
            onSuccess: () => alert("Successfully deleted"),
            onError: () => alert("Error deleted"),
        });
    }

    return (
        <>
            <TableComponent header={headers}>
                {candidates.map((candidate, index) => {
                    return (
                        <tr key={index}>
                            <td>
                                <div className="flex space-x-4 items-center px-3 py-2">
                                    <div>
                                        {candidate.picture ? (
                                            <img
                                                className="rounded-full h-16 w-16 object-cover border border-black bg-white"
                                                src={
                                                    `/storage/` +
                                                    candidate.picture
                                                }
                                                alt={candidate.full_name}
                                            />
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                    <div className="dark:text-white">
                                        {`#` + candidate.candidate_number}
                                    </div>
                                    <div>
                                        <div className="uppercase font-bold">
                                            {candidate.full_name}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {candidate.nickname}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="text-center px-3 py-2 uppercase">
                                {candidate.gender}
                            </td>
                            {showAction && (
                                <td>
                                    <div className="justify-center px-3 py-2 flex space-x-1">
                                        <PrimaryButton
                                            className="!p-2"
                                            onClick={() =>
                                                handleEditMode(candidate)
                                            }
                                        >
                                            Edit
                                        </PrimaryButton>
                                        <PrimaryButton
                                            className="!p-2"
                                            onClick={() => {
                                                deleteCandidate(candidate.id);
                                            }}
                                        >
                                            Delete
                                        </PrimaryButton>
                                    </div>
                                </td>
                            )}
                        </tr>
                    );
                })}
            </TableComponent>
        </>
    );
}
