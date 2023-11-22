export function TableHeader({ header }) {
    return (
        <tr>
            {header.map((head, index) => {
                return (
                    <th
                        className="px-3 py-2 text-center uppercase dark:text-white"
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
        <table className={"w-full border divide-y " + className} {...props}>
            <thead>{!customHeader && <TableHeader header={header} />}</thead>
            {customHeader && children}
            {!customHeader && <tbody className="divide-y">{children}</tbody>}
        </table>
    );
}

export default TableComponent;
