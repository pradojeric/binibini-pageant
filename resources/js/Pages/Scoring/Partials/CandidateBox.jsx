import ScoringInput from "@/Pages/Scoring/Partials/ScoringInput";
import Image from "@/Components/Image";

function CandidateBox({ candidate, criterias, onInputData = () => {}, existingScores = {}, isAdmin = false, missingCriteriaIds = [] }) {
    return (
        <div>
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                    <Image
                        className="w-full h-full object-cover"
                        src={`/storage/` + candidate.picture}
                        alt={candidate.full_name}
                    />

                    <div className="absolute top-4 left-4 z-10 bg-amber-500 text-gray-950 font-black text-2xl tabular-nums h-12 w-12 flex items-center justify-center rounded-xl shadow-md">
                        <span className="sr-only">Candidate number </span>
                        {candidate.candidate_number}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-left">
                        <h4 className="text-white font-bold text-base leading-snug line-clamp-2">
                            {candidate.full_name}
                        </h4>
                        {candidate.nickname && (
                            <p className="text-gray-200 text-sm font-medium">
                                {candidate.nickname}
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-5 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="space-y-4">
                        {criterias.map((criteria, index) => (
                            <ScoringInput
                                key={index}
                                criteria={criteria}
                                candidate={candidate}
                                onInputData={onInputData}
                                initialValue={existingScores[criteria.id] ?? ""}
                                isAdmin={isAdmin}
                                missing={missingCriteriaIds.includes(criteria.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateBox;
