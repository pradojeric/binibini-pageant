import { Head, useForm, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { EyeSlashIcon } from "@heroicons/react/24/outline";
import { DIVISION_KEYS, divisionOf, divisionsLabel } from "@/Utils/divisions";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import Alert from "@/Components/Alert";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import { SECONDARY_BUTTON_CLASSES } from "@/Components/styles";
import { useMemo, useCallback, useState, useEffect } from "react";

export default function PageantScoring({ auth, pageant, candidates, existingScores = {} }) {
    const { flash } = usePage().props;
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
    const { data, setData, post, processing, errors, isDirty } = useForm({
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

    // criteria id → candidate ids still empty, for the divisions shown on this page.
    // Keyed by criteria because the page shows one criteria at a time.
    const missingByCriteria = useMemo(() => {
        const scoredKeys = new Set(data.scores.map((s) => `${s.candidate_id}-${s.criteria_id}`));
        const shown = candidates.filter((c) => selectedSexes.includes(c.gender));
        const missing = {};
        for (const criteria of criterias) {
            const ids = shown.filter((c) => !scoredKeys.has(`${c.id}-${criteria.id}`)).map((c) => c.id);
            if (ids.length > 0) missing[criteria.id] = ids;
        }
        return missing;
    }, [data.scores, candidates, criterias, selectedSexes]);

    const missingCount = Object.values(missingByCriteria).reduce((sum, ids) => sum + ids.length, 0);
    const [showMissing, setShowMissing] = useState(false);
    const [focusTarget, setFocusTarget] = useState(null);

    // Values typed so far, so switching criteria shows them instead of the last saved ones.
    const scoresByCandidate = useMemo(() => {
        const map = {};
        for (const s of data.scores) {
            (map[s.candidate_id] ??= {})[s.criteria_id] = s.score;
        }
        return map;
    }, [data.scores]);

    // The first empty input may sit under another criteria, so focus it after the switch renders.
    useEffect(() => {
        if (!focusTarget) return;
        document.getElementById(focusTarget)?.focus();
        setFocusTarget(null);
    }, [focusTarget, selectedCriteriaId]);

    // Leaving with typed but unsaved scores would drop them silently.
    useEffect(() => {
        if (!isDirty) return;

        const confirmLeave = (event) => {
            if (event.detail.visit.method !== "get") return;
            if (!window.confirm("You have unsaved hidden scores. Leave without saving?")) {
                event.preventDefault();
            }
        };
        const warnUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        const removeBefore = router.on("before", confirmLeave);
        window.addEventListener("beforeunload", warnUnload);
        return () => {
            removeBefore();
            window.removeEventListener("beforeunload", warnUnload);
        };
    }, [isDirty]);

    const submit = (e) => {
        e.preventDefault();

        if (missingCount > 0) {
            setShowMissing(true);
            const [criteriaId, candidateIds] = missingByCriteria[selectedCriteriaId]
                ? [selectedCriteriaId, missingByCriteria[selectedCriteriaId]]
                : Object.entries(missingByCriteria)[0];
            setSelectedCriteriaId(Number(criteriaId));
            setFocusTarget(`can${candidateIds[0]}crit${criteriaId}`);
            return;
        }

        post(route("scoring.admin.store", pageant.id));
    };

    const missingHere = showMissing ? missingByCriteria[selectedCriteriaId] ?? [] : [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader icon={EyeSlashIcon} title="Hidden Scoring" subtitle={pageant.pageant} />}
        >
            <Head title={`Hidden Scoring - ${pageant.pageant}`} />

            <div
                className="py-12 bg-cover bg-center min-h-screen"
                style={{
                    backgroundImage: `url(/storage/${pageant.background})`,
                }}
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div>
                        <Breadcrumbs items={[{ label: "Pageants", href: route("pageants.index") }, { label: pageant.pageant, href: route("pageants.show", pageant.id) }, { label: "Scores", href: route("pageant.view-scores", pageant.id) }, { label: "Hidden Scoring" }]} className="inline-flex rounded-lg bg-white/90 dark:bg-gray-800/90 px-3 py-2 shadow-sm" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Hidden scoring · Round {pageant.current_round ?? "-"}
                                {divisionsLabel(pageant.divisions) && (
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        {" "}· {divisionsLabel(pageant.divisions)}
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Staff enter these criteria. Judges never see them on their scoring sheets.
                            </p>
                        </div>

                        {criterias.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                                <InputLabel htmlFor="hidden-criteria" value="Criteria" className="shrink-0" />
                                <SelectInput
                                    id="hidden-criteria"
                                    className="w-full sm:w-auto sm:max-w-xs text-sm"
                                    value={selectedCriteriaId}
                                    onChange={(e) => setSelectedCriteriaId(Number(e.target.value))}
                                >
                                    {criterias.map((c) => {
                                        const empty = showMissing ? missingByCriteria[c.id]?.length ?? 0 : 0;
                                        return (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.percentage}%){empty > 0 ? ` · ${empty} empty` : ""}
                                            </option>
                                        );
                                    })}
                                </SelectInput>
                            </div>
                        )}
                    </div>

                    {flash.message && (
                        <Alert role="status">{flash.message}</Alert>
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 dark:text-white">
                            {criterias.length === 0 ? (
                                <div className="py-10 text-center space-y-3">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        No hidden criteria in Round {pageant.current_round ?? "-"}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Mark a criteria as hidden scoring for this round to enter its scores here.
                                    </p>
                                    <Link href={route("pageants.criterias.index", pageant.id)} className={SECONDARY_BUTTON_CLASSES}>
                                        Manage criteria
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={submit} noValidate>
                                    {selectedSexes.map((sex) => (
                                        <section key={sex} className="mb-8">
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
                                                                isAdmin
                                                                missingCriteriaIds={missingHere.includes(candidate.id) ? [Number(selectedCriteriaId)] : []}
                                                            />
                                                        )
                                                    )
                                                ) : (
                                                    <div className="col-span-full text-center py-10 text-gray-600 dark:text-gray-400">
                                                        No candidates selected for this round.
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    ))}
    
                                    <div className="mt-8 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4 border-t pt-6 border-gray-100 dark:border-gray-700">
                                        {errors.scores && (
                                            <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                {errors.scores}
                                            </p>
                                        )}
                                        {showMissing && missingCount > 0 && (
                                            <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                {missingCount} {missingCount === 1 ? "score is" : "scores are"} empty or out of range.
                                                Criteria with gaps show a count in the selector.
                                            </p>
                                        )}
                                        <PrimaryButton className="px-8 py-3 text-lg" disabled={processing}>
                                            {processing ? "Saving..." : "Save Scores"}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
