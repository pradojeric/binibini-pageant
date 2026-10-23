import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/Utils/cn";
import { INPUT_CLASSES } from "./styles";

export default forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, ...props },
    ref
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={cn(INPUT_CLASSES, className)}
            ref={input}
        />
    );
});
