import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageantForm, { initialPageantForm } from "@/Pages/Pageant/Partials/PageantForm";
import PageHeader from "@/Components/PageHeader";
import BackButton from "@/Components/BackButton";
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
            header={<PageHeader icon={TrophyIcon} title="Create New Pageant" />}
        >
            <Head title="Create Pageant" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <BackButton href={route("pageants.index")}>Back to Pageants</BackButton>
            </div>

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
