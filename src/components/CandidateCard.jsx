import { useElectionStore } from "@/store/useElectionStore";

const CandidateCard = (props) => {
  const { position, electionId } = props;

  const { votes, updateVotes } = useElectionStore();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {position.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="border rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition"
          >
            <img
              src={candidate.photo || candidate.image || "/profile.jpg"}
              alt={candidate.name}
              className="w-24 h-24 rounded-full mb-3 object-cover"
            />
            <p className="font-semibold">{candidate.name}</p>
            <p className="text-sm text-gray-500">{candidate.party}</p>
            <p className="text-xs text-gray-400">{position.name}</p>
          </div>
        ))}
      </div>
      {/* Dropdown */}
      <select
        id={position.positionId}
        value={votes?.[electionId]?.[position.positionId] || ""}
        onChange={(e) =>
          updateVotes(electionId, position.positionId, e.target.value)
        }
        className="w-full border rounded-lg p-2"
      >
        <option value="">Select your candidate</option>
        {position.candidates.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.name} ({candidate.party})
          </option>
        ))}
      </select>
    </>
  );
};

export default CandidateCard;
