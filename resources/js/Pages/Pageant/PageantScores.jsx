import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateScoreList from "@/Pages/Pageant/Partials/CandidateScoreList";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { usePageantChannel } from "@/hooks/usePageantChannel";

// Helper to compute ranks based on a score extractor
function rankItems(candidates, sortedBy = "total") {
    if (!candidates?.length) return [];

    // 1. Define how to extract the score
    const getScore = (item) => {
        const score = sortedBy === "total" ? item.total : item.scores?.[sortedBy];
        return parseFloat(score) || 0; // Ensure number
    };

    // 2. Sort descending
    const sorted = [...candidates].sort((a, b) => getScore(b) - getScore(a));

    // 3. Assign ranks (handling ties with standard competition ranking "1224" or dense "1223"? 
    // The original code used average rank for ties? 
    // Let's stick to standard dense or skipped?
    // Original code:
    //  22:     // 3. Build a map: scoreValue → array of positions (1-based)
    // ...
    //  35:         scoreRank.set(sc, (sum / positions.length).toFixed(1));
    // It seems to be using fractional ranking for ties (e.g. 1.5 for tied 1st and 2nd).
    // I will preserve this logic but clean it up.

    const scorePositions = new Map();
    sorted.forEach((item, idx) => {
        const score = getScore(item);
        if (!scorePositions.has(score)) scorePositions.set(score, []);
        scorePositions.get(score).push(idx + 1);
    });

    const scoreRank = new Map();
    scorePositions.forEach((positions, score) => {
        const sum = positions.reduce((a, b) => a + b, 0);
        const rank = (sum / positions.length);
        // Format to decimal only if needed? Original used .toFixed(1)
        scoreRank.set(score, Number.isInteger(rank) ? rank : rank.toFixed(1));
    });

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
    const [confirmingReset, setConfirmingReset] = useState(false);
    const [confirmingEndPageant, setConfirmingEndPageant] = useState(false);

    usePageantChannel(pageant.id, ['.score.submitted', '.scores.reset', '.round.changed', '.group.changed']);

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
    }, [pageant, femaleCandidates, maleCandidates, criterias]);

    const sortFunction = (i) => {
        setFemCan(rankItems(femaleCandidates, i));
        setMaleCan(rankItems(maleCandidates, i));
    };

    const confirmResetScore = () => {
        setConfirmingReset(true);
    };

    const closeModal = () => {
        setConfirmingReset(false);
    };

    const resetScore = () => {
        router.post(route("pageant.reset-scores", pageant.id), {}, {
            onFinish: () => closeModal(),
        });
    };

    const confirmEndPageant = () => {
        setConfirmingEndPageant(true);
    };

    const closeEndPageantModal = () => {
        setConfirmingEndPageant(false);
    };

    const endPageant = () => {
        router.post(route("end.pageant", pageant.id), {}, {
            onFinish: () => closeEndPageantModal(),
        });
    };

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
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-200">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Current Round</span>
                                    <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                                        {pageant.current_round ?? "-"}
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-200">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Current Group</span>
                                    <span className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
                                        {pageant.current_group ?? "-"}
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-200">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Rounds</span>
                                    <span className="text-4xl font-extrabold text-gray-700 dark:text-gray-300 mt-2">
                                        {pageant.rounds}
                                    </span>
                                </div>
                            </div>

                            {/* Control Bar */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-8 flex flex-col xl:flex-row gap-6 justify-between items-center">
                                {/* Filters */}
                                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                                    <div className="flex flex-col">
                                        <InputLabel value="Round" className="mb-1 text-xs uppercase text-gray-400" />
                                        <SelectInput
                                            name="round"
                                            className="w-full md:w-32"
                                            value={pageant.current_round || ""}
                                            onChange={(e) => {
                                                router.put(
                                                    route("pageant.change-round", {
                                                        pageant: pageant.id,
                                                        round: e.target.value,
                                                    })
                                                );
                                            }}
                                        >
                                            <option value="" hidden>Select</option>
                                            <option value="0">Not started</option>
                                            {pageant.pageant_rounds.map((round, index) => (
                                                <option value={round.round} key={`R` + index}>
                                                    {round.round_name}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </div>
                                    <div className="flex flex-col">
                                        <InputLabel value="Group" className="mb-1 text-xs uppercase text-gray-400" />
                                        <SelectInput
                                            name="group"
                                            className="w-full md:w-32"
                                            value={pageant.current_group || ""}
                                            onChange={(e) => {
                                                router.put(
                                                    route("pageant.change-group", {
                                                        pageant: pageant.id,
                                                        group: e.target.value,
                                                    })
                                                );
                                            }}
                                        >
                                            <option value="" hidden>Select</option>
                                            <option value="0">Group 0</option>
                                            {groupList.map((group, index) => (
                                                <option value={group} key={`G` + index}>
                                                    Group {group}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <InputLabel value="Sort By" className="mb-1 text-xs uppercase text-gray-400" />
                                        <SelectInput
                                            name="criteria"
                                            defaultValue="total"
                                            className="w-full md:w-48"
                                            onChange={(e) => sortFunction(e.target.value)}
                                        >
                                            <option value="total">Total Points</option>
                                            {crits.map((criteria) => (
                                                <option key={`criteria-` + criteria.id} value={criteria.id}>
                                                    {criteria.name}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 justify-end w-full xl:w-auto">
                                    <Link href={route("scoring.admin", pageant.id)}>
                                        <PrimaryButton className="bg-green-600 hover:bg-green-500 border-none">
                                            Score Hidden
                                        </PrimaryButton>
                                    </Link>
                                    <Link href={route("pageant.candidates.select", pageant.id)}>
                                        <PrimaryButton className="bg-indigo-600 hover:bg-indigo-500 border-none">
                                            Select Candidate
                                        </PrimaryButton>
                                    </Link>
                                    <Link href={route("pageant.deduct", pageant.id)}>
                                        <DangerButton>
                                            Deduct
                                        </DangerButton>
                                    </Link>
                                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2 hidden md:block"></div>
                                    <Link href={route("pageant.for-printing", pageant.id)}>
                                        <SecondaryButton>
                                            Summary
                                        </SecondaryButton>
                                    </Link>
                                    <DangerButton onClick={confirmResetScore}>
                                        Reset
                                    </DangerButton>
                                    {pageant.status !== "finished" && (
                                        <DangerButton onClick={confirmEndPageant}>
                                            End
                                        </DangerButton>
                                    )}
                                </div>
                            </div>

                            <hr className="my-6 border-gray-200 dark:border-gray-700" />

                            {["mr", "ms"].map(
                                (sex) =>
                                    pageant.type.includes(sex) && (
                                        <CandidateScoreList
                                            key={sex}
                                            gender={sex === "mr" ? "Male" : "Female"}
                                            candidates={sex === "mr" ? maleCan : femCan}
                                            headings={headings}
                                            criterias={crits}
                                            current_round={pageant.current_round}
                                        />
                                    )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={confirmingReset} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Are you sure you want to reset the scores?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        This action cannot be undone. All scores for this round/pageant will be lost.
                    </p>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="ms-3" onClick={resetScore}>
                            Reset Scores
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={confirmingEndPageant} onClose={closeEndPageantModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Are you sure you want to end this pageant?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        This action will mark the pageant as finished.
                    </p>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeEndPageantModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="ms-3" onClick={endPageant}>
                            End Pageant
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
