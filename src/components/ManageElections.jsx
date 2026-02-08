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
    photo: "/profile.jpg",
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
      setNewCandidate({ name: "", party: "", photo: "/profile.jpg" });
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">Create Election</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Election Name"
            value={newElection.name}
            onChange={(e) =>
              setNewElection({ ...newElection, name: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
          <select
            value={newElection.status}
            onChange={(e) =>
              setNewElection({ ...newElection, status: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
          <button
            onClick={handleCreateElection}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
          >
            Save Election
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Elections</h2>
          {isLoading ? <span className="text-sm text-gray-500">Loading...</span> : null}
        </div>
        {elections.length === 0 ? (
          <p className="text-gray-500">No elections found.</p>
        ) : (
          <div className="space-y-3">
            {elections.map((election) => (
              <div
                key={election.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div>
                  {editingElectionId === election.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingElection.name}
                        onChange={(e) =>
                          setEditingElection({
                            ...editingElection,
                            name: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                      <select
                        value={editingElection.status}
                        onChange={(e) =>
                          setEditingElection({
                            ...editingElection,
                            status: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-lg">{election.name}</p>
                      <p className="text-sm text-gray-500">Status: {election.status}</p>
                    </>
                  )}
                </div>
                <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
                  {editingElectionId === election.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateElection(election.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingElectionId(null)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedElectionId(election.id);
                          setSelectedPositionId("");
                        }}
                        className={`px-3 py-1 rounded ${
                          selectedElectionId === election.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        Select
                      </button>
                      <button
                        onClick={() => {
                          setEditingElectionId(election.id);
                          setEditingElection({
                            name: election.name,
                            status: election.status,
                          });
                        }}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteElection(election.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">Manage Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <select
            value={selectedElectionId}
            onChange={(e) => {
              setSelectedElectionId(e.target.value);
              setSelectedPositionId("");
            }}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Select Election</option>
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Position Name"
            value={newPositionName}
            onChange={(e) => setNewPositionName(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
          <button
            onClick={handleCreatePosition}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow"
          >
            Add Position
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {selectedPositions.length === 0 ? (
            <p className="text-gray-500">No positions for this election.</p>
          ) : (
            selectedPositions.map((position) => (
              <div
                key={position.id}
                className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div>
                  {editingPositionId === position.id ? (
                    <input
                      type="text"
                      value={editingPositionName}
                      onChange={(e) => setEditingPositionName(e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    <p className="font-medium">{position.name}</p>
                  )}
                </div>
                <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
                  {editingPositionId === position.id ? (
                    <>
                      <button
                        onClick={() => handleUpdatePosition(position.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPositionId(null)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedPositionId(position.id);
                        }}
                        className={`px-3 py-1 rounded ${
                          selectedPositionId === position.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        Select
                      </button>
                      <button
                        onClick={() => {
                          setEditingPositionId(position.id);
                          setEditingPositionName(position.name);
                        }}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePosition(position.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">Manage Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <select
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Select Position</option>
            {selectedPositions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Candidate Name"
            value={newCandidate.name}
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, name: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Party Name"
            value={newCandidate.party}
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, party: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Photo URL"
            value={newCandidate.photo}
            onChange={(e) =>
              setNewCandidate({ ...newCandidate, photo: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={handleCreateCandidate}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow"
        >
          Add Candidate
        </button>

        <div className="mt-6 space-y-2">
          {selectedPositionId && selectedCandidates.length === 0 ? (
            <p className="text-gray-500">No candidates for this position.</p>
          ) : null}
          {!selectedPositionId && selectedCandidates.length === 0 ? (
            <p className="text-gray-500">No candidates for this election.</p>
          ) : null}
          {selectedCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={candidate.photo || "/profile.jpg"}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  {editingCandidateId === candidate.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingCandidate.name}
                        onChange={(e) =>
                          setEditingCandidate({
                            ...editingCandidate,
                            name: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                      <input
                        type="text"
                        value={editingCandidate.party}
                        onChange={(e) =>
                          setEditingCandidate({
                            ...editingCandidate,
                            party: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                      <input
                        type="text"
                        value={editingCandidate.photo}
                        onChange={(e) =>
                          setEditingCandidate({
                            ...editingCandidate,
                            photo: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.party}</p>
                      <p className="text-xs text-gray-400">{candidate.position}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
                {editingCandidateId === candidate.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateCandidate(candidate.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCandidateId(null)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingCandidateId(candidate.id);
                        setEditingCandidate({
                          name: candidate.name,
                          party: candidate.party,
                          photo: candidate.photo || "",
                        });
                      }}
                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageElections;
