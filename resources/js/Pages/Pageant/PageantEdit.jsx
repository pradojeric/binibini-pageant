import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageantForm, { initialPageantForm } from "@/Pages/Pageant/Partials/PageantForm";
import PageHeader from "@/Components/PageHeader";
import BackButton from "@/Components/BackButton";
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
            header={<PageHeader icon={TrophyIcon} title="Edit Pageant" subtitle={pageant.pageant} />}
        >
            <Head title={`Edit ${pageant.pageant}`} />

            <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <BackButton href={route("pageants.show", pageant.id)}>Back to Pageant</BackButton>
                </div>

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
