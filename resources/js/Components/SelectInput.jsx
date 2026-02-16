import { cn } from "@/Utils/cn";
import { INPUT_CLASSES } from "./styles";

export default function SelectInput({ children, className = "", ...props }) {
    return (
        <select
            {...props}
            className={cn(INPUT_CLASSES, className)}
        >
            {children}
        </select>
    );
}
