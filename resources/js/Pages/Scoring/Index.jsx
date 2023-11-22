import PrimaryButton from "@/Components/PrimaryButton";
import TableComponent from "@/Components/TableComponent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";

export default function ScoringIndex({ auth, pageants }) {
    const { flash } = usePage().props;
    const headings = [
        "Name",
        "Type",
        "Rounds",
        "Current Round",
        "Status",
        "Created",
        "Action",
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Current Pageants
                </h2>
            }
        >
            <Head title="Pageant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {flash.message && (
                                <div className="block w-full p-2 rounded-sm bg-green-500 text-white mb-2">
                                    {flash.message}
                                </div>
                            )}

                            {/* <TableComponent header={headings}>
                                {pageants.map((pageant) => {
                                    return (
                                        <tr key={pageant.id}>
                                            <td className="dark:text-white px-3 py-2 text-center">
                                                {pageant.pageant}
                                            </td>
                                            <td className="dark:text-white px-3 py-2 text-center uppercase">
                                                {pageant.type}
                                            </td>
                                            <td className="dark:text-white px-3 py-2 text-center">
                                                {pageant.rounds}
                                            </td>
                                            <td className="dark:text-white px-3 py-2 text-center">
                                                {pageant.current_round}
                                            </td>
                                            <td className="dark:text-white px-3 py-2 text-center">
                                                {pageant.status}
                                            </td>
                                            <td className="dark:text-white px-3 py-2 text-center">
                                                {pageant.updated_at}
                                            </td>
                                            <td className="text-center px-3 py-2">
                                                <Link
                                                    href={route(
                                                        "scoring.show",
                                                        pageant.id
                                                    )}
                                                >
                                                    <PrimaryButton>
                                                        Start Scoring
                                                    </PrimaryButton>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </TableComponent> */}
                            <div className="grid grid-cols-3 gap-4">
                                {pageants.map((pageant) => {
                                    return (
                                        <Link
                                            href={route(
                                                "scoring.show",
                                                pageant.id
                                            )}
                                        >
                                            <div className="flex flex-col items-center">
                                                <img
                                                    className="w-full h-96"
                                                    alt={pageant.pageant}
                                                    src={
                                                        `/storage/` +
                                                        pageant.background
                                                    }
                                                ></img>
                                                <div className="dark:text-white text-xl font-bold tracking-wide">
                                                    {pageant.pageant}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
