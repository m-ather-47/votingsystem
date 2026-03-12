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
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <span className="font-semibold">Confirm Your Vote</span>
          </div>
          <p className="text-sm text-base-content/70">This action cannot be undone. Are you sure?</p>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={async () => {
                const result = await castVote(electionId, electionVotes);
                toast.dismiss(t.id);
                if (result.success) {
                  toast.success(result.message || "Vote confirmed!");
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
      { duration: 10000, position: "top-center" }
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      <VoterNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <span className="loading loading-dots loading-lg text-primary"></span>
            <p className="text-sm text-base-content/50">Loading elections...</p>
          </div>
        ) : elections.length > 0 && voter ? (
          <div className="space-y-8">
            {/* Welcome header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome, <span className="text-primary">{String(voter.name || "Voter").toUpperCase()}</span>
              </h1>
              <p className="text-sm text-base-content/60 mt-1">
                Select your preferred candidate for each position and submit your vote.
              </p>
            </div>

            {/* Elections */}
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
                <div key={election.electionId} className="section-card">
                  {/* Election Header */}
                  <div className="section-card-header !flex-col sm:!flex-row gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                      <h2 className="!text-lg font-bold break-words min-w-0">{election.name}</h2>
                      <span className={`badge badge-sm shrink-0 ${isVoted ? "badge-success" : "badge-warning"}`}>
                        {election.voterStatus}
                      </span>
                    </div>
                    <span className="badge badge-sm badge-outline shrink-0">{election.status}</span>
                  </div>

                  <div className="section-card-body">
                    {isVoted ? (
                      <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div>
                          <p className="font-medium text-success">Vote Submitted</p>
                          <p className="text-sm text-base-content/60">You have successfully voted in this election. Thank you for participating!</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {election.positions.map((position) => (
                          <div key={position.positionId} className="mb-8 last:mb-0">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-1 h-6 bg-primary rounded-full" />
                              <h3 className="font-semibold text-base-content">
                                {position.name}
                              </h3>
                              <span className="text-xs text-base-content/40">
                                ({(position.candidates || []).length} candidates)
                              </span>
                            </div>
                            {position.candidates && position.candidates.length > 0 ? (
                              <CandidateCard
                                position={position}
                                electionId={election.electionId}
                              />
                            ) : (
                              <p className="text-sm text-base-content/50 pl-4">No candidates available for this position.</p>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-center pt-4 border-t border-base-200">
                          <button
                            disabled={!allSelected || !hasCandidates}
                            onClick={() => handleVote(election.electionId)}
                            className="btn btn-primary btn-wide gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="text-base-content/50">No active elections available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
