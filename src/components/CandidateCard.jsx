import { useElectionStore } from "@/store/useElectionStore";

const CandidateCard = (props) => {
  const { position, electionId } = props;
  const { votes, updateVotes } = useElectionStore();

  const selectedCandidateId = votes?.[electionId]?.[position.positionId];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {position.candidates.map((candidate) => {
        const isSelected = selectedCandidateId === candidate.id;
        return (
          <div
            key={candidate.id}
            onClick={() => updateVotes(electionId, position.positionId, candidate.id)}
            className={`group relative bg-base-100 rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected
                ? "border-primary shadow-md ring-2 ring-primary/20"
                : "border-base-200 hover:border-primary/40"
            }`}
          >
            {/* Selected check */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}

            <div className="flex flex-col items-center text-center gap-3">
              <div className={`avatar transition-transform duration-200 ${isSelected ? "scale-105" : "group-hover:scale-105"}`}>
                <div className="w-20 h-20 rounded-full ring-2 ring-offset-2 ring-offset-base-100 ring-base-200">
                  <img
                    src={candidate.photo || candidate.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                    alt={candidate.name}
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-base-content">{candidate.name}</h3>
                <span className="badge badge-sm badge-outline mt-1.5">{candidate.party}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidateCard;
