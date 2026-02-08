"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useElectionStore } from "@/store/useElectionStore";

import VoterNavbar from "@/components/VoterNavbar";
import CandidateCard from "@/components/CandidateCard";
import toast from "react-hot-toast";

const page = () => {
  const router = useRouter();
  const { voter, elections, votes, setVotes, setElections, castVote } =
    useElectionStore();

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const response = await fetch("/api/fetch/election", {
          cache: "no-store",
        });
        const result = await response.json();
        if (!result.success) {
          toast.error(result.message || "Failed to load election.");
          return;
        }
        setElections(result.data?.elections || []);
      } catch (error) {
        toast.error("Failed to load election.");
      }
    };

    fetchElection();
  }, [setElections]);

  useEffect(() => {
    if (elections.length > 0) {
      setVotes(elections);
    }
  }, [elections, setVotes]);

  const handleVote = (electionId) => {
    const electionVotes = votes?.[electionId] || {};
    const allSelected = Object.values(electionVotes).every(
      (val) => val !== ""
    );

    if (!allSelected) return;

    toast(
      (t) => (
        <span>
          Confirm your vote?
          <button
            className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
            onClick={async () => {
              const result = await castVote(electionId, electionVotes);
              toast.dismiss(t.id);
              if (result.success) {
                toast.success(result.message || "Vote confirmed!");
                router.push("/voter/login");
              } else {
                toast.error(result.message || "Failed to cast vote.");
              }
            }}
          >
            Yes
          </button>
          <button
            className="ml-2 px-2 py-1 bg-gray-500 text-white rounded"
            onClick={() => toast.dismiss(t.id)}
          >
            No
          </button>
        </span>
      ),
      { duration: 10000 }
    );
  };

  return (
    <div className="w-4xl max-w-full mx-auto p-4 bg-green-400">
      <VoterNavbar />

      <div className="max-w-6xl mx-auto p-4">
        {elections.length > 0 && voter ? (
          <div className="flex flex-col space-y-8">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Welcome, {String(voter.name || "Voter").toUpperCase()}
            </h1>

            {elections.map((election) => {
              const electionVotes = votes?.[election.electionId] || {};
              const allSelected = Object.values(electionVotes).every(
                (val) => val !== ""
              );
              const hasCandidates = (election.positions || []).some(
                (position) => (position.candidates || []).length > 0
              );
              const isVoted = election.voterStatus === "Voted";

              return (
                <div
                  key={election.electionId}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">{election.name}</h2>
                      <p className="text-sm text-gray-500">
                        Status: {election.voterStatus}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {election.status}
                    </span>
                  </div>

                  {isVoted ? (
                    <p className="text-green-600 font-medium">
                      You have already voted in this election.
                    </p>
                  ) : (
                    <>
                      {election.positions.map((position) => (
                        <div key={position.positionId} className="mb-4">
                          <h3 className="text-md font-semibold mb-2">
                            {position.name}
                          </h3>
                          <CandidateCard
                            position={position}
                            electionId={election.electionId}
                          />
                        </div>
                      ))}

                      <div className="flex justify-center">
                        <button
                          disabled={!allSelected || !hasCandidates}
                          onClick={() => handleVote(election.electionId)}
                          className={`px-6 py-3 rounded-lg text-white font-semibold w-[50%] ${
                            allSelected && hasCandidates
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Submit Vote
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <h1>Loading...</h1>
        )}
      </div>
    </div>
  );
};

export default page;
