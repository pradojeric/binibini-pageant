import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SelectInput from "@/Components/SelectInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateScoreList from "@/Pages/Pageant/Partials/CandidateScoreList";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Button, Typography, Select, Option } from "@material-tailwind/react";
function rankItems(candidates, sortedBy = "total") {
    if (candidates.length < 1) return [];
    // Function to extract the total score from an item
    function getTotalScore(item, sortedBy) {
        return sortedBy === "total" ? item.total : item.scores[sortedBy];
    }

    // Function to assign the average rank for tied ranks within the sorted data
    function assignAverageRank(startIndex, endIndex, rankSum) {
        const averageRank = (rankSum / (endIndex - startIndex + 1)).toFixed(1);
        for (let i = startIndex; i <= endIndex; i++) {
            sortedData[i].rank = averageRank; // Assign the average rank as a decimal
        }
    }

    const sortedData = [...candidates].sort((a, b) => {
        return getTotalScore(b, sortedBy) - getTotalScore(a, sortedBy);
    });

    let rank = 1;
    let startIndex = 0;
    let rankSum = 0;
    let previousTotal = getTotalScore(sortedData[0], sortedBy);

    sortedData.forEach((item, index) => {
        const currentTotal = getTotalScore(item, sortedBy);
        rankSum += rank; // Sum up ranks for a potential tie calculation

        if (currentTotal === previousTotal && index !== 0) {
            // If there's a tie, continue to the next item
            if (index === sortedData.length - 1) {
                // If it's the last item, assign the average rank for the tie
                assignAverageRank(startIndex, index, rankSum);
            }
        } else {
            // If the previous items were tied, calculate their average rank
            if (index - startIndex > 1) {
                assignAverageRank(startIndex, index - 1, rankSum - rank);
            } else {
                // If there was no tie, just assign the rank normally
                sortedData[startIndex].rank = startIndex + 1;
            }
            // Update variables for the next set of items
            startIndex = index;
            rankSum = rank;
            previousTotal = currentTotal;

            // Assign rank for the last item if it's not in a tie
            if (index === sortedData.length - 1) {
                sortedData[index].rank = index + 1;
            }
        }

        rank++; // Increment rank for the next item
    });

    return sortedData;
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

    const headings = ["Candidate Name"];

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

    crits.map((criteria) => {
        headings.push(criteria.name + ` (` + criteria.percentage + `)`);
    });

    headings.push("Total");
    if (pageant.current_round == 1) {
        headings.push("Deduction");
        headings.push("Overall");
    }
    headings.push("Rank");

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

                                <Link
                                    href={route(
                                        "pageant.candidates.select",
                                        pageant.id
                                    )}
                                >
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
                                </Link>
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
                            {(pageant.type == "mr" ||
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
