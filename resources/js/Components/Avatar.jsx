import { cn } from "@/Utils/cn";

export default function Avatar({ 
    src, 
    alt, 
    size = "md", 
    variant = "circular", 
    className, 
    children, 
    ...props 
}) {
    const sizeClasses = {
        xs: "w-6 h-6 text-xs",
        sm: "w-9 h-9 text-xs",
        md: "w-12 h-12 text-sm",
        lg: "w-14 h-14 text-base",
        xl: "w-20 h-20 text-lg",
        xxl: "w-24 h-24 text-xl",
    };

    const variantClasses = {
        circular: "rounded-full",
        rounded: "rounded-lg",
        square: "rounded-none",
    };

    const classes = cn(
        "inline-flex items-center justify-center overflow-hidden object-cover",
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.circular,
        className
    );

    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={classes}
                {...props}
            />
        );
    }

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}
