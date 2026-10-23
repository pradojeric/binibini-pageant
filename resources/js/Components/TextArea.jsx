import { cn } from "@/Utils/cn";
import { INPUT_CLASSES } from "./styles";

export default function TextArea({ children, className = "", ...props }) {
    return (
        <textarea
            {...props}
            className={cn(INPUT_CLASSES, className)}
        >
            {children}
        </textarea>
    );
}
