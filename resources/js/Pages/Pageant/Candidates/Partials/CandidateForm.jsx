import FormField from "@/Components/FormField";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TextArea from "@/Components/TextArea";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { divisionOf } from "@/Utils/divisions";
import { useEffect, useRef, useState } from "react";
import { PhotoIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

// Adds a candidate, or edits one when `candidate` is given.
export default function CandidateForm({ className = "", pageant, candidate = null, onCancel = () => {} }) {
    const editing = candidate !== null;
    // Preselect the division when the pageant only has one
    const defaultGender =
        pageant?.divisions?.length === 1 ? pageant.divisions[0] : "";
    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            picture: null,
            candidate_number: candidate?.candidate_number ?? "",
            last_name: candidate?.last_name ?? "",
            first_name: candidate?.first_name ?? "",
            middle_name: candidate?.middle_name ?? "",
            name_ext: candidate?.name_ext ?? "",
            gender: candidate?.gender ?? defaultGender,
            nickname: candidate?.nickname ?? "",
            description: candidate?.description ?? "",
        });

    const picRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            setData("picture", e.dataTransfer.files[0]);
        }
    };

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        if (editing) {
            post(route("candidates.update", candidate.id), {
                onSuccess: () => {
                    onCancel();
                    reset();
                },
            });
            return;
        }

        post(route("pageants.candidates.store", pageant.id), {
            onSuccess: () => {
                reset();
                if (picRef.current) {
                    picRef.current.value = "";
                }
            },
        });
    };

    return (
        <form onSubmit={submit} className={`space-y-6 ${className}`} noValidate>
            <p className="text-xs text-gray-600 dark:text-gray-400">
                Fields marked <span className="text-red-600 dark:text-red-400" aria-hidden="true">*</span> are required.
            </p>

            <div className="space-y-4">
                <FormField id="candidate_number" label="Candidate Number" required error={errors.candidate_number}>
                    <TextInput
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        className="mt-1 block w-full"
                        value={data.candidate_number}
                        onChange={(e) => setData("candidate_number", e.target.value)}
                    />
                </FormField>

                <FormField id="first_name" label="First Name" required error={errors.first_name}>
                    <TextInput
                        className="mt-1 block w-full"
                        value={data.first_name}
                        onChange={(e) => setData("first_name", e.target.value)}
                    />
                </FormField>

                <FormField id="last_name" label="Last Name" required error={errors.last_name}>
                    <TextInput
                        className="mt-1 block w-full"
                        value={data.last_name}
                        onChange={(e) => setData("last_name", e.target.value)}
                    />
                </FormField>

                <FormField id="middle_name" label="Middle Name" error={errors.middle_name}>
                    <TextInput
                        className="mt-1 block w-full"
                        value={data.middle_name}
                        onChange={(e) => setData("middle_name", e.target.value)}
                    />
                </FormField>

                <FormField id="name_ext" label="Name Extension" error={errors.name_ext}>
                    <TextInput
                        placeholder="e.g. Jr., III"
                        className="mt-1 block w-full"
                        value={data.name_ext}
                        onChange={(e) => setData("name_ext", e.target.value)}
                    />
                </FormField>

                <FormField id="gender" label="Division" required error={errors.gender}>
                    <SelectInput
                        className="mt-1 block w-full"
                        value={data.gender}
                        onChange={(e) => setData("gender", e.target.value)}
                    >
                        <option value="">Select Division</option>
                        {(pageant?.divisions ?? []).map((key) => (
                            <option key={key} value={key}>
                                {divisionOf(key).label}
                            </option>
                        ))}
                    </SelectInput>
                </FormField>

                <FormField id="nickname" label="Nickname" required error={errors.nickname}>
                    <TextInput
                        className="mt-1 block w-full"
                        value={data.nickname}
                        onChange={(e) => setData("nickname", e.target.value)}
                    />
                </FormField>

                <FormField id="description" label="Description" required error={errors.description}>
                    <TextArea
                        rows={3}
                        className="mt-1 block w-full"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />
                </FormField>

                <div className="space-y-2">
                    <InputLabel htmlFor="picture" className="flex items-center gap-2">
                        <PhotoIcon className="w-4 h-4" />
                        {editing ? "Update Picture" : "Candidate Picture"}
                    </InputLabel>
                    <div className="flex items-center justify-center w-full">
                        <label
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800 ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-indigo-600">
                                        {editing ? "Click to update" : "Click to upload"}
                                    </span>{" "}
                                    or drag and drop
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {data.picture
                                        ? data.picture.name
                                        : editing
                                          ? "Current picture will be kept if empty"
                                          : "PNG, JPG or WebP"}
                                </p>
                            </div>
                            <input
                                id="picture"
                                type="file"
                                className="sr-only"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) => setData("picture", e.target.files[0])}
                                ref={picRef}
                            />
                        </label>
                    </div>
                    {progress && (
                        <div
                            role="progressbar"
                            aria-label="Upload progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progress.percentage}
                            className="w-full mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
                        >
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                        </div>
                    )}
                    <InputError message={errors.picture} className="mt-2" />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
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
                    className="flex items-center gap-2"
                    disabled={processing}
                >
                    {editing && <CheckIcon className="w-4 h-4" />}
                    {editing ? "Save Changes" : "Register Candidate"}
                </PrimaryButton>
            </div>
        </form>
    );
}
