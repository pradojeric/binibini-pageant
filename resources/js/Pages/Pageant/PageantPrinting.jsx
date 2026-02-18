import PrimaryButton from "@/Components/PrimaryButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ComponentToPrint from "@/Pages/Pageant/Partials/ComponentToPrint";
import { Listbox, Transition } from "@headlessui/react";
import { Head, Link } from "@inertiajs/react";
import {
    useState,
    useRef,
    useCallback,
    useEffect,
    Fragment,
} from "react";
import ReactToPrint from "react-to-print";
import {
    PrinterIcon,
    DocumentTextIcon,
    ChevronUpDownIcon,
    CheckIcon,
    ArrowLeftIcon
} from "@heroicons/react/24/outline";

export default function PageantPrinting({
    auth,
    pageant,
    maleCandidates = [],
    femaleCandidates = [],
    criterias = [],
    judges = [],
}) {
    const componentRef = useRef(null);
    const [selected, setSelected] = useState(criterias[0]);
    const [filteredMaleCandidates, setFilteredMaleCandidates] = useState([]);
    const [filteredFemaleCandidates, setFilteredFemaleCandidates] = useState([]);

    const filterCandidates = useCallback((candidates, criteria) => {
        if (!criteria || !criteria.round) return candidates;
        
        // If it's a "Grand Total" or "Subtotal" that doesn't map to a specific round logic, 
        // or if it's the very first round/preliminary where everyone is included:
        // Adjust this logic if you have specific "preliminary" flags.
        // For now, checks if the candidate has the round in their qualified rounds.
        
        return candidates.filter(candidate => {
             // If candidate has no pageant_rounds data (e.g. legacy), assume they are in.
             // Or strict mode: if (candidate.pageant_rounds && candidate.pageant_rounds.length > 0) ...
             
             // If the criteria belongs to a round, check if candidate is qualified for it
             // We use 'round' (int) from criteria and compare with pageant_rounds.round
             
             // Edge case: Round 1 usually includes everyone. 
             if (criteria.round === 1) return true;

             return candidate.pageant_rounds?.some(r => r.round === criteria.round);
        });
    }, []);

    useEffect(() => {
        setFilteredMaleCandidates(filterCandidates(maleCandidates, selected));
        setFilteredFemaleCandidates(filterCandidates(femaleCandidates, selected));
    }, [selected, maleCandidates, femaleCandidates, filterCandidates]);


    const reactToPrintContent = useCallback(() => {
        return componentRef.current;
    }, [componentRef.current]);

    const reactToPrintTrigger = useCallback(() => {
        return (
            <PrimaryButton className="flex items-center gap-2">
                <PrinterIcon className="w-5 h-5" />
                Print Sheet
            </PrimaryButton>
        );
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "finished": return "bg-green-100 text-green-800 border-green-200";
            case "ongoing": return "bg-amber-100 text-amber-800 border-amber-200";
            case "not started": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('pageants.show', pageant.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                         <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                         <PrinterIcon className="w-6 h-6" />
                    </div>
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                        Printing Center
                    </h2>
                </div>
            }
        >
            <Head title={`Printing - ${pageant.pageant}`} />

            <div className="space-y-8 pb-12">
                {/* Hero / Overview Section */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700">
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
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(pageant.status)}`}>
                                    {pageant.status}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/30 text-white bg-white/10">
                                    {pageant.type}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                                {pageant.pageant}
                            </h1>
                            <p className="text-gray-200 mt-2 font-medium">
                                Generate and print official score sheets and results
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <DocumentTextIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Configuration
                                </h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Score Sheet / Result
                                    </label>
                                    <Listbox value={selected} onChange={setSelected}>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 sm:text-sm shadow-sm">
                                                <span className="block truncate text-gray-900 dark:text-white font-medium">
                                                    {!selected?.is_grand_total
                                                        ? `${selected?.round_name} - ${selected?.name}`
                                                        : `${selected?.round_name}`}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronUpDownIcon
                                                        className="h-5 w-5 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                                                    {criterias.map((criteria, idx) => (
                                                        <Listbox.Option
                                                            key={idx}
                                                            className={({ active }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                    active ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'
                                                                }`
                                                            }
                                                            value={criteria}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                        {!criteria.is_grand_total
                                                                            ? `${criteria.round_name} - ${criteria.name}`
                                                                            : `${criteria.round_name}`}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <ReactToPrint
                                        content={reactToPrintContent}
                                        documentTitle={`${pageant.pageant} - ${selected?.name || 'Results'}`}
                                        removeAfterPrint
                                        trigger={reactToPrintTrigger}
                                    />
                                    <p className="text-xs text-center text-gray-500 mt-3">
                                        Click to open print dialog. Ensure layout is set to Portrait/Landscape as needed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-2">
                         <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-t-lg border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Preview</span>
                                <div className="flex x-gap-2">
                                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                     <div className="w-3 h-3 rounded-full bg-amber-400 ml-2"></div>
                                     <div className="w-3 h-3 rounded-full bg-green-400 ml-2"></div>
                                </div>
                            </div>
                            <div className="p-8 overflow-x-auto min-h-[500px] flex justify-center bg-white dark:bg-gray-800 rounded-b-lg">
                                 {/* Wrapper for scaling/centering if needed */}
                                <div className="w-full max-w-[210mm] border border-gray-200 dark:border-gray-700 shadow-lg bg-white">
                                    <ComponentToPrint
                                        ref={componentRef}
                                        pageant={pageant}
                                        maleCandidates={filteredMaleCandidates}
                                        femaleCandidates={filteredFemaleCandidates}
                                        criterias={criterias} // Passing all criterias might be needed by internal logic? Usually singular 'criteria' is what varies
                                        criteria={selected} // Pass the selected criteria for the header/context
                                        judges={judges}
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

// export default forwardRef(PageantPrinting, ref);
