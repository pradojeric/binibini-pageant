import { cn } from "@/Utils/cn";

const variants = {
    success: "bg-green-500 text-white",
    warning: "bg-yellow-400 text-yellow-900",
    info: "bg-blue-500 text-white",
};

export default function Alert({ children, variant = "success", className, ...props }) {
    return (
        <div
            className={cn(
                "block w-full p-4 rounded-lg font-medium",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
