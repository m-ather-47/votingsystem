"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const ManageElections = () => {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [newElection, setNewElection] = useState({
    name: "",
    status: "Active",
  });
  const [newPositionName, setNewPositionName] = useState("");
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    party: "",
    photo: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
  });

  const [editingElectionId, setEditingElectionId] = useState(null);
  const [editingElection, setEditingElection] = useState({ name: "", status: "Active" });
  const [editingPositionId, setEditingPositionId] = useState(null);
  const [editingPositionName, setEditingPositionName] = useState("");
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState({
    name: "",
    party: "",
    photo: "",
  });

  const fetchElections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/election", { cache: "no-store" });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to fetch elections.");
        return;
      }
      setElections(result.data || []);
      if (!selectedElectionId && result.data?.length) {
        setSelectedElectionId(result.data[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch elections.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const selectedElection = useMemo(
    () => elections.find((election) => election.id === selectedElectionId),
    [elections, selectedElectionId]
  );

  const selectedPositions = selectedElection?.positions || [];
  const selectedPosition = selectedPositions.find(
    (position) => position.id === selectedPositionId
  );
  const allCandidates = selectedPositions.flatMap(
    (position) => position.candidates || []
  );
  const selectedCandidates = selectedPositionId
    ? selectedPosition?.candidates || []
    : allCandidates;

  const handleCreateElection = async () => {
    if (!newElection.name) return;
    try {
      const response = await fetch("/api/admin/election", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newElection),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to create election.");
        return;
      }
      toast.success(result.message || "Election created.");
      setNewElection({ name: "", status: "Active" });
      await fetchElections();
    } catch (error) {
      toast.error("Failed to create election.");
    }
  };

  const handleUpdateElection = async (electionId) => {
    try {
      const response = await fetch(`/api/admin/election/${electionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingElection),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to update election.");
        return;
      }
      toast.success(result.message || "Election updated.");
      setEditingElectionId(null);
      await fetchElections();
    } catch (error) {
      toast.error("Failed to update election.");
    }
  };

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm("Delete this election? This will remove all positions.")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/election/${electionId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to delete election.");
        return;
      }
      toast.success(result.message || "Election deleted.");
      setSelectedElectionId("");
      setSelectedPositionId("");
      await fetchElections();
    } catch (error) {
      toast.error("Failed to delete election.");
    }
  };

  const handleCreatePosition = async () => {
    if (!selectedElectionId || !newPositionName) return;
    try {
      const response = await fetch("/api/admin/position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          electionId: selectedElectionId,
          name: newPositionName,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to create position.");
        return;
      }
      toast.success(result.message || "Position created.");
      setNewPositionName("");
      await fetchElections();
    } catch (error) {
      toast.error("Failed to create position.");
    }
  };

  const handleUpdatePosition = async (positionId) => {
    if (!editingPositionName) return;
    try {
      const response = await fetch(`/api/admin/position/${positionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingPositionName }),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to update position.");
        return;
      }
      toast.success(result.message || "Position updated.");
      setEditingPositionId(null);
      await fetchElections();
    } catch (error) {
      toast.error("Failed to update position.");
    }
  };

  const handleDeletePosition = async (positionId) => {
    if (!window.confirm("Delete this position and its candidates?")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/position/${positionId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to delete position.");
        return;
      }
      toast.success(result.message || "Position deleted.");
      setSelectedPositionId("");
      await fetchElections();
    } catch (error) {
      toast.error("Failed to delete position.");
    }
  };

  const handleCreateCandidate = async () => {
    if (!selectedElectionId || !selectedPositionId) {
      toast.error("Select an election and position.");
      return;
    }
    if (!newCandidate.name || !newCandidate.party) return;

    try {
      const response = await fetch("/api/admin/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCandidate.name,
          party: newCandidate.party,
          photo: newCandidate.photo,
          position: selectedPosition?.name || "",
          positionId: selectedPositionId,
          electionId: selectedElectionId,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to create candidate.");
        return;
      }
      toast.success(result.message || "Candidate created.");
      setNewCandidate({ name: "", party: "", photo: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" });
      await fetchElections();
    } catch (error) {
      toast.error("Failed to create candidate.");
    }
  };

  const handleUpdateCandidate = async (candidateId) => {
    try {
      const response = await fetch(`/api/admin/candidate/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCandidate.name,
          party: editingCandidate.party,
          photo: editingCandidate.photo,
          positionId: selectedPositionId,
          position: selectedPosition?.name || "",
          electionId: selectedElectionId,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to update candidate.");
        return;
      }
      toast.success(result.message || "Candidate updated.");
      setEditingCandidateId(null);
      await fetchElections();
    } catch (error) {
      toast.error("Failed to update candidate.");
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      const response = await fetch(`/api/admin/candidate/${candidateId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.message || "Failed to delete candidate.");
        return;
      }
      toast.success(result.message || "Candidate deleted.");
      await fetchElections();
    } catch (error) {
      toast.error("Failed to delete candidate.");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Create Election */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
            <h2 className="card-title">Create New Election</h2>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Election Name</span>
                    </label>
                    <input
                        type="text"
                        placeholder="E.g., General Election 2024"
                        value={newElection.name}
                        onChange={(e) => setNewElection({ ...newElection, name: e.target.value })}
                        className="input input-bordered w-full"
                    />
                </div>
                 <div className="form-control w-full md:w-1/4">
                     <label className="label">
                        <span className="label-text">Status</span>
                    </label>
                    <select
                        value={newElection.status}
                        onChange={(e) => setNewElection({ ...newElection, status: e.target.value })}
                        className="select select-bordered w-full"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>
                 <div className="form-control">
                    <button
                        onClick={handleCreateElection}
                        className="btn btn-primary"
                    >
                        Create Election
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Manage Elections (List) */}
      <div className="card bg-base-100 shadow-xl">
         <div className="card-body">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="card-title">Active Elections</h2>
                 {isLoading && <span className="loading loading-spinner loading-md"></span>}
            </div>

            {elections.length === 0 ? (
                <div className="alert">No elections found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                         <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {elections.map((election) => (
                                <tr key={election.id} className={selectedElectionId === election.id ? "bg-base-200" : ""}>
                                    <td>
                                        {editingElectionId === election.id ? (
                                            <input
                                                type="text"
                                                value={editingElection.name}
                                                onChange={(e) => setEditingElection({...editingElection, name: e.target.value})}
                                                className="input input-bordered input-sm w-full max-w-xs"
                                            />
                                        ) : (
                                            <span className="font-semibold">{election.name}</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingElectionId === election.id ? (
                                             <select
                                                value={editingElection.status}
                                                onChange={(e) => setEditingElection({...editingElection, status: e.target.value})}
                                                className="select select-bordered select-sm"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        ) : (
                                            <div className={`badge ${election.status === 'Active' ? 'badge-success text-white' : 'badge-ghost'}`}>
                                                {election.status}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="join">
                                            {editingElectionId === election.id ? (
                                                <>
                                                 <button onClick={() => handleUpdateElection(election.id)} className="btn btn-sm btn-success join-item text-white">Save</button>
                                                 <button onClick={() => setEditingElectionId(null)} className="btn btn-sm btn-ghost join-item">Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedElectionId(election.id);
                                                            setSelectedPositionId("");
                                                        }}
                                                        className={`btn btn-sm join-item ${selectedElectionId === election.id ? 'btn-primary' : 'btn-outline'}`}
                                                    >
                                                        Select
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setEditingElectionId(election.id);
                                                            setEditingElection({ name: election.name, status: election.status });
                                                        }}
                                                        className="btn btn-sm btn-warning join-item text-white"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteElection(election.id)} className="btn btn-sm btn-error join-item text-white">Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
         </div>
      </div>

     {/* 3. Manage Positions section */}
     {selectedElectionId && (
         <div className="card bg-base-100 shadow-xl">
             <div className="card-body">
                 <h2 className="card-title">Manage Positions: {selectedElection?.name}</h2>
                 
                 <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-base-200 p-4 rounded-lg">
                      <div className="form-control w-full">
                        <label className="label"><span className="label-text">New Position Name</span></label>
                         <input
                            type="text"
                            placeholder="E.g. President, Secretary"
                            value={newPositionName}
                            onChange={(e) => setNewPositionName(e.target.value)}
                            className="input input-bordered w-full"
                        />
                      </div>
                      <button onClick={handleCreatePosition} className="btn btn-secondary">Add Position</button>
                 </div>

                 <div className="space-y-2">
                     {selectedPositions.length === 0 ? (
                         <div className="alert text-sm">No positions defined for this election yet.</div>
                     ) : (
                         selectedPositions.map((position) => (
                             <div key={position.id} className="flex flex-col md:flex-row items-center justify-between p-3 border rounded-lg hover:bg-base-200 transition">
                                 <div className="flex-1">
                                      {editingPositionId === position.id ? (
                                        <input
                                          type="text"
                                          value={editingPositionName}
                                          onChange={(e) => setEditingPositionName(e.target.value)}
                                          className="input input-bordered input-sm w-full max-w-xs"
                                        />
                                      ) : (
                                        <div className="font-semibold text-lg">{position.name}</div>
                                      )}
                                 </div>
                                 <div className="join mt-2 md:mt-0">
                                      {editingPositionId === position.id ? (
                                          <>
                                            <button onClick={() => handleUpdatePosition(position.id)} className="btn btn-sm btn-success join-item text-white">Save</button>
                                            <button onClick={() => setEditingPositionId(null)} className="btn btn-sm btn-ghost join-item">Cancel</button>
                                          </>
                                      ) : (
                                          <>
                                            <button 
                                                onClick={() => setSelectedPositionId(position.id)} 
                                                className={`btn btn-sm join-item ${selectedPositionId === position.id ? 'btn-active btn-secondary' : 'btn-outline btn-secondary'}`}
                                            >
                                                Select Candidates
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingPositionId(position.id);
                                                    setEditingPositionName(position.name);
                                                }}
                                                className="btn btn-sm btn-warning join-item text-white"
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeletePosition(position.id)} className="btn btn-sm btn-error join-item text-white">Delete</button>
                                          </>
                                      )}
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
             </div>
         </div>
     )}

     {/* 4. Manage Candidates */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
            <h2 className="card-title mb-4">Manage Candidates</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-base-200 p-4 rounded-lg mb-6">
                <div className="form-control">
                    <label className="label"><span className="label-text">Select Position</span></label>
                    <select
                        value={selectedPositionId}
                        onChange={(e) => setSelectedPositionId(e.target.value)}
                        className="select select-bordered w-full"
                    >
                        <option value="">All Positions</option>
                        {selectedPositions.map((position) => (
                        <option key={position.id} value={position.id}>
                            {position.name}
                        </option>
                        ))}
                    </select>
                </div>
                 <div className="form-control">
                    <label className="label"><span className="label-text">Candidate Name</span></label>
                    <input
                        type="text"
                         placeholder="Name"
                        value={newCandidate.name}
                        onChange={(e) =>
                        setNewCandidate({ ...newCandidate, name: e.target.value })
                        }
                        className="input input-bordered w-full"
                    />
                 </div>
                 <div className="form-control">
                    <label className="label"><span className="label-text">Party</span></label>
                     <input
                        type="text"
                        placeholder="Party"
                        value={newCandidate.party}
                        onChange={(e) =>
                        setNewCandidate({ ...newCandidate, party: e.target.value })
                        }
                        className="input input-bordered w-full"
                    />
                 </div>
                 <div className="form-control">
                    <label className="label"><span className="label-text">Photo URL</span></label>
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={newCandidate.photo}
                        onChange={(e) =>
                        setNewCandidate({ ...newCandidate, photo: e.target.value })
                        }
                        className="input input-bordered w-full"
                    />
                 </div>
                 <button
                    onClick={handleCreateCandidate}
                    className="btn btn-primary"
                    disabled={!selectedPositionId}
                >
                    Add Candidate
                </button>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {selectedCandidates.length === 0 ? (
                      <div className="col-span-full alert">No candidates found. Select a position above to add candidates.</div>
                 ) : (
                     selectedCandidates.map((candidate) => (
                         <div key={candidate.id} className="card bg-base-100 border shadow-sm hover:shadow-md transition">
                             <div className="card-body flex-row items-center p-4 gap-4">
                                
                                  {editingCandidateId === candidate.id ? (
                                         <div className="flex flex-col gap-2 w-full">
                                            <input
                                                type="text"
                                                value={editingCandidate.name}
                                                onChange={(e) => setEditingCandidate({...editingCandidate, name: e.target.value})}
                                                className="input input-bordered input-sm"
                                            />
                                             <input
                                                type="text"
                                                value={editingCandidate.party}
                                                onChange={(e) => setEditingCandidate({...editingCandidate, party: e.target.value})}
                                                className="input input-bordered input-sm"
                                            />
                                             <input
                                                type="text"
                                                value={editingCandidate.photo}
                                                onChange={(e) => setEditingCandidate({...editingCandidate, photo: e.target.value})}
                                                className="input input-bordered input-sm"
                                            />
                                             <div className="flex gap-2 mt-2">
                                                 <button onClick={() => handleUpdateCandidate(candidate.id)} className="btn btn-xs btn-success text-white">Save</button>
                                                 <button onClick={() => setEditingCandidateId(null)} className="btn btn-xs btn-ghost">Cancel</button>
                                             </div>
                                         </div>
                                  ) : (
                                       <>
                                        <div className="avatar">
                                            <div className="w-16 rounded-full">
                                                <img src={candidate.photo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={candidate.name} />
                                            </div>
                                        </div>
                                         <div className="flex-1">
                                             <h3 className="font-bold">{candidate.name}</h3>
                                             <div className="text-sm opacity-75">{candidate.party}</div>
                                             <div className="text-xs badge badge-outline mt-1">{candidate.position}</div>
                                         </div>
                                         <div className="flex flex-col gap-1">
                                             <button 
                                                onClick={() => {
                                                    setEditingCandidateId(candidate.id);
                                                    setEditingCandidate({
                                                        name: candidate.name,
                                                        party: candidate.party,
                                                        photo: candidate.photo || "",
                                                    });
                                                }}
                                                className="btn btn-xs btn-warning text-white"
                                            >
                                                Edit
                                            </button>
                                             <button onClick={() => handleDeleteCandidate(candidate.id)} className="btn btn-xs btn-error text-white">Delete</button>
                                         </div>
                                       </>
                                  )}
                             </div>
                         </div>
                     ))
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default ManageElections;
