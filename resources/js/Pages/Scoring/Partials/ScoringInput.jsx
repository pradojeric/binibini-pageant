import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import { useState } from "react";

function ScoringInput({ criteria, candidate, onInputData = () => {} }) {
    const [value, setValue] = useState(0);
    const minMax = { min: 0, max: criteria.percentage };

    return (
        <>
            <div className="w-full">
                <InputLabel
                    value={criteria.name + " (" + criteria.percentage + ")"}
                    htmlFor={`can` + candidate.id + `crit` + criteria.id}
                />
                <TextInput
                    id={`can` + candidate.id + `crit` + criteria.id}
                    type="number"
                    name="scores[]"
                    className="w-full"
                    value={value}
                    data-criteria-id={criteria.id}
                    required
                    onChange={(e) => {
                        const score = Math.max(
                            minMax.min,
                            Math.min(minMax.max, e.target.value)
                        );

                        setValue(score);

                        onInputData(candidate.id, criteria.id, score);

                        // const criteriaId = e.target.dataset.criteriaId;

                        // if (score > criteria.percentage || score < 0) {
                        //     //
                        //     setErrors((prevErrors) => {
                        //         const newErrors = [...prevErrors];
                        //         const existingErrorIndex = newErrors.findIndex(
                        //             (error) => error.criteriaId === criteriaId
                        //         );

                        //         if (existingErrorIndex !== -1) {
                        //             // Update existing error
                        //             newErrors[
                        //                 existingErrorIndex
                        //             ].message = `Score exceeds.`;
                        //         } else {
                        //             // Add new error
                        //             newErrors.push({
                        //                 criteriaId,
                        //                 message: `Score exceeds.`,
                        //             });
                        //         }

                        //         return newErrors;
                        //     });
                        //     console.log("Error");
                        // } else {
                        //     //
                        //     setErrors((prevErrors) => {
                        //         const newErrors = prevErrors.filter(
                        //             (error) => error.criteriaId !== criteriaId
                        //         );
                        //         return newErrors;
                        //     });

                        //     onInputData(candidate.id, criteria.id, score);
                        //     console.log("No error");
                        // }
                        // console.log(errors);
                    }}
                />
                {/* {errors.length > 0 &&
                    errors.find((err) => err.criteriaId == criteria.id) && (
                        <div style={{ color: "red" }}>
                            <p>
                                {
                                    errors.find(
                                        (err) => err.criteriaId == criteria.id
                                    ).message
                                }
                            </p>
                        </div>
                    )} */}
            </div>
        </>
    );
}

export default ScoringInput;
