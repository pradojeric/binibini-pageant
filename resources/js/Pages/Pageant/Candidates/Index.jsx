import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useReducer, useRef, useState } from "react";
import Breadcrumbs from "@/Components/Breadcrumbs";
import PageHeader from "@/Components/PageHeader";
import PrimaryButton from "@/Components/PrimaryButton";
import Alert from "@/Components/Alert";
import ImportModal from "@/Pages/Pageant/Partials/ImportModal";
import { 
    UserGroupIcon, 
    PlusIcon,
    PencilSquareIcon,
    ArrowUpTrayIcon
} from "@heroicons/react/24/outline";
import CandidateList from "@/Pages/Pageant/Candidates/Partials/CandidateList";
import CandidateForm from "@/Pages/Pageant/Candidates/Partials/CandidateForm";

function reducer(state, action) {
    switch (action.type) {
        case "start_editing": {
            return {
                ...state,
                editing: true,
                candidate: action.candidate,
            };
        }
        case "stop_editing": {
            return {
                ...state,
                editing: false,
                candidate: null,
            };
        }
    }
    throw Error("Unknown action: " + action.type);
}

function CandidateIndex({ auth, pageant }) {
    const { flash } = usePage().props;
    const [importing, setImporting] = useState(false);
    const formRef = useRef(null);
    const [state, dispatch] = useReducer(reducer, {
        editing: false,
        candidate: null,
    });

    const handleEditMode = (candidate) => {
        dispatch({ type: "start_editing", candidate: candidate });
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
                    icon={UserGroupIcon}
                    title="Manage Candidates"
                    subtitle={pageant.pageant}
                />
            }
        >
            <Head title={`Candidates - ${pageant.pageant}`} />

            <div className="space-y-6 pb-12">
                <div className="flex justify-between items-center">
                    <Breadcrumbs items={[{ label: "Pageants", href: route("pageants.index") }, { label: pageant.pageant, href: route("pageants.show", pageant.id) }, { label: "Candidates" }]} />
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
                    type="candidates"
                    title="Import Candidates"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div ref={formRef} className="lg:col-span-4 lg:sticky lg:top-24">
                        {/* The form is taller than a laptop viewport; scrolling inside the card keeps its submit button reachable while pinned. */}
                        <div className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800 overflow-hidden lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-xl">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                    {state.editing ? (
                                        <PencilSquareIcon className="w-5 h-5 text-indigo-500" />
                                    ) : (
                                        <PlusIcon className="w-5 h-5 text-indigo-500" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {state.editing ? "Edit Candidate" : "Add Candidate"}
                                </h3>
                            </div>
                            <div className="p-6">
                                <CandidateForm
                                    key={state.candidate?.id ?? "new"}
                                    pageant={pageant}
                                    candidate={state.candidate}
                                    onCancel={handleCancelEditMode}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800 overflow-hidden rounded-xl">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                        <UserGroupIcon className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Candidate Directory
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {pageant.candidates.length} candidates registered
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-0">
                                <CandidateList
                                    handleEditMode={handleEditMode}
                                    candidates={pageant.candidates}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default CandidateIndex;
