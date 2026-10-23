import { cn } from "@/Utils/cn";

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ icon: Icon, title, action, as: Heading = "h2", className }) {
    return (
        <div className={cn("px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4", className)}>
            <div className="flex items-center gap-2 min-w-0">
                {Icon && <Icon className="w-5 h-5 shrink-0 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />}
                <Heading className="text-base font-bold tracking-tight text-gray-900 dark:text-white truncate">
                    {title}
                </Heading>
            </div>
            {action}
        </div>
    );
}

export function CardBody({ className, children, ...props }) {
    return (
        <div className={cn("p-6", className)} {...props}>
            {children}
        </div>
    );
}

export default Card;
