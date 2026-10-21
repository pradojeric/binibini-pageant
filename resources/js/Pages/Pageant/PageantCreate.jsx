import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageantForm, { initialPageantForm } from "@/Pages/Pageant/Partials/PageantForm";
import { TrophyIcon } from "@heroicons/react/24/outline";

export default function PageantCreate({ auth }) {
    const { data, setData, post, processing, errors } = useForm(initialPageantForm());

    const submit = (e) => {
        e.preventDefault();
        post(route("pageants.store"));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <TrophyIcon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                        Create New Pageant
                    </h2>
                </div>
            }
        >
            <Head title="Create Pageant" />

            <PageantForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Create Pageant"
                processingLabel="Creating…"
                footerTitle="Ready to proceed?"
                footerHint="Review round details before creating."
            />
        </AuthenticatedLayout>
    );
}
