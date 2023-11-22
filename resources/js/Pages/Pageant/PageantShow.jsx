import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import IndexCriteria from "@/Pages/Pageant/Criterias/Partials/CriteriaList";
import PrimaryButton from "@/Components/PrimaryButton";
import CandidateList from "@/Pages/Pageant/Candidates/Partials/CandidateList";
import JudgeList from "@/Pages/Judges/Partials/JudgeList";
import { useEffect } from "react";

export default function PageantShow({ auth, pageant }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {pageant.pageant}
                </h2>
            }
        >
            <Head title="Pageant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 dark:text-white">
                            <div className="flex justify-between mb-2">
                                <div>
                                    <div className="uppercase">
                                        Rounds: {pageant.rounds}
                                    </div>
                                    <div className="uppercase">
                                        Pageant Type: {pageant.type}
                                    </div>
                                    <div className="uppercase">
                                        Pageant Status:
                                        {pageant.status ?? "Not started"}
                                    </div>

                                    <div className="mt-2">
                                        <Link
                                            href={route(
                                                "pageant.view-scores",
                                                pageant.id
                                            )}
                                        >
                                            <PrimaryButton>
                                                View Score
                                            </PrimaryButton>
                                        </Link>
                                    </div>
                                </div>

                                <div>
                                    <div>
                                        <JudgeList judges={pageant.judges} />
                                    </div>
                                    <div className="mt-2">
                                        {pageant.status !== "finished" && (
                                            <Link
                                                href={route(
                                                    "pageant.select-judges",
                                                    {
                                                        pageant: pageant.id,
                                                    }
                                                )}
                                            >
                                                <PrimaryButton>
                                                    Select Judges
                                                </PrimaryButton>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="grid grid-cols-2 mt-5 gap-4">
                                <div>
                                    <div className="flex justify-between mb-1 items-center">
                                        <h2 className="font-medium text-lg uppercase">
                                            Criterias
                                        </h2>
                                        {pageant.status !== "finished" && (
                                            <Link
                                                href={route(
                                                    "pageants.criterias.index",
                                                    pageant.id
                                                )}
                                            >
                                                <PrimaryButton className="!px-2 !py-1">
                                                    View
                                                </PrimaryButton>
                                            </Link>
                                        )}
                                    </div>
                                    <hr />
                                    <IndexCriteria
                                        criterias={pageant.criterias}
                                    ></IndexCriteria>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 items-center">
                                        <h2 className="font-medium text-lg uppercase">
                                            Candidates
                                        </h2>
                                        {pageant.status !== "finished" && (
                                            <Link
                                                href={route(
                                                    "pageants.candidates.index",
                                                    pageant.id
                                                )}
                                            >
                                                <PrimaryButton className="!px-2 !py-1">
                                                    View
                                                </PrimaryButton>
                                            </Link>
                                        )}
                                    </div>
                                    <hr />
                                    <CandidateList
                                        candidates={pageant.candidates}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
