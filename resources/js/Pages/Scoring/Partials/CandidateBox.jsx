import ScoringInput from "@/Pages/Scoring/Partials/ScoringInput";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function CandidateBox({ candidate, criterias, onInputData = () => {} }) {
    return (
        <div>
            <div className="flex flex-col items-center">
                <div className="relative w-full">
                    <LazyLoadImage
                        className="w-full bg-black object-cover"
                        src={`/storage/` + candidate.picture}
                        alt={candidate.full_name}
                        placeholderSrc={`/logo.png`}
                        effect="blur"
                    />

                    <div className="uppercase text-xl font-bold absolute top-1 left-1 bg-amber-600 rounded-full p-2">
                        {`# ` + candidate.candidate_number}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-slate-500">
                        <div className="uppercase text-center">
                            {candidate.gender + `. ` + candidate.full_name}
                        </div>
                        <div className="uppercase text-sm text-gray-200 text-center">
                            {candidate.nickname}
                        </div>
                    </div>
                </div>

                <div className="mt-4 w-full">
                    {criterias.map((criteria, index) => {
                        return (
                            <ScoringInput
                                key={index}
                                criteria={criteria}
                                candidate={candidate}
                                onInputData={onInputData}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default CandidateBox;
