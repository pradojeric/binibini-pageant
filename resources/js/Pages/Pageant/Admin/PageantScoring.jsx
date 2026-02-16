import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
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

        post(route("scoring.admin.store", pageant.id), {
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
                                {pageant.type ?? "-"}
                            </span>
                        </div>
                    </div>

                    {/* Control Bar (Just Back Button here for now, could be improved) */}
                    <div className="mb-6 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                        <Link href={route("pageant.view-scores", pageant.id)}>
                            <SecondaryButton>
                                &larr; Back to Scores
                            </SecondaryButton>
                        </Link>
                        <div className="text-gray-500 text-sm">
                           Admin Scoring Panel
                        </div>
                    </div>


                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 dark:text-white">
                            <form onSubmit={submit}>
                                {selectedSexes.map((sex, idx) => (
                                    <Fragment key={sex}>
                                        <div className="mb-8">
                                            <h2 className="uppercase font-bold text-2xl tracking-wide mb-6 border-b pb-2 border-gray-200 dark:border-gray-700">
                                                {sex === "mr"
                                                    ? "Mr. Candidates"
                                                    : "Ms. Candidates"}
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                                {candidatesBySex[sex].length > 0 ? (
                                                    candidatesBySex[sex].map(
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
                                                    )
                                                ) : (
                                                    <div className="col-span-full text-center py-10 text-gray-500">
                                                        No candidates found.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Fragment>
                                ))}
                                
                                <div className="mt-8 flex justify-end border-t pt-6 border-gray-100 dark:border-gray-700">
                                    <PrimaryButton className="px-8 py-3 text-lg">
                                        Save All Scores
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
