import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useReducer, useRef, useState } from "react";
import BackButton from "@/Components/BackButton";
import PageHeader from "@/Components/PageHeader";
import PrimaryButton from "@/Components/PrimaryButton";
import Alert from "@/Components/Alert";
import ImportModal from "@/Pages/Pageant/Partials/ImportModal";
import {
    ListBulletIcon,
    PlusIcon,
    PencilSquareIcon,
    ArrowUpTrayIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/Utils/cn";
import CriteriaList from "@/Pages/Pageant/Criterias/Partials/CriteriaList";
import CriteriaForm from "@/Pages/Pageant/Criterias/Partials/CriteriaForm";

function reducer(state, action) {
    switch (action.type) {
        case "start_editing": {
            return {
                ...state,
                editing: true,
                criteria: action.criteria,
            };
        }
        case "stop_editing": {
            return {
                ...state,
                editing: false,
                criteria: null,
            };
        }
    }
    throw Error("Unknown action: " + action.type);
}

// A round's criteria usually add up to 100%; a different total is flagged so it gets a second look.
function RoundTotals({ criterias }) {
    const totals = criterias.reduce((acc, criteria) => {
        acc[criteria.round] = (acc[criteria.round] ?? 0) + Number(criteria.percentage);
        return acc;
    }, {});
    const rounds = Object.keys(totals).sort((a, b) => a - b);

    if (rounds.length === 0) return null;

    return (
        <ul className="flex flex-wrap gap-2" aria-label="Percentage total per round">
            {rounds.map((round) => {
                const total = Math.round(totals[round] * 100) / 100;
                const complete = total === 100;
                return (
                    <li
                        key={round}
                        title={complete ? undefined : "Criteria in a round usually add up to 100%"}
                        className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border tabular-nums",
                            complete
                                ? "bg-green-50 text-green-800 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                : "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800"
                        )}
                    >
                        {!complete && <ExclamationTriangleIcon className="h-3 w-3" aria-hidden="true" />}
                        Round {round}: {total}%
                    </li>
                );
            })}
        </ul>
    );
}

function CriteriaIndex({ auth, pageant }) {
    const { flash } = usePage().props;
    const [importing, setImporting] = useState(false);
    const formRef = useRef(null);
    const [state, dispatch] = useReducer(reducer, {
        editing: false,
        criteria: null,
    });

    const handleEditMode = (criteria) => {
        dispatch({ type: "start_editing", criteria: criteria });
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleCancelEditMode = () => {
        dispatch({ type: "stop_editing" });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <PageHeader
                    icon={ListBulletIcon}
                    title="Manage Criteria"
                    subtitle={pageant.pageant}
                />
            }
        >
            <Head title={`Criteria - ${pageant.pageant}`} />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <div className="flex justify-between items-center">
                    <BackButton href={route("pageants.show", pageant.id)}>Back to Pageant</BackButton>
                    <PrimaryButton type="button" onClick={() => setImporting(true)} className="flex items-center gap-2">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Import
                    </PrimaryButton>
                </div>

                {flash.message && <Alert role="status">{flash.message}</Alert>}

                <ImportModal
                    show={importing}
                    onClose={() => setImporting(false)}
                    pageant={pageant}
                    type="criterias"
                    title="Import Criteria"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div ref={formRef} className="lg:col-span-4 lg:sticky lg:top-24">
                        <div className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800 overflow-hidden rounded-xl">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                    {state.editing ? (
                                        <PencilSquareIcon className="w-5 h-5 text-indigo-500" />
                                    ) : (
                                        <PlusIcon className="w-5 h-5 text-indigo-500" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {state.editing ? "Edit Criteria" : "Add Criteria"}
                                </h3>
                            </div>
                            <div className="p-6">
                                <CriteriaForm
                                    key={state.criteria?.id ?? "new"}
                                    pageant={pageant}
                                    criteria={state.criteria}
                                    onCancel={handleCancelEditMode}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800 overflow-hidden rounded-xl">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                        <ListBulletIcon className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Criteria List
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {pageant.criterias.length} criteria defined
                                        </p>
                                    </div>
                                </div>
                                <RoundTotals criterias={pageant.criterias} />
                            </div>
                            <div className="p-0">
                                <CriteriaList
                                    handleEditMode={handleEditMode}
                                    criterias={pageant.criterias}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default CriteriaIndex;
