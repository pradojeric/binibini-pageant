import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { useMemo } from "react";

export default function PageantCreate({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        pageant: "",
        type: "",
        background: "",
        rounds: 1,
        pageant_rounds: {
            mr: [{ round: 1, name: "", number_of_candidates: 1 }],
            ms: [{ round: 1, name: "", number_of_candidates: 1 }],
        },
    });

    const types = [
        { id: "ms", value: "Ms." },
        { id: "mr", value: "Mr." },
        { id: "mr&ms", value: "Mr. & Ms." },
    ];

    // Utility: return an array of sexes for a given type string
    const getSexes = (type) =>
        type === "mr&ms" ? ["mr", "ms"] : type ? [type] : [];

    /** Derive which candidate tables to show based on the selected pageant type */
    const selectedSexes = useMemo(() => {
        if (!data.type) return [];
        return data.type === "mr&ms" ? ["mr", "ms"] : [data.type];
    }, [data.type]);

    /** Sanitize numeric input (min 1, integers only) */
    const toInt = (v) => {
        if (v === "") return "";
        const n = parseInt(v, 10);
        return isNaN(n) || n < 1 ? 1 : n;
    };

    /** Build an array of rounds with the default candidate count */
    const scaffoldRounds = (roundsInt) =>
        Array.from({ length: roundsInt }, (_, i) => ({
            round: i + 1,
            name: "",
            number_of_candidates: 1,
        }));

    /** Handle change in the number of rounds */
    const handleRoundsChange = (e) => {
        const roundsInt = toInt(e.target.value);
        const scaffold = scaffoldRounds(roundsInt);
        const sexes = getSexes(data.type);

        const newPageantRounds = {};
        sexes.forEach((sex) => {
            // Re‑use what we already have, trimmed or padded to match roundsInt
            const existing = data.pageant_rounds[sex] ?? [];
            const updated = [];

            for (let i = 0; i < roundsInt; i++) {
                updated.push(
                    existing[i]
                        ? { ...existing[i], round: i + 1 }
                        : { ...scaffold[i] }
                );
            }
            newPageantRounds[sex] = updated;
        });

        setData({
            ...data,
            rounds: roundsInt,
            pageant_rounds: newPageantRounds,
        });
    };

    /** Update candidate count safely without mutating the original state */
    const updateCandidateCount = (sex, idx, value) => {
        const candidateInt = toInt(value);
        setData("pageant_rounds", {
            ...data.pageant_rounds,
            [sex]: data.pageant_rounds[sex].map((row, i) =>
                i === idx ? { ...row, number_of_candidates: candidateInt } : row
            ),
        });
    };

    /** Update round name without mutating state */
    const updateRoundName = (sex, idx, value) => {
        setData("pageant_rounds", {
            ...data.pageant_rounds,
            [sex]: data.pageant_rounds[sex].map((row, i) =>
                i === idx ? { ...row, name: value } : row
            ),
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("pageants.store"));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Create Pageants
                </h2>
            }
        >
            <Head title="Pageant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form
                                onSubmit={submit}
                                encType="multipart/form-data"
                            >
                                {/* Pageant name */}
                                <div>
                                    <InputLabel
                                        htmlFor="pageant"
                                        value="Pageant Name"
                                    />
                                    <TextInput
                                        id="pageant"
                                        type="text"
                                        name="pageant"
                                        value={data.pageant}
                                        className="mt-1 block w-full"
                                        onChange={(e) =>
                                            setData("pageant", e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.pageant}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Pageant type */}
                                <div className="mt-4">
                                    <InputLabel
                                        htmlFor="type"
                                        value="Pageant Type"
                                    />
                                    <SelectInput
                                        id="type"
                                        name="type"
                                        className="mt-1 block w-full"
                                        value={data.type}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            const sexes = getSexes(newType);
                                            const scaffold = scaffoldRounds(
                                                data.rounds
                                            );

                                            // Keep existing data for still‑relevant sexes, scaffold new ones
                                            const newPageantRounds = {};
                                            sexes.forEach((sex) => {
                                                newPageantRounds[sex] =
                                                    data.pageant_rounds[sex] ??
                                                    scaffold;
                                            });

                                            setData({
                                                ...data,
                                                type: newType,
                                                pageant_rounds:
                                                    newPageantRounds,
                                            });
                                        }}
                                    >
                                        <option hidden>Select...</option>
                                        {types.map((type) => (
                                            <option
                                                value={type.id}
                                                key={type.id}
                                            >
                                                {type.value}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError
                                        message={errors.type}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Background file */}
                                <div className="mt-4">
                                    <InputLabel
                                        htmlFor="background"
                                        value="Custom Background"
                                    />
                                    <TextInput
                                        id="background"
                                        type="file"
                                        name="background"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setData(
                                                "background",
                                                e.target.files[0]
                                            )
                                        }
                                        className="mt-1 block w-full"
                                    />
                                    <InputError
                                        message={errors.background}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Rounds */}
                                <div className="mt-4">
                                    <InputLabel
                                        htmlFor="rounds"
                                        value="Rounds"
                                    />
                                    <TextInput
                                        id="rounds"
                                        type="number"
                                        name="rounds"
                                        min={1}
                                        value={data.rounds}
                                        className="mt-1 block w-full"
                                        onChange={handleRoundsChange}
                                    />
                                    <InputError
                                        message={errors.rounds}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Candidate tables */}
                                {selectedSexes.length > 0 && (
                                    <div className="mt-4 flex justify-between gap-4 dark:text-white">
                                        {selectedSexes.map((sex) => (
                                            <div key={sex}>
                                                <div className="uppercase tracking-wide mb-2">
                                                    {sex === "mr"
                                                        ? "Male Candidate"
                                                        : "Female Candidate"}
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-3 py-2">
                                                                Round
                                                            </th>
                                                            <th className="px-3 py-2">
                                                                Name
                                                            </th>
                                                            <th className="px-3 py-2">
                                                                Number of
                                                                Candidates
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.pageant_rounds[
                                                            sex
                                                        ].map((pr, index) => (
                                                            <tr
                                                                key={`${sex}${pr.round}`}
                                                            >
                                                                <td className="text-center">
                                                                    {pr.round}
                                                                </td>
                                                                <td>
                                                                    <TextInput
                                                                        type="text"
                                                                        value={
                                                                            pr.name
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateRoundName(
                                                                                sex,
                                                                                index,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <TextInput
                                                                        type="number"
                                                                        min={1}
                                                                        value={
                                                                            pr.number_of_candidates
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateCandidateCount(
                                                                                sex,
                                                                                index,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton
                                        className="ml-4"
                                        disabled={processing}
                                    >
                                        Create
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
