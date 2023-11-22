import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import TextArea from "@/Components/TextArea";
import { useForm } from "@inertiajs/react";
import { useEffect, useRef } from "react";

export default function CandidateEdit({
    className = "",
    candidate,
    handleCancelEditMode = () => {},
}) {
    const pic = useRef(null);
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

    const genders = [
        { id: "mr", value: "Mr." },
        { id: "ms", value: "Ms." },
    ];

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("candidates.update", candidate.id), {
            onSuccess: () => {
                alert("Success!");
                handleCancelEditMode();
                reset();
            },
        });
    };

    return (
        <section className={className}>
            <h2 className="uppercase font-bold">Edit</h2>
            <form onSubmit={submit}>
                <div className="my-2">
                    <div className="mt-4">
                        <InputLabel
                            htmlFor="candidate_number"
                            value="Candidate Number"
                        />
                        <TextInput
                            type="number"
                            className="w-full block"
                            id="candidate_number"
                            name="candidate_number"
                            value={data.candidate_number}
                            onChange={(e) =>
                                setData("candidate_number", e.target.value)
                            }
                        />
                    </div>
                    <div className="mt-4">
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            className="w-full block"
                            id="last_name"
                            name="last_name"
                            value={data.last_name}
                            onChange={(e) =>
                                setData("last_name", e.target.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            className="w-full block"
                            id="first_name"
                            name="first_name"
                            value={data.first_name}
                            onChange={(e) =>
                                setData("first_name", e.target.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="middle_name" value="Middle Name" />
                        <TextInput
                            className="w-full block"
                            id="middle_name"
                            name="middle_name"
                            value={data.middle_name}
                            onChange={(e) =>
                                setData("middle_name", e.target.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="name_ext" value="Name Ext" />
                        <TextInput
                            className="w-full block"
                            id="name_ext"
                            name="name_ext"
                            value={data.name_ext}
                            onChange={(e) =>
                                setData("name_ext", e.target.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="gender" value="Gender" />

                        <SelectInput
                            id="gender"
                            name="gender"
                            className="mt-1 block w-full"
                            value={data.gender}
                            onChange={(e) => setData("gender", e.target.value)}
                        >
                            <option hidden>Select...</option>
                            {genders.map((gender) => {
                                return (
                                    <option value={gender.id} key={gender.id}>
                                        {gender.value}
                                    </option>
                                );
                            })}
                        </SelectInput>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="nickname" value="NickName" />
                        <TextInput
                            className="w-full block"
                            id="nickname"
                            name="nickname"
                            value={data.nickname}
                            onChange={(e) =>
                                setData("nickname", e.target.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="description" value="Description" />
                        <TextArea
                            className="w-full block"
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                        ></TextArea>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="picture" value="Picture" />
                        <TextInput
                            className="w-full block"
                            type="file"
                            accept="image/*"
                            id="picture"
                            name="picture"
                            ref={pic}
                            onChange={(e) =>
                                setData("picture", e.target.files[0])
                            }
                        />
                        {progress && (
                            <progress value={progress.percentage} max="100">
                                {progress.percentage}%
                            </progress>
                        )}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <PrimaryButton
                            type="button"
                            disabled={processing}
                            onClick={handleCancelEditMode}
                        >
                            Cancel
                        </PrimaryButton>
                        <PrimaryButton disabled={processing}>
                            Update
                        </PrimaryButton>
                    </div>
                </div>
                <InputError message={errors.last_name} />
                <InputError message={errors.first_name} />
                <InputError message={errors.middle_name} />
                <InputError message={errors.name_ext} />
                <InputError message={errors.gender} />
                <InputError message={errors.nickname} />
                <InputError message={errors.description} />
                <InputError message={errors.picture} />
            </form>
        </section>
    );
}
