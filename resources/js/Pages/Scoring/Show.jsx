import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import "react-lazy-load-image-component/src/effects/blur.css";

export default function ScoringShow({ auth, pageant, candidates }) {
    const { data, setData, post } = useForm({
        scores: [],
    });

    // const candidates = pageant.candidates;
    const femaleCandidates = candidates.filter(
        (candidate) => candidate.gender == "ms"
    );
    const maleCandidates = candidates.filter(
        (candidate) => candidate.gender == "mr"
    );

    const handleSetData = (candidate_id, criteria_id, score) => {
        const scoring = {
            candidate_id: candidate_id,
            criteria_id: criteria_id,
            score: score,
        };
        const found = data.scores.find(
            (obj) =>
                obj.candidate_id === candidate_id &&
                obj.criteria_id === criteria_id
        );

        if (!found) {
            console.log("Not Found. Adding...");
            setData("scores", [...data.scores, scoring]);
        } else {
            console.log("Found. Adding...");
            const objIndex = data.scores.findIndex(
                (obj) =>
                    obj.candidate_id === candidate_id &&
                    obj.criteria_id === criteria_id
            );
            data.scores[objIndex] = scoring;
        }
    };

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
                                    <div>
                                        <PrimaryButton>Save</PrimaryButton>
                                    </div>
                                </div>
                                <hr />

                                {(pageant.type == "mr" ||
                                    pageant.type == "mr&ms") && (
                                    <div>
                                        <h2 className="uppercase font-bold text-lg tracking-wide">
                                            Mr Candidates
                                        </h2>
                                        <div className="grid grid-cols-4 gap-8 mt-4">
                                            {maleCandidates.map((candidate) => {
                                                return (
                                                    <CandidateBox
                                                        key={candidate.id}
                                                        candidate={candidate}
                                                        criterias={
                                                            pageant.criterias
                                                        }
                                                        onInputData={
                                                            handleSetData
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {pageant.type == "mr&ms" && (
                                    <hr className="my-4" />
                                )}

                                {(pageant.type == "ms" ||
                                    pageant.type == "mr&ms") && (
                                    <div>
                                        <h2 className="uppercase font-bold text-lg tracking-wide">
                                            Ms Candidates
                                        </h2>
                                        <div className="grid grid-cols-4 gap-8 mt-4">
                                            {femaleCandidates.map(
                                                (candidate) => {
                                                    return (
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
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
