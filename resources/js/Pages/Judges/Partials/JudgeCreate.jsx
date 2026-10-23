import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";

export default function JudgeCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("judges.store"), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <InputLabel htmlFor="name" value="Full Name" className="text-xs font-bold uppercase tracking-wider text-gray-500" />

                <TextInput
                    id="name"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 shadow-sm transition-all"
                    placeholder="Enter judge full name"
                    autoComplete="name"
                    isFocused={true}
                    onChange={(e) => setData("name", e.target.value)}
                    required
                />

                <InputError message={errors.name} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="email" value="Email Address" className="text-xs font-bold uppercase tracking-wider text-gray-500" />

                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 shadow-sm transition-all"
                    placeholder="judge@example.com"
                    autoComplete="username"
                    onChange={(e) => setData("email", e.target.value)}
                    required
                />

                <InputError message={errors.email} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="password" value="Password" className="text-xs font-bold uppercase tracking-wider text-gray-500" />

                <TextInput
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    className="mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 shadow-sm transition-all"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    onChange={(e) => setData("password", e.target.value)}
                    required
                />

                <InputError message={errors.password} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel
                    htmlFor="password_confirmation"
                    value="Confirm Password"
                    className="text-xs font-bold uppercase tracking-wider text-gray-500"
                />

                <TextInput
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    className="mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 shadow-sm transition-all"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                    required
                />

                <InputError
                    message={errors.password_confirmation}
                    className="mt-2"
                />
            </div>

            <div className="pt-4">
                <PrimaryButton className="w-full justify-center py-3 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all" disabled={processing}>
                    Create Judge Account
                </PrimaryButton>
            </div>
        </form>
    );
}
