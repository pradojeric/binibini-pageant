import { cn } from "@/Utils/cn";

export function TableHeader({ header }) {
    return (
        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            {header.map((head, index) => {
                return (
                    <th
                        className="px-6 py-4 text-center uppercase tracking-wider text-xs font-bold text-gray-500 dark:text-gray-400"
                        key={index}
                    >
                        {head}
                    </th>
                );
            })}
        </tr>
    );
}

function TableComponent({
    className = "",
    header = [],
    children,
    customHeader = false,
    ...props
}) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
            <table className={cn("w-full divide-y divide-gray-100 dark:divide-gray-800", className)} {...props}>
                <thead>{!customHeader && <TableHeader header={header} />}</thead>
                {customHeader && children}
                {!customHeader && <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{children}</tbody>}
            </table>
        </div>
    );
}

export default TableComponent;
