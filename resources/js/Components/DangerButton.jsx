import { cn } from "@/Utils/cn";

export default function DangerButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={cn(
                "inline-flex items-center px-5 py-2.5 bg-red-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out shadow-sm hover:shadow-red-500/30",
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
