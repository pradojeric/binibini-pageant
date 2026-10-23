import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import { useState, useMemo, useCallback } from "react";

function ScoringInput({ criteria, candidate, onInputData = () => {}, initialValue = "", isAdmin = false, missing = false }) {
    const [value, setValue] = useState(initialValue);
    const minMax = useMemo(() => {
        const min = isAdmin ? 0 : Math.round(criteria.percentage / 2);
        return { min, max: criteria.percentage };
    }, [criteria.percentage, isAdmin]);

    const handleChange = useCallback(
        (e) => {
            const raw = e.target.value;
            setValue(raw);
            const num = Number(raw);
            // Enter submits without a blur, so only an in-range value may be recorded here;
            // anything else (cleared, half-typed, out of range) counts as missing until blur clamps it.
            const valid = raw !== "" && !isNaN(num) && num >= minMax.min && num <= minMax.max;
            onInputData(candidate.id, criteria.id, valid ? num : null);
        },
        [candidate.id, criteria.id, minMax, onInputData]
    );

    const handleBlur = useCallback(
        (e) => {
            const raw = e.target.value;
            if (raw === "") return;
            const num = Number(raw);
            const score = Math.max(minMax.min, Math.min(minMax.max, num));
            setValue(score);
            onInputData(candidate.id, criteria.id, score);
        },
        [candidate.id, criteria.id, minMax, onInputData]
    );

    return (
        <div className="relative group/input">
            <div className="flex justify-between items-center mb-1.5 px-0.5">
                <InputLabel 
                    htmlFor={`can` + candidate.id + `crit` + criteria.id}
                    className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-indigo-400 transition-colors"
                    value={criteria.name}
                />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    {minMax.min}–{minMax.max} pts
                </span>
            </div>
            
            <div className="relative">
                <TextInput
                    id={`can` + candidate.id + `crit` + criteria.id}
                    type="number"
                    name="scores[]"
                    className={`block w-full bg-white dark:bg-gray-800 rounded-2xl text-lg font-bold tabular-nums transition-colors pr-12 ${
                        missing ? "border-red-500 ring-2 ring-red-500/30" : "border-gray-200 dark:border-gray-700"
                    }`}
                    value={value}
                    data-criteria-id={criteria.id}
                    required
                    min={minMax.min}
                    max={minMax.max}
                    step="any"
                    inputMode="decimal"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder={`${minMax.min}–${minMax.max}`}
                    aria-invalid={missing || undefined}
                    aria-describedby={missing ? `can${candidate.id}crit${criteria.id}-error` : undefined}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">pts</span>
                </div>
            </div>
            {missing && (
                <p id={`can${candidate.id}crit${criteria.id}-error`} className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                    Enter a score from {minMax.min} to {minMax.max}.
                </p>
            )}
        </div>
    );
}

export default ScoringInput;
