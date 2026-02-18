import { cn } from "@/Utils/cn";

export default function Chip({ 
    variant = "filled", 
    color = "blue-gray", 
    value, 
    children, 
    className, 
    ...props 
}) {
    // Map colors to Tailwind classes
    const colorClasses = {
        "blue-gray": {
            filled: "bg-gray-500 text-white",
            gradient: "bg-gradient-to-tr from-gray-600 to-gray-400 text-white shadow-gray-500/20",
            outlined: "border border-gray-500 text-gray-500",
            ghost: "text-gray-500 bg-gray-500/10",
        },
        gray: {
            filled: "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
            gradient: "bg-gradient-to-tr from-gray-900 to-gray-800 text-white shadow-gray-900/20",
            outlined: "border border-gray-900 text-gray-900 dark:border-white dark:text-white",
            ghost: "text-gray-900 bg-gray-900/10 dark:text-white dark:bg-white/10",
        },
        blue: {
            filled: "bg-blue-500 text-white",
            gradient: "bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/20",
            outlined: "border border-blue-500 text-blue-500",
            ghost: "text-blue-500 bg-blue-500/10",
        },
        indigo: {
            filled: "bg-indigo-500 text-white",
            gradient: "bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-indigo-500/20",
            outlined: "border border-indigo-500 text-indigo-500",
            ghost: "text-indigo-500 bg-indigo-500/10",
        },
        purple: {
            filled: "bg-purple-500 text-white",
            gradient: "bg-gradient-to-tr from-purple-600 to-purple-400 text-white shadow-purple-500/20",
            outlined: "border border-purple-500 text-purple-500",
            ghost: "text-purple-500 bg-purple-500/10",
        },
        green: {
            filled: "bg-green-500 text-white",
            gradient: "bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/20",
            outlined: "border border-green-500 text-green-500",
            ghost: "text-green-500 bg-green-500/10",
        },
        red: {
            filled: "bg-red-500 text-white",
            gradient: "bg-gradient-to-tr from-red-600 to-red-400 text-white shadow-red-500/20",
            outlined: "border border-red-500 text-red-500",
            ghost: "text-red-500 bg-red-500/10",
        },
        amber: {
            filled: "bg-amber-500 text-white",
            gradient: "bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-amber-500/20",
            outlined: "border border-amber-500 text-amber-500",
            ghost: "text-amber-500 bg-amber-500/10",
        },
        orange: {
            filled: "bg-orange-500 text-white",
            gradient: "bg-gradient-to-tr from-orange-600 to-orange-400 text-white shadow-orange-500/20",
            outlined: "border border-orange-500 text-orange-500",
            ghost: "text-orange-500 bg-orange-500/10",
        },
    };
    
    // Default to blue-gray if color not found
    const selectedColor = colorClasses[color] || colorClasses["blue-gray"];
    // Default to filled if variant not found
    const variantClass = selectedColor[variant] || selectedColor.filled;
    
    // Shadow for gradient variant
    const shadowClass = variant === "gradient" ? "shadow-md" : "";

    return (
        <span
            className={cn(
                "relative inline-flex items-center justify-center px-4 py-1 text-xs font-bold uppercase tracking-wide rounded-lg select-none whitespace-nowrap align-baseline transition-all",
                variantClass,
                shadowClass,
                className
            )}
            {...props}
        >
            {value || children}
        </span>
    );
}
