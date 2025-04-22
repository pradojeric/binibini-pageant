import PrimaryButton from "@/Components/PrimaryButton";
import TableComponent from "@/Components/TableComponent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function PageantIndex({ auth, pageants }) {
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
                    Pageants
                </h2>
            }
        >
            <Head title="Pageant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex justify-end">
                                <Link href={route("pageants.create")}>
                                    <PrimaryButton>Create</PrimaryButton>
                                </Link>
                            </div>
                            <TableComponent header={headings}>
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
                                                {pageant.status ??
                                                    `Not yet started`}
                                            </td>
                                            <td className="dark:text-white px-3 py-2 text-center">
                                                {pageant.updated_at}
                                            </td>
                                            <td className="text-center px-3 py-2">
                                                <Link
                                                    href={route(
                                                        "pageants.show",
                                                        pageant.id
                                                    )}
                                                >
                                                    <div className="flex space-x-4">
                                                        <PrimaryButton>
                                                            View
                                                        </PrimaryButton>
                                                    </div>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </TableComponent>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
