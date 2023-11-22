import PrimaryButton from "@/Components/PrimaryButton";
import TableComponent from "@/Components/TableComponent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import JudgeCreate from "@/Pages/Judges/Partials/JudgeCreate";
import JudgeList from "@/Pages/Judges/Partials/JudgeList";
import { Head, Link } from "@inertiajs/react";

export default function PageantIndex({ auth, judges }) {
    const headings = ["Name", "Type", "Rounds", "Status", "Created", "Action"];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Judges
                </h2>
            }
        >
            <Head title="Judges" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <JudgeCreate />
                            </div>
                            <div>
                                <JudgeList judges={judges} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
