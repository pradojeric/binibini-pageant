import TableComponent from "@/Components/TableComponent";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm } from "@inertiajs/react";

export default function CriteriaList({ criterias, handleEditMode = () => {} }) {
    const { delete: destroy } = useForm({});
    const showAction = route().current("pageants.criterias.index");

    const headers = ["Round", "Group", "Name", "Percentage", "Hidden Scoring"];

    if (showAction) {
        headers.push("Action");
    }

    function deleteCriteria(id) {
        // alert(id);
        destroy(route("criterias.destroy", id), {
            onSuccess: () => alert("Successfully deleted"),
            onError: () => alert("Error deleted"),
        });
    }

    return (
        <>
            <h2 className="uppercase font-bold">List of Criterias</h2>
            <TableComponent header={headers}>
                {criterias.map((criteria, index) => (
                    <tr key={index}>
                        <td className="text-center px-3 py-2">
                            {criteria.round}
                        </td>
                        <td className="text-center px-3 py-2">
                            {criteria.group}
                        </td>
                        <td className="text-center px-3 py-2">
                            {criteria.name}
                        </td>
                        <td className="text-center px-3 py-2">
                            {criteria.percentage}
                        </td>
                        <td className="text-center px-3 py-2">
                            {criteria.hidden_scoring ? "True" : "False"}
                        </td>
                        {showAction && (
                            <td className="text-center px-3 py-2 flex space-x-1">
                                <PrimaryButton
                                    className="!p-2"
                                    onClick={() => handleEditMode(criteria)}
                                >
                                    Edit
                                </PrimaryButton>
                                <PrimaryButton
                                    className="!p-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        deleteCriteria(criteria.id);
                                    }}
                                >
                                    Delete
                                </PrimaryButton>
                            </td>
                        )}
                    </tr>
                ))}
            </TableComponent>
        </>
    );
}
