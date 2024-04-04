import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { useState } from "react";

export default function PageantCreate({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        pageant: "",
        type: "",
        background: "",
        rounds: 1,
        pageant_rounds: {
            mr: [{ round: 1, number_of_candidates: 1 }],
            ms: [{ round: 1, number_of_candidates: 1 }],
        },
    });

    const types = [
        { id: "ms", value: "Ms." },
        { id: "mr", value: "Mr." },
        { id: "mr&ms", value: "Mr. & Ms." },
    ];

    const getType = () => {
        if (!data.type) return [];

        const regexString = /m[rs]/g;
        const array = [...data.type.match(regexString)];

        return array;
    };

    function submit(e) {
        e.preventDefault();

        post(route("pageants.store"));
    }

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
                            <form onSubmit={submit}>
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
                                        onChange={(e) =>
                                            setData("type", e.target.value)
                                        }
                                    >
                                        <option hidden>Select...</option>
                                        {types.map((type) => {
                                            return (
                                                <option
                                                    value={type.id}
                                                    key={type.id}
                                                >
                                                    {type.value}
                                                </option>
                                            );
                                        })}
                                    </SelectInput>
                                    <InputError
                                        message={errors.type}
                                        className="mt-2"
                                    />
                                </div>
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
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full"
                                    />
                                    <InputError
                                        message={errors.background}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="mt-4">
                                    <InputLabel
                                        htmlFor="rounds"
                                        value="Rounds"
                                    />
                                    <TextInput
                                        id="rounds"
                                        type="number"
                                        name="rounds"
                                        value={data.rounds}
                                        min={1}
                                        className="mt-1 block w-full"
                                        onChange={(e) => {
                                            const a = Array.from(
                                                { length: e.target.value },
                                                (_, i) => ({
                                                    round: i + 1,
                                                    number_of_candidates: 1,
                                                })
                                            );

                                            const newData = {
                                                rounds: e.target.value,
                                                pageant_rounds: {
                                                    mr: [...a],
                                                    ms: [...a],
                                                },
                                            };
                                            setData({ ...data, ...newData });
                                        }}
                                    />
                                    <InputError
                                        message={errors.rounds}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between gap-4 dark:text-white">
                                        {getType().includes("mr") && (
                                            <div>
                                                <div className="uppercase tracking-wide">
                                                    Male Candidate
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>Round</th>
                                                            <th>
                                                                Number of
                                                                Candidates
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.pageant_rounds[
                                                            "mr"
                                                        ].map((pr, index) => {
                                                            return (
                                                                <tr
                                                                    key={
                                                                        `mr` +
                                                                        pr.round
                                                                    }
                                                                >
                                                                    <td className="text-center">
                                                                        {
                                                                            pr.round
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        <TextInput
                                                                            type="number"
                                                                            value={
                                                                                pr.number_of_candidates
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const old =
                                                                                    data
                                                                                        .pageant_rounds[
                                                                                        "mr"
                                                                                    ];
                                                                                old[
                                                                                    index
                                                                                ] =
                                                                                    {
                                                                                        round: pr.round,
                                                                                        number_of_candidates:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    };
                                                                                const newValue =
                                                                                    old;

                                                                                setData(
                                                                                    "pageant_rounds",
                                                                                    {
                                                                                        ...data.pageant_rounds,
                                                                                        mr: newValue,
                                                                                    }
                                                                                );
                                                                            }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {getType().includes("ms") && (
                                            <div>
                                                <div className="uppercase tracking-wide">
                                                    Female Candidate
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-3 py-2">
                                                                Round
                                                            </th>
                                                            <th className="px-3 py-2">
                                                                Number of
                                                                Candidates
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.pageant_rounds[
                                                            "ms"
                                                        ].map((pr, index) => {
                                                            return (
                                                                <tr
                                                                    key={
                                                                        `ms` +
                                                                        pr.round
                                                                    }
                                                                >
                                                                    <td className="text-center">
                                                                        {
                                                                            pr.round
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        <TextInput
                                                                            type="number"
                                                                            value={
                                                                                pr.number_of_candidates
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const old =
                                                                                    data
                                                                                        .pageant_rounds[
                                                                                        "ms"
                                                                                    ];
                                                                                old[
                                                                                    index
                                                                                ] =
                                                                                    {
                                                                                        round: pr.round,
                                                                                        number_of_candidates:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    };
                                                                                const newValue =
                                                                                    old;

                                                                                console.log(
                                                                                    data.pageant_rounds
                                                                                );

                                                                                setData(
                                                                                    "pageant_rounds",
                                                                                    {
                                                                                        ...data.pageant_rounds,
                                                                                        ms: newValue,
                                                                                    }
                                                                                );
                                                                            }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>

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
