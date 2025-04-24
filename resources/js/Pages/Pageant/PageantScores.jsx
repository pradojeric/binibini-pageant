import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateScoreList from "@/Pages/Pageant/Partials/CandidateScoreList";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@material-tailwind/react";

function rankItems(candidates, sortedBy = "total") {
    if (!candidates.length) return [];

    // 1. Pick the right score extractor
    const getScore = (item) =>
        sortedBy === "total" ? item.total : item.scores[sortedBy];

    // 2. Sort descending (clone so we don’t mutate)
    const sorted = [...candidates].sort((a, b) => getScore(b) - getScore(a));

    // 3. Build a map: scoreValue → array of positions (1-based)
    const scorePositions = new Map();
    sorted.forEach((item, idx) => {
        const sc = getScore(item);
        const pos = idx + 1;
        if (!scorePositions.has(sc)) scorePositions.set(sc, []);
        scorePositions.get(sc).push(pos);
    });

    // 4. Compute average rank per score
    const scoreRank = new Map();
    for (let [sc, positions] of scorePositions.entries()) {
        const sum = positions.reduce((a, b) => a + b, 0);
        scoreRank.set(sc, (sum / positions.length).toFixed(1));
    }

    // 5. Attach the computed rank to each item and return
    return sorted.map((item) => ({
        ...item,
        rank: scoreRank.get(getScore(item)),
    }));
}

export default function PageantScores({
    auth,
    pageant,
    maleCandidates = [],
    femaleCandidates = [],
    criterias,
}) {
    const [femCan, setFemCan] = useState([]);
    const [maleCan, setMaleCan] = useState([]);
    const [crits, setCrits] = useState(criterias);
    const [groupList, setGroupList] = useState([1]);

    // const headings = ["Candidate Name"];
    const headings = useMemo(
        () => [
            "Candidate Name",
            ...criterias.map((c) => `${c.name} (${c.percentage})`),
            "Total",
            ...(pageant.current_round === 1 ? ["Deduction", "Overall"] : []),
            "Rank",
        ],
        [criterias, pageant.current_round]
    );

    useEffect(() => {
        setFemCan(rankItems(femaleCandidates));
        setMaleCan(rankItems(maleCandidates));
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

    const sortFunction = (i) => {
        // const femSort = [...femaleCandidates];
        // const maleSort = [...maleCandidates];
        // femSort.sort((a, b) => {
        //     if (i === "total") return b.total - a.total;
        //     return b.scores[i] - a.scores[i];
        // });
        // maleSort.sort((a, b) => {
        //     if (i === "total") return b.total - a.total;
        //     return b.scores[i] - a.scores[i];
        // });

        setFemCan(rankItems(femaleCandidates, i));
        setMaleCan(rankItems(maleCandidates, i));
    };

    // crits.map((criteria) => {
    //     headings.push(criteria.name + ` (` + criteria.percentage + `)`);
    // });

    // headings.push("Total");
    // if (pageant.current_round == 1) {
    //     headings.push("Deduction");
    //     headings.push("Overall");
    // }
    // headings.push("Rank");

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
                                    <Button
                                        color="yellow"
                                        className="transition duration-300 ease-in-out hover:bg-yellow-600"
                                    >
                                        Summary
                                    </Button>
                                </Link>

                                <Button
                                    onClick={(e) => {
                                        if (
                                            confirm(
                                                "Are you sure? Not irreversable"
                                            )
                                        ) {
                                            alert("Success");
                                            router.get(
                                                route(
                                                    "pageant.reset-scores",
                                                    pageant.id
                                                )
                                            );
                                        }
                                    }}
                                    color="blue"
                                    className="transition duration-300 ease-in-out hover:bg-blue-600"
                                >
                                    Reset Score
                                </Button>

                                {pageant.status != "finished" && (
                                    <Link>
                                        <Button
                                            color="red"
                                            className="transition duration-300 ease-in-out hover:bg-red-600"
                                        >
                                            End Pageant
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className=" dark:text-white text-lg">
                                Current Round:{" "}
                                <span className="text-2xl">
                                    {" "}
                                    {pageant.current_round ?? "Not Yet Started"}
                                </span>
                            </div>
                            <div className=" dark:text-white text-lg">
                                Current Group:{" "}
                                <span className="text-2xl">
                                    {pageant.current_group ?? "Not Yet Started"}
                                </span>
                            </div>
                            <div className=" dark:text-white text-lg">
                                Total Rounds:
                                <span className="text-2xl">
                                    {" "}
                                    {pageant.rounds}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    <form className="space-y-2">
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
                                            <option value="0">
                                                Not started
                                            </option>
                                            {pageant.pageant_rounds.map(
                                                (round, index) => {
                                                    return (
                                                        <option
                                                            value={round.round}
                                                            key={`R` + index}
                                                        >
                                                            {`${round.round_name}`}
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </SelectInput>
                                    </form>
                                    <form className="space-y-2">
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

                            <div className="mt-4 space-x-2">
                                <Link href={route("scoring.admin", pageant.id)}>
                                    <Button
                                        color="green"
                                        className="transition duration-300 ease-in-out hover:bg-green-600"
                                    >
                                        Score Hidden Criteria
                                    </Button>
                                </Link>

                                <Link
                                    href={route(
                                        "pageant.candidates.select",
                                        pageant.id
                                    )}
                                >
                                    <Button
                                        color="blue"
                                        className="transition duration-300 ease-in-out hover:bg-blue-600"
                                    >
                                        Select Round Candidate
                                    </Button>
                                </Link>

                                <Link
                                    href={route("pageant.deduct", pageant.id)}
                                >
                                    <Button
                                        color="red"
                                        className="transition duration-300 ease-in-out hover:bg-red-600"
                                    >
                                        Deduct Points
                                    </Button>
                                </Link>
                            </div>

                            <hr className="mt-4 mb-2" />
                            {/* {(pageant.type == "mr" ||
                                pageant.type == "mr&ms") && (
                                <CandidateScoreList
                                    gender="Male"
                                    candidates={maleCan}
                                    headings={headings}
                                    current_round={pageant.current_round}
                                ></CandidateScoreList>
                            )}
                            {(pageant.type == "ms" ||
                                pageant.type == "mr&ms") && (
                                <CandidateScoreList
                                    gender="Female"
                                    candidates={femCan}
                                    headings={headings}
                                    current_round={pageant.current_round}
                                ></CandidateScoreList>
                            )} */}
                            {["mr", "ms"].map(
                                (sex) =>
                                    pageant.type.includes(sex) && (
                                        <CandidateScoreList
                                            key={sex}
                                            gender={
                                                sex === "mr" ? "Male" : "Female"
                                            }
                                            candidates={
                                                sex === "mr" ? maleCan : femCan
                                            }
                                            headings={headings}
                                            current_round={
                                                pageant.current_round
                                            }
                                        />
                                    )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
