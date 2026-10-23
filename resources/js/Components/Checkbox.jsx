import { cn } from "@/Utils/cn";

export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={cn(
                "rounded border-gray-300 dark:border-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-900 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out cursor-pointer hover:border-indigo-500",
                className
            )}
        />
    );
}
