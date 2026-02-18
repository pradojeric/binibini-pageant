import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useMemo, useCallback, Fragment } from "react";

export default function ScoringShow({ auth, pageant, candidates }) {
    const { data, setData, post, processing } = useForm({
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
    // Function to check if all candidates have been scored
    const allCandidatesScored = () => {
        const scoredKeys = new Set(
            data.scores.map((s) => `${s.candidate_id}-${s.criteria_id}`)
        );

        for (let candidate of candidates) {
            // Check if candidate matches the active pageant type/sex filter
            if (selectedSexes.includes(candidate.gender)) {
                for (let criteria of pageant.criterias) {
                    if (!scoredKeys.has(`${candidate.id}-${criteria.id}`)) {
                        return false;
                    }
                }
            }
        }
        return true;
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
            <Head title={`Scoring - ${pageant.pageant}`} />

            <div
                className="py-12 bg-fixed bg-cover bg-center min-h-screen"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/storage/${pageant.background})`,
                }}
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                                Current Round
                            </span>
                            <span className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">
                                {pageant.current_round}
                            </span>
                        </div>
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                                Pageant Type
                            </span>
                            <span className="text-4xl font-black text-purple-600 dark:text-purple-400 mt-2 uppercase">
                                {pageant.type}
                            </span>
                        </div>
                         <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                                Scored
                            </span>
                            <span className="text-4xl font-black text-green-600 dark:text-green-400 mt-2">
                                {new Set(data.scores.map(s => s.candidate_id)).size} / {candidates.length}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md overflow-hidden shadow-2xl sm:rounded-3xl border border-white/10">
                        <div className="p-8">
                            <form onSubmit={submit}>
                                {selectedSexes.map((sex, idx) => (
                                    <Fragment key={sex}>
                                        <div className={idx > 0 ? "mt-12 pt-12 border-t border-gray-200 dark:border-gray-700" : ""}>
                                            <div className="flex items-center gap-4 mb-8">
                                                <h2 className="uppercase font-black text-3xl tracking-tighter dark:text-white">
                                                    {sex === "mr" ? "Mr. Candidates" : "Ms. Candidates"}
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
                                <div className="mt-12 flex justify-end pt-8 border-t border-gray-200 dark:border-gray-700">
                                    <PrimaryButton 
                                        className="px-10 py-4 text-lg font-bold rounded-xl shadow-lg shadow-blue-500/20"
                                        disabled={processing}
                                    >
                                        {processing ? "Saving..." : "Lock in Scores"}
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
