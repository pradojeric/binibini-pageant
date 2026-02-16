import { cn } from "@/Utils/cn";

export default function SecondaryButton({ type = 'button', className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            type={type}
            className={cn(
                "inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-25 transition-all duration-200 ease-in-out",
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
