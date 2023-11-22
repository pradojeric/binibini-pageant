import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import Checkbox from "@/Components/Checkbox";
import PrimaryButton from "@/Components/PrimaryButton";

export default function PageantCreate({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        pageant: "",
        type: "",
        background: "",
        rounds: 1,
        separate_scoring: false,
    });

    const types = [
        { id: "mr&ms", value: "Mr. & Ms." },
        { id: "mr", value: "Mr." },
        { id: "ms", value: "Ms." },
    ];

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
                                        className="mt-1 block w-full"
                                        onChange={(e) =>
                                            setData("rounds", e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.rounds}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="block mt-4">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="separate_scoring"
                                            checked={data.separate_scoring}
                                            onChange={(e) =>
                                                setData(
                                                    "separate_scoring",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                            Separate Scoring
                                        </span>
                                    </label>
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
