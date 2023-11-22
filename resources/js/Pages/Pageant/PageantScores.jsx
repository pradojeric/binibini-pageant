import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SelectInput from "@/Components/SelectInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateScoreList from "@/Pages/Pageant/Partials/CandidateScoreList";
import { Head, Link, router } from "@inertiajs/react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

export default function PageantScores({
    auth,
    pageant,
    maleCandidates = [],
    femaleCandidates = [],
    criterias,
}) {
    const [femCan, setFemCan] = useState(femaleCandidates);
    const [maleCan, setMaleCan] = useState(maleCandidates);
    const [crits, setCrits] = useState(criterias);

    const headings = ["Rank", "Candidate Name"];
    const roundList = Array.from({ length: pageant.rounds }, (_, i) => i + 1);

    // return <>{console.log(criterias)}</>;

    useEffect(() => {
        setFemCan(femaleCandidates);
        setMaleCan(maleCandidates);
        setCrits(criterias);
    }, [pageant]);

    const sortFunction = (i) => {
        const femSort = [...femaleCandidates];
        const maleSort = [...maleCandidates];
        femSort.sort((a, b) => {
            if (i === "total") return b.total - a.total;
            return b.scores[i] - a.scores[i];
        });
        maleSort.sort((a, b) => {
            if (i === "total") return b.total - a.total;
            return b.scores[i] - a.scores[i];
        });

        setFemCan(femSort);
        setMaleCan(maleSort);
    };

    crits.map((criteria) => {
        headings.push(criteria.name + ` (` + criteria.percentage + `)`);
    });

    headings.push("Total");

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {pageant.pageant} Scores
                </h2>
            }
        >
            <Head title="Pageant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex space-x-2 justify-end">
                                <Link
                                    href={route(
                                        "pageant.for-printing",
                                        pageant.id
                                    )}
                                >
                                    <PrimaryButton>Summary</PrimaryButton>
                                </Link>
                                {pageant.status != "finished" && (
                                    <Link>
                                        <PrimaryButton>
                                            End Pageant
                                        </PrimaryButton>
                                    </Link>
                                )}
                            </div>
                            <div className="uppercase dark:text-white text-lg">
                                Current Round:{" "}
                                {pageant.current_round ?? "Not Yet Started"}
                            </div>
                            <div className="uppercase dark:text-white text-lg">
                                Total Rounds: {pageant.rounds}
                            </div>

                            <div className="flex justify-between">
                                <form>
                                    <InputLabel value="Change Round" />
                                    <SelectInput
                                        name="round"
                                        onChange={(e) => {
                                            router.put(
                                                route("pageant.change-round", {
                                                    pageant: pageant.id,
                                                    round: e.target.value,
                                                })
                                            );
                                        }}
                                    >
                                        <option value="">Select</option>
                                        <option value="">Round 0</option>
                                        {roundList.map((round, index) => {
                                            return (
                                                <option
                                                    value={round}
                                                    key={`R` + index}
                                                >
                                                    {round}
                                                </option>
                                            );
                                        })}
                                    </SelectInput>
                                </form>
                                <form>
                                    <InputLabel value="Sort By" />
                                    <SelectInput
                                        name="criteria"
                                        defaultValue="total"
                                        onChange={(e) => {
                                            sortFunction(e.target.value);
                                        }}
                                    >
                                        <option value="total">
                                            Total Points
                                        </option>
                                        {crits.map((criteria) => {
                                            return (
                                                <option
                                                    key={
                                                        `criteria-` +
                                                        criteria.id
                                                    }
                                                    value={criteria.id}
                                                >
                                                    {criteria.name}
                                                </option>
                                            );
                                        })}
                                    </SelectInput>
                                </form>
                            </div>

                            <hr className="mt-4 mb-2" />
                            {(pageant.type == "mr" ||
                                pageant.type == "mr&ms") && (
                                <CandidateScoreList
                                    gender="Male"
                                    candidates={maleCan}
                                    headings={headings}
                                ></CandidateScoreList>
                            )}
                            {(pageant.type == "ms" ||
                                pageant.type == "mr&ms") && (
                                <CandidateScoreList
                                    gender="Female"
                                    candidates={femCan}
                                    headings={headings}
                                ></CandidateScoreList>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
