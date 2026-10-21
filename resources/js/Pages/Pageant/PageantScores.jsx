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
import { DIVISION_KEYS } from "@/Utils/divisions";
import { PRIMARY_BUTTON_CLASSES } from "@/Components/styles";

// Helper to compute ranks based on a score extractor
function rankItems(candidates, sortedBy = "order") {
    if (!candidates?.length) return [];

    // Sort by order ascending (no score-based ranking)
    if (sortedBy === "order") {
        const sorted = [...candidates].sort((a, b) => (a.order || 0) - (b.order || 0));
        return sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

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

const rankByDivision = (candidatesByDivision, sortedBy) =>
    Object.fromEntries(
        Object.entries(candidatesByDivision).map(([key, list]) => [key, rankItems(list, sortedBy)])
    );

export default function PageantScores({
    auth,
    pageant,
    candidatesByDivision = {},
    criterias,
    judges = [],
}) {
    const [ranked, setRanked] = useState({});
    const [crits, setCrits] = useState(criterias);
    const [groupList, setGroupList] = useState([1]);
    // null, "scores" or "everything": which reset is waiting for confirmation
    const [confirmingReset, setConfirmingReset] = useState(null);
    const [confirmingEndPageant, setConfirmingEndPageant] = useState(false);

    usePageantChannel(pageant.id, ['.score.submitted', '.scores.reset', '.round.changed', '.group.changed']);

    // pageant_rounds has one row per division; list each round number once.
    const rounds = useMemo(
        () => [...new Map(pageant.pageant_rounds.map((r) => [r.round, r])).values()].sort((a, b) => a.round - b.round),
        [pageant.pageant_rounds]
    );

    // Deductions apply in every round, so show the columns whenever this round has one.
    const showDeductions = useMemo(
        () => Object.values(candidatesByDivision).some((list) => list.some((c) => Number(c.deduction) !== 0)),
        [candidatesByDivision]
    );

    const headings = useMemo(
        () => [
            "Candidate Name",
            ...criterias.map((c) => `${c.name} (${c.percentage})`),
            "Total",
            ...(showDeductions ? ["Deduction", "Overall"] : []),
            "Rank",
        ],
        [criterias, showDeductions]
    );

    useEffect(() => {
        setRanked(rankByDivision(candidatesByDivision, "order"));
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
    }, [pageant, candidatesByDivision, criterias]);

    const sortFunction = (i) => {
        setRanked(rankByDivision(candidatesByDivision, i));
    };

    const closeModal = () => {
        setConfirmingReset(null);
    };

    const reset = () => {
        const name = confirmingReset === "everything" ? "pageant.reset-everything" : "pageant.reset-scores";
        router.post(route(name, pageant.id), {}, {
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
                                            {rounds.map((round) => (
                                                <option value={round.round} key={`R` + round.round}>
                                                    {round.round_name}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </div>
                                    <div className="flex flex-col">
                                        <InputLabel value="Group" className="mb-1 text-xs uppercase text-gray-400" />
                                        <SelectInput
                                            name="group"
                                            className="w-full md:w-56"
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
                                            <option value="0">Closed (no group open)</option>
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
                                            defaultValue="order"
                                            className="w-full md:w-48"
                                            onChange={(e) => sortFunction(e.target.value)}
                                        >
                                            <option value="order">Order</option>
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
                                    <DangerButton onClick={() => setConfirmingReset("scores")}>
                                        Reset Scores
                                    </DangerButton>
                                    <DangerButton onClick={() => setConfirmingReset("everything")}>
                                        Reset Everything
                                    </DangerButton>
                                    {pageant.status !== "finished" && (
                                        <DangerButton onClick={confirmEndPageant}>
                                            End
                                        </DangerButton>
                                    )}
                                </div>
                            </div>

                            {/* Judge Progress */}
                            {judges.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Judge Progress
                                        </h3>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {judges.filter((j) => j.status === "done").length} / {judges.length} completed
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {judges.map((judge) => (
                                            <div
                                                key={judge.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                                                    judge.status === "done"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${
                                                    judge.status === "done" ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                                                }`} />
                                                {judge.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <hr className="my-6 border-gray-200 dark:border-gray-700" />

                            {pageant.current_round > 0 && Object.values(candidatesByDivision).every((list) => list.length === 0) ? (
                                <div className="py-16 text-center">
                                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                        No candidates are in this round yet.
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Judges can't score until candidates are selected for it.
                                    </p>
                                    <Link
                                        href={route("pageant.candidates.select", { pageant: pageant.id, round: pageant.current_round })}
                                        className={`${PRIMARY_BUTTON_CLASSES} mt-6`}
                                    >
                                        Select candidates for this round
                                    </Link>
                                </div>
                            ) : DIVISION_KEYS.filter((key) => pageant.divisions.includes(key)).map((key) => (
                                <CandidateScoreList
                                    key={key}
                                    division={key}
                                    candidates={ranked[key] ?? []}
                                    headings={headings}
                                    criterias={crits}
                                    showDeductions={showDeductions}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={confirmingReset !== null} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {confirmingReset === "everything" ? "Reset everything?" : "Reset scores?"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        This permanently erases, for every round of this pageant:
                    </p>
                    <ul className="mt-2 list-disc ps-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>all judges' scores and all hidden (staff) scores</li>
                        {confirmingReset === "everything" && (
                            <>
                                <li>all deductions</li>
                                <li>every round's selected candidates and their stage order</li>
                            </>
                        )}
                    </ul>
                    {confirmingReset === "scores" && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Deductions and each round's selected candidates and stage order are kept.
                        </p>
                    )}
                    <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
                        The pageant goes back to "Not started". This cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="ms-3" onClick={reset}>
                            {confirmingReset === "everything" ? "Erase Everything" : "Erase Scores"}
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
