import TableComponent from "@/Components/TableComponent";

function JudgeList({ judges }) {
    const headers = ["Name", "Email"];

    return (
        <div className="dark:text-white">
            <TableComponent header={headers}>
                {judges.map((judge) => {
                    return (
                        <tr key={judge.id}>
                            <td className="text-center px-3 py-2">
                                {judge.name}
                            </td>
                            <td className="text-center px-3 py-2">
                                {judge.email}
                            </td>
                        </tr>
                    );
                })}
            </TableComponent>
        </div>
    );
}

export default JudgeList;
