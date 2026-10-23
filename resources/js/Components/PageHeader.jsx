// Title area for AuthenticatedLayout's `header` slot. Actions (create, back) belong in the page body, not here.
export default function PageHeader({ icon: Icon, title, subtitle, children }) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {Icon && (
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
            )}
            <div className="flex flex-col min-w-0">
                <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}
