import Modal from "@/Components/Modal";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputError from "@/Components/InputError";

export default function ConfirmDeleteModal({ show, title, children, error, processing = false, confirmLabel = "Delete", onConfirm, onClose }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{children}</div>
                <InputError message={error} className="mt-4" role="alert" />
                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        {error ? "Close" : "Cancel"}
                    </SecondaryButton>
                    {!error && (
                        <DangerButton type="button" onClick={onConfirm} disabled={processing}>
                            {confirmLabel}
                        </DangerButton>
                    )}
                </div>
            </div>
        </Modal>
    );
}
