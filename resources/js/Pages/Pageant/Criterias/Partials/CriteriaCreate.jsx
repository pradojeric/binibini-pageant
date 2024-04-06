import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { Checkbox } from "flowbite-react";
import { useEffect } from "react";

export default function CriteriaCreate({ className = "", pageant }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        round: 1,
        percentage: 0,
        group: 1,
        hidden_scoring: false,
    });

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("pageants.criterias.store", pageant.id), {
            onSuccess: () => {
                alert("Success!");
                reset();
            },
        });
    };

    return (
        <section className={className}>
            <h2 className="uppercase font-bold">Create</h2>
            <form onSubmit={submit}>
                <div className="my-2">
                    <div className="mt-4">
                        <InputLabel htmlFor="group" value="Group" />
                        <TextInput
                            className="w-full block"
                            id="group"
                            name="group"
                            value={data.group}
                            onChange={(e) => setData("group", e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="round" value="Round" />
                        <TextInput
                            className="w-full block"
                            id="round"
                            name="round"
                            value={data.round}
                            onChange={(e) => setData("round", e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            className="w-full block"
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="percentage" value="Percentage" />
                        <TextInput
                            className="w-full block"
                            id="percentage"
                            type="number"
                            name="percentage"
                            value={data.percentage}
                            onChange={(e) =>
                                setData("percentage", e.target.value)
                            }
                        />
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <Checkbox
                            name="hidden_scoring"
                            value={true}
                            id="hidden_scoring"
                            onChange={(e) => {
                                setData("hidden_scoring", e.target.checked);
                            }}
                        />
                        <InputLabel
                            htmlFor="hidden_scoring"
                            value="Score by Admin"
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <PrimaryButton disabled={processing}>Add</PrimaryButton>
                    </div>
                </div>
                <InputError message={errors.round} />
                <InputError message={errors.name} />
                <InputError message={errors.percentage} />
            </form>
        </section>
    );
}
