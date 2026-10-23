import { Link } from "@inertiajs/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

// items: [{ label, href }]; the last item is the current page and is not linked.
export default function Breadcrumbs({ items, className = "" }) {
    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;

                    return (
                        <li key={i} className="flex items-center gap-1.5 min-w-0">
                            {i > 0 && (
                                <ChevronRightIcon className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                            )}
                            {isLast || !item.href ? (
                                <span
                                    className="truncate text-gray-900 dark:text-white"
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="truncate rounded text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
