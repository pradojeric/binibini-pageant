import { Link } from "@inertiajs/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { cn } from "@/Utils/cn";
import { SECONDARY_BUTTON_CLASSES } from "@/Components/styles";

export default function BackButton({ href, className = "", children }) {
    return (
        <Link href={href} className={cn(SECONDARY_BUTTON_CLASSES, "gap-2", className)}>
            <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
            {children}
        </Link>
    );
}
