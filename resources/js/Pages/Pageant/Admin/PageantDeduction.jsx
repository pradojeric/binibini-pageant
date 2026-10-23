import { Head, Link, useForm } from "@inertiajs/react";
import Image from "@/Components/Image";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import TableComponent from "@/Components/TableComponent";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import InputError from "@/Components/InputError";
import { useEffect, useMemo } from "react";
import { SECONDARY_BUTTON_CLASSES } from "@/Components/styles";
import { DIVISION_KEYS, divisionOf, divisionsLabel } from "@/Utils/divisions";

export default function ScoringShow({ auth, pageant, candidates }) {
    const { data, setData, post, errors } = useForm({
        round: 1,
        scores: [],
    });

    // A round number has one row per division; any of their ids identifies a deduction for this round.
    const roundNumbers = useMemo(
        () => [...new Set(pageant.pageant_rounds.map((r) => r.round))].sort((a, b) => a - b),
        [pageant.pageant_rounds]
    );

    useEffect(() => {
        if (!data.round) return;
        const roundIds = pageant.pageant_rounds
            .filter((r) => r.round == data.round)
            .map((r) => r.id);
        const scores = [];

        candidates.forEach((candidate) => {
            const deduction = candidate.candidates_deduction.find((c) =>
                roundIds.includes(c.pivot.pageant_round_id)
            );
            if (deduction) scores[candidate.id] = deduction.pivot.deduction;
        });

        setData("scores", scores);
    }, [data.round]);

    const divisions = DIVISION_KEYS.filter((key) => pageant.divisions.includes(key));

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
                                <Image
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                                    src={`/storage/` + candidate.picture}
                                    alt={candidate.full_name}
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
                                        {candidate.candidate_number}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-xs tabular-nums font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                #{candidate.candidate_number}
                            </div>
                        </div>
                        <div>
                            <div className="uppercase font-bold text-gray-900 dark:text-gray-100 text-sm tracking-wide">
                                {candidate.full_name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {candidate.nickname}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="text-center px-6 py-4">
                    <TextInput
                        type="number"
                        name="scores[]"
                        aria-label={`Deduction for ${candidate.full_name}`}
                        step="any"
                        inputMode="decimal"
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
                                Deductions · {data.round ? `Round ${data.round}` : "No round selected"}
                                {divisionsLabel(pageant.divisions) && (
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        {" "}· {divisionsLabel(pageant.divisions)}
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Deductions are subtracted from each candidate's total for the selected round.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 dark:text-white">
                            <form onSubmit={submit}>
                                {/* Round Selection */}
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
                                                setData(prev => ({ ...prev, round: val }));
                                            }}
                                        >
                                            <option value="" hidden>Select Round</option>
                                            {roundNumbers.map((round) => (
                                                <option value={round} key={round}>
                                                    {`Round ${round}`}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </div>
                                    <PrimaryButton>Save Deductions</PrimaryButton>
                                </div>
                                <InputError message={errors.round} className="mb-2" />
                                <InputError message={errors.scores} className="mb-4" />

                                <hr className="border-gray-100 dark:border-gray-700 mb-8" />
                                
                                {divisions.map((key, idx) => (
                                    <div key={key} className={idx > 0 ? "mt-10 pt-8 border-t border-gray-100 dark:border-gray-700" : ""}>
                                        <h2 className="uppercase font-bold text-xl tracking-wide mb-4 text-gray-800 dark:text-gray-200">
                                            {divisionOf(key).label} Candidates
                                        </h2>
                                        <TableComponent
                                            header={["Candidate", "Deduction Points"]}
                                            className="w-full"
                                        >
                                            <tbody>
                                                {candidates
                                                    .filter((candidate) => candidate.gender === key)
                                                    .map((candidate, i) => renderCandidateRow(candidate, i))}
                                            </tbody>
                                        </TableComponent>
                                    </div>
                                ))}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
