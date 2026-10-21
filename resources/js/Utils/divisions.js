// Mirrors app/Enums/Division.php. Key order is the canonical display order.
export const DIVISION_KEYS = ["mr", "ms", "hiyas"];

export const DIVISIONS = {
    mr: {
        key: "mr",
        label: "Mr.",
        chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        bar: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    },
    ms: {
        key: "ms",
        label: "Ms.",
        chip: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
        bar: "bg-pink-500",
        badge: "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    },
    hiyas: {
        key: "hiyas",
        label: "Hiyas",
        chip: "bg-deep-purple-100 text-deep-purple-700 dark:bg-deep-purple-900/40 dark:text-deep-purple-300",
        bar: "bg-deep-purple-500",
        badge: "bg-deep-purple-50 text-deep-purple-700 border-deep-purple-100 dark:bg-deep-purple-900/30 dark:text-deep-purple-300 dark:border-deep-purple-800",
    },
};

const UNKNOWN = {
    chip: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    bar: "bg-gray-400",
    badge: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

// Candidates saved before validation existed may carry a value outside the known divisions.
export const divisionOf = (key) =>
    DIVISIONS[key] ?? { ...UNKNOWN, key, label: key ? String(key).toUpperCase() : "—" };

// "Mr.", "Mr. & Ms.", "Mr., Ms. & Hiyas"
export const divisionsLabel = (keys = []) => {
    const labels = keys.map((key) => divisionOf(key).label);
    return labels.length < 3
        ? labels.join(" & ")
        : `${labels.slice(0, -1).join(", ")} & ${labels.at(-1)}`;
};
