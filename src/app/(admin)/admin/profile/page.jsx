"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const StatIcon = ({ type }) => {
  const icons = {
    voters: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    candidates: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    positions: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
    elections: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
    votes: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
    turnout: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

const colorMap = {
  voters: "bg-blue-50 text-blue-600",
  candidates: "bg-violet-50 text-violet-600",
  positions: "bg-amber-50 text-amber-600",
  elections: "bg-emerald-50 text-emerald-600",
  votes: "bg-sky-50 text-sky-600",
  turnout: "bg-rose-50 text-rose-600",
};

const page = () => {
  const router = useRouter();
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

        if (statsRes.status === 401 || electionsRes.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.replace("/admin/login");
          return;
        }

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

  const statCards = [
    { key: "voters", label: "Registered Voters", value: stats?.voters },
    { key: "candidates", label: "Candidates", value: stats?.candidates },
    { key: "positions", label: "Positions", value: stats?.positions },
    { key: "elections", label: "Elections", value: stats?.elections },
    { key: "votes", label: "Votes Cast", value: stats?.votes },
    {
      key: "turnout",
      label: "Turnout",
      value: stats?.turnout !== undefined ? `${stats.turnout.toFixed(1)}%` : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of elections, voters, and platform activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="stat-card">
            <div className={`stat-icon ${colorMap[card.key]}`}>
              <StatIcon type={card.key} />
            </div>
            <div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">
                {isLoading ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  card.value ?? "—"
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Elections Overview */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Elections Overview</h2>
          {isLoading && (
            <span className="loading loading-spinner loading-sm text-base-content/40"></span>
          )}
        </div>
        <div className="section-card-body">
          {elections.length === 0 ? (
            <div className="text-center py-10 text-base-content/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p className="text-sm">No elections created yet.</p>
            </div>
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
                    : "—";

                return (
                  <div
                    key={election.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border border-base-200 hover:bg-base-200/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${election.status === "Active" ? "bg-success" : "bg-base-300"}`} />
                      <div>
                        <p className="font-semibold text-sm">{election.name}</p>
                        <p className="text-xs text-base-content/50">{election.status}</p>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 flex flex-wrap gap-x-6 gap-y-1 text-xs text-base-content/60">
                      <span>Positions: <strong className="text-base-content">{statsEntry?.positions ?? positions.length}</strong></span>
                      <span>Candidates: <strong className="text-base-content">{statsEntry?.candidates ?? candidates.length}</strong></span>
                      <span>Votes: <strong className="text-base-content">{statsEntry?.votes ?? 0}</strong></span>
                      <span>Turnout: <strong className="text-base-content">{turnoutValue}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
