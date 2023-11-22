import ScoringInput from "@/Pages/Scoring/Partials/ScoringInput";

function CandidateBox({ candidate, criterias, onInputData = () => {} }) {
    return (
        <div>
            <div className="flex flex-col items-center">
                <div class="relative w-full">
                    <img
                        className="w-full object-cover border bg-black"
                        src={`/storage/` + candidate.picture}
                        alt={candidate.full_name}
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
