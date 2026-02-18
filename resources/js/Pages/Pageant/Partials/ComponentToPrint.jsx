import { useRef } from "react";
import { forwardRef } from "react";

function rankItems(candidates, sortedBy = "total") {
    // Copy candidates (shallow clone objects) and sort by the chosen total
    const sortedData = candidates.map(c => ({ ...c })).sort((a, b) => {
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
        <div className="mt-2 text-gray-900">
            <h2 className="uppercase font-bold text-xl mb-2">{gender} Candidates</h2>
            <div className="overflow-x-auto border border-gray-200 bg-white">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                            {!(
                                criteria.is_subtotal ||
                                criteria.is_grand_total ||
                                criteria.hidden_scoring
                            ) &&
                                judges.map((judge) => {
                                    return (
                                        <th
                                            key={`judge` + judge.id}
                                            className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {judge.name}
                                        </th>
                                    );
                                })}
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {candidates.map((candidate, index) => {
                            return (
                                <tr key={`cand` + candidate.id}>
                                    <td>
                                        <div className="flex space-x-4 items-center px-3 py-2">
                                            <div className="text-gray-900 font-medium">
                                                {`#` + candidate.candidate_number}
                                            </div>
                                            <div>
                                                <div className="uppercase font-bold text-gray-900 whitespace-nowrap">
                                                    {
                                                        candidate.full_name_last_name_first
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
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
                                                    className="px-3 py-1 text-center text-gray-900"
                                                >
                                                    {
                                                        candidate.scores[
                                                            criteria.id
                                                        ][judge.id]
                                                    }
                                                </td>
                                            );
                                        })}
                                    <td className="px-3 py-1 text-center font-bold text-gray-900">
                                        {candidate.scores[criteria.id]["total"]}
                                    </td>
                                    <td className="px-3 py-1 text-center font-bold text-gray-900">
                                        {candidate.rank}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
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
                <h1 className="uppercase font-extrabold tracking-wide text-3xl text-gray-900 text-center">
                    {pageant.pageant}
                </h1>

                {sections.map(({ list, gender }) =>
                    list.length > 0 ? (
                        <div key={gender} className="p-2 break-after-page">
                            <div className="uppercase text-2xl font-bold text-gray-900">
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
