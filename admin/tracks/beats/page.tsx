"use client";
import React, { useState } from "react";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { BeatCategory, initialBeats } from "./beatData";



export default function BeatCategoryPage() {
  const [beats, setBeats] = useState<BeatCategory[]>(initialBeats);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<BeatCategory | null>(null);
  const [editBeat, setEditBeat] = useState({ name: '', description: '' });
  const [newBeat, setNewBeat] = useState({ name: '', description: '' });
  const pageSize = 8;

  const totalPages = Math.ceil(beats.length / pageSize);
  const paginatedBeats = beats.slice((page - 1) * pageSize, page * pageSize);

  function handleSaveBeat() {
    // Add new beat to the list (simulate backend save)
    setBeats([
      ...beats,
      { id: beats.length + 1, name: newBeat.name, description: newBeat.description },
    ]);
    setShowAddModal(false);
    setNewBeat({ name: '', description: '' });
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setNewBeat({ name: '', description: '' });
  }

  function handleViewBeat(beat: BeatCategory) {
    setSelectedBeat(beat);
    setShowViewModal(true);
  }

  function handleCloseViewModal() {
    setShowViewModal(false);
    setSelectedBeat(null);
  }

  function handleEditBeat(beat: BeatCategory) {
    setSelectedBeat(beat);
    setEditBeat({ name: beat.name, description: beat.description });
    setShowEditModal(true);
  }

  function handleSaveEditBeat() {
    // Here you would typically update to your backend
    console.log('Updating beat:', selectedBeat?.id, editBeat);
    // Update the beat in the local state (simulate backend update)
    setBeats(beats.map(beat => 
      beat.id === selectedBeat?.id 
        ? { ...beat, name: editBeat.name, description: editBeat.description }
        : beat
    ));
    setShowEditModal(false);
    setSelectedBeat(null);
    setEditBeat({ name: '', description: '' });
  }

  function handleCloseEditModal() {
    setShowEditModal(false);
    setSelectedBeat(null);
    setEditBeat({ name: '', description: '' });
  }

  function handleDeleteBeat(beat: BeatCategory) {
    setSelectedBeat(beat);
    setShowDeleteModal(true);
  }

  function handleConfirmDelete() {
    // Here you would typically delete from your backend
    console.log('Deleting beat:', selectedBeat?.id);
    // Remove the beat from the local state (simulate backend delete)
    setBeats(beats.filter(beat => beat.id !== selectedBeat?.id));
    setShowDeleteModal(false);
    setSelectedBeat(null);
  }

  function handleCloseDeleteModal() {
    setShowDeleteModal(false);
    setSelectedBeat(null);
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#081028]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Track Management <span className="text-lg font-normal text-gray-400 ml-4">Beat Category</span></h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search for..."
            className="w-full sm:w-64 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43]"
          />
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#101936] text-white border border-[#232B43] hover:bg-[#232B43] transition"
          >
            <span className="text-xl">+</span> Add Category
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xl bg-[#101936]">
        <table className="min-w-full text-white">
          <thead>
            <tr className="bg-[#232B43] text-[#C7C7C7] text-left text-sm">
              <th className="px-6 py-4 font-semibold">Category Name</th>
              <th className="px-6 py-4 font-semibold">Description</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBeats.map((beat, idx) => (
              <tr
                key={beat.id + '-' + idx}
                className={
                  idx % 2 === 0
                    ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                    : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                }
              >
                <td className="px-6 py-4">{beat.name}</td>
                <td className="px-6 py-4">{beat.description}</td>
                <td className="px-6 py-4 flex gap-4 text-lg">
                  <button 
                    className="text-white hover:text-[#7ED7FF] transition-colors" 
                    title="View"
                    onClick={() => handleViewBeat(beat)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="text-white hover:text-[#E100FF] transition-colors" 
                    title="Edit"
                    onClick={() => handleEditBeat(beat)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="text-white hover:text-red-500 transition-colors" 
                    title="Delete"
                    onClick={() => handleDeleteBeat(beat)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {paginatedBeats.map((beat, idx) => (
          <div
            key={beat.id + '-' + idx}
            className="bg-[#101936] rounded-xl p-4 shadow-lg border border-[#232B43]"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{beat.name}</h3>
                <p className="text-gray-400 text-sm">{beat.description}</p>
              </div>
              <div className="flex gap-3 text-lg ml-4">
                <button 
                  className="text-white hover:text-[#7ED7FF] transition-colors p-1" 
                  title="View"
                  onClick={() => handleViewBeat(beat)}
                >
                  <FaEye />
                </button>
                <button 
                  className="text-white hover:text-[#E100FF] transition-colors p-1" 
                  title="Edit"
                  onClick={() => handleEditBeat(beat)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="text-white hover:text-red-500 transition-colors p-1" 
                  title="Delete"
                  onClick={() => handleDeleteBeat(beat)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-white gap-4">
        <span className="text-sm text-gray-400 text-center sm:text-left">
          Showing data {beats.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, beats.length)} of {beats.length} entries
        </span>
        <div className="flex gap-2 items-center">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${page === 1 ? 'bg-[#232B43] text-gray-500' : 'bg-[#232B43] hover:bg-[#E100FF] hover:text-white'} transition-colors`}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            &lt;
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
            &gt;
          </button>
        </div>
      </div>

      {/* Add Beat Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Add Beat Category</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newBeat.name}
                  onChange={(e) => setNewBeat({ ...newBeat, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF]"
                  placeholder="Enter beat category name..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newBeat.description}
                  onChange={(e) => setNewBeat({ ...newBeat, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] resize-none"
                  placeholder="Enter beat category description..."
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBeat}
                className="flex-1 py-2 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-[#c800d6] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Beat Modal */}
      {showViewModal && selectedBeat && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">View Beat Category Details</h2>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Name</label>
                <div className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43]">
                  {selectedBeat.name}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Description</label>
                <div className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43] min-h-[80px]">
                  {selectedBeat.description}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseViewModal}
                className="py-2 px-6 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Beat Modal */}
      {showEditModal && selectedBeat && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Beat Category</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editBeat.name}
                  onChange={(e) => setEditBeat({ ...editBeat, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF]"
                  placeholder="Enter beat category name..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={editBeat.description}
                  onChange={(e) => setEditBeat({ ...editBeat, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] resize-none"
                  placeholder="Enter beat category description..."
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCloseEditModal}
                className="flex-1 py-2 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditBeat}
                className="flex-1 py-2 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-[#c800d6] transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Beat Modal */}
      {showDeleteModal && selectedBeat && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Delete Beat</h2>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FaTrash className="text-2xl text-red-500" />
                </div>
                <p className="text-white text-lg mb-2">Are you sure you want to delete this beat category?</p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 py-2 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 