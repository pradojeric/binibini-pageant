import { useRef } from "react";
import { forwardRef } from "react";

function rankItems(candidates, sortedBy = "total") {
    const sortedData = candidates.map(c => ({ ...c })).sort((a, b) => {
        const aScore =
            sortedBy === "total" ? a.total : a.scores[sortedBy].total;
        const bScore =
            sortedBy === "total" ? b.total : b.scores[sortedBy].total;
        return bScore - aScore;
    });

    let i = 0;
    while (i < sortedData.length) {
        const groupScore =
            sortedBy === "total"
                ? sortedData[i].total
                : sortedData[i].scores[sortedBy].total;
        let j = i;
        let rankSum = 0;
        while (
            j < sortedData.length &&
            (sortedBy === "total"
                ? sortedData[j].total
                : sortedData[j].scores[sortedBy].total) === groupScore
        ) {
            rankSum += j + 1;
            j++;
        }
        const averageRank = (rankSum / (j - i)).toFixed(1);
        for (let k = i; k < j; k++) {
            sortedData[k].rank = averageRank;
        }
        i = j;
    }

    return sortedData;
}

function RenderTable({ criteria, allCandidates, gender, judges, criterias }) {
    const candidates = rankItems(allCandidates, criteria.id);

    const isSubtotal = criteria.is_subtotal;
    const isGrandTotal = criteria.is_grand_total;
    const isRegular = !isSubtotal && !isGrandTotal;

    // For subtotal: get individual criteria in this round
    const roundCriterias = isSubtotal
        ? criterias.filter(c => c.round === criteria.round && !c.is_subtotal && !c.is_grand_total)
        : [];

    // For grand total: get all subtotal entries
    const subtotalEntries = isGrandTotal
        ? criterias.filter(c => c.is_subtotal)
        : [];

    // Check if any candidate has deductions
    const hasDeductions = isSubtotal
        ? candidates.some(c => {
            const roundName = criteria.round_name;
            return (c.roundDeductions?.[roundName] ?? 0) > 0;
        })
        : isGrandTotal
        ? candidates.some(c => (c.totalDeduction ?? 0) > 0)
        : false;

    return (
        <div className="mt-2 text-gray-900">
            <h2 className="uppercase font-bold text-xl mb-2">{gender} Candidates</h2>
            <div className="overflow-x-auto border border-gray-200 bg-white">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>

                            {/* Regular criteria: show judge columns */}
                            {isRegular && !criteria.hidden_scoring &&
                                judges.map((judge) => (
                                    <th
                                        key={`judge` + judge.id}
                                        className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {judge.name}
                                    </th>
                                ))}

                            {/* Subtotal: show per-criteria columns */}
                            {isSubtotal &&
                                roundCriterias.map((c) => (
                                    <th
                                        key={`crit-${c.id}`}
                                        className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {c.name}
                                    </th>
                                ))}

                            {/* Grand total: show per-round columns */}
                            {isGrandTotal &&
                                subtotalEntries.map((s) => (
                                    <th
                                        key={`round-${s.id}`}
                                        className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {s.round_name}
                                    </th>
                                ))}

                            {/* Deduction column if applicable */}
                            {hasDeductions && (
                                <th className="px-3 py-2 text-center text-xs font-medium text-red-500 uppercase tracking-wider">
                                    Deduction
                                </th>
                            )}

                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {candidates.map((candidate) => {
                            const roundDeduction = isSubtotal
                                ? (candidate.roundDeductions?.[criteria.round_name] ?? 0)
                                : 0;
                            const totalDeduction = candidate.totalDeduction ?? 0;

                            return (
                                <tr key={`cand` + candidate.id}>
                                    <td>
                                        <div className="flex space-x-4 items-center px-3 py-2">
                                            <div className="text-gray-900 font-medium">
                                                {`#` + candidate.candidate_number}
                                            </div>
                                            <div>
                                                <div className="uppercase font-bold text-gray-900 whitespace-nowrap">
                                                    {candidate.full_name_last_name_first}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {candidate.nickname}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Regular: judge scores */}
                                    {isRegular && !criteria.hidden_scoring &&
                                        judges.map((judge) => (
                                            <td
                                                key={`judge-cand` + judge.id}
                                                className="px-3 py-1 text-center text-gray-900"
                                            >
                                                {candidate.scores[criteria.id][judge.id]}
                                            </td>
                                        ))}

                                    {/* Subtotal: per-criteria totals */}
                                    {isSubtotal &&
                                        roundCriterias.map((c) => (
                                            <td
                                                key={`crit-score-${c.id}`}
                                                className="px-3 py-1 text-center text-gray-900"
                                            >
                                                {candidate.scores[c.id]?.total ?? 0}
                                            </td>
                                        ))}

                                    {/* Grand total: per-round subtotals (raw, before deduction) */}
                                    {isGrandTotal &&
                                        subtotalEntries.map((s) => {
                                            const subtotalScore = candidate.scores[s.id]?.total ?? 0;
                                            const ded = candidate.roundDeductions?.[s.round_name] ?? 0;
                                            // subtotal already has deduction subtracted, add it back for raw display
                                            const rawScore = subtotalScore + ded;
                                            return (
                                                <td
                                                    key={`round-score-${s.id}`}
                                                    className="px-3 py-1 text-center text-gray-900"
                                                >
                                                    {rawScore}
                                                </td>
                                            );
                                        })}

                                    {/* Deduction value */}
                                    {hasDeductions && (
                                        <td className="px-3 py-1 text-center text-red-600 font-medium">
                                            {isSubtotal && roundDeduction > 0 ? `-${roundDeduction}` : ''}
                                            {isGrandTotal && totalDeduction > 0 ? `-${totalDeduction}` : ''}
                                            {((isSubtotal && roundDeduction === 0) || (isGrandTotal && totalDeduction === 0)) ? '0' : ''}
                                        </td>
                                    )}

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
                                <RenderTable
                                    criteria={criteria}
                                    allCandidates={list}
                                    judges={judges}
                                    gender={gender}
                                    criterias={criterias}
                                />
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
});
