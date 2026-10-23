import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useReducer } from "react";
import SecondaryButton from "@/Components/SecondaryButton";
import {
    ListBulletIcon,
    ArrowLeftIcon,
    PlusIcon,
    PencilSquareIcon
} from "@heroicons/react/24/outline";
import CriteriaList from "@/Pages/Pageant/Criterias/Partials/CriteriaList";
import CriteriaCreate from "@/Pages/Pageant/Criterias/Partials/CriteriaCreate";
import CriteriaEdit from "@/Pages/Pageant/Criterias/Partials/CriteriaEdit";

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

function CriteriaIndex({ auth, pageant }) {
    const [state, dispatch] = useReducer(reducer, {
        editing: false,
        criteria: null,
    });

    const handleEditMode = (criteria) => {
        dispatch({ type: "start_editing", criteria: criteria });
    };

    const handleCancelEditMode = () => {
        dispatch({ type: "stop_editing" });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <ListBulletIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                            Manage Criteria
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {pageant.pageant}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Criteria - ${pageant.pageant}`} />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <div className="flex justify-between items-center">
                    <Link href={route("pageants.show", pageant.id)}>
                        <SecondaryButton className="flex items-center gap-2 lowercase py-2">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back to Pageant
                        </SecondaryButton>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 sticky top-24">
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
                                {!state.editing ? (
                                    <CriteriaCreate pageant={pageant} />
                                ) : (
                                    <CriteriaEdit
                                        criteria={state.criteria}
                                        handleCancelEditMode={handleCancelEditMode}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800 overflow-hidden rounded-xl">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                        <ListBulletIcon className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Criteria List
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {pageant.criterias.length} criteria defined
                                        </p>
                                    </div>
                                </div>
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
