import TableComponent from "@/Components/TableComponent";
import { useRef } from "react";
import { forwardRef } from "react";

function RenderTable({ criteria, candidates, gender, judges }) {
    candidates.sort(
        (a, b) =>
            b.scores[criteria.id]["total"] - a.scores[criteria.id]["total"]
    );

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
                                    {index + 1}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </TableComponent>
        </div>
    );
}

function RenderTotalTable({ candidates, gender, judges, criterias }) {
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
                                    {index + 1}
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
                candidates={candidates}
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

                <div className="p-2 break-after-page" key={criteria.name}>
                    <div className="uppercase text-2xl font-bold dark:text-white">
                        {criteria
                            ? criteria.name + ` - Round ` + criteria.round
                            : `Grand Total`}
                    </div>
                    <hr />

                    {maleCandidates && (
                        <div className="my-2">
                            {criteria &&
                                renderScores(maleCandidates, criteria, "male")}
                            {!criteria && (
                                <RenderTotalTable
                                    candidates={maleCandidates}
                                    gender="male"
                                    criterias={criterias}
                                    judges={judges}
                                />
                            )}
                        </div>
                    )}
                    {femaleCandidates && (
                        <div className="my-2 break-before-page">
                            {criteria &&
                                renderScores(
                                    femaleCandidates,
                                    criteria,
                                    "female"
                                )}
                            {!criteria && (
                                <RenderTotalTable
                                    candidates={femaleCandidates}
                                    gender="female"
                                    criterias={criterias}
                                    judges={judges}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* {criterias.map((criteria) => {
                    return (
                        <div
                            className="p-2 break-after-page"
                            key={criteria.name}
                        >
                            <div className="uppercase text-2xl font-bold dark:text-white">
                                {criteria.name + ` - Round ` + criteria.round}
                            </div>
                            <hr />
                            <div className="my-2">
                                <RenderTable
                                    key={`fem` + criteria.id}
                                    criteria={criteria}
                                    candidates={femaleCandidates}
                                    gender="female"
                                />
                            </div>
                            <div className="my-2">
                                <RenderTable
                                    key={`male` + criteria.id}
                                    criteria={criteria}
                                    candidates={maleCandidates}
                                    gender="male"
                                />
                            </div>
                        </div>
                    );
                })} */}
                {/* <div className="p-2 break-after-page">
                    <div className="uppercase text-3xl font-bold dark:text-white">
                        Grand Total of Score
                    </div>
                    <hr />
                    <div className="my-2">
                        <RenderTable
                            candidates={femaleCandidates}
                            gender="female"
                        />
                    </div>
                    <div className="my-2">
                        <RenderTable
                            candidates={maleCandidates}
                            gender="male"
                        />
                    </div>
                </div> */}
            </div>
        </div>
    );
});

// export default forwardRef(PageantPrinting, ref);
