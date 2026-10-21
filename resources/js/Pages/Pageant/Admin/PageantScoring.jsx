import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { DIVISION_KEYS, divisionOf, divisionsLabel } from "@/Utils/divisions";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useMemo, useCallback, Fragment, useState } from "react";

export default function ScoringShow({ auth, pageant, candidates, existingScores = {} }) {
    const isAdmin = auth.user.role === "admin";
    const criterias = pageant.criterias ?? [];

    const [selectedCriteriaId, setSelectedCriteriaId] = useState(
        criterias.length > 0 ? criterias[0].id : ""
    );

    const selectedCriteria = useMemo(
        () => criterias.filter((c) => c.id === Number(selectedCriteriaId)),
        [criterias, selectedCriteriaId]
    );

    // Seeded on the first render: the inputs read their starting value only once,
    // so filling this in an effect afterwards would leave them blank.
    const { data, setData, post, processing, errors } = useForm({
        scores: Object.entries(existingScores).flatMap(([candidateId, criteriaScores]) =>
            Object.entries(criteriaScores).map(([criteriaId, score]) => ({
                candidate_id: Number(candidateId),
                criteria_id: Number(criteriaId),
                score: Number(score),
            }))
        ),
    });

    // 1. The divisions this pageant runs, in display order
    const selectedSexes = useMemo(
        () => DIVISION_KEYS.filter((key) => pageant.divisions.includes(key)),
        [pageant.divisions]
    );

    // 2. Precompute the candidate lists by division
    const candidatesBySex = Object.fromEntries(
        selectedSexes.map((key) => [key, candidates.filter((c) => c.gender === key)])
    );

    const handleSetData = useCallback(
        (candidate_id, criteria_id, score) => {
            const entry = { candidate_id, criteria_id, score };
            const idx = data.scores.findIndex(
                (s) =>
                    s.candidate_id === candidate_id &&
                    s.criteria_id === criteria_id
            );

            // A null score means the box was cleared: drop the entry so it counts as missing again.
            const newScores =
                score === null
                    ? data.scores.filter((_, i) => i !== idx)
                    : idx === -1
                    ? [...data.scores, entry]
                    : data.scores.map((s, i) => (i === idx ? entry : s));

            setData("scores", newScores);
        },
        [data.scores, setData]
    );

    // Every candidate in the round needs a score for every hidden criteria, not just one of them.
    const missingCount = useMemo(() => {
        const scoredKeys = new Set(data.scores.map((s) => `${s.candidate_id}-${s.criteria_id}`));
        return candidates.reduce(
            (sum, candidate) => sum + criterias.filter((c) => !scoredKeys.has(`${candidate.id}-${c.id}`)).length,
            0
        );
    }, [data.scores, candidates, criterias]);
    const [showMissing, setShowMissing] = useState(false);

    // Values typed so far, so switching criteria shows them instead of the last saved ones.
    const scoresByCandidate = useMemo(() => {
        const map = {};
        for (const s of data.scores) {
            (map[s.candidate_id] ??= {})[s.criteria_id] = s.score;
        }
        return map;
    }, [data.scores]);

    const submit = (e) => {
        e.preventDefault();

        if (missingCount > 0) {
            setShowMissing(true);
            return;
        }

        post(route("scoring.admin.store", pageant.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {pageant.pageant}
                </h2>
            }
        >
            <Head title="Pageant Scoring" />

            <div
                className="py-12 bg-fixed bg-cover bg-center min-h-screen"
                style={{
                    backgroundImage: `url(/storage/${pageant.background})`,
                }}
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-200">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                                Current Round
                            </span>
                            <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                                {pageant.current_round ?? "-"}
                            </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-200">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                                Pageant Type
                            </span>
                            <span className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 mt-2 uppercase">
                                {divisionsLabel(pageant.divisions) || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Control Bar */}
                    <div className="mb-6 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                        <Link href={route("pageant.view-scores", pageant.id)}>
                            <SecondaryButton>
                                &larr; Back to Scores
                            </SecondaryButton>
                        </Link>

                        {/* Criteria Selector */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Criteria:
                            </label>
                            <select
                                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                value={selectedCriteriaId}
                                onChange={(e) => setSelectedCriteriaId(e.target.value)}
                            >
                                {criterias.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.percentage}%)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="text-gray-500 text-sm">
                           Admin Scoring Panel
                        </div>
                    </div>


                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 dark:text-white">
                            <form onSubmit={submit}>
                                {selectedSexes.map((sex) => (
                                    <Fragment key={sex}>
                                        <div className="mb-8">
                                            <h2 className="uppercase font-bold text-2xl tracking-wide mb-6 border-b pb-2 border-gray-200 dark:border-gray-700">
                                                {divisionOf(sex).label} Candidates
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                                {candidatesBySex[sex].length > 0 ? (
                                                    candidatesBySex[sex].map(
                                                        (candidate) => (
                                                            <CandidateBox
                                                                key={`${candidate.id}-${selectedCriteriaId}`}
                                                                candidate={candidate}
                                                                criterias={selectedCriteria}
                                                                onInputData={handleSetData}
                                                                existingScores={scoresByCandidate[candidate.id] ?? {}}
                                                                isAdmin={isAdmin}
                                                            />
                                                        )
                                                    )
                                                ) : (
                                                    <div className="col-span-full text-center py-10 text-gray-500">
                                                        No candidates selected for this round.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Fragment>
                                ))}

                                <div className="mt-8 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4 border-t pt-6 border-gray-100 dark:border-gray-700">
                                    {errors.scores && (
                                        <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            {errors.scores}
                                        </p>
                                    )}
                                    {showMissing && missingCount > 0 && (
                                        <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            {missingCount} {missingCount === 1 ? "score is" : "scores are"} still empty. Check each criteria in the selector.
                                        </p>
                                    )}
                                    <PrimaryButton className="px-8 py-3 text-lg" disabled={processing}>
                                        {processing ? "Saving..." : "Save Scores"}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
