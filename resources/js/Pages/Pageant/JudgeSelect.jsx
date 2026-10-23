import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Image from "@/Components/Image";
import { Head, useForm } from "@inertiajs/react";
import BackButton from "@/Components/BackButton";
import PageHeader from "@/Components/PageHeader";
import PrimaryButton from "@/Components/PrimaryButton";
import Checkbox from "@/Components/Checkbox";
import { 
    UserGroupIcon, 
    CheckIcon,
    UserIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function JudgeSelect({
    auth,
    judges,
    pageant,
    pageantJudges = [],
}) {
    const { data, setData, post, processing } = useForm({
        selectedJudges: pageantJudges,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("pageant.store-judges", pageant.id));
    };

    const handleChecked = (judgeId) => {
        const id = Number(judgeId);
        const isSelected = data.selectedJudges.includes(id);

        if (isSelected) {
            setData("selectedJudges", data.selectedJudges.filter((o) => o !== id));
        } else {
            setData("selectedJudges", [...data.selectedJudges, id]);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <PageHeader
                    icon={ShieldCheckIcon}
                    title="Select Judges"
                    subtitle={pageant.pageant}
                />
            }
        >
            <Head title={`Select Judges - ${pageant.pageant}`} />

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <div className="flex justify-between items-center">
                    <BackButton href={route("pageants.show", pageant.id)}>Back to Pageant</BackButton>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <UserGroupIcon className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Available Judges
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {judges.length} judges found in directory
                                </p>
                            </div>
                        </div>
                        
                        <PrimaryButton
                            onClick={submit}
                            disabled={processing}
                            className="flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            <CheckIcon className="w-4 h-4 stroke-[3]" />
                            Save Selection
                        </PrimaryButton>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {judges.map((judge) => (
                            <div 
                                key={judge.id} 
                                className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors cursor-pointer ${
                                    data.selectedJudges.includes(judge.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                                }`}
                                onClick={() => handleChecked(judge.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={data.selectedJudges.includes(judge.id)}
                                            onChange={() => handleChecked(judge.id)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(judge.name)}&background=random`}
                                            alt={judge.name}
                                            className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                        />
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                                {judge.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                judge@example.com
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {data.selectedJudges.includes(judge.id) && (
                                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                        <ShieldCheckIcon className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Selected</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {judges.length === 0 && (
                            <div className="p-12 text-center">
                                <UserIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No judges found in the directory.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
