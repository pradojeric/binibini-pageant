import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateScoreList from "@/Pages/Pageant/Partials/CandidateScoreList";
import LiveControlPanel from "@/Pages/Pageant/Partials/LiveControlPanel";
import ScoreActionsMenu from "@/Pages/Pageant/Partials/ScoreActionsMenu";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import Chip from "@/Components/Chip";
import { Card, CardHeader } from "@/Components/Card";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { usePageantChannel } from "@/hooks/usePageantChannel";
import { DIVISION_KEYS } from "@/Utils/divisions";
import { PRIMARY_BUTTON_CLASSES, SECONDARY_BUTTON_CLASSES } from "@/Components/styles";
import { cn } from "@/Utils/cn";

// Keys match the values Pageant::status can return.
const STATUS_STYLES = {
    "not yet started": "bg-gray-100 text-gray-800",
    ongoing: "bg-amber-100 text-amber-900",
    finished: "bg-green-100 text-green-900",
};

const toNumber = (value) => parseFloat(value) || 0;

// Overall rank by total. Ties share the average of their positions (two tied for 1st are both 1.5).
function withRanks(candidates) {
    const byTotal = [...candidates].sort((a, b) => toNumber(b.total) - toNumber(a.total));

    const positions = new Map();
    byTotal.forEach((item, idx) => {
        const score = toNumber(item.total);
        positions.set(score, [...(positions.get(score) ?? []), idx + 1]);
    });

    return candidates.map((item) => {
        const tied = positions.get(toNumber(item.total));
        const rank = tied.reduce((a, b) => a + b, 0) / tied.length;
        return { ...item, rank: Number.isInteger(rank) ? rank : rank.toFixed(1) };
    });
}

// Sorting only changes row order; the rank stays the overall one.
function sortCandidates(candidates, sortBy) {
    if (sortBy === "order") {
        return [...candidates].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    const score = (item) => toNumber(sortBy === "total" ? item.total : item.scores?.[sortBy]);
    return [...candidates].sort((a, b) => score(b) - score(a));
}

export default function PageantScores({
    auth,
    pageant,
    candidatesByDivision = {},
    criterias,
    judges = [],
}) {
    const [sortBy, setSortBy] = useState("order");
    // null, "scores" or "everything": which reset is waiting for confirmation
    const [confirmingReset, setConfirmingReset] = useState(null);
    const [confirmingEndPageant, setConfirmingEndPageant] = useState(false);

    usePageantChannel(pageant.id, ['.score.submitted', '.scores.reset', '.round.changed', '.group.changed']);

    // pageant_rounds has one row per division; list each round number once.
    const rounds = useMemo(
        () => [...new Map(pageant.pageant_rounds.map((r) => [r.round, r])).values()].sort((a, b) => a.round - b.round),
        [pageant.pageant_rounds]
    );

    // Groups 1..highest among this round's criteria.
    const groupList = useMemo(() => {
        const groups = criterias.filter((c) => c.round == pageant.current_round).map((c) => Number(c.group));
        return groups.length ? Array.from({ length: Math.max(...groups) }, (_, i) => i + 1) : [];
    }, [criterias, pageant.current_round]);

    // A criterion sort falls back to stage order once the round changes and that criterion is gone.
    const activeSort =
        sortBy === "order" || sortBy === "total" || criterias.some((c) => String(c.id) === sortBy) ? sortBy : "order";

    // Derived on every render, so realtime reloads keep the chosen sort.
    const ranked = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(candidatesByDivision).map(([key, list]) => [key, sortCandidates(withRanks(list), activeSort)])
            ),
        [candidatesByDivision, activeSort]
    );

    // Deductions apply in every round, so show the columns whenever this round has one.
    const showDeductions = useMemo(
        () => Object.values(candidatesByDivision).some((list) => list.some((c) => Number(c.deduction) !== 0)),
        [candidatesByDivision]
    );

    const noCandidates =
        pageant.current_round > 0 && Object.values(candidatesByDivision).every((list) => list.length === 0);

    const closeModal = () => {
        setConfirmingReset(null);
    };

    const reset = () => {
        const name = confirmingReset === "everything" ? "pageant.reset-everything" : "pageant.reset-scores";
        router.post(route(name, pageant.id), {}, {
            onFinish: () => closeModal(),
        });
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
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {pageant.pageant} Scores
                    </h1>
                    <Chip
                        value={pageant.status}
                        className={cn(
                            "rounded-full px-3",
                            STATUS_STYLES[pageant.status?.toLowerCase()] ?? STATUS_STYLES["not yet started"]
                        )}
                    />
                </div>
            }
        >
            <Head title={`${pageant.pageant} · Scores`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <LiveControlPanel pageant={pageant} rounds={rounds} groupList={groupList} judges={judges} />

                    {/* overflow-visible so the More menu isn't clipped by the card */}
                    <Card className="overflow-visible">
                        <CardHeader icon={ChartBarIcon} title="Results" />

                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 md:items-end justify-between">
                            <div>
                                <InputLabel htmlFor="results-sort" value="Sort by" className="mb-1" />
                                <SelectInput
                                    id="results-sort"
                                    className="w-full md:w-56"
                                    value={activeSort}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="order">Stage order</option>
                                    <option value="total">Total points</option>
                                    {criterias.map((criteria) => (
                                        <option key={`criteria-` + criteria.id} value={String(criteria.id)}>
                                            {criteria.name}
                                        </option>
                                    ))}
                                </SelectInput>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link href={route("pageant.candidates.select", pageant.id)} className={SECONDARY_BUTTON_CLASSES}>
                                    Select Candidates
                                </Link>
                                <Link href={route("scoring.admin", pageant.id)} className={SECONDARY_BUTTON_CLASSES}>
                                    Score Hidden
                                </Link>
                                <Link href={route("pageant.deduct", pageant.id)} className={SECONDARY_BUTTON_CLASSES}>
                                    Deduct
                                </Link>
                                <Link href={route("pageant.for-printing", pageant.id)} className={PRIMARY_BUTTON_CLASSES}>
                                    Summary
                                </Link>
                                <ScoreActionsMenu
                                    onResetScores={() => setConfirmingReset("scores")}
                                    onResetEverything={() => setConfirmingReset("everything")}
                                    onEndPageant={pageant.status !== "finished" ? () => setConfirmingEndPageant(true) : null}
                                />
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-10">
                            {noCandidates ? (
                                <div className="py-12 text-center">
                                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                        No candidates are in this round yet.
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
                                    criterias={criterias}
                                    showDeductions={showDeductions}
                                />
                            ))}
                        </div>
                    </Card>
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
