import { cn } from "@/Utils/cn";

const variantElementMap = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    lead: "p",
    paragraph: "p",
    small: "small",
};

const variantClasses = {
    h1: "text-4xl font-extrabold tracking-tight lg:text-5xl",
    h2: "text-3xl font-bold tracking-tight first:mt-0",
    h3: "text-2xl font-bold tracking-tight",
    h4: "text-xl font-bold tracking-tight",
    h5: "text-lg font-bold tracking-tight",
    h6: "text-base font-bold tracking-tight",
    lead: "text-xl text-gray-500 dark:text-gray-400",
    paragraph: "leading-7 [&:not(:first-child)]:mt-6",
    small: "text-sm font-medium leading-none",
};

const colorClasses = {
    inherit: "text-inherit",
    current: "text-current",
    black: "text-black",
    white: "text-white",
    "blue-gray": "text-blue-gray-900 dark:text-blue-gray-100",
    gray: "text-gray-900 dark:text-gray-100",
    indigo: "text-indigo-600 dark:text-indigo-400",
    red: "text-red-600 dark:text-red-400",
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
};

export default function Typography({
    variant = "paragraph",
    color = "inherit",
    as,
    className,
    children,
    ...props
}) {
    const Component = as || variantElementMap[variant] || "p";
    
    return (
        <Component
            className={cn(
                variantClasses[variant],
                color !== "inherit" && colorClasses[color],
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}
