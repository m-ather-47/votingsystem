"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useElectionStore } from "@/store/useElectionStore";

export default function ManageVoter() {
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
    if (!voters || voters.length === 0) {
      setVotersData();
    }
  }, [voters, setVotersData]);

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

  // Handle Delete
  const handleDelete = async (id) => {
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">Manage Voters</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Add Voter</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={newVoter.name}
            onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="CNIC"
            value={newVoter.cnic}
            onChange={(e) => setNewVoter({ ...newVoter, cnic: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            value={newVoter.dob}
            onChange={(e) => setNewVoter({ ...newVoter, dob: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={newVoter.status}
            onChange={(e) => setNewVoter({ ...newVoter, status: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="Not Voted">Not Voted</option>
            <option value="Voted">Voted</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <input
            type="text"
            placeholder="Photo URL"
            value={newVoter.photo}
            onChange={(e) => setNewVoter({ ...newVoter, photo: e.target.value })}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Create Voter
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">All Voters</h2>
          <input
            type="text"
            placeholder="Search by name or CNIC"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Photo</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">CNIC</th>
                <th className="px-4 py-2 text-left">DOB</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoters.map((voter) => (
                <tr
                  key={voter.id || voter.cnic}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-2">
                    {editingVoter === (voter.id || voter.cnic) ? (
                      <input
                        type="text"
                        value={editedData.photo}
                        onChange={(e) =>
                          setEditedData({ ...editedData, photo: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Photo URL"
                      />
                    ) : (
                      <img
                        src={voter.photo || "/profile.jpg"}
                        alt={voter.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingVoter === (voter.id || voter.cnic) ? (
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) =>
                          setEditedData({ ...editedData, name: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      String(voter.name).toUpperCase()
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingVoter === (voter.id || voter.cnic) ? (
                      <input
                        type="text"
                        value={editedData.cnic}
                        onChange={(e) =>
                          setEditedData({ ...editedData, cnic: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      voter.cnic
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingVoter === (voter.id || voter.cnic) ? (
                      <input
                        type="date"
                        value={editedData.dob || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, dob: e.target.value })
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      voter.dob
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingVoter === (voter.id || voter.cnic) ? (
                      <select
                        value={editedData.status}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            status: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="Not Voted">Not Voted</option>
                        <option value="Voted">Voted</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          voter.status === "Voted"
                            ? "bg-green-200 text-green-700"
                            : "bg-yellow-200 text-yellow-700"
                        }`}
                      >
                        {voter.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {editingVoter === (voter.id || voter.cnic) ? (
                      <>
                        <button
                          onClick={() => handleSave(voter.id || voter.cnic)}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingVoter(null)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingVoter(voter.id || voter.cnic);
                            setEditedData({
                              name: voter.name || "",
                              cnic: voter.cnic || "",
                              dob: voter.dob || "",
                              status: voter.status || "Not Voted",
                              photo: voter.photo || "",
                            });
                          }}
                          className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(voter.id || voter.cnic)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
