import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useEffect } from "react";
import Checkbox from "@/Components/Checkbox";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import InputError from "@/Components/InputError";

export default function ScoringShow({
    auth,
    pageant,
    candidates,
    selected = [],
}) {
    const { data, setData, post, errors, reset } = useForm({
        round: "",
        selectedCandidates: selected,
    });

    const submit = (e) => {
        e.preventDefault();
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
                className="py-12 bg-fixed bg-cover bg-center min-h-screen"
                style={{
                    backgroundImage: `url(/storage/${pageant.background})`,
                }}
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                     {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-200">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                                Current Round
                            </span>
                            <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                                {pageant.current_round ?? "-"}
                            </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-200">
                             <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                                Pageant Type
                            </span>
                             <span className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 mt-2 uppercase">
                                {pageant.type ?? "-"}
                            </span>
                        </div>
                    </div>

                    {/* Control Bar */}
                    <div className="mb-6 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <Link href={route("pageant.view-scores", pageant.id)}>
                             <SecondaryButton>
                                &larr; Back to Scores
                            </SecondaryButton>
                        </Link>
                         <div className="font-medium text-gray-500">
                            Candidate Selection
                         </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <InputError message={errors.round} />
                            <InputError message={errors.selectedCandidates} />
                            <form onSubmit={submit}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <InputLabel value="Select Round:" className="text-lg" />
                                        <SelectInput
                                            name="round"
                                            value={data.round}
                                            className="min-w-[200px]"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setData((previousData) => ({
                                                    ...previousData,
                                                    round: val,
                                                }));
                                            }}
                                        >
                                            <option value="" hidden>
                                                Select Round
                                            </option>
                                            <option value="0">Round 0</option>
                                            {pageant.pageant_rounds.map(
                                                (round, index) => {
                                                    return (
                                                        <option
                                                            value={round.id}
                                                            key={`R` + index}
                                                        >
                                                            {`Round ${round.round} (${round.number_of_candidates})`}
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </SelectInput>
                                    </div>
                                    <PrimaryButton type="submit" className="px-6 py-2">
                                        Save Selection
                                    </PrimaryButton>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {candidates.map((candidate) => {
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
                                                                <img
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
                                                                     <span className="text-gray-500 font-bold">{candidate.candidate_number}</span>
                                                                </div>
                                                            )}
                                                             <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                                #{candidate.candidate_number}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="uppercase font-bold dark:text-white truncate text-sm">
                                                                {
                                                                    candidate.full_name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
