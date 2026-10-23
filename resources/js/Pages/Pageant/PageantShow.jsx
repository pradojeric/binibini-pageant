import { Head, Link } from "@inertiajs/react";
import Image from "@/Components/Image";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { DIVISION_KEYS, divisionOf } from "@/Utils/divisions";
import { cn } from "@/Utils/cn";
import IndexCriteria from "@/Pages/Pageant/Criterias/Partials/CriteriaList";
import JudgeList from "@/Pages/Judges/Partials/JudgeList";
import Card, { CardBody, CardHeader } from "@/Components/Card";
import PageHeader from "@/Components/PageHeader";
import BackButton from "@/Components/BackButton";
import Chip from "@/Components/Chip";
import Avatar from "@/Components/Avatar";
import Typography from "@/Components/Typography";
import {
    PRIMARY_BUTTON_CLASSES,
    SECONDARY_BUTTON_CLASSES,
    SMALL_LINK_BUTTON_CLASSES,
} from "@/Components/styles";
import {
    TrophyIcon,
    UserGroupIcon,
    ListBulletIcon,
    UserIcon,
    ScaleIcon,
    ChartBarIcon,
    PrinterIcon,
    ClockIcon,
    Square2StackIcon
} from "@heroicons/react/24/outline";

// Keys match the values Pageant::status can return.
const STATUS_STYLES = {
    "not yet started": "bg-gray-100 text-gray-800",
    ongoing: "bg-amber-100 text-amber-900",
    finished: "bg-green-100 text-green-900",
};

const STAT_LABEL_CLASSES = "text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400";

const divisionOrder = (key) => {
    const index = DIVISION_KEYS.indexOf(key);
    return index === -1 ? DIVISION_KEYS.length : index;
};

// [[key, items], ...] sorted by sortKey
const groupBy = (items, key, sortKey = (k) => k) =>
    Object.entries(
        items.reduce((groups, item) => {
            (groups[item[key]] ??= []).push(item);
            return groups;
        }, {})
    ).sort(([a], [b]) => (sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0));

function EmptyState({ icon: Icon, message, action }) {
    return (
        <div className="px-6 py-12 text-center">
            <Icon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true" />
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

function CandidateRow({ candidate }) {
    return (
        <li className="flex items-center gap-4 p-3 rounded-xl">
            <div className="relative shrink-0">
                {candidate.picture ? (
                    <Avatar
                        src={`/storage/${candidate.picture}`}
                        alt=""
                        size="lg"
                        className="border-2 border-white dark:border-gray-800 shadow-sm"
                    />
                ) : (
                    <Avatar
                        variant="circular"
                        size="lg"
                        className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold"
                        aria-hidden="true"
                    >
                        {candidate.full_name.charAt(0)}
                    </Avatar>
                )}
                <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full min-w-[1.5rem] h-6 px-1 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm tabular-nums">
                    <span className="sr-only">Candidate number </span>
                    {candidate.candidate_number}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
                    {candidate.full_name}
                </p>
                {candidate.nickname && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate italic">
                        "{candidate.nickname}"
                    </p>
                )}
            </div>
        </li>
    );
}

export default function PageantShow({ auth, pageant }) {
    const candidates = pageant.candidates;
    const isFinished = pageant.status?.toLowerCase() === "finished";
    const isOngoing = pageant.status?.toLowerCase() === "ongoing";
    const isMultiDivision = pageant.divisions.length > 1;

    const candidateGroups = groupBy(candidates, "gender", divisionOrder);
    const roundGroups = groupBy(pageant.pageant_rounds, "round", Number).map(([round, rows]) => [
        round,
        [...rows].sort((a, b) => divisionOrder(a.pageant_type) - divisionOrder(b.pageant_type)),
    ]);

    const scoresTitle = isOngoing ? "Live Scoring" : isFinished ? "Results" : "Scores";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader icon={TrophyIcon} title={pageant.pageant} subtitle="Overview" />}
        >
            <Head title={pageant.pageant} />

            <div className="space-y-8 pb-12">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <BackButton href={route("pageants.index")}>Back to Pageants</BackButton>
                </div>

                {/* Hero / Overview Section */}
                <Card className="w-full">
                    <div className="relative min-h-[12rem] md:min-h-[16rem] flex flex-col justify-end overflow-hidden">
                        {pageant.background ? (
                            <Image
                                src={`/storage/${pageant.background}`}
                                loading="eager"
                                className="absolute inset-0 w-full h-full object-cover"
                                alt=""
                            />
                        ) : (
                            <div className="absolute inset-0 bg-indigo-700" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />
                        <div className="relative p-5 sm:p-8">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Chip
                                    value={pageant.status}
                                    className={cn(
                                        "rounded-full px-3",
                                        STATUS_STYLES[pageant.status?.toLowerCase()] ?? STATUS_STYLES["not yet started"]
                                    )}
                                />
                                {pageant.divisions.map((key) => (
                                    <Chip
                                        key={key}
                                        value={divisionOf(key).label}
                                        className={cn("rounded-full px-3", divisionOf(key).chip)}
                                    />
                                ))}
                            </div>
                            <Typography
                                variant="h2"
                                as="h1"
                                color="white"
                                className="text-2xl sm:text-3xl font-black tracking-tight [text-wrap:balance] break-words"
                            >
                                {pageant.pageant}
                            </Typography>
                        </div>
                    </div>
                    <CardBody>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-700 dark:text-indigo-300">
                                    <Square2StackIcon className="w-6 h-6" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className={STAT_LABEL_CLASSES}>Rounds</p>
                                    <Typography variant="h5" as="p" className="text-gray-900 dark:text-white tabular-nums">{pageant.rounds}</Typography>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-700 dark:text-blue-300">
                                    <UserGroupIcon className="w-6 h-6" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <p className={STAT_LABEL_CLASSES}>Candidates</p>
                                    <Typography variant="h5" as="p" className="text-gray-900 dark:text-white tabular-nums">{candidates.length}</Typography>
                                    {isMultiDivision && candidates.length > 0 && (
                                        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 tabular-nums">
                                            {candidateGroups
                                                .map(([key, group]) => `${divisionOf(key).label} ${group.length}`)
                                                .join(" · ")}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600 rounded-xl text-white">
                                        <ChartBarIcon className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{scoresTitle}</p>
                                        <p className="text-sm text-indigo-800 dark:text-indigo-300">View entries and tabulations</p>
                                    </div>
                                </div>
                                <Link href={route("pageant.view-scores", pageant.id)} className={PRIMARY_BUTTON_CLASSES}>
                                    View Scores
                                </Link>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Candidates */}
                    <Card className="lg:col-span-4 flex flex-col lg:max-h-[600px]">
                        <CardHeader
                            icon={UserIcon}
                            title="Candidates"
                            action={!isFinished && (
                                <Link href={route("pageants.candidates.index", pageant.id)} className={SMALL_LINK_BUTTON_CLASSES}>
                                    Manage
                                </Link>
                            )}
                        />
                        <div className="flex-1 lg:overflow-y-auto p-4 custom-scrollbar">
                            {candidates.length === 0 ? (
                                <EmptyState
                                    icon={UserGroupIcon}
                                    message="No candidates yet."
                                    action={!isFinished && (
                                        <Link href={route("pageants.candidates.index", pageant.id)} className={SECONDARY_BUTTON_CLASSES}>
                                            Add Candidates
                                        </Link>
                                    )}
                                />
                            ) : (
                                <div className="space-y-6">
                                    {candidateGroups.map(([key, group]) => (
                                        <section key={key} aria-label={`${divisionOf(key).label} candidates`}>
                                            {(isMultiDivision || candidateGroups.length > 1) && (
                                                <h3 className="flex items-center gap-2 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                                    <span className={cn("w-2 h-2 rounded-full", divisionOf(key).bar)} aria-hidden="true" />
                                                    {divisionOf(key).label}
                                                    <span className="font-normal normal-case tracking-normal tabular-nums">({group.length})</span>
                                                </h3>
                                            )}
                                            <ul className="space-y-2">
                                                {group.map((candidate) => (
                                                    <CandidateRow key={candidate.id} candidate={candidate} />
                                                ))}
                                            </ul>
                                        </section>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Center & Right: Criteria & Judges */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Criteria Card */}
                        <Card>
                            <CardHeader
                                icon={ListBulletIcon}
                                title="Scoring Criteria"
                                action={!isFinished && (
                                    <Link href={route("pageants.criterias.index", pageant.id)} className={SMALL_LINK_BUTTON_CLASSES}>
                                        Configure
                                    </Link>
                                )}
                            />
                            <IndexCriteria criterias={pageant.criterias} bare />
                        </Card>

                        {/* Judges & Round Schedule */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Judges Card */}
                            <Card className="flex flex-col lg:max-h-[500px]">
                                <CardHeader
                                    icon={ScaleIcon}
                                    title="Panel of Judges"
                                    action={!isFinished && (
                                        <Link href={route("pageant.select-judges", { pageant: pageant.id })} className={SMALL_LINK_BUTTON_CLASSES}>
                                            Select
                                        </Link>
                                    )}
                                />
                                <div className="flex-1 lg:overflow-y-auto custom-scrollbar">
                                    <JudgeList judges={pageant.judges} readOnly />
                                </div>
                            </Card>

                            {/* Rounds List Card */}
                            <Card>
                                <CardHeader
                                    icon={ClockIcon}
                                    title="Round Breakdown"
                                    action={
                                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 rounded-full border border-indigo-100 dark:border-indigo-900/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 tabular-nums whitespace-nowrap">
                                            {pageant.rounds} {pageant.rounds === 1 ? "round" : "rounds"}
                                        </span>
                                    }
                                />
                                {roundGroups.length === 0 ? (
                                    <EmptyState
                                        icon={ClockIcon}
                                        message="No rounds set up yet."
                                        action={!isFinished && (
                                            <Link href={route("pageants.edit", pageant.id)} className={SECONDARY_BUTTON_CLASSES}>
                                                Edit Settings
                                            </Link>
                                        )}
                                    />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Advancing</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {roundGroups.map(([round, rows]) => (
                                                    <tr key={round}>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                {[...new Set(rows.map((row) => row.round_name))].join(" / ")}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Round {round}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                                {rows.map((row) => (
                                                                    <span
                                                                        key={row.id}
                                                                        className={cn(
                                                                            "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm tabular-nums",
                                                                            isMultiDivision
                                                                                ? divisionOf(row.pageant_type).badge
                                                                                : "bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                                                        )}
                                                                    >
                                                                        {isMultiDivision && (
                                                                            <span className="text-xs font-semibold">{divisionOf(row.pageant_type).label}</span>
                                                                        )}
                                                                        <span className="font-bold">{row.number_of_candidates}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <Card>
                    <CardBody className="flex flex-wrap items-center justify-between gap-6 sm:p-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl text-gray-600 dark:text-gray-400">
                                <PrinterIcon className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">Settings & Printing</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Edit pageant settings, or print scoresheets and results.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href={route("pageants.edit", pageant.id)} className={SECONDARY_BUTTON_CLASSES}>
                                Edit Settings
                            </Link>
                            <Link href={route("pageant.for-printing", pageant.id)} className={cn(PRIMARY_BUTTON_CLASSES, "gap-2")}>
                                <PrinterIcon className="w-4 h-4" aria-hidden="true" />
                                Print Sheets
                            </Link>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
