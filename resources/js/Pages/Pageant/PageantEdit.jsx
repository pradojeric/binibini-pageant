import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { useMemo } from "react";
import { 
    TrophyIcon, 
    QueueListIcon, 
    PhotoIcon, 
    Squares2X2Icon,
    UserIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function PageantEdit({ auth, pageant }) {
    // Transform flat pageant_rounds from backend into the object format used by the form
    const initialPageantRounds = useMemo(() => {
        const rounds = { mr: [], ms: [] };
        pageant.pageant_rounds.forEach(pr => {
            if (rounds[pr.pageant_type]) {
                rounds[pr.pageant_type].push({
                    round: pr.round,
                    name: pr.round_name,
                    number_of_candidates: pr.number_of_candidates
                });
            }
        });
        return rounds;
    }, [pageant.pageant_rounds]);

    const { data, setData, post, processing, errors } = useForm({
        pageant: pageant.pageant,
        type: pageant.type,
        background: null,
        rounds: pageant.rounds,
        pageant_rounds: initialPageantRounds,
    });

    const types = [
        { id: "ms", value: "Ms." },
        { id: "mr", value: "Mr." },
        { id: "mr&ms", value: "Mr. & Ms." },
    ];

    const getSexes = (type) =>
        type === "mr&ms" ? ["mr", "ms"] : type ? [type] : [];

    const selectedSexes = useMemo(() => {
        if (!data.type) return [];
        return data.type === "mr&ms" ? ["mr", "ms"] : [data.type];
    }, [data.type]);

    const toInt = (v) => {
        if (v === "") return "";
        const n = parseInt(v, 10);
        return isNaN(n) || n < 1 ? 1 : n;
    };

    const scaffoldRounds = (roundsInt) =>
        Array.from({ length: roundsInt }, (_, i) => ({
            round: i + 1,
            name: "",
            number_of_candidates: 1,
        }));

    const handleRoundsChange = (e) => {
        const roundsInt = toInt(e.target.value);
        const scaffold = scaffoldRounds(roundsInt);
        const sexes = getSexes(data.type);

        const newPageantRounds = {};
        sexes.forEach((sex) => {
            const existing = data.pageant_rounds[sex] ?? [];
            const updated = [];

            for (let i = 0; i < roundsInt; i++) {
                updated.push(
                    existing[i]
                        ? { ...existing[i], round: i + 1 }
                        : { ...scaffold[i] }
                );
            }
            newPageantRounds[sex] = updated;
        });

        setData({
            ...data,
            rounds: roundsInt,
            pageant_rounds: newPageantRounds,
        });
    };

    const updateCandidateCount = (sex, idx, value) => {
        const candidateInt = toInt(value);
        setData("pageant_rounds", {
            ...data.pageant_rounds,
            [sex]: data.pageant_rounds[sex].map((row, i) =>
                i === idx ? { ...row, number_of_candidates: candidateInt } : row
            ),
        });
    };

    const updateRoundName = (sex, idx, value) => {
        setData("pageant_rounds", {
            ...data.pageant_rounds,
            [sex]: data.pageant_rounds[sex].map((row, i) =>
                i === idx ? { ...row, name: value } : row
            ),
        });
    };

    const submit = (e) => {
        e.preventDefault();
        // Since we are uploading file with potentially POST routing, 
        // Inertia handles this well with post() and Laravel's _method spoofing if needed.
        // But here we'll use a direct post to the update route as established.
        post(route("pageants.update", pageant.id), {
            forceFormData: true,
        });
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
                        Edit Pageant: {pageant.pageant}
                    </h2>
                </div>
            }
        >
            <Head title={`Edit ${pageant.pageant}`} />

            <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                <form onSubmit={submit} encType="multipart/form-data" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column: Basic Settings */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-6">
                                <div className="flex items-center gap-2 pb-4 border-b border-gray-50 dark:border-gray-700/50">
                                    <Squares2X2Icon className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h3>
                                </div>

                                <div>
                                    <InputLabel htmlFor="pageant" value="Pageant Name" className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2" />
                                    <TextInput
                                        id="pageant"
                                        type="text"
                                        name="pageant"
                                        value={data.pageant}
                                        placeholder="e.g. Binibining Lungsod 2024"
                                        className="block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                                        onChange={(e) => setData("pageant", e.target.value)}
                                    />
                                    <InputError message={errors.pageant} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="type" value="Pageant Type" className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2" />
                                    <SelectInput
                                        id="type"
                                        name="type"
                                        className="block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.type}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            const sexes = getSexes(newType);
                                            const scaffold = scaffoldRounds(data.rounds);
                                            const newPageantRounds = {};
                                            sexes.forEach((sex) => {
                                                newPageantRounds[sex] = data.pageant_rounds[sex] ?? scaffold;
                                            });
                                            setData({ ...data, type: newType, pageant_rounds: newPageantRounds });
                                        }}
                                    >
                                        <option hidden>Select type...</option>
                                        {types.map((type) => (
                                            <option value={type.id} key={type.id}>{type.value}</option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.type} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="background" value="Custom Background" className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2" />
                                    {pageant.background && !data.background && (
                                        <div className="mb-4 relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img src={`/storage/${pageant.background}`} className="w-full h-full object-cover" alt="Current background" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <p className="text-white text-xs font-bold uppercase tracking-widest">Current Background</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-xl hover:border-indigo-400 transition-colors group">
                                        <div className="space-y-1 text-center">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                <label htmlFor="background" className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none">
                                                    <span>Upload a new file</span>
                                                    <input
                                                        id="background"
                                                        name="background"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => setData("background", e.target.files[0])}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    </div>
                                    <InputError message={errors.background} className="mt-2" />
                                    {data.background && (
                                        <p className="mt-2 text-xs text-indigo-600 font-medium truncate">Selected: {data.background.name}</p>
                                    )}
                                </div>

                                <div>
                                    <InputLabel htmlFor="rounds" value="Number of Rounds" className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2" />
                                    <TextInput
                                        id="rounds"
                                        type="number"
                                        name="rounds"
                                        min={1}
                                        value={data.rounds}
                                        className="block w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                                        onChange={handleRoundsChange}
                                    />
                                    <InputError message={errors.rounds} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Commit Changes</p>
                                        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Update all pageant parameters.</p>
                                    </div>
                                </div>
                                <PrimaryButton className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95" disabled={processing}>
                                    Update Pageant
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Right Column: Rounds Configuration */}
                        <div className="lg:col-span-7 space-y-6">
                            {selectedSexes.length === 0 ? (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400">
                                    <QueueListIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Select a Pageant Type</p>
                                    <p className="text-sm max-w-xs mx-auto">Configuration for rounds and candidate counts will appear here once you select a type.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {selectedSexes.map((sex) => {
                                        const sexRounds = data.pageant_rounds[sex] || [];
                                        return (
                                            <div key={sex} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                <div className="px-8 py-6 bg-gray-50/50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${sex === 'mr' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                            {sex === "mr" ? "Male Division" : "Female Division"}
                                                        </h3>
                                                    </div>
                                                    <span className="text-xs font-black px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-400 uppercase tracking-widest">{sexRounds.length || data.rounds} Rounds</span>
                                                </div>

                                                <div className="p-4 overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-left">
                                                                <th className="px-4 py-3 text-xs uppercase tracking-widest font-black text-gray-400">#</th>
                                                                <th className="px-4 py-3 text-xs uppercase tracking-widest font-black text-gray-400">Round Name</th>
                                                                <th className="px-4 py-3 text-xs uppercase tracking-widest font-black text-gray-400 text-right">Candidates</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                                            {sexRounds.map((pr, index) => (
                                                                <tr key={`${sex}${pr.round}`} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                                                    <td className="px-4 py-4 font-black text-gray-300 dark:text-gray-600">
                                                                        {pr.round}
                                                                    </td>
                                                                    <td className="px-4 py-4">
                                                                        <TextInput
                                                                            type="text"
                                                                            value={pr.name}
                                                                            placeholder={`Enter round ${pr.round} name...`}
                                                                            className="w-full bg-transparent border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg py-1 transition-all"
                                                                            onChange={(e) => updateRoundName(sex, index, e.target.value)}
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right">
                                                                        <div className="flex items-center justify-end">
                                                                             <TextInput
                                                                                type="number"
                                                                                min={1}
                                                                                value={pr.number_of_candidates}
                                                                                className="w-20 text-right bg-gray-50 dark:bg-gray-700/30 border-none focus:ring-2 focus:ring-indigo-500 rounded-lg py-1 font-bold"
                                                                                onChange={(e) => updateCandidateCount(sex, index, e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
