import { DIVISION_KEYS, divisionOf } from "@/Utils/divisions";
import { forwardRef } from "react";

// Scores can be decimals; summing them leaves float tails (85.30000000001) that must not print
// or split a tie the reader sees as equal.
const roundScore = (value) => Math.round((Number(value) || 0) * 100) / 100;

const formatRank = (rank) => (Number.isInteger(rank) ? String(rank) : rank.toFixed(1));

const criteriaTitle = (criteria) =>
    criteria.is_grand_total ? criteria.round_name : `${criteria.round_name} - ${criteria.name}`;

function roundCriteriasOf(criteria, criterias) {
    return criterias.filter(c => c.round === criteria.round && !c.is_subtotal && !c.is_grand_total);
}

function subtotalEntriesOf(criterias) {
    return criterias.filter(c => c.is_subtotal);
}

// Score columns between Candidate and Total; drives the paper orientation.
export function scoreColumnCount(criteria, criterias, judges) {
    if (!criteria) return 0;
    if (criteria.is_grand_total) return subtotalEntriesOf(criterias).length;
    if (criteria.is_subtotal) return roundCriteriasOf(criteria, criterias).length;
    return criteria.hidden_scoring ? 0 : judges.length;
}

function rankItems(candidates, sortedBy = "total") {
    const scoreOf = (c) => roundScore(sortedBy === "total" ? c.total : c.scores[sortedBy].total);
    const sortedData = candidates.map(c => ({ ...c })).sort((a, b) => scoreOf(b) - scoreOf(a));

    let i = 0;
    while (i < sortedData.length) {
        const groupScore = scoreOf(sortedData[i]);
        let j = i;
        let rankSum = 0;
        while (j < sortedData.length && scoreOf(sortedData[j]) === groupScore) {
            rankSum += j + 1;
            j++;
        }
        const averageRank = rankSum / (j - i);
        for (let k = i; k < j; k++) {
            sortedData[k].rank = averageRank;
        }
        i = j;
    }

    return sortedData;
}

const TH = "px-2 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-800";
const TH_NUM = `${TH} text-right`;
const TD_NUM = "px-2 py-1.5 text-right tabular-nums text-gray-900";

function RenderTable({ criteria, allCandidates, judges, criterias }) {
    const candidates = rankItems(allCandidates, criteria.id);

    const isSubtotal = criteria.is_subtotal;
    const isGrandTotal = criteria.is_grand_total;
    const isRegular = !isSubtotal && !isGrandTotal;

    const roundCriterias = isSubtotal ? roundCriteriasOf(criteria, criterias) : [];
    const subtotalEntries = isGrandTotal ? subtotalEntriesOf(criterias) : [];

    const hasDeductions = isSubtotal
        ? candidates.some(c => (c.roundDeductions?.[criteria.round_name] ?? 0) > 0)
        : isGrandTotal
        ? candidates.some(c => (c.totalDeduction ?? 0) > 0)
        : false;

    return (
        <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-sm print:text-xs">
                <thead>
                    <tr>
                        <th className={`${TH} text-left`}>Candidate</th>

                        {isRegular && !criteria.hidden_scoring &&
                            judges.map((judge) => (
                                <th key={`judge` + judge.id} className={TH_NUM}>
                                    {judge.name}
                                </th>
                            ))}

                        {isSubtotal &&
                            roundCriterias.map((c) => (
                                <th key={`crit-${c.id}`} className={TH_NUM}>
                                    {c.name}
                                </th>
                            ))}

                        {isGrandTotal &&
                            subtotalEntries.map((s) => (
                                <th key={`round-${s.id}`} className={TH_NUM}>
                                    {s.round_name}
                                </th>
                            ))}

                        {hasDeductions && <th className={TH_NUM}>Deduction</th>}

                        <th className={TH_NUM}>Total</th>
                        <th className={TH_NUM}>Rank</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                    {candidates.map((candidate) => {
                        const deduction = isSubtotal
                            ? (candidate.roundDeductions?.[criteria.round_name] ?? 0)
                            : (candidate.totalDeduction ?? 0);

                        return (
                            <tr key={`cand` + candidate.id} className="break-inside-avoid">
                                <td className="px-2 py-1.5">
                                    <div className="flex gap-3 items-baseline">
                                        <span className="font-medium tabular-nums text-gray-900">
                                            {`#` + candidate.candidate_number}
                                        </span>
                                        <div>
                                            <div className="uppercase font-bold text-gray-900">
                                                {candidate.full_name_last_name_first}
                                            </div>
                                            {candidate.nickname && (
                                                <div className="text-xs text-gray-600">{candidate.nickname}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {isRegular && !criteria.hidden_scoring &&
                                    judges.map((judge) => (
                                        <td key={`judge-cand` + judge.id} className={TD_NUM}>
                                            {roundScore(candidate.scores[criteria.id][judge.id])}
                                        </td>
                                    ))}

                                {isSubtotal &&
                                    roundCriterias.map((c) => (
                                        <td key={`crit-score-${c.id}`} className={TD_NUM}>
                                            {roundScore(candidate.scores[c.id]?.total)}
                                        </td>
                                    ))}

                                {/* Grand total: per-round subtotals (raw, before deduction) */}
                                {isGrandTotal &&
                                    subtotalEntries.map((s) => {
                                        const subtotalScore = candidate.scores[s.id]?.total ?? 0;
                                        const ded = candidate.roundDeductions?.[s.round_name] ?? 0;
                                        // subtotal already has deduction subtracted, add it back for raw display
                                        return (
                                            <td key={`round-score-${s.id}`} className={TD_NUM}>
                                                {roundScore(subtotalScore + ded)}
                                            </td>
                                        );
                                    })}

                                {hasDeductions && (
                                    <td className={`${TD_NUM} font-medium`}>
                                        {deduction > 0 ? `−${roundScore(deduction)}` : "0"}
                                    </td>
                                )}

                                <td className={`${TD_NUM} font-bold`}>
                                    {roundScore(candidate.scores[criteria.id].total)}
                                </td>
                                <td className={`${TD_NUM} font-bold`}>
                                    {formatRank(candidate.rank)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function Signatures({ judges }) {
    const signers = [...judges.map(judge => ({ key: `judge-${judge.id}`, name: judge.name, role: "Judge" })),
        { key: "tabulator", name: "", role: "Tabulator" }];

    return (
        <div className="mt-10 grid grid-cols-3 gap-x-8 gap-y-8 break-inside-avoid">
            {signers.map(({ key, name, role }) => (
                <div key={key} className="text-xs text-gray-700">
                    <div className="h-8 border-b border-gray-800" />
                    <div className="mt-1 font-semibold uppercase text-gray-900">{name || " "}</div>
                    <div>{role}</div>
                </div>
            ))}
        </div>
    );
}

export default forwardRef(function ComponentToPrint(
    {
        pageant,
        candidatesByDivision = {},
        criterias = [],
        criteria,
        judges = [],
        printedAt,
    },
    ref
) {
    const sections = DIVISION_KEYS
        .filter((key) => candidatesByDivision[key]?.length > 0)
        .map((key) => ({ key, list: candidatesByDivision[key], label: divisionOf(key).label }));

    const printedLabel = printedAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

    return (
        <div ref={ref} className="p-6 print:p-0 text-gray-900">
            {sections.length === 0 && (
                <div className="py-24 text-center">
                    <p className="font-semibold">No candidates in {criteriaTitle(criteria)} yet.</p>
                    <p className="mt-1 text-sm text-gray-600">
                        Select candidates into this round before printing its results.
                    </p>
                </div>
            )}

            {/* Each division is a standalone sheet: it repeats the heading so a loose page still says what it is. */}
            {sections.map(({ key, list, label }, index) => (
                <section key={key} className={index > 0 ? "break-before-page pt-6 print:pt-0" : undefined}>
                    <header className="text-center">
                        <h1 className="uppercase font-extrabold tracking-wide text-2xl">{pageant.pageant}</h1>
                        <p className="mt-1 uppercase text-lg font-bold">{criteriaTitle(criteria)}</p>
                        <p className="uppercase text-sm font-semibold text-gray-700">{label} Candidates</p>
                    </header>

                    <div className="mt-4">
                        <RenderTable
                            criteria={criteria}
                            allCandidates={list}
                            judges={judges}
                            criterias={criterias}
                        />
                    </div>

                    <Signatures judges={judges} />

                    <p className="mt-6 text-xs text-gray-600">Printed {printedLabel}</p>
                </section>
            ))}
        </div>
    );
});
