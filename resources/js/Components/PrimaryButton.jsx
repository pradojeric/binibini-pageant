import { cn } from "@/Utils/cn";

export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={cn(
                "inline-flex items-center px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-400 focus:bg-indigo-700 dark:focus:bg-indigo-600 active:bg-indigo-900 dark:active:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out shadow-sm hover:shadow-indigo-500/30",
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

