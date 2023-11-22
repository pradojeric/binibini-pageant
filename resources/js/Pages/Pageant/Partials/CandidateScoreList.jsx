import TableComponent from "@/Components/TableComponent";

function CandidateScoreList({ gender = "Male", candidates, headings }) {
    const renderScores = (candidate) => {
        const scores = Object.values(candidate.scores);

        return scores.map((score, index) => {
            return (
                <td
                    className="text-center px-3 py-2 dark:text-white"
                    key={index}
                >
                    {score}
                </td>
            );
        });
    };

    return (
        <>
            <h2 className="text-xl uppercase font-bold dark:text-white">
                {gender + ` Candidate`}
            </h2>
            <TableComponent header={headings}>
                {candidates.map((candidate, index) => {
                    return (
                        <tr key={candidate.id}>
                            <td className="text-center px-3 py-2 dark:text-white">
                                {index + 1}
                            </td>
                            <td>
                                <div className="flex space-x-4 items-center px-3 py-2">
                                    <div className="shrink-0">
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
                                        <div className="uppercase font-bold  dark:text-gray-200 whitespace-nowrap">
                                            {
                                                candidate.full_name_last_name_first
                                            }
                                        </div>
                                        <div className="text-sm dark:text-gray-400">
                                            {candidate.nickname}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            {renderScores(candidate)}
                            <td className="text-center px-3 py-2 dark:text-white">
                                {candidate.total}
                            </td>
                        </tr>
                    );
                })}
            </TableComponent>
            ;
        </>
    );
}

export default CandidateScoreList;
