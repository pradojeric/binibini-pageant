import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CriteriaIndex from "@/Pages/Pageant/Criterias/Partials/CriteriaList";
import CriteriaCreate from "@/Pages/Pageant/Criterias/Partials/CriteriaCreate";
import CriteriaEdit from "@/Pages/Pageant/Criterias/Partials/CriteriaEdit";
import { useReducer } from "react";
import { Transition } from "@headlessui/react";
import PrimaryButton from "@/Components/PrimaryButton";
import CandidateCreate from "@/Pages/Pageant/Candidates/Partials/CandidateCreate";
import CandidateList from "@/Pages/Pageant/Candidates/Partials/CandidateList";
import CandidateEdit from "@/Pages/Pageant/Candidates/Partials/CandidateEdit";

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
    const [state, dispatch] = useReducer(reducer, {
        editing: false,
        candidate: null,
    });

    const handleEditMode = (candidate) => {
        dispatch({ type: "start_editing", candidate: candidate });
    };

    const handleCancelEditMode = () => {
        dispatch({ type: "stop_editing" });
    };

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
                            <Link href={route("pageants.show", pageant.id)}>
                                <PrimaryButton>Back</PrimaryButton>
                            </Link>
                            <div className="grid grid-cols-3 gap-4 mt-5">
                                <div>
                                    {!state.editing ? (
                                        <CandidateCreate pageant={pageant} />
                                    ) : (
                                        <CandidateEdit
                                            candidate={state.candidate}
                                            handleCancelEditMode={
                                                handleCancelEditMode
                                            }
                                        />
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <CandidateList
                                        handleEditMode={handleEditMode}
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

export default CandidateIndex;
