"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useElectionStore } from "@/store/useElectionStore";
import toast from "react-hot-toast";

const VoterNavbar = () => {
  const router = useRouter();
  const { voter, setVoter } = useElectionStore();

  useEffect(() => {
    async function fetchVoter() {
      try {
        const res = await fetch("/api/fetch/voter", { cache: "no-store" });
        const result = await res.json();
        if (!result.success) {
          toast.error(result.message);
          return router.push("/");
        }
        setVoter(result.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchVoter();
  }, [setVoter, router]);

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    const result = await response.json();
    if (result.success) {
      toast.success(result.message);
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-base-200 bg-base-100/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">VoteSecure</span>
            <span className="badge badge-sm badge-ghost">Voter Portal</span>
          </div>

          <div className="flex items-center gap-3">
            {voter && (
              <div className="hidden sm:flex items-center gap-3 pr-3 border-r border-base-200">
                <div className="text-right">
                  <div className="text-sm font-semibold leading-tight">{voter.name}</div>
                  <div className="text-xs text-base-content/50 font-mono">{voter.cnic}</div>
                </div>
                <div className="avatar">
                  <div className="w-9 rounded-full ring-2 ring-base-200">
                    <img
                      alt="Profile"
                      src={voter.photo || "/profile.jpg"}
                    />
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm text-error hover:bg-error/10 gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default VoterNavbar;
