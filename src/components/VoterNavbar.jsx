import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useElectionStore } from "@/store/useElectionStore";
import toast from "react-hot-toast";

const VoterNavbar = () => {
  const router = useRouter();

  const { voter, setVoter } = useElectionStore();

  useEffect(() => {
    async function fetchVoter() {
      const res = await fetch("/api/fetch/voter", { cache: "no-store" });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.message);
        return router.push("/");
      }
      setVoter(result.data);
    }
    fetchVoter();
  }, []);

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    const result = await response.json();
    if (result.success) {
      toast.success(result.message);
      router.push("/");
    }
  };

  return (
    <header className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <img
          src={voter?.photo || "/profile.jpg"}
          alt="Profile"
          className="w-16 h-16 rounded-full border"
        />
        <div>
          {voter && voter.name ? (
            <>
              <h1 className="text-xl font-bold">
                {String(voter.name).toUpperCase()}
              </h1>
              <p className="text-gray-500">Voter ID: {voter.cnic}</p>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
      >
        Logout
      </button>
    </header>
  );
};

export default VoterNavbar;
