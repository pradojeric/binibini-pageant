import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TableComponent from "@/Components/TableComponent";
import "react-lazy-load-image-component/src/effects/blur.css";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import InputError from "@/Components/InputError";
import { useEffect } from "react";

export default function ScoringShow({ auth, pageant, candidates }) {
    const { data, setData, post, errors } = useForm({
        round: 1,
        scores: [],
    });

    useEffect(() => {
        if (!data.round) return;
        const scores = [];

        candidates.forEach((candidate) => {
            if (candidate.candidates_deduction.length > 0) {
                const deduction = candidate.candidates_deduction.filter((c) => {
                    return c.pivot.pageant_round_id == data.round;
                });
                
                if (deduction.length < 1) return;

                scores[candidate.id] = deduction[0].pivot.deduction;
            }
        });

        setData("scores", scores);
    }, [data.round]);

    const femaleCandidates = candidates.filter(
        (candidate) => candidate.gender === "ms"
    );
    const maleCandidates = candidates.filter(
        (candidate) => candidate.gender === "mr"
    );

    const submit = (e) => {
        e.preventDefault();
        post(route("pageant.deduct.store", { pageant: pageant }));
    };

    const renderCandidateRow = (candidate, index) => {
        return (
            <tr
                key={index}
                className="group transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
               <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-4 items-center">
                        <div className="shrink-0 relative">
                            {candidate.picture ? (
                                <img
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 transition-transform group-hover:scale-110 duration-200"
                                    src={`/storage/` + candidate.picture}
                                    alt={candidate.full_name}
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                                    <span className="text-gray-500 font-medium text-xs">
                                        {candidate.candidate_number}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                #{candidate.candidate_number}
                            </div>
                        </div>
                        <div>
                            <div className="uppercase font-bold text-gray-900 dark:text-gray-100 text-sm tracking-wide">
                                {candidate.full_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {candidate.nickname}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="text-center px-6 py-4">
                    <TextInput
                        type="number"
                        name="scores[]"
                        value={data.scores[candidate.id] ?? 0}
                        min={0}
                        className="w-24 text-center font-bold"
                        onChange={(e) => {
                            const val = e.target.value;
                            setData((prev) => {
                                const newScores = [...prev.scores]; // array copy
                                newScores[candidate.id] = val;
                                return { ...prev, scores: newScores };
                            });
                        }}
                    />
                </td>
            </tr>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {pageant.pageant} - Points Deduction
                </h2>
            }
        >
            <Head title="Pageant Deduction" />

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
                                Current Round Selected
                            </span>
                            <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                                {data.round ? `Round ${data.round}` : "-"}
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
                         <div className="flex items-center gap-4">
                            <Link href={route("pageant.view-scores", pageant.id)}>
                                <SecondaryButton>
                                    &larr; Back to Scores
                                </SecondaryButton>
                            </Link>
                         </div>
                         <div className="font-medium text-gray-500">
                            Deductions Manager
                         </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 dark:text-white">
                            <form onSubmit={submit}>
                                {/* Round Selection */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <InputLabel value="Select Round:" className="text-lg" />
                                        <SelectInput
                                            name="round"
                                            value={data.round}
                                            className="min-w-[200px]"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setData(prev => ({ ...prev, round: val }));
                                            }}
                                        >
                                            <option value="" hidden>Select Round</option>
                                            <option value="0">Round 0</option>
                                            {pageant.pageant_rounds.map((round, index) => (
                                                <option value={round.id} key={`R${index}`}>
                                                    {`Round ${round.round} (${round.number_of_candidates})`}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </div>
                                    <PrimaryButton>Save Deductions</PrimaryButton>
                                </div>
                                <InputError message={errors.round} className="mb-2" />
                                <InputError message={errors.scores} className="mb-4" />

                                <hr className="border-gray-100 dark:border-gray-700 mb-8" />
                                
                                {(pageant.type === "mr" || pageant.type === "mr&ms") && (
                                    <div className="mb-10">
                                        <h2 className="uppercase font-bold text-xl tracking-wide mb-4 text-gray-800 dark:text-gray-200">
                                            Mr. Candidates
                                        </h2>
                                        <TableComponent
                                            header={["Candidate", "Deduction Points"]}
                                            className="w-full"
                                        >
                                            <tbody>
                                                {maleCandidates.map((candidate, idx) =>
                                                    renderCandidateRow(candidate, idx)
                                                )}
                                            </tbody>
                                        </TableComponent>
                                    </div>
                                )}

                                {pageant.type === "mr&ms" && <hr className="my-8 border-gray-100 dark:border-gray-700" />}

                                {(pageant.type === "ms" || pageant.type === "mr&ms") && (
                                    <div>
                                        <h2 className="uppercase font-bold text-xl tracking-wide mb-4 text-gray-800 dark:text-gray-200">
                                            Ms. Candidates
                                        </h2>
                                        <TableComponent
                                            header={["Candidate", "Deduction Points"]}
                                            className="w-full"
                                        >
                                            <tbody>
                                                {femaleCandidates.map((candidate, idx) =>
                                                    renderCandidateRow(candidate, idx)
                                                )}
                                            </tbody>
                                        </TableComponent>
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
