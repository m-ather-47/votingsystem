import { create } from "zustand";

export const useElectionStore = create((set, get) => ({
  elections: [],
  voter: null,
  votes: {},
  voters: [],

  setVoter: async (voterData) => {
    set({ voter: voterData });
  },

  setVoters: (votersData) => {
    set({ voters: votersData });
  },

  setVotersData: async () => {
    try {
      const response = await fetch("/api/admin/voter", { cache: "no-store" });
      const result = await response.json();
      if (result.success) {
        set({ voters: result.data });
      }
      return result;
    } catch (error) {
      return { success: false, message: "Failed to fetch voters." };
    }
  },

  setVotes: (electionsData) => {
    const votes = (electionsData || []).reduce((acc, election) => {
      acc[election.electionId] = (election.positions || []).reduce(
        (posAcc, pos) => {
          posAcc[pos.positionId] = "";
          return posAcc;
        },
        {}
      );
      return acc;
    }, {});

    set({ votes });
  },

  updateVotes: (electionId, positionId, candidateId) => {
    set((state) => ({
      votes: {
        ...state.votes,
        [electionId]: {
          ...(state.votes[electionId] || {}),
          [positionId]: candidateId,
        },
      },
    }));
  },

  setElections: async (electionsData) => {
    set({ elections: electionsData });
  },

  castVote: async (electionId, votesData) => {
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ electionId, votes: votesData }),
      });
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          elections: state.elections.map((election) =>
            election.electionId === electionId
              ? { ...election, voterStatus: "Voted" }
              : election
          ),
        }));
      }
      return result;
    } catch (error) {
      return { success: false, message: "Failed to cast vote." };
    }
  },
}));
