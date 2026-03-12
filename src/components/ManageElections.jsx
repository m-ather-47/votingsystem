"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ManageElections = () => {
  const router = useRouter();
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
      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.replace("/admin/login");
        return;
      }
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1>Manage Elections</h1>
        <p>Create and manage elections, positions, and candidates.</p>
      </div>

      {/* Create Election */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Create Election</h2>
        </div>
        <div className="section-card-body">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="form-control flex-1">
              <label className="label"><span className="label-text text-xs font-medium">Election Name</span></label>
              <input
                type="text"
                placeholder="e.g. General Election 2026"
                value={newElection.name}
                onChange={(e) => setNewElection({ ...newElection, name: e.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </div>
            <div className="form-control w-full sm:w-40">
              <label className="label"><span className="label-text text-xs font-medium">Status</span></label>
              <select
                value={newElection.status}
                onChange={(e) => setNewElection({ ...newElection, status: e.target.value })}
                className="select select-bordered select-sm w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button onClick={handleCreateElection} className="btn btn-primary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Elections List */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Elections</h2>
          {isLoading && <span className="loading loading-spinner loading-sm text-base-content/40"></span>}
        </div>
        <div className="section-card-body p-0">
          {elections.length === 0 ? (
            <div className="text-center py-10 text-base-content/50 text-sm">No elections found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider">
                    <th>Name</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {elections.map((election) => (
                    <tr key={election.id} className={`hover ${selectedElectionId === election.id ? "bg-primary/5" : ""}`}>
                      <td>
                        {editingElectionId === election.id ? (
                          <input
                            type="text"
                            value={editingElection.name}
                            onChange={(e) => setEditingElection({...editingElection, name: e.target.value})}
                            className="input input-bordered input-xs w-full max-w-xs"
                          />
                        ) : (
                          <span className="font-medium text-sm">{election.name}</span>
                        )}
                      </td>
                      <td>
                        {editingElectionId === election.id ? (
                          <select
                            value={editingElection.status}
                            onChange={(e) => setEditingElection({...editingElection, status: e.target.value})}
                            className="select select-bordered select-xs"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Archived">Archived</option>
                          </select>
                        ) : (
                          <span className={`badge badge-sm ${election.status === "Active" ? "badge-success text-white" : election.status === "Inactive" ? "badge-warning text-white" : "badge-ghost"}`}>
                            {election.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          {editingElectionId === election.id ? (
                            <>
                              <button onClick={() => handleUpdateElection(election.id)} className="btn btn-xs btn-success text-white">Save</button>
                              <button onClick={() => setEditingElectionId(null)} className="btn btn-xs btn-ghost">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setSelectedElectionId(election.id); setSelectedPositionId(""); }}
                                className={`btn btn-xs ${selectedElectionId === election.id ? "btn-primary" : "btn-ghost"}`}
                              >
                                Select
                              </button>
                              <button
                                onClick={() => { setEditingElectionId(election.id); setEditingElection({ name: election.name, status: election.status }); }}
                                className="btn btn-xs btn-ghost text-warning"
                              >
                                Edit
                              </button>
                              <button onClick={() => handleDeleteElection(election.id)} className="btn btn-xs btn-ghost text-error">Delete</button>
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

      {/* Positions */}
      {selectedElectionId && (
        <div className="section-card">
          <div className="section-card-header">
            <h2>Positions &mdash; {selectedElection?.name}</h2>
          </div>
          <div className="section-card-body space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-base-200/50 rounded-lg border border-base-200">
              <div className="form-control flex-1">
                <label className="label"><span className="label-text text-xs font-medium">New Position</span></label>
                <input
                  type="text"
                  placeholder="e.g. President, Secretary"
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <button onClick={handleCreatePosition} className="btn btn-sm btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Position
              </button>
            </div>

            {selectedPositions.length === 0 ? (
              <div className="text-center py-8 text-base-content/50 text-sm">No positions defined for this election yet.</div>
            ) : (
              <div className="space-y-2">
                {selectedPositions.map((position) => (
                  <div key={position.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-base-200 hover:bg-base-200/30 transition gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      {editingPositionId === position.id ? (
                        <input
                          type="text"
                          value={editingPositionName}
                          onChange={(e) => setEditingPositionName(e.target.value)}
                          className="input input-bordered input-xs w-full max-w-xs"
                        />
                      ) : (
                        <span className="font-medium text-sm">{position.name}</span>
                      )}
                    </div>
                    <div className="flex gap-1 ml-5 sm:ml-0">
                      {editingPositionId === position.id ? (
                        <>
                          <button onClick={() => handleUpdatePosition(position.id)} className="btn btn-xs btn-success text-white">Save</button>
                          <button onClick={() => setEditingPositionId(null)} className="btn btn-xs btn-ghost">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedPositionId(position.id)}
                            className={`btn btn-xs ${selectedPositionId === position.id ? "btn-primary" : "btn-ghost"}`}
                          >
                            Candidates
                          </button>
                          <button
                            onClick={() => { setEditingPositionId(position.id); setEditingPositionName(position.name); }}
                            className="btn btn-xs btn-ghost text-warning"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeletePosition(position.id)} className="btn btn-xs btn-ghost text-error">Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidates */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Candidates</h2>
        </div>
        <div className="section-card-body space-y-6">
          {/* Add Candidate Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end p-4 bg-base-200/50 rounded-lg border border-base-200">
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Position</span></label>
              <select
                value={selectedPositionId}
                onChange={(e) => setSelectedPositionId(e.target.value)}
                className="select select-bordered select-sm w-full"
              >
                <option value="">All Positions</option>
                {selectedPositions.map((position) => (
                  <option key={position.id} value={position.id}>{position.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Name</span></label>
              <input
                type="text"
                placeholder="Candidate name"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Party</span></label>
              <input
                type="text"
                placeholder="Party name"
                value={newCandidate.party}
                onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Photo URL</span></label>
              <input
                type="text"
                placeholder="Image URL"
                value={newCandidate.photo}
                onChange={(e) => setNewCandidate({ ...newCandidate, photo: e.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </div>
            <button
              onClick={handleCreateCandidate}
              className="btn btn-primary btn-sm"
              disabled={!selectedPositionId}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add
            </button>
          </div>

          {/* Candidates Grid */}
          {selectedCandidates.length === 0 ? (
            <div className="text-center py-10 text-base-content/50 text-sm">
              No candidates found. Select a position above to add candidates.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCandidates.map((candidate) => (
                <div key={candidate.id} className="border border-base-200 rounded-lg p-4 hover:shadow-md transition bg-base-100">
                  {editingCandidateId === candidate.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingCandidate.name}
                        onChange={(e) => setEditingCandidate({...editingCandidate, name: e.target.value})}
                        className="input input-bordered input-sm w-full"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={editingCandidate.party}
                        onChange={(e) => setEditingCandidate({...editingCandidate, party: e.target.value})}
                        className="input input-bordered input-sm w-full"
                        placeholder="Party"
                      />
                      <input
                        type="text"
                        value={editingCandidate.photo}
                        onChange={(e) => setEditingCandidate({...editingCandidate, photo: e.target.value})}
                        className="input input-bordered input-sm w-full"
                        placeholder="Photo URL"
                      />
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleUpdateCandidate(candidate.id)} className="btn btn-xs btn-success text-white flex-1">Save</button>
                        <button onClick={() => setEditingCandidateId(null)} className="btn btn-xs btn-ghost flex-1">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="avatar shrink-0">
                        <div className="w-12 h-12 rounded-full ring-2 ring-base-200">
                          <img src={candidate.photo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={candidate.name} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{candidate.name}</h3>
                        <p className="text-xs text-base-content/60">{candidate.party}</p>
                        <span className="badge badge-ghost badge-xs mt-1">{candidate.position}</span>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingCandidateId(candidate.id);
                            setEditingCandidate({
                              name: candidate.name,
                              party: candidate.party,
                              photo: candidate.photo || "",
                            });
                          }}
                          className="btn btn-xs btn-ghost text-warning"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteCandidate(candidate.id)} className="btn btn-xs btn-ghost text-error">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageElections;
