import PrimaryButton from "@/Components/PrimaryButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ComponentToPrint from "@/Pages/Pageant/Partials/ComponentToPrint";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Head } from "@inertiajs/react";
import {
    useState,
    forwardRef,
    useRef,
    useCallback,
    useEffect,
    Fragment,
} from "react";
import ReactToPrint from "react-to-print";

export default function PageantPrinting({
    auth,
    pageant,
    maleCandidates = [],
    femaleCandidates = [],
    criterias = [],
    judges = [],
}) {
    const componentRef = useRef(null);
    const onBeforeGetContentResolve = useRef(null);

    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("old boring text");
    const [selected, setSelected] = useState(criterias[0]);

    const handleAfterPrint = useCallback(() => {
        console.log("`onAfterPrint` called");
    }, []);

    const handleBeforePrint = useCallback(() => {
        console.log("`onBeforePrint` called");
    }, []);

    const handleOnBeforeGetContent = useCallback(() => {
        console.log("`onBeforeGetContent` called");
        setLoading(true);
        setText("Loading new text...");

        return new Promise((resolve) => {
            onBeforeGetContentResolve.current = resolve;

            setTimeout(() => {
                setLoading(false);
                setText("New, Updated Text!");
                resolve();
            }, 2000);
        });
    }, [setLoading, setText]);

    useEffect(() => {
        if (
            text === "New, Updated Text!" &&
            typeof onBeforeGetContentResolve.current === "function"
        ) {
            onBeforeGetContentResolve.current();
        }
    }, [onBeforeGetContentResolve.current, text]);
    const reactToPrintContent = useCallback(() => {
        return componentRef.current;
    }, [componentRef.current]);

    const reactToPrintTrigger = useCallback(() => {
        // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
        // to the root node of the returned component as it will be overwritten.

        // Bad: the `onClick` here will be overwritten by `react-to-print`
        // return <button onClick={() => alert('This will not work')}>Print this out!</button>;

        // Good
        return (
            <div className="text-right p-5">
                <PrimaryButton>Print</PrimaryButton>
            </div>
        );
    }, []);

    return (
        <>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {pageant.pageant} Scores
                    </h2>
                }
            >
                <Head title="Pageant Summary" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <ReactToPrint
                                content={reactToPrintContent}
                                documentTitle={pageant.pageant}
                                onAfterPrint={handleAfterPrint}
                                onBeforeGetContent={handleOnBeforeGetContent}
                                onBeforePrint={handleBeforePrint}
                                removeAfterPrint
                                trigger={reactToPrintTrigger}
                            />
                            {loading && (
                                <p className="px-2 py-1 rounded bg-green-500 text-white mx-3">
                                    Loading...
                                </p>
                            )}
                            <div className="px-6">
                                <Listbox
                                    value={selected}
                                    onChange={setSelected}
                                    name="Criteria"
                                >
                                    <Listbox.Label className="dark:text-white uppercase">
                                        Criteria:
                                    </Listbox.Label>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                            <span className="block truncate">
                                                {selected.id
                                                    ? `Round ${selected.round} - ${selected.name}`
                                                    : "Grand Total"}
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
                                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                {criterias.map(
                                                    (criteria, roundId) => (
                                                        <Listbox.Option
                                                            key={roundId}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                    active
                                                                        ? "bg-amber-100 text-amber-900"
                                                                        : "text-gray-900"
                                                                }`
                                                            }
                                                            value={criteria}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${
                                                                            selected
                                                                                ? "font-medium"
                                                                                : "font-normal"
                                                                        }`}
                                                                    >
                                                                        {`Round ${criteria.round} - ${criteria.name}`}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                                            <CheckIcon
                                                                                className="h-5 w-5"
                                                                                aria-hidden="true"
                                                                            />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    )
                                                )}
                                                <Listbox.Option
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                            active
                                                                ? "bg-amber-100 text-amber-900"
                                                                : "text-gray-900"
                                                        }`
                                                    }
                                                    value=""
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${
                                                                    selected
                                                                        ? "font-medium"
                                                                        : "font-normal"
                                                                }`}
                                                            >
                                                                Grand Total
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                                    <CheckIcon
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>

                            <ComponentToPrint
                                ref={componentRef}
                                pageant={pageant}
                                maleCandidates={maleCandidates}
                                femaleCandidates={femaleCandidates}
                                criterias={criterias}
                                criteria={selected}
                                judges={judges}
                            />
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}

// export default forwardRef(PageantPrinting, ref);
