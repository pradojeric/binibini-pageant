import { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";

export default function OrderSelectionModal({
    show,
    onClose,
    candidates,
    selectedIds,
    onConfirm,
}) {
    const [ordered, setOrdered] = useState([]);

    const selectedCandidates = candidates.filter((c) =>
        selectedIds.includes(c.id)
    );

    useEffect(() => {
        if (show) {
            // Pre-populate with existing order from selectedIds
            setOrdered([...selectedIds]);
        }
    }, [show]);

    const handleClick = (id) => {
        if (ordered.includes(id)) return;
        setOrdered((prev) => [...prev, id]);
    };

    const handleReset = () => {
        setOrdered([]);
    };

    const handleRandomize = () => {
        const shuffled = [...selectedIds];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setOrdered(shuffled);
    };

    const allOrdered = ordered.length === selectedIds.length;

    const getOrder = (id) => {
        const idx = ordered.indexOf(id);
        return idx === -1 ? null : idx + 1;
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Set Candidate Order
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Click candidates in the order they should appear to judges,
                    or randomize.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    {selectedCandidates.map((candidate) => {
                        const order = getOrder(candidate.id);
                        const isOrdered = order !== null;

                        return (
                            <button
                                key={candidate.id}
                                type="button"
                                onClick={() => handleClick(candidate.id)}
                                disabled={isOrdered}
                                className={`relative flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                    isOrdered
                                        ? "bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700 opacity-75 cursor-default"
                                        : "bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:border-blue-400 hover:shadow-sm cursor-pointer"
                                }`}
                            >
                                {isOrdered && (
                                    <span className="absolute -top-2 -left-2 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                                        {order}
                                    </span>
                                )}
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    #{candidate.candidate_number}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">
                                    {candidate.full_name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                    {candidate.total}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                        <SecondaryButton type="button" onClick={handleRandomize}>
                            Randomize
                        </SecondaryButton>
                        <DangerButton type="button" onClick={handleReset}>
                            Reset
                        </DangerButton>
                    </div>
                    <div className="flex gap-2">
                        <SecondaryButton type="button" onClick={onClose}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="button"
                            disabled={!allOrdered}
                            onClick={() => onConfirm(ordered)}
                        >
                            Confirm ({ordered.length}/{selectedIds.length})
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
