import TableComponent from "@/Components/TableComponent";

function CandidateScoreList({
    gender = "Male",
    candidates,
    headings,
    criterias = [], // Receive criterias to map scores correctly
    current_round,
}) {
    const renderScores = (candidate) => {
        // Use criterias to look up scores by ID, ensuring order matches headings
        return criterias.map((criteria) => {
            const score = candidate.scores?.[criteria.id] ?? 0;
            return (
                <td
                    className="text-center px-3 py-2 dark:text-white"
                    key={criteria.id}
                >
                    {score}
                </td>
            );
        });
    };

    return (
        <>
            <h2 className="text-xl uppercase font-bold dark:text-white mb-4 flex items-center gap-2">
                <span className={`w-2 h-8 rounded-full ${gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                {gender + ` Candidates`}
            </h2>
            <TableComponent header={headings} className="min-w-full">
                        {candidates.length > 0 ? (
                            candidates.map((candidate, index) => {
                                const isTopRank = candidate.rank == 1;
                                return (
                                    <tr 
                                        key={candidate.id} 
                                        className={`
                                            group transition-colors duration-150 hover:bg-blue-50/50 dark:hover:bg-gray-800 
                                            ${isTopRank ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}
                                        `}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-4 items-center">
                                                <div className="shrink-0 relative">
                                                    {candidate.picture ? (
                                                        <img
                                                            className="rounded-full h-12 w-12 object-cover border-2 border-white dark:border-gray-700 shadow-sm group-hover:scale-110 transition-transform duration-200"
                                                            src={`/storage/` + candidate.picture}
                                                            alt={candidate.full_name}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                        </div>
                                                    )}
                                                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-gray-800">
                                                        #{candidate.candidate_number}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="uppercase font-bold text-gray-900 dark:text-gray-100 text-sm tracking-wide">
                                                        {candidate.full_name_last_name_first}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        {candidate.nickname}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {renderScores(candidate)}
                                        {current_round === 1 && (
                                            <>
                                                <td className="text-center px-3 py-4 dark:text-gray-300 font-mono text-sm">
                                                    {(candidate.total + candidate.deduction).toFixed(2)}
                                                </td>
                                                <td className="text-center px-3 py-4 text-red-500 font-medium text-sm">
                                                    {candidate.deduction > 0 ? `-${candidate.deduction}` : '-'}
                                                </td>
                                            </>
                                        )}
                                        <td className="text-center px-3 py-4">
                                            <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
                                                {candidate.total}
                                            </span>
                                        </td>
                                        <td className="text-center px-6 py-4">
                                            <span className={`
                                                inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                ${candidate.rank == 1 
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 ring-2 ring-yellow-400/50' 
                                                    : candidate.rank == 2 
                                                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                        : candidate.rank == 3
                                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                }
                                            `}>
                                                {candidate.rank}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={headings.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                        <p className="text-lg font-medium">No candidates found</p>
                                        <p className="text-sm">Try changing the group or round.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </TableComponent>
        </>
    );
}

export default CandidateScoreList;
