import { Head, useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { StarIcon } from "@heroicons/react/24/outline";
import { DIVISION_KEYS, divisionOf, divisionsLabel } from "@/Utils/divisions";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Modal from "@/Components/Modal";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useMemo, useCallback, useState, Fragment } from "react";
import { usePageantChannel } from "@/hooks/usePageantChannel";

export default function ScoringShow({ auth, pageant, candidates }) {
    usePageantChannel(pageant.id, {
        '.round.changed': null,
        '.group.changed': null,
        '.pageant.ended': null,
        '.scores.reset': () => {
            router.visit(route('scoring.details', pageant.id));
        },
    });

    const { data, setData, post, processing, errors } = useForm({
        scores: [],
    });
    const [showMissing, setShowMissing] = useState(false);
    const [reviewing, setReviewing] = useState(false);

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

    const scoreOf = (candidateId, criteriaId) =>
        data.scores.find((s) => s.candidate_id === candidateId && s.criteria_id === criteriaId)?.score;

    // candidate id → criteria ids still empty, for the divisions shown on this page
    const missingByCandidate = useMemo(() => {
        const scoredKeys = new Set(data.scores.map((s) => `${s.candidate_id}-${s.criteria_id}`));
        const missing = {};
        for (const candidate of candidates) {
            if (!selectedSexes.includes(candidate.gender)) continue;
            const ids = pageant.criterias
                .filter((criteria) => !scoredKeys.has(`${candidate.id}-${criteria.id}`))
                .map((criteria) => criteria.id);
            if (ids.length > 0) missing[candidate.id] = ids;
        }
        return missing;
    }, [data.scores, candidates, pageant.criterias, selectedSexes]);

    const missingCount = Object.values(missingByCandidate).reduce((sum, ids) => sum + ids.length, 0);

    const submit = (e) => {
        e.preventDefault();

        if (missingCount > 0) {
            setShowMissing(true);
            const [candidateId, ids] = Object.entries(missingByCandidate)[0];
            document.getElementById(`can${candidateId}crit${ids[0]}`)?.focus();
            return;
        }

        setReviewing(true);
    };

    const lockScores = () => {
        post(route("scoring.store", pageant.id), {
            onFinish: () => setReviewing(false),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader icon={StarIcon} title="Scoring" subtitle={pageant.pageant} />}
        >
            <Head title={`Scoring - ${pageant.pageant}`} />

            <div
                className="py-12 bg-fixed bg-cover bg-center min-h-screen"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/storage/${pageant.background})`,
                }}
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Breadcrumbs items={[{ label: "Current Pageants", href: route("scoring.index") }, { label: pageant.pageant, href: route("scoring.details", pageant.id) }, { label: "Scoring" }]} className="inline-flex rounded-lg bg-white/90 dark:bg-gray-800/90 px-3 py-2 shadow-sm" />
                    </div>

                    {/* Stats Bar */}
                    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 mb-8">
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <div className="flex items-center gap-3 bg-white/10 px-5 py-2 rounded-xl border border-white/10">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Current Round</span>
                                <span className="text-2xl font-black text-blue-400">{pageant.current_round}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 px-5 py-2 rounded-xl border border-white/10">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Pageant Type</span>
                                <span className="text-2xl font-black text-purple-400 uppercase">{divisionsLabel(pageant.divisions)}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 px-5 py-2 rounded-xl border border-white/10">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Scored</span>
                                <span className="text-2xl font-black text-green-400">
                                    {new Set(data.scores.map(s => s.candidate_id)).size} / {candidates.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md overflow-hidden shadow-2xl sm:rounded-3xl border border-white/10">
                        <div className="p-8">
                            <form onSubmit={submit} noValidate>
                                {errors.scores && (
                                    <div role="alert" className="mb-8 p-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-semibold">
                                        {errors.scores}
                                    </div>
                                )}
                                {selectedSexes.map((sex, idx) => (
                                    <Fragment key={sex}>
                                        <div className={idx > 0 ? "mt-12 pt-12 border-t border-gray-200 dark:border-gray-700" : ""}>
                                            <div className="flex items-center gap-4 mb-8">
                                                <h2 className="uppercase font-black text-3xl tracking-tighter dark:text-white">
                                                    {divisionOf(sex).label} Candidates
                                                </h2>
                                                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                                {candidatesBySex[sex].length > 0 ? (
                                                    candidatesBySex[sex].map((candidate) => (
                                                        <CandidateBox
                                                            key={candidate.id}
                                                            candidate={candidate}
                                                            criterias={pageant.criterias}
                                                            onInputData={handleSetData}
                                                            missingCriteriaIds={showMissing ? missingByCandidate[candidate.id] ?? [] : []}
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="col-span-full py-12 text-center">
                                                        <p className="text-gray-500 font-medium">No candidates available.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Fragment>
                                ))}
                                <div className="mt-12 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                                    {showMissing && missingCount > 0 && (
                                        <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            {missingCount} {missingCount === 1 ? "score is" : "scores are"} still empty. They are highlighted in red above.
                                        </p>
                                    )}
                                    <PrimaryButton 
                                        className="px-10 py-4 text-lg font-bold rounded-xl shadow-lg shadow-blue-500/20"
                                        disabled={processing}
                                    >
                                        {processing ? "Saving..." : "Review & Lock Scores"}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={reviewing} onClose={() => !processing && setReviewing(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Review your scores
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Once locked, these scores are final and cannot be changed.
                    </p>

                    <div className="mt-4 max-h-[60vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full text-sm text-gray-900 dark:text-gray-100">
                            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold">Candidate</th>
                                    {pageant.criterias.map((criteria) => (
                                        <th key={criteria.id} className="px-3 py-2 text-center font-semibold">
                                            {criteria.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {selectedSexes.flatMap((sex) =>
                                    candidatesBySex[sex].map((candidate) => (
                                        <tr key={candidate.id}>
                                            <td className="px-3 py-2">
                                                <span className="font-bold">#{candidate.candidate_number}</span>{" "}
                                                {candidate.full_name}
                                            </td>
                                            {pageant.criterias.map((criteria) => (
                                                <td key={criteria.id} className="px-3 py-2 text-center font-bold tabular-nums">
                                                    {scoreOf(candidate.id, criteria.id)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setReviewing(false)} disabled={processing}>
                            Go Back
                        </SecondaryButton>
                        <PrimaryButton onClick={lockScores} disabled={processing}>
                            {processing ? "Saving..." : "Lock Scores"}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
