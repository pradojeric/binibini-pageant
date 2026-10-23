import { cloneElement } from "react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";

// Label, optional hint, control and error, with the control wired to the hint and error for screen readers.
export default function FormField({ id, label, required = false, hint, error, className = "", children }) {
    const hintId = hint ? `${id}-hint` : null;
    const errorId = error ? `${id}-error` : null;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
        <div className={className}>
            <InputLabel htmlFor={id} required={required}>
                {label}
            </InputLabel>
            {hint && (
                <p id={hintId} className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {hint}
                </p>
            )}
            {cloneElement(children, {
                id,
                "aria-describedby": describedBy,
                "aria-invalid": error ? true : undefined,
                "aria-required": required || undefined,
            })}
            <InputError id={errorId ?? undefined} message={error} className="mt-2" />
        </div>
    );
}
