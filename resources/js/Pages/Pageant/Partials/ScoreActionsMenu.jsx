import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ArrowPathIcon, EllipsisHorizontalIcon, FlagIcon, TrashIcon } from "@heroicons/react/24/outline";
import { SECONDARY_BUTTON_CLASSES } from "@/Components/styles";
import { cn } from "@/Utils/cn";

// The pageant's irreversible actions, kept out of the toolbar so they can't be hit by accident.
export default function ScoreActionsMenu({ onResetScores, onResetEverything, onEndPageant }) {
    const items = [
        { label: "Reset scores", hint: "Erase every judge and staff score", icon: ArrowPathIcon, onClick: onResetScores },
        { label: "Reset everything", hint: "Also erase deductions and selections", icon: TrashIcon, onClick: onResetEverything },
        onEndPageant && { label: "End pageant", hint: "Mark the pageant as finished", icon: FlagIcon, onClick: onEndPageant },
    ].filter(Boolean);

    return (
        <Menu as="div" className="relative">
            <Menu.Button className={cn(SECONDARY_BUTTON_CLASSES, "gap-1.5 px-3")}>
                <EllipsisHorizontalIcon className="w-5 h-5" aria-hidden="true" />
                More
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-30 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-gray-800 p-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
                    {items.map((item) => (
                        <Menu.Item key={item.label}>
                            {({ active }) => (
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    className={cn(
                                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left",
                                        active && "bg-red-50 dark:bg-red-900/30"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                                    <span>
                                        <span className="block text-sm font-semibold text-red-700 dark:text-red-200">{item.label}</span>
                                        <span className="block text-xs text-gray-600 dark:text-gray-400">{item.hint}</span>
                                    </span>
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
