"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useElectionStore } from "@/store/useElectionStore";

import VoterNavbar from "@/components/VoterNavbar";
import CandidateCard from "@/components/CandidateCard";
import toast from "react-hot-toast";

const page = () => {
  const router = useRouter();
  const { voter, elections, votes, setVotes, setElections, castVote } =
    useElectionStore();
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
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
        <div className="flex flex-col gap-2">
          <span>
            Are you sure you want to cast your vote? This action cannot be undone.
          </span>
          <div className="flex gap-2 justify-end">
             <button
            className="btn btn-sm btn-error text-white"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="btn btn-sm btn-success text-white"
            onClick={async () => {
              const result = await castVote(electionId, electionVotes);
              toast.dismiss(t.id);
              if (result.success) {
                toast.success(result.message || "Vote confirmed!");
                // router.push("/voter/login");
              } else {
                toast.error(result.message || "Failed to cast vote.");
              }
            }}
          >
            Confirm Vote
          </button>
         
          </div>
        </div>
      ),
      { duration: 10000, position: 'top-center' }
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      <VoterNavbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-lg">Loading Elections...</p>
           </div>
        ) : elections.length > 0 && voter ? (
          <div className="flex flex-col space-y-8">
            <div className="text-center mb-4">
                 <h1 className="text-3xl font-bold">
                    Welcome, <span className="text-primary">{String(voter.name || "Voter").toUpperCase()}</span>
                </h1>
                <p className="text-base-content/70">Please carefully select candidates for each position below.</p>
            </div>

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
                  className="card bg-base-100 shadow-xl"
                >
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4">
                            <div>
                                <h2 className="card-title text-2xl">{election.name}</h2>
                                <div className={`badge ${isVoted ? 'badge-success text-white' : 'badge-warning text-white'} gap-2 mt-1`}>
                                   Status: {election.voterStatus}
                                </div>
                            </div>
                            <div className="badge badge-accent badge-outline mt-2 md:mt-0">
                            {election.status} 
                            </div>
                        </div>

                  {isVoted ? (
                    <div className="alert alert-success text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>You have successfully voted in this election. Thank you for participating!</span>
                    </div>
                  ) : (
                    <>
                      {election.positions.map((position) => (
                        <div key={position.positionId} className="mb-8">
                          <h3 className="text-lg font-bold mb-4 border-l-4 border-primary pl-3 bg-base-200 py-2 rounded-r">
                            Running for: {position.name}
                          </h3>
                          {position.candidates && position.candidates.length > 0 ? (
                             <CandidateCard
                            position={position}
                            electionId={election.electionId}
                          />
                          ) : (
                            <div className="alert">No candidates available for this position.</div>
                          )}
                         
                        </div>
                      ))}

                      <div className="card-actions justify-center mt-6">
                        <button
                          disabled={!allSelected || !hasCandidates}
                          onClick={() => handleVote(election.electionId)}
                          className="btn btn-primary btn-wide btn-lg"
                        >
                          Submit Vote
                        </button>
                      </div>
                    </>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p className="text-lg text-base-content/70">No active elections available.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default page;
