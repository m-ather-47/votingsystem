"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useElectionStore } from "@/store/useElectionStore";

export default function ManageVoter() {
  const router = useRouter();
  const { voters, setVoters, setVotersData } = useElectionStore();

  const [search, setSearch] = useState("");
  const [editingVoter, setEditingVoter] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    cnic: "",
    dob: "",
    photo: "",
    status: "",
  });
  const [newVoter, setNewVoter] = useState({
    name: "",
    cnic: "",
    dob: "",
    status: "Not Voted",
    photo: "/profile.jpg",
  });

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/admin/voter", { cache: "no-store" });
      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.replace("/admin/login");
        return;
      }
      const result = await res.json();
      if (result.success) {
        setVoters(result.data || []);
      }
    };
    init();
  }, []);

  const handleCreate = async () => {
    if (!newVoter.name || !newVoter.cnic || !newVoter.dob) {
      return toast.error("Please provide name, CNIC, and DOB.");
    }
    try {
      const response = await fetch("/api/admin/voter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVoter),
      });
      const result = await response.json();

      if (!result.success) {
        return toast.error(result.message || "Failed to create voter.");
      }

      toast.success(result.message || "Voter created.");
      setNewVoter({
        name: "",
        cnic: "",
        dob: "",
        status: "Not Voted",
        photo: "/profile.jpg",
      });
      await setVotersData();
    } catch (error) {
      toast.error("Failed to create voter.");
    }
  };

  const handleSave = async (id) => {
    try {
      const response = await fetch(`/api/admin/voter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });
      const result = await response.json();

      if (!result.success) {
        return toast.error(result.message || "Failed to update voter.");
      }

      toast.success(result.message || "Voter updated.");
      setEditingVoter(null);
      await setVotersData();
    } catch (error) {
      toast.error("Failed to update voter.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this voter? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/admin/voter/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!result.success) {
        return toast.error(result.message || "Failed to delete voter.");
      }

      setVoters(voters.filter((v) => (v.id || v.cnic) !== id));
      toast.success(result.message || "Voter deleted.");
    } catch (error) {
      toast.error("Failed to delete voter.");
    }
  };

  const filteredVoters = voters.filter((voter) => {
    const target = `${voter.name} ${voter.cnic}`.toLowerCase();
    return target.includes(search.toLowerCase());
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const statusBadge = (status) => {
    const map = {
      Voted: "badge-success",
      "Not Voted": "badge-warning",
      Active: "badge-info",
      Inactive: "badge-ghost",
    };
    return map[status] || "badge-ghost";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1>Voter Management</h1>
        <p>Register new voters and manage existing voter records.</p>
      </div>

      {/* Add Voter Form */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Register New Voter</h2>
        </div>
        <div className="section-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Full Name</span></label>
              <input
                type="text"
                placeholder="e.g. Muhammad Ali"
                value={newVoter.name}
                onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">CNIC</span></label>
              <input
                type="text"
                placeholder="XXXXX-XXXXXXX-X"
                value={newVoter.cnic}
                onChange={(e) => setNewVoter({ ...newVoter, cnic: e.target.value })}
                className="input input-bordered input-sm w-full font-mono"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Date of Birth</span></label>
              <input
                type="date"
                value={newVoter.dob}
                onChange={(e) => setNewVoter({ ...newVoter, dob: e.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Status</span></label>
              <select
                value={newVoter.status}
                onChange={(e) => setNewVoter({ ...newVoter, status: e.target.value })}
                className="select select-bordered select-sm w-full"
              >
                <option value="Not Voted">Not Voted</option>
                <option value="Voted">Voted</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Photo URL</span></label>
              <input
                type="text"
                placeholder="/profile.jpg"
                value={newVoter.photo}
                onChange={(e) => setNewVoter({ ...newVoter, photo: e.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleCreate} className="btn btn-primary btn-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Register Voter
            </button>
          </div>
        </div>
      </div>

      {/* Voters Table */}
      <div className="section-card">
        <div className="section-card-header !flex-wrap gap-3">
          <h2>All Voters ({filteredVoters.length})</h2>
          <div className="relative w-full sm:w-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by name or CNIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered input-sm pl-9 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/50">
                <th>Photo</th>
                <th>Name</th>
                <th>CNIC</th>
                <th>DOB</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-base-content/50">
                    No voters found.
                  </td>
                </tr>
              ) : (
                filteredVoters.map((voter) => {
                  const voterId = voter.id || voter.cnic;
                  const isEditing = editingVoter === voterId;

                  return (
                    <tr key={voterId} className="hover:bg-base-200/30 transition-colors">
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedData.photo}
                            onChange={(e) => setEditedData({ ...editedData, photo: e.target.value })}
                            className="input input-bordered input-xs w-28"
                            placeholder="Photo URL"
                          />
                        ) : (
                          <div className="avatar">
                            <div className="w-9 h-9 rounded-full ring ring-base-200 ring-offset-1">
                              <img src={voter.photo || "/profile.jpg"} alt={voter.name} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedData.name}
                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                            className="input input-bordered input-xs w-full"
                          />
                        ) : (
                          String(voter.name).toUpperCase()
                        )}
                      </td>
                      <td className="font-mono text-xs">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedData.cnic}
                            onChange={(e) => setEditedData({ ...editedData, cnic: e.target.value })}
                            className="input input-bordered input-xs w-full font-mono"
                          />
                        ) : (
                          voter.cnic
                        )}
                      </td>
                      <td className="text-sm">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editedData.dob || ""}
                            onChange={(e) => setEditedData({ ...editedData, dob: e.target.value })}
                            className="input input-bordered input-xs"
                          />
                        ) : (
                          formatDate(voter.dob)
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editedData.status}
                            onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
                            className="select select-bordered select-xs"
                          >
                            <option value="Not Voted">Not Voted</option>
                            <option value="Voted">Voted</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`badge badge-sm ${statusBadge(voter.status)}`}>
                            {voter.status}
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        {isEditing ? (
                          <div className="join">
                            <button onClick={() => handleSave(voterId)} className="btn btn-xs btn-success join-item">Save</button>
                            <button onClick={() => setEditingVoter(null)} className="btn btn-xs btn-ghost join-item">Cancel</button>
                          </div>
                        ) : (
                          <div className="join">
                            <button
                              onClick={() => {
                                setEditingVoter(voterId);
                                setEditedData({
                                  name: voter.name || "",
                                  cnic: voter.cnic || "",
                                  dob: formatDate(voter.dob),
                                  status: voter.status || "Not Voted",
                                  photo: voter.photo || "",
                                });
                              }}
                              className="btn btn-xs btn-ghost text-warning join-item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(voterId)}
                              className="btn btn-xs btn-ghost text-error join-item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
