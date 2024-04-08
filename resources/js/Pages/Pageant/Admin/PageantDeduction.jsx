import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
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
                console.log(deduction);
                if (deduction.length < 1) return;

                scores[candidate.id] = deduction[0].pivot.deduction;
            }
        });

        setData("scores", scores);
        console.log(data.scores);
    }, [data.round]);

    // const candidates = pageant.candidates;
    const femaleCandidates = candidates.filter(
        (candidate) => candidate.gender == "ms"
    );
    const maleCandidates = candidates.filter(
        (candidate) => candidate.gender == "mr"
    );

    const submit = (e) => {
        e.preventDefault();
        post(route("pageant.deduct.store", { pageant: pageant }));
    };

    const handleSetData = () => {
        //
    };

    const render = (candidate, index) => {
        return (
            <tr key={index}>
                <td>
                    <div className="flex space-x-4 items-center px-3 py-2">
                        <div>
                            {candidate.picture ? (
                                <img
                                    className="rounded-full h-16 w-16 object-cover border border-black bg-white"
                                    src={`/storage/` + candidate.picture}
                                    alt={candidate.full_name}
                                />
                            ) : (
                                ""
                            )}
                        </div>
                        <div className="dark:text-white">
                            {`#` + candidate.candidate_number}
                        </div>
                        <div>
                            <div className="uppercase font-bold">
                                {candidate.full_name}
                            </div>
                            <div className="text-sm text-gray-400">
                                {candidate.nickname}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="text-center px-3 py-2 uppercase">
                    <TextInput
                        type="number"
                        name="scores[]"
                        value={data.scores[candidate.id] ?? 0}
                        min={0}
                        onChange={(e) => {
                            const oldScores = data.scores;
                            oldScores[candidate.id] = e.target.value;
                            setData("scores", oldScores);
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
            <Head title="Pageant" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 dark:text-white">
                        <InputError message={errors.round} />
                        <InputError message={errors.scores} />
                        <form onSubmit={submit}>
                            <div className="flex justify-between mb-2">
                                <div>
                                    <div className="uppercase">
                                        Pageant Type: {pageant.type}
                                    </div>
                                </div>
                                <div>
                                    <PrimaryButton>Save</PrimaryButton>
                                </div>
                            </div>
                            <div className="mt-4 gap-2 flex items-center">
                                <InputLabel value="Round" />
                                <SelectInput
                                    name="round"
                                    value={data.round}
                                    onChange={(e) => {
                                        setData("round", e.target.value);
                                    }}
                                >
                                    <option value="" hidden>
                                        Select
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
                            <hr />
                            {(pageant.type == "mr" ||
                                pageant.type == "mr&ms") && (
                                <div>
                                    <h2 className="uppercase font-bold text-lg tracking-wide">
                                        Mr Candidates
                                    </h2>
                                    <table>
                                        <tbody>
                                            {maleCandidates.map((candidate) => {
                                                return render(candidate, index);
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {pageant.type == "mr&ms" && <hr className="my-4" />}

                            {(pageant.type == "ms" ||
                                pageant.type == "mr&ms") && (
                                <div>
                                    <h2 className="uppercase font-bold text-lg tracking-wide">
                                        Ms Candidates
                                    </h2>
                                    <table>
                                        <tbody>
                                            {femaleCandidates.map(
                                                (candidate, index) => {
                                                    return render(
                                                        candidate,
                                                        index
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
