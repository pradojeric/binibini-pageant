import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import TextArea from "@/Components/TextArea";
import { useForm } from "@inertiajs/react";
import { useEffect, useRef } from "react";

const GENDERS = [
    { id: "mr", value: "Mr." },
    { id: "ms", value: "Ms." },
];

export default function CandidateCreate({ className = "", pageant }) {
    // Default to the pageant's gender type unless it's "mr&ms", then start blank
    const defaultGender =
        pageant?.type && pageant.type !== "mr&ms" ? pageant.type : "";
    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            picture: null,
            candidate_number: "",
            last_name: "",
            first_name: "",
            middle_name: "",
            name_ext: "",
            gender: defaultGender,
            nickname: "",
            description: "",
        });

    const picRef = useRef(null);

    const {
        candidate_number,
        last_name,
        first_name,
        middle_name,
        name_ext,
        gender,
        nickname,
        description,
        picture,
    } = data;
    const {
        candidate_number: errCandidateNumber,
        last_name: errLastName,
        first_name: errFirstName,
        middle_name: errMiddleName,
        name_ext: errNameExt,
        gender: errGender,
        nickname: errNickname,
        description: errDescription,
        picture: errPicture,
    } = errors;

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("pageants.candidates.store", pageant.id), {
            onSuccess: () => {
                alert("Success!");
                reset();
                if (picRef.current) {
                    picRef.current.value = "";
                }
            },
        });
    };

    return (
        <section className={className}>
            <h2 className="uppercase font-bold">Create</h2>
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
                            value={candidate_number}
                            onChange={(e) =>
                                setData("candidate_number", e.target.value)
                            }
                        />
                        <InputError
                            message={errCandidateNumber}
                            className="mt-1"
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            className="w-full block"
                            id="last_name"
                            name="last_name"
                            value={last_name}
                            onChange={(e) =>
                                setData("last_name", e.target.value)
                            }
                        />
                        <InputError message={errLastName} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            className="w-full block"
                            id="first_name"
                            name="first_name"
                            value={first_name}
                            onChange={(e) =>
                                setData("first_name", e.target.value)
                            }
                        />
                        <InputError message={errFirstName} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="middle_name" value="Middle Name" />
                        <TextInput
                            className="w-full block"
                            id="middle_name"
                            name="middle_name"
                            value={middle_name}
                            onChange={(e) =>
                                setData("middle_name", e.target.value)
                            }
                        />
                        <InputError message={errMiddleName} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="name_ext" value="Name Ext" />
                        <TextInput
                            className="w-full block"
                            id="name_ext"
                            name="name_ext"
                            value={name_ext}
                            onChange={(e) =>
                                setData("name_ext", e.target.value)
                            }
                        />
                        <InputError message={errNameExt} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="gender" value="Gender" />

                        <SelectInput
                            id="gender"
                            name="gender"
                            className="mt-1 block w-full"
                            value={gender}
                            onChange={(e) => setData("gender", e.target.value)}
                        >
                            <option value="" hidden>
                                Select gender...
                            </option>
                            {GENDERS.map((gender) => (
                                <option value={gender.id} key={gender.id}>
                                    {gender.value}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errGender} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="nickname" value="NickName" />
                        <TextInput
                            className="w-full block"
                            id="nickname"
                            name="nickname"
                            value={nickname}
                            onChange={(e) =>
                                setData("nickname", e.target.value)
                            }
                        />
                        <InputError message={errNickname} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="description" value="Description" />
                        <TextArea
                            className="w-full block"
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                        ></TextArea>
                        <InputError message={errDescription} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="picture" value="Picture" />
                        <TextInput
                            className="w-full block"
                            type="file"
                            accept="image/*"
                            id="picture"
                            name="picture"
                            onChange={(e) =>
                                setData("picture", e.target.files[0])
                            }
                            ref={picRef}
                        />
                        {progress && (
                            <progress value={progress.percentage} max="100">
                                {progress.percentage}%
                            </progress>
                        )}
                        <InputError message={errPicture} className="mt-1" />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <PrimaryButton disabled={processing}>Add</PrimaryButton>
                    </div>
                </div>
            </form>
        </section>
    );
}
