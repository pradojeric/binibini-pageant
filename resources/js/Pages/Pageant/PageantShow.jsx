import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import IndexCriteria from "@/Pages/Pageant/Criterias/Partials/CriteriaList";
import JudgeList from "@/Pages/Judges/Partials/JudgeList";
import Card, { CardBody } from "@/Components/Card";
import Chip from "@/Components/Chip";
import Avatar from "@/Components/Avatar";
import Typography from "@/Components/Typography";
import { 
    TrophyIcon, 
    UserGroupIcon, 
    ListBulletIcon, 
    UserIcon,
    ChartBarIcon,
    PrinterIcon,
    ArrowRightIcon,
    ClockIcon,
    Square2StackIcon
} from "@heroicons/react/24/outline";

export default function PageantShow({ auth, pageant }) {
    const candidates = pageant.candidates;

    // Helper to get status color for Chip component
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "finished": return "green";
            case "ongoing": return "amber";
            case "not started": return "blue-gray";
            default: return "blue-gray";
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <TrophyIcon className="w-6 h-6" />
                    </div>
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                        {pageant.pageant}
                    </h2>
                </div>
            }
        >
            <Head title={pageant.pageant} />

            <div className="space-y-8 pb-12">
                {/* Hero / Overview Section */}
                <Card className="w-full">
                    <div className="relative h-48 md:h-64 overflow-hidden">
                        {pageant.background ? (
                            <img
                                src={`/storage/${pageant.background}`}
                                className="w-full h-full object-cover"
                                alt={pageant.pageant}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700" />
                        )}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <div className="flex flex-wrap items-center gap-4 mb-2">
                                <Chip
                                    variant="gradient"
                                    color={getStatusColor(pageant.status)}
                                    value={pageant.status ?? "Not started"}
                                    className="rounded-full shadow-md"
                                />
                                <Chip
                                    variant="outlined"
                                    color="blue-gray"
                                    value={pageant.type}
                                    className="rounded-full border-white/40 text-white uppercase"
                                />
                            </div>
                            <Typography variant="h2" color="white" className="font-black tracking-tight drop-shadow-md">
                                {pageant.pageant}
                            </Typography>
                        </div>
                    </div>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Square2StackIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <Typography variant="small" className="font-bold uppercase tracking-wider text-gray-400">Total Rounds</Typography>
                                    <Typography variant="h5" color="blue-gray" className="dark:text-white">{pageant.rounds}</Typography>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
                                    <UserGroupIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <Typography variant="small" className="font-bold uppercase tracking-wider text-gray-400">Candidates</Typography>
                                    <Typography variant="h5" color="blue-gray" className="dark:text-white">{candidates.length}</Typography>
                                </div>
                            </div>
                            <div className="md:col-span-2 flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                        <ChartBarIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Typography variant="small" className="font-bold text-indigo-900 dark:text-indigo-100">Live Scoring</Typography>
                                        <Typography variant="small" className="text-indigo-600/70 dark:text-indigo-400/70">View entries and tabulations</Typography>
                                    </div>
                                </div>
                                <Link 
                                    href={route("pageant.view-scores", pageant.id)}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring focus:ring-indigo-300 disabled:opacity-25 transition shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95"
                                >
                                    View Scores
                                </Link>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left: Candidates */}
                    <Card className="lg:col-span-4 overflow-hidden flex flex-col h-full max-h-[600px]">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-indigo-500" />
                                <Typography variant="h6" className="text-gray-900 dark:text-white">Candidates</Typography>
                            </div>
                            {pageant.status !== "finished" && (
                                <Link href={route("pageants.candidates.index", pageant.id)}>
                                    <Typography color="indigo" variant="small" className="font-black uppercase tracking-widest text-[10px] hover:text-indigo-800 transition-colors cursor-pointer">
                                        Manage
                                    </Typography>
                                </Link>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="space-y-4">
                                {candidates.map((candidate, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <div className="relative">
                                            {candidate.picture ? (
                                                <Avatar
                                                    src={`/storage/${candidate.picture}`}
                                                    alt={candidate.full_name}
                                                    size="lg"
                                                    className="border-2 border-white dark:border-gray-800 shadow-sm"
                                                />
                                            ) : (
                                                <Avatar
                                                    variant="circular"
                                                    size="lg"
                                                    className="bg-indigo-50 text-indigo-500 font-bold"
                                                >
                                                    {candidate.full_name.charAt(0)}
                                                </Avatar>
                                            )}
                                            <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">
                                                {candidate.candidate_number}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Typography variant="small" className="font-black text-gray-900 dark:text-white uppercase leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                                                {candidate.full_name}
                                            </Typography>
                                            <Typography variant="small" className="text-gray-500 font-medium truncate italic">
                                                "{candidate.nickname}"
                                            </Typography>
                                        </div>
                                        <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Center & Right: Criteria & Judges */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Criteria Card */}
                        <Card className="overflow-hidden">
                             <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ListBulletIcon className="w-5 h-5 text-indigo-500" />
                                    <Typography variant="h6" className="text-gray-900 dark:text-white">Scoring Criteria</Typography>
                                </div>
                                {pageant.status !== "finished" && (
                                    <Link href={route("pageants.criterias.index", pageant.id)}>
                                        <Typography color="indigo" variant="small" className="font-black uppercase tracking-widest text-[10px] hover:text-indigo-800 transition-colors cursor-pointer">
                                            Configure
                                        </Typography>
                                    </Link>
                                )}
                            </div>
                            <CardBody className="p-0">
                                <IndexCriteria criterias={pageant.criterias} />
                            </CardBody>
                        </Card>

                        {/* Judges & Round Schedule */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Judges Card */}
                            <Card className="overflow-hidden flex flex-col h-full max-h-[500px]">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="w-5 h-5 text-indigo-500" />
                                        <Typography variant="h6" className="text-gray-900 dark:text-white">Panel of Judges</Typography>
                                    </div>
                                    {pageant.status !== "finished" && (
                                        <Link href={route("pageant.select-judges", { pageant: pageant.id })}>
                                            <Typography color="indigo" variant="small" className="font-black uppercase tracking-widest text-[10px] hover:text-indigo-800 transition-colors cursor-pointer">
                                                Select
                                            </Typography>
                                        </Link>
                                    )}
                                </div>
                                <div className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                                    <JudgeList judges={pageant.judges} />
                                </div>
                            </Card>

                            {/* Rounds List Card */}
                            <Card className="overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="w-5 h-5 text-indigo-500" />
                                        <Typography variant="h6" className="text-gray-900 dark:text-white">Round Breakdown</Typography>
                                    </div>
                                    <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                                        <Typography variant="small" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{pageant.pageant_rounds.length} Total</Typography>
                                    </div>
                                </div>
                                <CardBody className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Quota</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                                {pageant.pageant_rounds.map((round, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <Typography variant="small" className="font-bold text-gray-900 dark:text-gray-100">{round.round_name}</Typography>
                                                            <Typography variant="small" className="text-[10px] text-gray-400 uppercase font-black">Round {round.round}</Typography>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 w-10 border border-gray-200 dark:border-gray-700">
                                                                <Typography variant="small" className="font-black text-gray-900 dark:text-white">{round.number_of_candidates}</Typography>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm shadow-gray-200/50 dark:shadow-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl text-gray-600 dark:text-gray-400">
                            <PrinterIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <Typography variant="h6" className="text-gray-900 dark:text-white">Reporting & Outputs</Typography>
                            <Typography variant="small" className="text-gray-500">Generate scorecards and results for printing.</Typography>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route("pageants.edit", pageant.id)}
                            className="inline-flex items-center px-4 py-2 bg-transparent border border-transparent rounded-md font-bold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-100 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            Edit Settings
                        </Link>
                        <Link 
                            href={route("pageant.for-printing", pageant.id)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            Print Sheets
                        </Link>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
