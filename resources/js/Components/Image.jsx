import { useState } from "react";

export const PLACEHOLDER_IMAGE = "/placeholders/placeholder-image.png";

// Native lazy loading; swaps to the placeholder once if the source fails (missing upload, bad path).
export default function Image({ src, fallback = PLACEHOLDER_IMAGE, loading = "lazy", alt = "", onError, ...props }) {
    const [failedSrc, setFailedSrc] = useState(null);
    const showFallback = !src || failedSrc === src;

    return (
        <img
            {...props}
            src={showFallback ? fallback : src}
            alt={alt}
            loading={loading}
            decoding="async"
            onError={(event) => {
                if (!showFallback) setFailedSrc(src);
                onError?.(event);
            }}
        />
    );
}
