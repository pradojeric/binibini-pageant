import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useMemo, useCallback, Fragment } from "react";

export default function ScoringShow({ auth, pageant, candidates }) {
    const { data, setData, post } = useForm({
        scores: [],
    });

    // 1. Derive an array of active sexes from pageant.type
    const selectedSexes = useMemo(() => {
        if (!pageant.type) return [];
        return pageant.type === "mr&ms" ? ["mr", "ms"] : [pageant.type];
    }, [pageant.type]);

    // 2. Precompute the candidate lists by sex
    const candidatesBySex = {
        mr: candidates.filter((c) => c.gender === "mr"),
        ms: candidates.filter((c) => c.gender === "ms"),
    };

    const handleSetData = useCallback(
        (candidate_id, criteria_id, score) => {
            const entry = { candidate_id, criteria_id, score };
            const idx = data.scores.findIndex(
                (s) =>
                    s.candidate_id === candidate_id &&
                    s.criteria_id === criteria_id
            );

            const newScores =
                idx === -1
                    ? [...data.scores, entry]
                    : data.scores.map((s, i) => (i === idx ? entry : s));

            setData("scores", newScores);
            console.log(newScores);
        },
        [data.scores, setData]
    );

    // Function to check if all candidates have been scored
    const allCandidatesScored = () => {
        // Create a set to store candidate ids that have been scored
        let scoredCandidates = new Set();

        // Iterate through the scores array
        for (let score of data.scores) {
            scoredCandidates.add(score.candidate_id);
        }

        // Check if all candidates have been scored
        for (let candidate of candidates) {
            if (!scoredCandidates.has(candidate.id)) {
                return false; // If any candidate has not been scored, return false
            }
        }
        return true; // All candidates have been scored
    };

    const submit = (e) => {
        e.preventDefault();

        if (!allCandidatesScored()) {
            alert("All candidates must be scored");
            return;
        }

        post(route("scoring.store", pageant.id), {
            onError: (errors) => {
                console.log(errors);
            },
        });
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
            <Head title="Pageant" />

            <div
                className="py-12 bg-fixed bg-contain bg-center"
                style={{
                    backgroundImage: `url(/storage/${pageant.background})`,
                }}
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 dark:text-white">
                            <form onSubmit={submit}>
                                <div className="flex justify-between mb-2">
                                    <div>
                                        <div className="uppercase">
                                            Rounds: {pageant.current_round}
                                        </div>
                                        <div className="uppercase">
                                            Pageant Type: {pageant.type}
                                        </div>
                                    </div>
                                </div>
                                <hr />

                                {selectedSexes.map((sex, idx) => (
                                    // Using a fragment so the <hr> can live between Mr & Ms
                                    <Fragment key={sex}>
                                        <div>
                                            <h2 className="uppercase font-bold text-lg tracking-wide">
                                                {sex === "mr"
                                                    ? "Mr Candidates"
                                                    : "Ms Candidates"}
                                            </h2>
                                            <div className="grid grid-cols-4 gap-8 mt-4">
                                                {candidatesBySex[sex].map(
                                                    (candidate) => (
                                                        <CandidateBox
                                                            key={candidate.id}
                                                            candidate={
                                                                candidate
                                                            }
                                                            criterias={
                                                                pageant.criterias
                                                            }
                                                            onInputData={
                                                                handleSetData
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        {/* Insert a divider only after the first section when both sexes */}
                                        {idx === 0 &&
                                            selectedSexes.length > 1 && (
                                                <hr className="my-4" />
                                            )}
                                    </Fragment>
                                ))}
                                <div className="mt-5 flex justify-end">
                                    <PrimaryButton>Save</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
