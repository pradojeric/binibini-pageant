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

export function CardBody({ className, children, ...props }) {
    return (
        <div className={cn("p-6", className)} {...props}>
            {children}
        </div>
    );
}

export default Card;
