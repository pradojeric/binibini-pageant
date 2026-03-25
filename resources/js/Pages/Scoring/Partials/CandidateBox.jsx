import ScoringInput from "@/Pages/Scoring/Partials/ScoringInput";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function CandidateBox({ candidate, criterias, onInputData = () => {}, existingScores = {}, isAdmin = false }) {
    return (
        <div className="group">
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.03]">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                    <LazyLoadImage
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={`/storage/` + candidate.picture}
                        alt={candidate.full_name}
                        placeholderSrc={`/logo.png`}
                        effect="blur"
                    />

                    {/* Candidate Number Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <div className="bg-amber-500 text-white font-black text-2xl h-12 w-12 flex items-center justify-center rounded-2xl shadow-lg ring-4 ring-amber-500/20 rotate-[-5deg] group-hover:rotate-0 transition-transform duration-300">
                            {candidate.candidate_number}
                        </div>
                    </div>

                    {/* Name Overlay - Glassmorphism */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 text-left">
                        <div className="flex flex-col">
                            <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">
                                Candidate
                            </span>
                            <h4 className="text-white font-bold text-xs leading-tight uppercase truncate">
                                {candidate.full_name}
                            </h4>
                            <p className="text-gray-300 text-lg font-medium uppercase tracking-wider opacity-80">
                                {candidate.nickname}
                            </p>
                        </div>
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
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateBox;
