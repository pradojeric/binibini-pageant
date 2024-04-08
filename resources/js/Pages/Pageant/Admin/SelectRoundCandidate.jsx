import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CandidateBox from "@/Pages/Scoring/Partials/CandidateBox";
import PrimaryButton from "@/Components/PrimaryButton";
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
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleChecked = (e) => {
        let id = e.target.value;
        return e.target.checked
            ? setData("selectedCandidates", [...data.selectedCandidates, id])
            : setData(
                  "selectedCandidates",
                  [...data.selectedCandidates].filter((o) => {
                      return o, id != id;
                  })
              );
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
                className="py-12 bg-fixed bg-cover"
                style={{
                    backgroundImage: `url(/storage/${pageant.background})`,
                }}
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex justify-end">
                                <Link
                                    href={route(
                                        "pageant.view-scores",
                                        pageant.id
                                    )}
                                >
                                    <PrimaryButton>Back</PrimaryButton>
                                </Link>
                            </div>

                            <InputError message={errors.round} />
                            <InputError message={errors.selectedCandidates} />

                            <form onSubmit={submit}>
                                <div className="mt-4 gap-2 flex items-center">
                                    <InputLabel value="Round" />
                                    <SelectInput
                                        name="round"
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
                                <div className="mt-4">
                                    {candidates.map((candidate) => {
                                        return (
                                            <div key={candidate.id}>
                                                <label className="flex items-center gap-4">
                                                    <Checkbox
                                                        name="selectedJudges[]"
                                                        value={candidate.id}
                                                        defaultChecked={data.selectedCandidates.includes(
                                                            candidate.id
                                                        )}
                                                        onChange={handleChecked}
                                                    />
                                                    <div className="flex space-x-4 items-center px-3 py-2">
                                                        <div>
                                                            {candidate.picture ? (
                                                                <img
                                                                    className="rounded-full h-16 w-16 object-cover border border-black bg-white"
                                                                    src={
                                                                        `/storage/` +
                                                                        candidate.picture
                                                                    }
                                                                    alt={
                                                                        candidate.full_name
                                                                    }
                                                                />
                                                            ) : (
                                                                ""
                                                            )}
                                                        </div>
                                                        <div className="dark:text-white">
                                                            {`#` +
                                                                candidate.candidate_number}
                                                        </div>
                                                        <div>
                                                            <div className="uppercase font-bold dark:text-white">
                                                                {
                                                                    candidate.full_name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                {
                                                                    candidate.nickname
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4">
                                    <PrimaryButton onClick={submit}>
                                        Add
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
