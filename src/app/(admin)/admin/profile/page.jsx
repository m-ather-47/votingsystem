"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const page = () => {
  const [stats, setStats] = useState(null);
  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const perElectionStats = stats?.perElection || [];
  const perElectionMap = new Map(
    perElectionStats.map((entry) => [entry.electionId, entry])
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const [statsRes, electionsRes] = await Promise.all([
          fetch("/api/admin/stats", { cache: "no-store" }),
          fetch("/api/admin/election", { cache: "no-store" }),
        ]);

        const statsResult = await statsRes.json();
        const electionsResult = await electionsRes.json();

        if (statsResult.success) {
          setStats(statsResult.data);
        } else {
          toast.error(statsResult.message || "Failed to load stats.");
        }

        if (electionsResult.success) {
          setElections(electionsResult.data || []);
        } else {
          toast.error(electionsResult.message || "Failed to load elections.");
        }
      } catch (error) {
        toast.error("Failed to load admin dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-2">Admin Profile</h2>
        <p className="text-gray-600">
          Overview of current elections and platform stats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Voters</p>
          <p className="text-2xl font-bold">{stats?.voters ?? "-"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Candidates</p>
          <p className="text-2xl font-bold">{stats?.candidates ?? "-"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Positions</p>
          <p className="text-2xl font-bold">{stats?.positions ?? "-"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Elections</p>
          <p className="text-2xl font-bold">{stats?.elections ?? "-"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Votes Cast</p>
          <p className="text-2xl font-bold">{stats?.votes ?? "-"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Turnout</p>
          <p className="text-2xl font-bold">
            {stats?.turnout !== undefined
              ? `${stats.turnout.toFixed(1)}%`
              : "-"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Election Stats</h3>
          {isLoading ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : null}
        </div>
        {elections.length === 0 ? (
          <p className="text-gray-500">No elections created yet.</p>
        ) : (
          <div className="space-y-3">
            {elections.map((election) => {
              const positions = election.positions || [];
              const candidates = positions.flatMap(
                (position) => position.candidates || []
              );
              const statsEntry = perElectionMap.get(election.id);
              const turnoutValue =
                statsEntry?.turnout !== undefined
                  ? `${statsEntry.turnout.toFixed(1)}%`
                  : "-";

              return (
                <div
                  key={election.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-lg">{election.name}</p>
                    <p className="text-sm text-gray-500">
                      Status: {election.status}
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>
                      Positions: {statsEntry?.positions ?? positions.length}
                    </span>
                    <span>
                      Candidates: {statsEntry?.candidates ?? candidates.length}
                    </span>
                    <span>Votes: {statsEntry?.votes ?? 0}</span>
                    <span>Turnout: {turnoutValue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
