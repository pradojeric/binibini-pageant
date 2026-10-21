import { cn } from "@/Utils/cn";
import { SECONDARY_BUTTON_CLASSES } from "@/Components/styles";

export default function SecondaryButton({ type = 'button', className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            type={type}
            className={cn(
                SECONDARY_BUTTON_CLASSES,
                disabled && 'opacity-25 cursor-not-allowed',
                !disabled && 'active:scale-95',
                className
            )}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
