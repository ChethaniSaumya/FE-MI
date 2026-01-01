"use client";
import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const mockRoles = [
  { id: 1, name: "Super Admin" },
  { id: 2, name: "Admin" },
  { id: 3, name: "Musician" },
];

export default function UserRolesPage() {
  const [roles, setRoles] = useState(mockRoles);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(roles.length / pageSize));
  const paginatedRoles = roles.slice((page - 1) * pageSize, page * pageSize);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");

  function handleAddRole() {
    if (!newRole.trim()) {
      setError("Role name is required");
      return;
    }
    if (newRole.trim().length < 3) {
      setError("Role name must be at least 3 characters");
      return;
    }
    setRoles([
      ...roles,
      { id: roles.length + 1, name: newRole.trim() },
    ]);
    setShowAddModal(false);
    setNewRole("");
    setError("");
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setNewRole("");
    setError("");
  }

  return (
    <div className="min-h-screen p-8 bg-[#081028]">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Users <span className="text-lg font-normal text-gray-400 ml-4">User Roles</span></h1>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search for..."
                className="w-64 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43]"
              />
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#101936] text-white border border-[#232B43] hover:bg-[#232B43] transition w-full sm:w-auto justify-center"
              onClick={() => setShowAddModal(true)}
            >
              <span className="text-xl font-bold">+</span> Add Role
            </button>
          </div>
        </div>
      <div className="overflow-x-auto rounded-2xl shadow-xl bg-[#101936]">
        <table className="min-w-full text-white">
          <thead>
            <tr className="bg-[#19213A] text-[#C7C7C7] text-left text-sm">
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoles.map((role, idx) => (
              <tr
                key={role.id + '-' + idx}
                className={
                  idx % 2 === 0
                    ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                    : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                }
              >
                <td className="px-6 py-4">{role.name}</td>
                <td className="px-6 py-4 flex gap-4 text-lg">
                  <button className="hover:text-[#E100FF] transition-colors" title="Edit"><FaEdit /></button>
                  <button className="hover:text-red-500 transition-colors" title="Delete"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 text-white">
        <span className="text-sm text-gray-400">
          Showing data {roles.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, roles.length)} of {roles.length} entries
        </span>
        <div className="flex gap-2 items-center">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${page === 1 ? 'bg-[#232B43] text-gray-500' : 'bg-[#232B43] hover:bg-[#E100FF] hover:text-white'} transition-colors`}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            {'<'}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${page === num ? 'bg-[#E100FF] text-white' : 'bg-[#232B43] text-gray-300 hover:bg-[#E100FF] hover:text-white'} transition-colors`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${page === totalPages ? 'bg-[#232B43] text-gray-500' : 'bg-[#232B43] hover:bg-[#E100FF] hover:text-white'} transition-colors`}
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            {'>'}
          </button>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192B4D]/10 backdrop-blur-sm">
          <div className="bg-[#192B4D] rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-[#232B43] relative">
            <h2 className="text-2xl font-bold text-white mb-6">Add Role</h2>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">Role Name</label>
              <input
                type="text"
                value={newRole}
                onChange={e => { setNewRole(e.target.value); setError(""); }}
                className={`w-full px-4 py-2 rounded-lg bg-[#181F36] text-white border ${error ? 'border-pink-500' : 'border-[#232B43]'} focus:outline-none`}
                placeholder="Enter role name"
                minLength={3}
                autoFocus
              />
              {error && <div className="text-pink-400 mt-2 text-sm font-medium">{error}</div>}
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                className="px-4 py-2 rounded-lg bg-[#232B43] text-white hover:bg-[#181F36] transition"
                onClick={handleCloseModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#E100FF] text-white hover:bg-[#c800d6] transition disabled:opacity-50"
                onClick={handleAddRole}
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 