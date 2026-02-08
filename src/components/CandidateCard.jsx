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
            className={`card bg-base-100 shadow-md hover:shadow-lg transition-all cursor-pointer border-2 ${
              isSelected ? "border-primary scale-105" : "border-transparent"
            }`}
          >
            <figure className="pt-4 px-4">
               <div className="avatar">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                    src={candidate.photo || candidate.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} 
                    alt={candidate.name} 
                    className="object-cover"
                    />
                </div>
               </div>
            </figure>
            <div className="card-body items-center text-center p-4">
              <h2 className="card-title text-base">{candidate.name}</h2>
              <div className="badge badge-secondary badge-outline">{candidate.party}</div>
             
              {isSelected && (
                 <div className="badge badge-primary mt-2">Selected</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidateCard;
