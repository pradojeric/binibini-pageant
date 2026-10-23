import InputLabel from "@/Components/InputLabel";
import Image from "@/Components/Image";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import Checkbox from "@/Components/Checkbox";
import PrimaryButton from "@/Components/PrimaryButton";
import { cn } from "@/Utils/cn";
import { DIVISION_KEYS, divisionOf } from "@/Utils/divisions";
import {
    QueueListIcon,
    PhotoIcon,
    Squares2X2Icon,
    UserIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";

export const MAX_ROUNDS = 20;

const LABEL_CLASSES = "text-xs uppercase tracking-widest font-bold text-gray-600 dark:text-gray-300 mb-2";
const TH_CLASSES = "px-4 py-3 text-xs uppercase tracking-widest font-black text-gray-500 dark:text-gray-400";

const scaffoldRounds = (count) =>
    Array.from({ length: count }, (_, i) => ({
        round: i + 1,
        name: "",
        number_of_candidates: 1,
    }));

// Keeps "" while the field is being cleared; otherwise clamps to [1, max].
const toInt = (value, max = Infinity) => {
    if (value === "") return "";
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) return 1;
    return Math.min(n, max);
};

/**
 * Shape the form data from a pageant (edit) or from nothing (create).
 */
export function initialPageantForm(pageant = null) {
    const pageantRounds = {};
    (pageant?.pageant_rounds ?? [])
        .slice()
        .sort((a, b) => a.round - b.round)
        .forEach((pr) => {
            (pageantRounds[pr.pageant_type] ??= []).push({
                round: pr.round,
                name: pr.round_name,
                number_of_candidates: pr.number_of_candidates,
            });
        });

    return {
        pageant: pageant?.pageant ?? "",
        divisions: pageant?.divisions ?? [],
        background: null,
        rounds: pageant?.rounds ?? 1,
        pageant_rounds: pageantRounds,
    };
}

export default function PageantForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    currentBackground = null,
    submitLabel,
    processingLabel,
    footerTitle,
    footerHint,
}) {
    const selectedDivisions = DIVISION_KEYS.filter((key) => data.divisions.includes(key));

    const toggleDivision = (key, checked) => {
        const divisions = checked
            ? [...data.divisions, key]
            : data.divisions.filter((d) => d !== key);

        // Unchecking keeps that division's rows so re-checking restores what was typed.
        const pageantRounds = { ...data.pageant_rounds };
        if (checked && !pageantRounds[key]) {
            pageantRounds[key] = scaffoldRounds(data.rounds || 1);
        }

        setData({ ...data, divisions, pageant_rounds: pageantRounds });
    };

    const handleRoundsChange = (e) => {
        const rounds = toInt(e.target.value, MAX_ROUNDS);
        if (rounds === "") {
            setData("rounds", "");
            return;
        }

        const pageantRounds = {};
        Object.entries(data.pageant_rounds).forEach(([key, existing]) => {
            pageantRounds[key] = scaffoldRounds(rounds).map((blank, i) =>
                existing[i] ? { ...existing[i], round: i + 1 } : blank
            );
        });
        selectedDivisions.forEach((key) => {
            pageantRounds[key] ??= scaffoldRounds(rounds);
        });

        setData({ ...data, rounds, pageant_rounds: pageantRounds });
    };

    const updateRow = (key, idx, changes) => {
        setData("pageant_rounds", {
            ...data.pageant_rounds,
            [key]: data.pageant_rounds[key].map((row, i) =>
                i === idx ? { ...row, ...changes } : row
            ),
        });
    };

    return (
        <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Basic Settings */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                            <Squares2X2Icon className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h3>
                        </div>

                        <div>
                            <InputLabel htmlFor="pageant" value="Pageant Name" className={LABEL_CLASSES} />
                            <TextInput
                                id="pageant"
                                type="text"
                                name="pageant"
                                value={data.pageant}
                                required
                                aria-invalid={!!errors.pageant}
                                placeholder="e.g. Binibining Lungsod 2024"
                                className="block w-full rounded-xl"
                                onChange={(e) => setData("pageant", e.target.value)}
                            />
                            <InputError message={errors.pageant} className="mt-2" />
                        </div>

                        <fieldset aria-describedby="divisions-hint">
                            <legend className={LABEL_CLASSES}>Divisions</legend>
                            <p id="divisions-hint" className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Pick one or more. Each division gets its own rounds and candidate slots.
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {DIVISION_KEYS.map((key) => {
                                    const division = divisionOf(key);
                                    const checked = data.divisions.includes(key);
                                    return (
                                        <label
                                            key={key}
                                            className={cn(
                                                "flex items-center gap-2 min-h-[44px] px-3 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800",
                                                checked
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                            )}
                                        >
                                            <Checkbox
                                                name="divisions[]"
                                                value={key}
                                                checked={checked}
                                                onChange={(e) => toggleDivision(key, e.target.checked)}
                                            />
                                            <span className={cn("w-2 h-2 rounded-full shrink-0", division.bar)} aria-hidden="true" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{division.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <InputError message={errors.divisions ?? errors["divisions.0"]} className="mt-2" />
                        </fieldset>

                        <div>
                            <InputLabel htmlFor="background" value="Custom Background" className={LABEL_CLASSES} />
                            {currentBackground && !data.background && (
                                <Image
                                    src={`/storage/${currentBackground}`}
                                    className="mb-4 w-full h-32 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                                    alt="Current background"
                                />
                            )}
                            <label
                                htmlFor="background"
                                className="flex flex-col items-center gap-1 px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-xl cursor-pointer hover:border-indigo-400 transition-colors group focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800"
                            >
                                <PhotoIcon className="h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" aria-hidden="true" />
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                    {currentBackground ? "Choose a new image" : "Choose an image"}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">PNG, JPG, GIF or WebP, up to 10MB</span>
                                <input
                                    id="background"
                                    name="background"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => setData("background", e.target.files[0] ?? null)}
                                />
                            </label>
                            <InputError message={errors.background} className="mt-2" />
                            {data.background && (
                                <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                                    Selected: {data.background.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="rounds" value="Number of Rounds" className={LABEL_CLASSES} />
                            <TextInput
                                id="rounds"
                                type="number"
                                name="rounds"
                                min={1}
                                max={MAX_ROUNDS}
                                required
                                aria-invalid={!!errors.rounds}
                                value={data.rounds}
                                className="block w-full rounded-xl"
                                onChange={handleRoundsChange}
                            />
                            <InputError message={errors.rounds} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{footerTitle}</p>
                                <p className="text-xs text-indigo-800 dark:text-indigo-300">{footerHint}</p>
                            </div>
                        </div>
                        <PrimaryButton type="submit" className="justify-center px-8 py-3 rounded-xl" disabled={processing}>
                            {processing ? processingLabel : submitLabel}
                        </PrimaryButton>
                    </div>
                </div>

                {/* Right Column: Rounds Configuration */}
                <div className="lg:col-span-7 space-y-6">
                    {selectedDivisions.length === 0 ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center text-gray-600 dark:text-gray-400">
                            <QueueListIcon className="w-16 h-16 mb-4 opacity-20" aria-hidden="true" />
                            <p className="text-lg font-medium">Select at least one division</p>
                            <p className="text-sm max-w-xs mx-auto">Rounds and candidate counts for each division will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {selectedDivisions.map((key) => (
                                <DivisionRoundsCard
                                    key={key}
                                    division={divisionOf(key)}
                                    rows={data.pageant_rounds[key] ?? []}
                                    errors={errors}
                                    onChange={(idx, changes) => updateRow(key, idx, changes)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}

function DivisionRoundsCard({ division, rows, errors, onChange }) {
    const errorFor = (index, field) => errors[`pageant_rounds.${division.key}.${index}.${field}`];

    return (
        <section
            aria-labelledby={`division-${division.key}`}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
            <div className="px-6 sm:px-8 py-6 bg-gray-50/50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", division.chip)}>
                        <UserIcon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 id={`division-${division.key}`} className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                        {division.label} Division
                    </h3>
                </div>
                <span className="text-xs font-black px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                    {rows.length} {rows.length === 1 ? "Round" : "Rounds"}
                </span>
            </div>

            <InputError message={errors[`pageant_rounds.${division.key}`]} className="px-8 pt-4" />

            <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th scope="col" className={TH_CLASSES}>#</th>
                            <th scope="col" className={TH_CLASSES}>Round Name</th>
                            <th scope="col" className={cn(TH_CLASSES, "text-right")}>Candidates</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {rows.map((pr, index) => (
                            <tr key={`${division.key}${pr.round}`} className="align-top">
                                <td className="px-4 py-4 font-black text-gray-500 dark:text-gray-400 tabular-nums">
                                    {pr.round}
                                </td>
                                <td className="px-4 py-4">
                                    <TextInput
                                        type="text"
                                        value={pr.name}
                                        required
                                        aria-label={`${division.label} round ${pr.round} name`}
                                        aria-invalid={!!errorFor(index, "name")}
                                        placeholder={`Round ${pr.round} name, e.g. Swimwear`}
                                        className="w-full py-2"
                                        onChange={(e) => onChange(index, { name: e.target.value })}
                                    />
                                    <InputError message={errorFor(index, "name")} className="mt-1" />
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <TextInput
                                        type="number"
                                        min={1}
                                        required
                                        aria-label={`${division.label} round ${pr.round} number of candidates`}
                                        aria-invalid={!!errorFor(index, "number_of_candidates")}
                                        value={pr.number_of_candidates}
                                        className="w-24 py-2 text-right font-bold tabular-nums"
                                        onChange={(e) => onChange(index, { number_of_candidates: toInt(e.target.value) })}
                                    />
                                    <InputError message={errorFor(index, "number_of_candidates")} className="mt-1" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
