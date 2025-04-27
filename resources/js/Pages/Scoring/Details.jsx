import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { LazyLoadImage } from "react-lazy-load-image-component";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function ScoringIndex({ auth, pageant, groupCriterias }) {
    const { flash } = usePage().props;

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
                        <div className="p-6 ">
                            {flash.message && (
                                <div className="block w-full p-2 rounded-sm bg-green-500 text-white mb-2">
                                    {flash.message}
                                </div>
                            )}
                            {Object.entries(groupCriterias).map(
                                ([roundName, groups]) => (
                                    <div key={`round-` + roundName}>
                                        <h2 className="uppercase dark:text-white text-2xl font-bold mb-4">
                                            {roundName}
                                        </h2>

                                        <div className="grid grid-cols-4 gap-4 items-center">
                                            {/* Render each group inside that round */}
                                            {Object.entries(groups).map(
                                                ([groupName, items]) => (
                                                    <div
                                                        key={
                                                            `group-` + groupName
                                                        }
                                                    >
                                                        <Link
                                                            href={route(
                                                                "scoring.score",
                                                                {
                                                                    pageant:
                                                                        pageant.id,
                                                                    criteria:
                                                                        items[0]
                                                                            .id,
                                                                }
                                                            )}
                                                        >
                                                            <div
                                                                className={classNames(
                                                                    `relative w-full object-cover bg-black border`,
                                                                    pageant.current_round ==
                                                                        items[0]
                                                                            .round &&
                                                                        pageant.current_group ==
                                                                            groupName
                                                                        ? "border-green-500"
                                                                        : "border-red-500"
                                                                )}
                                                            >
                                                                <LazyLoadImage
                                                                    src={
                                                                        `/storage/` +
                                                                        pageant.background
                                                                    }
                                                                    placeholderSrc="/logo.png"
                                                                    alt={
                                                                        roundName
                                                                    }
                                                                />
                                                                <div className="py-1 px-2 bg-gray-500 absolute bottom-0 inset-x-0">
                                                                    <h3 className="text-center text-white uppercase font-bold">
                                                                        Criterias
                                                                    </h3>
                                                                    <ul className="text-center text-white uppercase font-bold text-xs list-inside list-disc">
                                                                        {items.map(
                                                                            (
                                                                                crit
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        `crit-` +
                                                                                        crit.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        crit.name
                                                                                    }
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                            {/* {groupCriterias.map((group, index) => {
                                return (
                                    <div key={index}>
                                        <h2 className="uppercase dark:text-white text-2xl font-bold mb-4">
                                            {`Round #` + (index + 1)}
                                        </h2>
                                        <div className="grid grid-cols-4 gap-4 items-center">
                                            {group.map((criteria) => {
                                                return (
                                                    <Link
                                                        key={criteria.id}
                                                        href={route(
                                                            "scoring.score",
                                                            {
                                                                pageant:
                                                                    pageant.id,
                                                                criteria:
                                                                    criteria.id,
                                                            }
                                                        )}
                                                        className={classNames(
                                                            `w-full object-cover bg-black`,
                                                            pageant.current_round ==
                                                                criteria.round &&
                                                                pageant.current_group ==
                                                                    criteria.group
                                                                ? "border border-green-500"
                                                                : "border border-red-500"
                                                        )}
                                                    >
                                                        <div className="relative">
                                                            <LazyLoadImage
                                                                src={
                                                                    `/storage/` +
                                                                    pageant.background
                                                                }
                                                                placeholderSrc="/logo.png"
                                                                alt={
                                                                    criteria.name
                                                                }
                                                            />
                                                            <div
                                                                key={
                                                                    criteria.id
                                                                }
                                                                className="py-1 px-2 bg-gray-500 text-center text-white uppercase font-bold absolute bottom-0 inset-x-0"
                                                            >
                                                                {criteria.name}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })} */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
