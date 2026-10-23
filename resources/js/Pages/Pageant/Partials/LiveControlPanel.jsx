import { useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { CheckCircleIcon, ClockIcon, SignalIcon } from "@heroicons/react/24/outline";
import { Card, CardHeader, CardBody } from "@/Components/Card";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

const roundName = (rounds, round) =>
    Number(round) > 0 ? rounds.find((r) => r.round == round)?.round_name ?? `Round ${round}` : "Not started";

// What the confirm modal says for a pending round or group change.
function describeChange(pending, pageant, rounds) {
    const value = Number(pending.value);

    if (pending.type === "round") {
        return value === 0
            ? {
                  title: "Set the pageant back to Not started?",
                  body: "Judging closes on every judge's screen. Scores already entered are kept.",
                  confirm: "Set to Not started",
              }
            : {
                  title: `Switch the live round to ${roundName(rounds, value)}?`,
                  body: "Judges' screens move to this round right away and the open group closes. Open a group afterwards so judges can score.",
                  confirm: "Switch round",
              };
    }

    if (value === 0) {
        return {
            title: "Close judging?",
            body: "Judges can't submit scores until you open a group again.",
            confirm: "Close judging",
        };
    }

    const closes = Number(pageant.current_group) > 0 ? ` Group ${pageant.current_group} closes.` : "";
    return {
        title: `Open Group ${value} for judging?`,
        body: `Judges can start scoring Group ${value} of ${roundName(rounds, pageant.current_round)} right away.${closes}`,
        confirm: `Open Group ${value}`,
    };
}

export default function LiveControlPanel({ pageant, rounds, groupList, judges }) {
    // { type: "round" | "group", value } while a change waits for confirmation
    const [pending, setPending] = useState(null);
    const [processing, setProcessing] = useState(false);

    const groupOpen = Number(pageant.current_group) > 0;
    const doneCount = judges.filter((j) => j.status === "done").length;

    const selectValue = (type, live) => (pending?.type === type ? pending.value : String(live ?? ""));

    const apply = () => {
        const name = pending.type === "round" ? "pageant.change-round" : "pageant.change-group";
        router.put(
            route(name, { pageant: pageant.id, [pending.type]: pending.value }),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setPending(null);
                },
            }
        );
    };

    // Keep the last text on screen while the modal fades out after pending clears.
    const lastChange = useRef(null);
    if (pending) lastChange.current = describeChange(pending, pageant, rounds);
    const change = lastChange.current;

    return (
        <Card>
            <CardHeader
                icon={SignalIcon}
                title="Live control"
                action={
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {roundName(rounds, pageant.current_round)}
                        </span>
                        <span aria-hidden="true"> · </span>
                        <span className={groupOpen ? "text-green-800 dark:text-green-300 font-medium" : ""}>
                            {groupOpen ? `Group ${pageant.current_group} open` : "Judging closed"}
                        </span>
                    </p>
                }
            />
            <CardBody className="grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-10">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <InputLabel htmlFor="live-round" value="Round" className="mb-1" />
                        <SelectInput
                            id="live-round"
                            className="w-full sm:w-48"
                            value={selectValue("round", pageant.current_round)}
                            onChange={(e) => setPending({ type: "round", value: e.target.value })}
                        >
                            <option value="0">Not started</option>
                            {rounds.map((round) => (
                                <option value={round.round} key={`R` + round.round}>
                                    {round.round_name}
                                </option>
                            ))}
                        </SelectInput>
                    </div>
                    <div>
                        <InputLabel htmlFor="live-group" value="Open group" className="mb-1" />
                        <SelectInput
                            id="live-group"
                            className="w-full sm:w-48"
                            value={selectValue("group", pageant.current_group)}
                            disabled={groupList.length === 0}
                            onChange={(e) => setPending({ type: "group", value: e.target.value })}
                        >
                            <option value="0">None (judging closed)</option>
                            {groupList.map((group) => (
                                <option value={group} key={`G` + group}>
                                    Group {group}
                                </option>
                            ))}
                        </SelectInput>
                    </div>
                </div>

                {judges.length > 0 && (
                    <div className="lg:border-l lg:border-gray-100 lg:dark:border-gray-700 lg:pl-10">
                        <div className="flex items-baseline justify-between gap-4 mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Judges</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                                {groupOpen
                                    ? `${doneCount} of ${judges.length} submitted Group ${pageant.current_group}`
                                    : "Open a group to track submissions"}
                            </p>
                        </div>
                        <ul className="flex flex-wrap gap-2">
                            {judges.map((judge) => {
                                const done = groupOpen && judge.status === "done";
                                const Icon = done ? CheckCircleIcon : ClockIcon;
                                return (
                                    <li
                                        key={judge.id}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                            done
                                                ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300"
                                                : groupOpen
                                                  ? "bg-amber-100 text-gray-900 dark:bg-amber-900/30 dark:text-amber-300"
                                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                                        {judge.name}
                                        {groupOpen && (
                                            <span className="sr-only">{done ? ", submitted" : ", still scoring"}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </CardBody>

            <Modal show={pending !== null} maxWidth="md" onClose={() => !processing && setPending(null)}>
                {change && (
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{change.title}</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{change.body}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setPending(null)} disabled={processing}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton onClick={apply} disabled={processing}>
                                {change.confirm}
                            </PrimaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
}
