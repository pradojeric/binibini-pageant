import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import IndexCriteria from "@/Pages/Pageant/Criterias/Partials/CriteriaList";
import PrimaryButton from "@/Components/PrimaryButton";
import CandidateList from "@/Pages/Pageant/Candidates/Partials/CandidateList";
import JudgeList from "@/Pages/Judges/Partials/JudgeList";
import { useEffect } from "react";
import { Button, Avatar, Typography } from "@material-tailwind/react";

export default function PageantShow({ auth, pageant }) {
    const candidates = pageant.candidates;

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
                <div className=" mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 dark:text-white">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="">
                                        Pageant Type:{" "}
                                        <span className="uppercase">
                                            {" "}
                                            {pageant.type}
                                        </span>
                                    </div>
                                    <div className="">
                                        Pageant Status:{" "}
                                        <span
                                            className={
                                                pageant.status === "Not started"
                                                    ? "text-green-600"
                                                    : "text-green-600"
                                            }
                                        >
                                            {pageant.status ?? "Not started"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="">
                                        <span className="text-xl">
                                            {pageant.rounds + ` Rounds`}
                                        </span>
                                        <table className="table table-auto border border-gray-300 mt-2">
                                            <thead>
                                                <tr>
                                                    <th className="px-2 py-1 text-sm tracking-wide uppercase font-semibold">
                                                        Round
                                                    </th>
                                                    <th className="px-2 py-1 text-sm tracking-wide uppercase font-semibold">
                                                        Number of Candidates
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageant.pageant_rounds.map(
                                                    (round, index) => (
                                                        <tr key={index}>
                                                            <td className="px-2 py-0.5 text-sm">
                                                                {
                                                                    round.round_name
                                                                }
                                                            </td>
                                                            <td className="px-2 py-0.5 text-sm text-center">
                                                                {
                                                                    round.number_of_candidates
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* <div>
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
                                </div> */}
                            </div>
                            <div className="mt-2">
                                <Link
                                    href={route(
                                        "pageant.view-scores",
                                        pageant.id
                                    )}
                                >
                                    <Button
                                        color="green"
                                        className="transition duration-300 ease-in-out hover:bg-green-600"
                                    >
                                        View Score
                                    </Button>
                                </Link>
                            </div>
                            {/* <hr /> */}
                            {/* <div className="grid grid-cols-2 mt-5 gap-4">
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
                            </div> */}
                            <div className="mt-5">
                                <div className="grid grid-cols-12 grid-rows-5 gap-4 ">
                                    <div className="col-span-3 row-span-5 border p-4">
                                        <div className="flex justify-between mb-4">
                                            <div className="font-bold mb-4">
                                                Candidates
                                            </div>

                                            {pageant.status !== "finished" && (
                                                <Link
                                                    href={route(
                                                        "pageants.candidates.index",
                                                        pageant.id
                                                    )}
                                                >
                                                    <Typography
                                                        color="green"
                                                        as="a"
                                                        href=""
                                                        variant="small"
                                                        className="font-medium  transition duration-300 ease-in-out hover:text-green-800"
                                                    >
                                                        View/Add Candidates
                                                    </Typography>
                                                </Link>
                                            )}
                                        </div>
                                        {candidates.map((candidate, index) => (
                                            <div
                                                key={index}
                                                className="flex space-x-2 mb-4 items-center"
                                            >
                                                <div>
                                                    {candidate.picture ? (
                                                        <img
                                                            className="rounded-full h-16 w-16 object-cover border border-black bg-white"
                                                            src={
                                                                `/storage/` +
                                                                candidate.picture
                                                            }
                                                            alt={
                                                                candidate.full_name
                                                            }
                                                        />
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                                <div className="flex flex-col space-y-0">
                                                    <div className="text-sm">
                                                        Candidate #
                                                        {
                                                            candidate.candidate_number
                                                        }
                                                    </div>
                                                    <div>
                                                        <div className="uppercase font-bold">
                                                            {
                                                                candidate.full_name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            {candidate.nickname}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="col-span-6 row-span-5 col-start-4 border p-4 ">
                                        <div className="flex justify-between mb-4">
                                            <div className="font-bold mb-4">
                                                Criteria
                                            </div>
                                            {pageant.status !== "finished" && (
                                                <Link
                                                    href={route(
                                                        "pageants.criterias.index",
                                                        pageant.id
                                                    )}
                                                >
                                                    <Typography
                                                        color="green"
                                                        as="a"
                                                        href=""
                                                        variant="small"
                                                        className="font-medium transition duration-300 ease-in-out hover:text-green-800"
                                                    >
                                                        View
                                                    </Typography>
                                                </Link>
                                            )}
                                        </div>
                                        <IndexCriteria
                                            criterias={pageant.criterias}
                                        ></IndexCriteria>
                                    </div>
                                    <div className="col-span-3 row-span-5 col-start-10 border p-4">
                                        <div className="flex justify-between mb-4">
                                            <div className="font-bold mb-4">
                                                Judges
                                            </div>
                                            {pageant.status !== "finished" && (
                                                <Link
                                                    href={route(
                                                        "pageant.select-judges",
                                                        {
                                                            pageant: pageant.id,
                                                        }
                                                    )}
                                                >
                                                    <Typography
                                                        color="green"
                                                        as="a"
                                                        href=""
                                                        variant="small"
                                                        className="font-medium transition duration-300 ease-in-out hover:text-green-800"
                                                    >
                                                        Select Judges
                                                    </Typography>
                                                </Link>
                                            )}
                                        </div>
                                        <div>
                                            <JudgeList
                                                judges={pageant.judges}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
