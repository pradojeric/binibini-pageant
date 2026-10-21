import { cn } from "@/Utils/cn";
import { PRIMARY_BUTTON_CLASSES } from "@/Components/styles";

export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={cn(
                PRIMARY_BUTTON_CLASSES,
                disabled && 'opacity-50 cursor-not-allowed',
                !disabled && 'active:scale-95',
                className
            )}
            disabled={disabled}
            >
            {children}
        </button>
    );
}

