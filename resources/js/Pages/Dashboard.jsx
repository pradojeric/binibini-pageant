import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import PageHeader from "@/Components/PageHeader";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import { Head } from "@inertiajs/react";

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader icon={Squares2X2Icon} title="Dashboard" />}
        >
            <Head title="Dashboard" />

            <Breadcrumbs items={[{ label: "Dashboard" }]} className="mb-6" />
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    You're logged in!
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
