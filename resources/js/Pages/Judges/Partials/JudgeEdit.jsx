import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { useEffect } from "react";

export default function JudgeEdit({ judge, show, onClose }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: judge?.name || "",
        email: judge?.email || "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        if (judge) {
            setData({
                name: judge.name,
                email: judge.email,
                password: "",
                password_confirmation: "",
            });
        }
    }, [judge]);

    const submit = (e) => {
        e.preventDefault();
        put(route("judges.update", judge.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Edit Judge Account
                </h2>

                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="edit_name" value="Full Name" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                        <TextInput
                            id="edit_name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 shadow-sm transition-all"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="edit_email" value="Email Address" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                        <TextInput
                            id="edit_email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 shadow-sm transition-all"
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
                        <p className="text-xs text-gray-400 mb-4 italic">Leave password blank if you don't want to change it.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit_password" value="New Password" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                <TextInput
                                    id="edit_password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 shadow-sm transition-all"
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_password_confirmation" value="Confirm New Password" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                <TextInput
                                    id="edit_password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 shadow-sm transition-all"
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose} className="rounded-xl">
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton className="rounded-xl px-6" disabled={processing}>
                        Update Changes
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
