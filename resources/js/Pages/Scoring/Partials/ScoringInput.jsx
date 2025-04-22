import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import { useState, useMemo, useCallback } from "react";

function ScoringInput({ criteria, candidate, onInputData = () => {} }) {
    const [value, setValue] = useState("");
    const minMax = useMemo(() => {
        const min = Math.round(criteria.percentage / 2);
        return { min, max: criteria.percentage };
    }, [criteria.percentage]);

    const handleChange = useCallback(
        (e) => {
            const raw = Number(e.target.value);
            setValue(raw);
            // Live update parent on every change
            onInputData(candidate.id, criteria.id, raw);
        },
        [candidate.id, criteria.id, onInputData]
    );

    const handleBlur = useCallback(
        (e) => {
            const raw = Number(e.target.value);
            const score = Math.max(minMax.min, Math.min(minMax.max, raw));
            setValue(score);
            // Ensure parent has the clamped score
            onInputData(candidate.id, criteria.id, score);
        },
        [candidate.id, criteria.id, minMax, onInputData]
    );

    return (
        <div className="w-full">
            <InputLabel
                value={criteria.name + " (" + criteria.percentage + ")"}
                htmlFor={`can` + candidate.id + `crit` + criteria.id}
            />
            <TextInput
                id={`can` + candidate.id + `crit` + criteria.id}
                type="number"
                name="scores[]"
                className="w-full"
                value={value}
                data-criteria-id={criteria.id}
                required
                min={minMax.min}
                max={minMax.max}
                onBlur={handleBlur}
                onChange={handleChange}
            />
        </div>
    );
}

export default ScoringInput;
