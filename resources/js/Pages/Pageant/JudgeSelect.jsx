import PrimaryButton from "@/Components/PrimaryButton";
import TableComponent from "@/Components/TableComponent";
import Checkbox from "@/Components/Checkbox";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect } from "react";

function pluck(arr, key) {
    return arr.map((i) => Number(i[key]));
}

export default function JudgeSelect({
    auth,
    judges,
    pageant,
    pageantJudges = [],
}) {
    const { data, setData, post, reset } = useForm({
        selectedJudges: pageantJudges,
    });

    const headings = ["Name", "Type", "Rounds", "Status", "Created", "Action"];

    const submit = (e) => {
        e.preventDefault();
        post(route("pageant.store-judges", pageant.id));
    };

    useEffect(() => {
        return () => console.log(data.selectedJudges);
    }, [setData]);

    const handleChecked = (e) => {
        let id = e.target.value;

        return e.target.checked
            ? setData("selectedJudges", [...data.selectedJudges, id])
            : setData(
                  "selectedJudges",
                  [...data.selectedJudges].filter((o) => {
                      console.log(o, id);
                      return o != id;
                  })
              );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Pageants
                </h2>
            }
        >
            <Head title="Pageant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex justify-end">
                                <Link href={route("pageants.index")}>
                                    <PrimaryButton>Back</PrimaryButton>
                                </Link>
                            </div>
                            <form onSubmit={submit}>
                                {judges.map((judge) => {
                                    return (
                                        <div className="block" key={judge.id}>
                                            <label className="flex items-center">
                                                <Checkbox
                                                    name="selectedJudges[]"
                                                    value={judge.id}
                                                    defaultChecked={data.selectedJudges.includes(
                                                        judge.id
                                                    )}
                                                    onChange={handleChecked}
                                                />
                                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {judge.name}
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}
                                <div className="mt-4">
                                    <PrimaryButton onClick={submit}>
                                        Add
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
