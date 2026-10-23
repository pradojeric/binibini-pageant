import FormField from "@/Components/FormField";
import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { PlusIcon, CheckIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

// Adds a criteria, or edits one when `criteria` is given.
export default function CriteriaForm({ className = "", pageant, criteria = null, onCancel = () => {} }) {
    const editing = criteria !== null;
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: criteria?.name ?? "",
        round: criteria?.round ?? 1,
        percentage: criteria?.percentage ?? 0,
        group: criteria?.group ?? 1,
        hidden_scoring: criteria?.hidden_scoring ?? false,
    });

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        if (editing) {
            patch(route("criterias.update", criteria.id), {
                onSuccess: () => {
                    onCancel();
                    reset();
                },
            });
            return;
        }

        post(route("pageants.criterias.store", pageant.id), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <form onSubmit={submit} className={`space-y-5 ${className}`} noValidate>
            <p className="text-xs text-gray-600 dark:text-gray-400">
                Fields marked <span className="text-red-600 dark:text-red-400" aria-hidden="true">*</span> are required.
            </p>

            <div className="flex flex-col gap-5">
                <FormField
                    id="name"
                    label="Criteria Name"
                    required
                    hint="The name judges will see when scoring."
                    error={errors.name}
                >
                    <TextInput
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="e.g. Poise and Elegance"
                    />
                </FormField>

                <FormField
                    id="percentage"
                    label="Percentage"
                    required
                    hint="The maximum score for this criteria, from 1 to 100. Judges can score between half this value and the full value. A round's criteria usually add up to 100%."
                    error={errors.percentage}
                >
                    <TextInputWithSuffix
                        suffix="%"
                        type="number"
                        min="1"
                        max="100"
                        step="any"
                        value={data.percentage}
                        onChange={(e) => setData("percentage", e.target.value)}
                        placeholder="0"
                    />
                </FormField>

                <FormField
                    id="round"
                    label="Round"
                    required
                    hint="Criteria are organized into rounds. Judges score one round at a time."
                    error={errors.round}
                >
                    <TextInput
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={data.round}
                        onChange={(e) => setData("round", e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="1"
                    />
                </FormField>

                <FormField
                    id="group"
                    label="Group"
                    required
                    hint="Within a round, criteria are split into groups. Judges will only see and score one group of criteria at a time. Use different group numbers to separate criteria into batches."
                    error={errors.group}
                >
                    <TextInput
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={data.group}
                        onChange={(e) => setData("group", e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="1"
                    />
                </FormField>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900/80">
                    <div className="flex h-6 items-center">
                        <Checkbox
                            id="hidden_scoring"
                            aria-describedby="hidden_scoring-hint"
                            checked={data.hidden_scoring}
                            onChange={(e) => setData("hidden_scoring", e.target.checked)}
                        />
                    </div>
                    <label htmlFor="hidden_scoring" className="cursor-pointer select-none">
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                            Score by Admin Only
                            <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                        </span>
                        <span id="hidden_scoring-hint" className="block text-xs text-gray-600 dark:text-gray-400 mt-1">
                            If enabled, only the admin can enter scores for this criteria.
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                {editing && (
                    <SecondaryButton
                        className="flex items-center gap-2"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        <XMarkIcon className="w-4 h-4" />
                        Cancel
                    </SecondaryButton>
                )}
                <PrimaryButton
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={processing}
                >
                    {editing ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                    {editing ? "Save Changes" : "Add Criteria"}
                </PrimaryButton>
            </div>
        </form>
    );
}

// FormField hands its accessibility props to its direct child, so the suffix wrapper forwards them to the input.
function TextInputWithSuffix({ suffix, ...props }) {
    return (
        <div className="relative mt-1">
            <TextInput {...props} className="block w-full pr-10" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-600 dark:text-gray-400 sm:text-sm font-bold" aria-hidden="true">
                    {suffix}
                </span>
            </div>
        </div>
    );
}
