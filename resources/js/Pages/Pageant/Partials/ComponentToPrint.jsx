import TableComponent from "@/Components/TableComponent";
import { useRef } from "react";
import { forwardRef } from "react";

function rankItems(candidates, sortedBy = "total") {
    // Copy candidates and sort by the chosen total
    const sortedData = [...candidates].sort((a, b) => {
        const aScore =
            sortedBy === "total" ? a.total : a.scores[sortedBy].total;
        const bScore =
            sortedBy === "total" ? b.total : b.scores[sortedBy].total;
        return bScore - aScore;
    });

    // Assign ranks, averaging ties in a single pass
    let i = 0;
    while (i < sortedData.length) {
        // Determine the score at the start of the group
        const groupScore =
            sortedBy === "total"
                ? sortedData[i].total
                : sortedData[i].scores[sortedBy].total;
        let j = i;
        let rankSum = 0;
        // Find end of tie group and sum rank positions
        while (
            j < sortedData.length &&
            (sortedBy === "total"
                ? sortedData[j].total
                : sortedData[j].scores[sortedBy].total) === groupScore
        ) {
            rankSum += j + 1;
            j++;
        }
        // Compute average rank for the tie group
        const averageRank = (rankSum / (j - i)).toFixed(1);
        // Assign average rank to each item in the group
        for (let k = i; k < j; k++) {
            sortedData[k].rank = averageRank;
        }
        // Move to next group
        i = j;
    }

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
                        {!(
                            criteria.is_subtotal ||
                            criteria.is_grand_total ||
                            criteria.hidden_scoring
                        ) &&
                            judges.map((judge) => {
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
                                {!(
                                    criteria.is_subtotal ||
                                    criteria.is_grand_total ||
                                    criteria.hidden_scoring
                                ) &&
                                    judges.map((judge) => {
                                        return (
                                            <td
                                                key={`judge-cand` + judge.id}
                                                className="px-3 py-1 text-center"
                                            >
                                                {
                                                    candidate.scores[
                                                        criteria.id
                                                    ][judge.id]
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

    const sections = [
        { list: maleCandidates, gender: "male" },
        { list: femaleCandidates, gender: "female" },
    ];

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

                {sections.map(({ list, gender }) =>
                    list.length > 0 ? (
                        <div key={gender} className="p-2 break-after-page">
                            <div className="uppercase text-2xl font-bold dark:text-white">
                                {!criteria.is_grand_total
                                    ? `${criteria.round_name} - ${criteria.name}`
                                    : `${criteria.round_name}`}
                            </div>
                            <hr />
                            <div className="my-2">
                                {renderScores(list, criteria, gender)}
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
});

// export default forwardRef(PageantPrinting, ref);
