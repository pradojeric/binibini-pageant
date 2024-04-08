import TableComponent from "@/Components/TableComponent";
import { useRef } from "react";
import { forwardRef } from "react";

function rankItems(candidates, sortedBy = "total") {
    // Function to extract the total score from an item
    function getTotalScore(item, sortedBy) {
        return sortedBy === "total"
            ? item.total
            : item.scores[sortedBy]["total"];
    }

    // Function to assign the average rank for tied ranks within the sorted data
    function assignAverageRank(startIndex, endIndex, rankSum) {
        const averageRank = (rankSum / (endIndex - startIndex + 1)).toFixed(1);
        for (let i = startIndex; i <= endIndex; i++) {
            sortedData[i].rank = averageRank; // Assign the average rank as a decimal
        }
    }

    const sortedData = [...candidates].sort((a, b) => {
        return getTotalScore(b, sortedBy) - getTotalScore(a, sortedBy);
    });

    let rank = 1;
    let startIndex = 0;
    let rankSum = 0;
    let previousTotal = getTotalScore(sortedData[0], sortedBy);

    sortedData.forEach((item, index) => {
        const currentTotal = getTotalScore(item, sortedBy);
        rankSum += rank; // Sum up ranks for a potential tie calculation

        if (currentTotal === previousTotal && index !== 0) {
            // If there's a tie, continue to the next item
            if (index === sortedData.length - 1) {
                // If it's the last item, assign the average rank for the tie
                assignAverageRank(startIndex, index, rankSum);
            }
        } else {
            // If the previous items were tied, calculate their average rank
            if (index - startIndex > 1) {
                assignAverageRank(startIndex, index - 1, rankSum - rank);
            } else {
                // If there was no tie, just assign the rank normally
                sortedData[startIndex].rank = startIndex + 1;
            }
            // Update variables for the next set of items
            startIndex = index;
            rankSum = rank;
            previousTotal = currentTotal;

            // Assign rank for the last item if it's not in a tie
            if (index === sortedData.length - 1) {
                sortedData[index].rank = index + 1;
            }
        }

        rank++; // Increment rank for the next item
    });

    return sortedData;
}

function RenderTable({ criteria, allCandidates, gender, judges }) {
    const candidates = rankItems(allCandidates, criteria.id);

    return (
        <div className="dark:text-white mt-2">
            <h2 className="uppercase font-bold text-xl">{gender} Candidates</h2>
            <TableComponent customHeader={true}>
                <thead>
                    <tr>
                        <th className="px-3 py-2">Candidate</th>
                        {judges.map((judge) => {
                            return (
                                <th
                                    key={`judge` + judge.id}
                                    className="px-3 py-2"
                                >
                                    {judge.name}
                                </th>
                            );
                        })}
                        <th className="px-3 py-2">Total</th>
                        <th className="px-3 py-2">Rank</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {candidates.map((candidate, index) => {
                        return (
                            <tr key={`cand` + candidate.id}>
                                <td>
                                    <div className="flex space-x-4 items-center px-3 py-2">
                                        <div className="dark:text-white">
                                            {`#` + candidate.candidate_number}
                                        </div>
                                        <div>
                                            <div className="uppercase font-bold dark:text-gray-200 whitespace-nowrap">
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
                                {judges.map((judge) => {
                                    return (
                                        <td
                                            key={`judge-cand` + judge.id}
                                            className="px-3 py-1 text-center"
                                        >
                                            {
                                                candidate.scores[criteria.id][
                                                    judge.id
                                                ]
                                            }
                                        </td>
                                    );
                                })}
                                <td className="px-3 py-1 text-center">
                                    {candidate.scores[criteria.id]["total"]}
                                </td>
                                <td className="px-3 py-1 text-center">
                                    {candidate.rank}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </TableComponent>
        </div>
    );
}

function RenderTotalTable({ allCandidates, gender, criterias }) {
    const candidates = rankItems(allCandidates);

    return (
        <div className="dark:text-white mt-2">
            <h2 className="uppercase font-bold text-xl">{gender} Candidates</h2>
            <TableComponent customHeader={true}>
                <thead>
                    <tr>
                        <th className="px-3 py-2">Candidate</th>
                        {criterias.map((criteria) => {
                            return (
                                <th key={criteria.id} className="px-3 py-2">
                                    {criteria.name}
                                </th>
                            );
                        })}
                        <th className="px-3 py-2">Total</th>
                        <th className="px-3 py-2">Rank</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {candidates.map((candidate, index) => {
                        return (
                            <tr key={`cand` + candidate.id}>
                                <td>
                                    <div className="flex space-x-4 items-center px-3 py-2">
                                        <div className="dark:text-white">
                                            {`#` + candidate.candidate_number}
                                        </div>
                                        <div className="grow-0">
                                            <div className="uppercase font-bold dark:text-gray-200 whitespace-nowrap">
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
                                {criterias.map((criteria) => {
                                    return (
                                        <td
                                            key={criteria.id}
                                            className="px-3 py-1 text-center"
                                        >
                                            {
                                                candidate.scores[criteria.id][
                                                    "total"
                                                ]
                                            }
                                        </td>
                                    );
                                })}

                                <td className="px-3 py-1 text-center">
                                    {candidate.total}
                                </td>
                                <td className="px-3 py-1 text-center">
                                    {candidate.rank}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </TableComponent>
        </div>
    );
}

export default forwardRef(function PageantPrinting(
    {
        pageant,
        maleCandidates = [],
        femaleCandidates = [],
        criterias = [],
        criteria,
        judges = [],
    },
    ref
) {
    const compRef = ref ? ref : useRef();

    const renderScores = (candidates, criteria, gender) => {
        return (
            <RenderTable
                key={`male` + criteria.id}
                criteria={criteria}
                allCandidates={candidates}
                judges={judges}
                gender={gender}
            />
        );
    };

    return (
        <div className="p-6">
            <div ref={compRef}>
                <h1 className="uppercase font-extrabold tracking-wide text-3xl dark:text-white text-center">
                    {pageant.pageant}
                </h1>

                {maleCandidates.length > 0 && (
                    <>
                        <div
                            className="p-2 break-after-page"
                            key={criteria.name}
                        >
                            <div className="uppercase text-2xl font-bold dark:text-white">
                                {criteria
                                    ? criteria.name +
                                      ` - Round ` +
                                      criteria.round
                                    : `Grand Total`}
                            </div>
                            <hr />
                            <div className="my-2">
                                {criteria &&
                                    renderScores(
                                        maleCandidates,
                                        criteria,
                                        "male"
                                    )}
                                {!criteria && (
                                    <RenderTotalTable
                                        allCandidates={maleCandidates}
                                        gender="male"
                                        criterias={criterias}
                                        judges={judges}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
                {femaleCandidates.length > 0 && (
                    <>
                        <div
                            className="p-2 break-after-page"
                            key={criteria.name}
                        >
                            <div className="uppercase text-2xl font-bold dark:text-white">
                                {criteria
                                    ? criteria.name +
                                      ` - Round ` +
                                      criteria.round
                                    : `Grand Total`}
                            </div>
                            <hr />
                            <div className="my-2">
                                {criteria &&
                                    renderScores(
                                        femaleCandidates,
                                        criteria,
                                        "female"
                                    )}
                                {!criteria && (
                                    <RenderTotalTable
                                        allCandidates={femaleCandidates}
                                        gender="female"
                                        criterias={criterias}
                                        judges={judges}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

// export default forwardRef(PageantPrinting, ref);
