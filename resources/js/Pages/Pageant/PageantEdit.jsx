import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageantForm, { initialPageantForm } from "@/Pages/Pageant/Partials/PageantForm";
import { TrophyIcon } from "@heroicons/react/24/outline";

export default function PageantEdit({ auth, pageant }) {
    const { data, setData, post, processing, errors } = useForm(initialPageantForm(pageant));

    const submit = (e) => {
        e.preventDefault();
        post(route("pageants.update", pageant.id), {
            forceFormData: true,
        });
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
                        Edit Pageant: {pageant.pageant}
                    </h2>
                </div>
            }
        >
            <Head title={`Edit ${pageant.pageant}`} />

            <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                <PageantForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    currentBackground={pageant.background}
                    submitLabel="Update Pageant"
                    processingLabel="Updating…"
                    footerTitle="Commit Changes"
                    footerHint="Update all pageant parameters."
                />
            </div>
        </AuthenticatedLayout>
    );
}
