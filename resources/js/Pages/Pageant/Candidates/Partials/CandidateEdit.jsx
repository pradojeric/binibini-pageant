import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TextArea from "@/Components/TextArea";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { PhotoIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

const GENDERS = [
    { id: "mr", value: "Mr." },
    { id: "ms", value: "Ms." },
];

export default function CandidateEdit({
    className = "",
    candidate,
    handleCancelEditMode = () => {},
}) {
    const picRef = useRef(null);
    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            picture: null,
            candidate_number: candidate.candidate_number,
            last_name: candidate.last_name,
            first_name: candidate.first_name,
            middle_name: candidate.middle_name ?? "",
            name_ext: candidate.name_ext ?? "",
            gender: candidate.gender,
            nickname: candidate.nickname,
            description: candidate.description,
        });

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("candidates.update", candidate.id), {
            onSuccess: () => {
                handleCancelEditMode();
                reset();
            },
        });
    };

    return (
        <form onSubmit={submit} className={`space-y-6 ${className}`}>
            <div className="space-y-4">
                <div>
                    <InputLabel htmlFor="candidate_number" value="Candidate Number" />
                    <TextInput
                        id="candidate_number"
                        type="number"
                        className="mt-1 block w-full"
                        value={data.candidate_number}
                        onChange={(e) => setData("candidate_number", e.target.value)}
                    />
                    <InputError message={errors.candidate_number} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="first_name" value="First Name" />
                    <TextInput
                        id="first_name"
                        className="mt-1 block w-full"
                        value={data.first_name}
                        onChange={(e) => setData("first_name", e.target.value)}
                    />
                    <InputError message={errors.first_name} className="mt-2" />
                </div>
                
                <div>
                    <InputLabel htmlFor="last_name" value="Last Name" />
                    <TextInput
                        id="last_name"
                        className="mt-1 block w-full"
                        value={data.last_name}
                        onChange={(e) => setData("last_name", e.target.value)}
                    />
                    <InputError message={errors.last_name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="middle_name" value="Middle Name" />
                    <TextInput
                        id="middle_name"
                        className="mt-1 block w-full"
                        value={data.middle_name}
                        onChange={(e) => setData("middle_name", e.target.value)}
                    />
                    <InputError message={errors.middle_name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="name_ext" value="Name Extension" />
                    <TextInput
                        id="name_ext"
                        placeholder="e.g. Jr., III"
                        className="mt-1 block w-full"
                        value={data.name_ext}
                        onChange={(e) => setData("name_ext", e.target.value)}
                    />
                    <InputError message={errors.name_ext} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="gender" value="Gender" />
                    <SelectInput
                        id="gender"
                        className="mt-1 block w-full"
                        value={data.gender}
                        onChange={(e) => setData("gender", e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        {GENDERS.map((gender) => (
                            <option key={gender.id} value={gender.id}>
                                {gender.value}
                            </option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.gender} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="nickname" value="Nickname" />
                    <TextInput
                        id="nickname"
                        className="mt-1 block w-full"
                        value={data.nickname}
                        onChange={(e) => setData("nickname", e.target.value)}
                    />
                    <InputError message={errors.nickname} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="description" value="Description" />
                    <TextArea
                        id="description"
                        rows={3}
                        className="mt-1 block w-full"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <PhotoIcon className="w-4 h-4" />
                        Update Picture
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold text-indigo-600">Click to update</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {data.picture ? data.picture.name : "Current picture will be kept if empty"}
                                </p>
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => setData("picture", e.target.files[0])}
                                ref={picRef}
                            />
                        </label>
                    </div>
                    {progress && (
                        <div className="w-full mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                        </div>
                    )}
                    <InputError message={errors.picture} className="mt-2" />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <SecondaryButton 
                    className="flex items-center gap-2"
                    onClick={handleCancelEditMode}
                    disabled={processing}
                >
                    <XMarkIcon className="w-4 h-4" />
                    Cancel
                </SecondaryButton>
                <PrimaryButton 
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
