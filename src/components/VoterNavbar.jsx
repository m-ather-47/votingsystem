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
      // If we already have voter data, we might not need to fetch, 
      // but to be safe and get fresh status, we fetch.
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
    <div className="navbar bg-base-100 shadow-xl rounded-box mb-6">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl uppercase text-primary font-bold">
          E-Vote Potal
        </a>
      </div>
      <div className="flex-none gap-4">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar border border-base-300"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Profile"
                src={voter?.photo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-64"
          >
            {voter && (
              <li className="pointer-events-none mb-2">
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-base-200 rounded-box">
                  <div className="avatar">
                    <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={voter.photo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                        alt="Profile"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-base-content">{voter.name}</div>
                    <div className="text-sm text-base-content/70 font-mono tracking-wide">{voter.cnic}</div>
                  </div>
                </div>
              </li>
            )}
            <li>
              <button onClick={handleLogout} className="text-error font-bold flex justify-center">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoterNavbar;
