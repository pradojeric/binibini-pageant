import { useState } from "react";
import { router } from "@inertiajs/react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputError from "@/Components/InputError";
import { SMALL_LINK_BUTTON_CLASSES } from "@/Components/styles";
import { cn } from "@/Utils/cn";

function formatValue(value) {
    if (value === true) return "yes";
    if (value === false) return "no";
    return value ?? "";
}

export default function ImportModal({ show, onClose, pageant, type, title }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState([]);
    const [processing, setProcessing] = useState(false);

    const params = { pageant: pageant.id, type };
    const invalidRows = preview?.rows.filter((row) => Object.keys(row.errors).length > 0).length ?? 0;

    const reset = () => {
        setFile(null);
        setPreview(null);
        setErrors([]);
        setProcessing(false);
    };

    const close = () => {
        reset();
        onClose();
    };

    const handlePreview = (e) => {
        e.preventDefault();
        if (!file) return;

        const data = new FormData();
        data.append("file", file);

        setProcessing(true);
        setErrors([]);
        window.axios
            .post(route("pageants.import.preview", params), data)
            .then(({ data }) => setPreview(data))
            .catch((error) => {
                const fieldErrors = error.response?.data?.errors;
                setErrors(fieldErrors ? Object.values(fieldErrors).flat() : ["The file could not be previewed. Please try again."]);
            })
            .finally(() => setProcessing(false));
    };

    const handleConfirm = () => {
        router.post(
            route("pageants.import.store", params),
            { rows: preview.rows.map(({ row, values }) => ({ row, values })) },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: close,
                onError: (fieldErrors) => setErrors(Object.values(fieldErrors)),
            }
        );
    };

    return (
        <Modal show={show} onClose={close} maxWidth={preview ? "6xl" : "2xl"}>
            <div className="p-6 space-y-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Upload a .csv or .xlsx file whose first row is the header. Existing records that match are updated; nothing is deleted.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Template:</span>
                    {["csv", "xlsx"].map((format) => (
                        <a
                            key={format}
                            href={route("pageants.import.template", { ...params, format })}
                            className={SMALL_LINK_BUTTON_CLASSES}
                        >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                            {format.toUpperCase()}
                        </a>
                    ))}
                </div>

                {!preview && (
                    <form onSubmit={handlePreview} className="space-y-4">
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={(e) => setFile(e.target.files[0] ?? null)}
                            className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 dark:file:bg-indigo-900/40 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 dark:file:text-indigo-300"
                        />
                        <div className="flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={close}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={!file || processing}>
                                Preview
                            </PrimaryButton>
                        </div>
                    </form>
                )}

                {preview && (
                    <>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {preview.rows.length} rows ·{" "}
                            {preview.rows.filter((row) => row.action === "create").length} new ·{" "}
                            {preview.rows.filter((row) => row.action === "update").length} updates
                            {invalidRows > 0 && (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                    {" "}· {invalidRows} with errors. Fix the file and upload it again.
                                </span>
                            )}
                        </p>

                        <div className="max-h-[60vh] overflow-auto rounded-lg border border-gray-100 dark:border-gray-700">
                            <table className="min-w-full text-sm">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-3 py-2">Row</th>
                                        <th className="px-3 py-2">Action</th>
                                        {preview.columns.map((column) => (
                                            <th key={column} className="px-3 py-2 whitespace-nowrap">
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {preview.rows.map((row) => (
                                        <tr
                                            key={row.row}
                                            className={cn(
                                                "align-top text-gray-700 dark:text-gray-300",
                                                Object.keys(row.errors).length > 0 && "bg-red-50 dark:bg-red-900/20"
                                            )}
                                        >
                                            <td className="px-3 py-2 text-gray-400">{row.row}</td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className={cn(
                                                        "rounded px-2 py-0.5 text-xs font-semibold",
                                                        row.action === "create"
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                                    )}
                                                >
                                                    {row.action === "create" ? "new" : "update"}
                                                </span>
                                            </td>
                                            {preview.columns.map((column) => (
                                                <td key={column} className="px-3 py-2 max-w-xs">
                                                    <div className="truncate">{formatValue(row.values[column])}</div>
                                                    <InputError message={row.errors[column]} className="text-xs" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {errors.map((message) => (
                    <InputError key={message} message={message} />
                ))}

                {preview && (
                    <div className="flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={reset}>
                            Choose another file
                        </SecondaryButton>
                        <PrimaryButton type="button" onClick={handleConfirm} disabled={invalidRows > 0 || processing}>
                            Import {preview.rows.length} rows
                        </PrimaryButton>
                    </div>
                )}
            </div>
        </Modal>
    );
}
