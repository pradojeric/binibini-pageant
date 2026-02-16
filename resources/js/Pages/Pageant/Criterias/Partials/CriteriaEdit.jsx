import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { CheckIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default function CriteriaEdit({
    className = "",
    criteria,
    handleCancelEditMode = () => {},
}) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: criteria.name,
        round: criteria.round,
        group: criteria.group,
        percentage: criteria.percentage,
        hidden_scoring: criteria.hidden_scoring,
    });

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        patch(route("criterias.update", criteria.id), {
            onSuccess: () => {
                handleCancelEditMode();
                reset();
            },
        });
    };

    return (
        <form onSubmit={submit} className={`space-y-5 ${className}`}>
            <div className="flex flex-col gap-5">
                <div>
                    <InputLabel htmlFor="name" value="Criteria Name" />
                    <TextInput
                        id="name"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="e.g. Poise and Elegance"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="percentage" value="Percentage" />
                    <div className="relative mt-1">
                        <TextInput
                            id="percentage"
                            type="number"
                            value={data.percentage}
                            onChange={(e) => setData("percentage", e.target.value)}
                            className="block w-full pr-10"
                            placeholder="0"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 sm:text-sm font-bold">%</span>
                        </div>
                    </div>
                    <InputError message={errors.percentage} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="round" value="Round" />
                    <TextInput
                        id="round"
                        type="number"
                        value={data.round}
                        onChange={(e) => setData("round", e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="1"
                    />
                    <InputError message={errors.round} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="group" value="Group" />
                    <TextInput
                        id="group"
                        type="number"
                        value={data.group}
                        onChange={(e) => setData("group", e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="1"
                    />
                    <InputError message={errors.group} className="mt-2" />
                </div>

                <div className="md:col-span-2">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900/80">
                        <div className="flex h-6 items-center">
                            <Checkbox
                                id="hidden_scoring_edit"
                                checked={data.hidden_scoring}
                                onChange={(e) => setData("hidden_scoring", e.target.checked)}
                            />
                        </div>
                        <label htmlFor="hidden_scoring_edit" className="cursor-pointer select-none">
                            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                Score by Admin Only
                                <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                            </span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                If enabled, only the admin can enter scores for this criteria.
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                <SecondaryButton 
                    className="flex items-center gap-2"
                    onClick={handleCancelEditMode}
                    disabled={processing}
                >
                    <XMarkIcon className="w-4 h-4" />
                    Cancel
                </SecondaryButton>
                <PrimaryButton 
                    type="submit" 
                    className="flex items-center gap-2"
                    disabled={processing}
                >
                    <CheckIcon className="w-4 h-4" />
                    Save Changes
                </PrimaryButton>
            </div>
        </form>
    );
}
