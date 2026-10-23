import { Head, Link, useForm, router } from "@inertiajs/react";
import Image from "@/Components/Image";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useEffect, useMemo, useState } from "react";
import OrderSelectionModal from "./_partial/OrderSelectionModal";
import { SECONDARY_BUTTON_CLASSES } from "@/Components/styles";
import { DIVISION_KEYS, divisionOf, divisionsLabel } from "@/Utils/divisions";
import Checkbox from "@/Components/Checkbox";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import InputError from "@/Components/InputError";

export default function ScoringShow({
    auth,
    pageant,
    candidates,
    round = null,
    selected = [],
}) {
    const [showOrderModal, setShowOrderModal] = useState(false);

    const { data, setData, post, errors, reset, transform } = useForm({
        round: round ?? "",
        selectedCandidates: selected,
    });

    // Changing the round reloads with preserveState, so pull that round's saved selection in.
    // Keyed on the round so a failed save doesn't wipe the unsaved checks.
    useEffect(() => {
        setData((previousData) => ({ ...previousData, selectedCandidates: selected }));
    }, [round]);

    const roundNumbers = useMemo(
        () => [...new Set(pageant.pageant_rounds.map((r) => r.round))].sort((a, b) => a - b),
        [pageant.pageant_rounds]
    );

    // Slots per division for the chosen round: each division's row has its own number_of_candidates.
    const slots = Object.fromEntries(
        pageant.pageant_rounds
            .filter((r) => r.round == data.round)
            .map((r) => [r.pageant_type, r.number_of_candidates])
    );

    const divisions = DIVISION_KEYS.filter((key) => pageant.divisions.includes(key));
    const candidatesOf = (key) => candidates.filter((c) => c.gender === key);
    const selectedCountOf = (key) =>
        candidatesOf(key).filter((c) => data.selectedCandidates.includes(c.id)).length;

    const openOrderModal = (e) => {
        e.preventDefault();
        setShowOrderModal(true);
    };

    // Posting through the form (not router.post) keeps validation errors on this form.
    const handleConfirmOrder = (orderedIds) => {
        setShowOrderModal(false);
        transform((formData) => ({ ...formData, selectedCandidates: orderedIds }));
        post(route("select.store", pageant.id), {
            preserveState: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleChecked = (e) => {
        const id = parseInt(e.target.value, 10);
        const checked = e.target.checked;
        
        setData((previousData) => ({
            ...previousData,
            selectedCandidates: checked
                ? [...previousData.selectedCandidates, id]
                : previousData.selectedCandidates.filter((o) => o !== id),
        }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {pageant.pageant} - Select Candidates
                </h2>
            }
        >
            <Head title="Select Candidates" />

            <div
                className="py-12 bg-cover bg-center min-h-screen"
                style={{
                    backgroundImage: `url(/storage/${pageant.background})`,
                }}
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                        <Link href={route("pageant.view-scores", pageant.id)} className={`${SECONDARY_BUTTON_CLASSES} self-start lg:self-auto`}>
                            &larr; Back to Scores
                        </Link>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Candidate selection · Round {pageant.current_round ?? "-"}
                                {divisionsLabel(pageant.divisions) && (
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        {" "}· {divisionsLabel(pageant.divisions)}
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Pick who advances into the round, in stage order.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <InputError message={errors.round} />
                            <InputError message={errors.selectedCandidates} />
                            <form onSubmit={openOrderModal}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <InputLabel htmlFor="round" value="Select Round:" className="text-lg" />
                                        <SelectInput
                                            id="round"
                                            name="round"
                                            value={data.round}
                                            className="min-w-[200px]"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setData((previousData) => ({
                                                    ...previousData,
                                                    round: val,
                                                }));
                                                if (val) {
                                                    router.get(
                                                        route("pageant.candidates.select", pageant.id),
                                                        { round: val },
                                                        { preserveState: true }
                                                    );
                                                }
                                            }}
                                        >
                                            <option value="" hidden>
                                                Select Round
                                            </option>
                                            {roundNumbers.map((roundNumber) => (
                                                <option value={roundNumber} key={roundNumber}>
                                                    {`Round ${roundNumber}`}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </div>
                                    <div className="flex gap-2">
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => {
                                                if (!data.round) return;

                                                // Take each division's top N by previous-round total.
                                                const topCandidates = divisions.flatMap((key) =>
                                                    [...candidatesOf(key)]
                                                        .sort((a, b) => (b.total || 0) - (a.total || 0))
                                                        .slice(0, slots[key] ?? 0)
                                                        .map((c) => c.id)
                                                );

                                                setData("selectedCandidates", topCandidates);
                                            }}
                                            disabled={!data.round}
                                            className="px-4 py-2"
                                        >
                                            Auto Select Top
                                        </SecondaryButton>
                                        <PrimaryButton type="submit" className="px-6 py-2">
                                            Save Selection
                                        </PrimaryButton>
                                    </div>
                                </div>
                                
                                {divisions.map((key) => (
                                <section key={key} aria-labelledby={`select-${key}`} className="mt-8 first:mt-4">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                                        <h2 id={`select-${key}`} className="uppercase font-bold text-xl tracking-wide text-gray-800 dark:text-gray-200">
                                            {divisionOf(key).label} Candidates
                                        </h2>
                                        {data.round && (
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 tabular-nums">
                                                {selectedCountOf(key)} of {slots[key] ?? 0} selected
                                            </span>
                                        )}
                                    </div>
                                    <InputError message={errors[`selectedCandidates.${key}`]} className="mb-3" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {candidatesOf(key).map((candidate) => {
                                        return (
                                            <div key={candidate.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                                                <label className="flex items-center gap-4 cursor-pointer w-full h-full">
                                                    <Checkbox
                                                        name="selectedJudges[]"
                                                        value={candidate.id}
                                                        checked={data.selectedCandidates.includes(
                                                            candidate.id
                                                        )}
                                                        onChange={handleChecked}
                                                        className="w-5 h-5"
                                                    />
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="shrink-0 relative">
                                                            {candidate.picture ? (
                                                                <Image
                                                                    className="rounded-full h-14 w-14 object-cover border-2 border-white shadow-sm bg-gray-100"
                                                                    src={
                                                                        `/storage/` +
                                                                        candidate.picture
                                                                    }
                                                                    alt={
                                                                        candidate.full_name
                                                                    }
                                                                />
                                                            ) : (
                                                                <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
                                                                     <span className="text-gray-700 dark:text-gray-300 font-bold">{candidate.candidate_number}</span>
                                                                </div>
                                                            )}
                                                             <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs tabular-nums font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                                #{candidate.candidate_number}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="uppercase font-bold dark:text-white truncate text-sm">
                                                                {
                                                                    candidate.full_name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                {
                                                                    candidate.nickname
                                                                }
                                                            </div>
                                                            <div className="mt-1">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                   Score: {candidate.total}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                                </section>
                                ))}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <OrderSelectionModal
                show={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                candidates={candidates}
                selectedIds={data.selectedCandidates}
                onConfirm={handleConfirmOrder}
            />
        </AuthenticatedLayout>
    );
}
