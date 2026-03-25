import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import { useState, useMemo, useCallback } from "react";

function ScoringInput({ criteria, candidate, onInputData = () => {}, initialValue = "", isAdmin = false }) {
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
            if (raw !== "" && !isNaN(num) && num > 0) {
                onInputData(candidate.id, criteria.id, num);
            }
        },
        [candidate.id, criteria.id, onInputData]
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
                    className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 group-focus-within/input:text-blue-500 transition-colors"
                    value={criteria.name}
                />
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                    Max: {criteria.percentage}
                </span>
            </div>
            
            <div className="relative">
                <TextInput
                    id={`can` + candidate.id + `crit` + criteria.id}
                    type="number"
                    name="scores[]"
                    className="block w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-blue-500/20 focus:border-blue-500 rounded-2xl text-lg font-bold transition-all pr-10"
                    value={value}
                    data-criteria-id={criteria.id}
                    required
                    min={minMax.min}
                    max={minMax.max}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-300 dark:text-gray-600 font-bold text-sm">%</span>
                </div>
            </div>
        </div>
    );
}

export default ScoringInput;
