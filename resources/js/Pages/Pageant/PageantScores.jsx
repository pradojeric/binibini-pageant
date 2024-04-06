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
    const [groupList, setGroupList] = useState([1]);

    const roundList = Array.from({ length: pageant.rounds }, (_, i) => i + 1);

    const headings = ["Rank", "Candidate Name"];

    // return <>{console.log(criterias)}</>;

    useEffect(() => {
        setFemCan(femaleCandidates);
        setMaleCan(maleCandidates);
        setCrits(criterias);

        const organizedData = criterias.reduce((acc, item) => {
            if (!acc[item.round]) {
                acc[item.round] = {};
            }
            if (!acc[item.round][item.group]) {
                acc[item.round][item.group] = [];
            }
            acc[item.round][item.group].push(item.name);
            return acc;
        }, {});

        if (!organizedData[pageant.current_round]) {
            setGroupList([]);
            return;
        }

        const groups = Object.keys(organizedData[pageant.current_round]);
        const highestGroup = Math.max(...groups.map(Number)); // Convert keys to numbers and find the max
        setGroupList(Array.from({ length: highestGroup }, (_, i) => i + 1));
    }, [pageant]);

    useEffect(() => {
        //
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
                                Current Group:{" "}
                                {pageant.current_group ?? "Not Yet Started"}
                            </div>
                            <div className="uppercase dark:text-white text-lg">
                                Total Rounds: {pageant.rounds}
                            </div>

                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    <form>
                                        <InputLabel value="Change Round" />
                                        <SelectInput
                                            name="round"
                                            onChange={(e) => {
                                                router.put(
                                                    route(
                                                        "pageant.change-round",
                                                        {
                                                            pageant: pageant.id,
                                                            round: e.target
                                                                .value,
                                                        }
                                                    )
                                                );
                                            }}
                                        >
                                            <option value="" hidden>
                                                Select
                                            </option>
                                            <option value="0">Round 0</option>
                                            {pageant.pageant_rounds.map(
                                                (round, index) => {
                                                    return (
                                                        <option
                                                            value={round.round}
                                                            key={`R` + index}
                                                        >
                                                            {`Round ${round.round}`}
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </SelectInput>
                                    </form>
                                    <form>
                                        <InputLabel value="Change Group" />
                                        <SelectInput
                                            name="group"
                                            onChange={(e) => {
                                                router.put(
                                                    route(
                                                        "pageant.change-group",
                                                        {
                                                            pageant: pageant.id,
                                                            group: e.target
                                                                .value,
                                                        }
                                                    )
                                                );
                                            }}
                                        >
                                            <option value="" hidden>
                                                Select
                                            </option>
                                            <option value="0">Group 0</option>
                                            {groupList.map((group, index) => {
                                                return (
                                                    <option
                                                        value={group}
                                                        key={`G` + index}
                                                    >
                                                        {`Group ${group}`}
                                                    </option>
                                                );
                                            })}
                                        </SelectInput>
                                    </form>
                                </div>

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

                            <div className="mt-4">
                                <Link href={route("scoring.admin", pageant.id)}>
                                    <PrimaryButton>
                                        Score Hidden Criteria
                                    </PrimaryButton>
                                </Link>
                                <Link
                                    href={route(
                                        "pageant.candidates.select",
                                        pageant.id
                                    )}
                                >
                                    <PrimaryButton>
                                        Select Round Candidate
                                    </PrimaryButton>
                                </Link>
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
