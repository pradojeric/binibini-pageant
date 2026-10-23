import { divisionOf } from "@/Utils/divisions";
import Image from "@/Components/Image";
import TableComponent from "@/Components/TableComponent";
import { cn } from "@/Utils/cn";

const TH = "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-400";
const NUM_TD = "px-4 py-3 text-right tabular-nums text-sm text-gray-700 dark:text-gray-300";
// Solid backgrounds so scrolled columns don't show through the pinned name column.
const STICKY = "sticky left-0 z-[1] border-r border-gray-100 dark:border-gray-800";

const RANK_STYLES = {
    1: "bg-yellow-100 text-gray-900 ring-2 ring-yellow-400/60 dark:bg-yellow-900/60 dark:text-yellow-200",
    2: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    3: "bg-orange-100 text-gray-900 dark:bg-orange-900/60 dark:text-orange-200",
};

function CandidateScoreList({ division, candidates, criterias = [], showDeductions }) {
    const { label, bar } = divisionOf(division);
    const columnCount = criterias.length + (showDeductions ? 5 : 3);

    return (
        <section aria-labelledby={`division-${division}`}>
            <h3
                id={`division-${division}`}
                className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
            >
                <span className={`w-1.5 h-6 rounded-full ${bar}`} aria-hidden="true"></span>
                {label} Candidates
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    ({candidates.length})
                </span>
            </h3>
            <TableComponent customHeader className="min-w-full">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <th scope="col" className={cn(TH, STICKY, "text-left bg-gray-50 dark:bg-gray-800")}>
                            Candidate
                        </th>
                        {criterias.map((c) => (
                            <th scope="col" key={c.id} className={cn(TH, "text-right align-bottom")}>
                                <span className="block normal-case text-sm tracking-normal text-gray-800 dark:text-gray-200">
                                    {c.name}
                                </span>
                                <span className="font-medium normal-case tracking-normal tabular-nums">
                                    {c.percentage}%
                                    {c.hidden_scoring ? (
                                        <span className="ms-1.5 rounded bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                                            Staff
                                        </span>
                                    ) : null}
                                </span>
                            </th>
                        ))}
                        <th scope="col" className={cn(TH, "text-right align-bottom")}>Total</th>
                        {showDeductions && (
                            <>
                                <th scope="col" className={cn(TH, "text-right align-bottom")}>Deduction</th>
                                <th scope="col" className={cn(TH, "text-right align-bottom")}>Overall</th>
                            </>
                        )}
                        <th scope="col" className={cn(TH, "text-center align-bottom")}>Rank</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {candidates.length > 0 ? (
                        candidates.map((candidate) => (
                            <tr key={candidate.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td
                                    className={cn(
                                        STICKY,
                                        "px-4 py-3 whitespace-nowrap bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800"
                                    )}
                                >
                                    <div className="flex gap-3 items-center">
                                        <div className="shrink-0 relative">
                                            {candidate.picture ? (
                                                <Image
                                                    className="rounded-full h-10 w-10 object-cover"
                                                    src={`/storage/` + candidate.picture}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                </div>
                                            )}
                                            <span className="absolute -top-1 -right-1.5 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-gray-900 tabular-nums">
                                                #{candidate.candidate_number}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                                {candidate.full_name_last_name_first}
                                            </div>
                                            {candidate.nickname && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {candidate.nickname}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                {criterias.map((criteria) => (
                                    <td className={NUM_TD} key={criteria.id}>
                                        {candidate.scores?.[criteria.id] ?? 0}
                                    </td>
                                ))}
                                {showDeductions && (
                                    <>
                                        <td className={NUM_TD}>
                                            {(candidate.total + candidate.deduction).toFixed(2)}
                                        </td>
                                        <td className={cn(NUM_TD, candidate.deduction > 0 && "text-red-800 dark:text-red-400")}>
                                            {candidate.deduction > 0 ? `−${candidate.deduction}` : "–"}
                                        </td>
                                    </>
                                )}
                                <td className={cn(NUM_TD, "text-base font-bold text-gray-900 dark:text-white")}>
                                    {candidate.total}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span
                                        className={cn(
                                            "inline-flex items-center justify-center min-w-[2rem] h-8 px-1.5 rounded-full font-bold text-sm tabular-nums",
                                            RANK_STYLES[candidate.rank] ?? "text-gray-600 dark:text-gray-400"
                                        )}
                                    >
                                        {candidate.rank}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columnCount} className="px-6 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                                No {label} candidates are in this round.
                            </td>
                        </tr>
                    )}
                </tbody>
            </TableComponent>
        </section>
    );
}

export default CandidateScoreList;
