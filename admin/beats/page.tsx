"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaDrum } from "react-icons/fa";
import { beatAPI } from "../../utils/api";

interface Beat {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function BeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [newBeat, setNewBeat] = useState({ name: '', description: '', color: '#E100FF' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBeat, setDeletingBeat] = useState<Beat | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 8;

  useEffect(() => {
    loadBeats();
  }, []);

  async function loadBeats() {
    try {
      setLoading(true);
      const response = await beatAPI.getBeats();
      if (response.success) {
        setBeats(response.beats);
      }
    } catch (error) {
      console.error('Error loading beats:', error);
      setMessage('Failed to load beats');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(beats.length / pageSize);
  const paginatedBeats = beats.slice((page - 1) * pageSize, page * pageSize);

  async function handleSaveBeat() {
    if (!newBeat.name.trim()) {
      setMessage('Please enter a beat name');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await beatAPI.createBeat(newBeat);
      if (response.success) {
        setMessage('Beat created successfully!');
        setShowAddModal(false);
        setNewBeat({ name: '', description: '', color: '#E100FF' });
        loadBeats(); // Reload the list
      }
    } catch (error: any) {
      console.error('Error creating beat:', error);
      setMessage(error.response?.data?.message || 'Failed to create beat');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateBeat() {
    if (!editingBeat || !editingBeat.name.trim()) {
      setMessage('Please enter a beat name');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await beatAPI.updateBeat(editingBeat.id, {
        name: editingBeat.name,
        description: editingBeat.description,
        color: editingBeat.color
      });
      if (response.success) {
        setMessage('Beat updated successfully!');
        setShowEditModal(false);
        setEditingBeat(null);
        loadBeats(); // Reload the list
      }
    } catch (error: any) {
      console.error('Error updating beat:', error);
      setMessage(error.response?.data?.message || 'Failed to update beat');
    } finally {
      setIsSubmitting(false);
    }
  }

  const openDeleteModal = (beat: Beat) => {
    setDeletingBeat(beat);
    setShowDeleteModal(true);
    setMessage(''); // Clear any existing messages when opening modal
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingBeat(null);
    // Don't clear message here - let it display for success feedback
  };

  async function handleDeleteBeat() {
    if (!deletingBeat) return;
    
    setIsDeleting(true);
    try {
      const response = await beatAPI.deleteBeat(deletingBeat.id);
      if (response.success) {
        setMessage('Beat deleted successfully!');
        // Remove from local state
        setBeats(prev => prev.filter(beat => beat.id !== deletingBeat.id));
        closeDeleteModal();
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error deleting beat:', error);
      setMessage('Failed to delete beat');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEditBeat(beat: Beat) {
    setEditingBeat({ ...beat });
    setShowEditModal(true);
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setShowEditModal(false);
    setNewBeat({ name: '', description: '', color: '#E100FF' });
    setEditingBeat(null);
    setMessage('');
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Beats <span className="text-lg font-normal text-gray-400 ml-4">Category</span></h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search for..."
            className="w-64 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43]"
          />
          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white hover:bg-secondary/80 transition-colors"
          >
            <FaPlus /> Add Beat
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('successfully') 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E100FF]"></div>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && (
        <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xl bg-[#101936]">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-[#19213A] text-[#C7C7C7] text-left text-sm">
                <th className="px-6 py-4 font-semibold">Beat Name</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBeats.map((beat, idx) => (
                <tr
                  key={beat.id}
                  className={
                    idx % 2 === 0
                      ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                      : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                  }
                >
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <FaDrum className="text-[#E100FF]" />
                    {beat.name}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{beat.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      beat.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {beat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(beat.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-4 text-lg">
                    <button 
                      className="text-white hover:text-secondary transition-colors" 
                      title="Edit"
                      onClick={() => handleEditBeat(beat)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-white hover:text-red-500 transition-colors" 
                      title="Delete"
                      onClick={() => openDeleteModal(beat)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards View */}
      {!loading && (
        <div className="md:hidden space-y-4">
          {paginatedBeats.map((beat) => (
            <div
              key={beat.id}
              className="bg-[#101936] rounded-xl p-4 shadow-lg border border-[#232B43]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaDrum className="text-[#E100FF]" />
                    <h3 className="text-lg font-semibold text-white">{beat.name}</h3>
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-600"
                      style={{ backgroundColor: beat.color }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{beat.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      beat.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {beat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-400">
                      {new Date(beat.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 text-lg ml-4">
                  <button 
                    className="text-white hover:text-secondary transition-colors p-1" 
                    title="Edit"
                    onClick={() => handleEditBeat(beat)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="text-white hover:text-red-500 transition-colors p-1" 
                    title="Delete"
                    onClick={() => openDeleteModal(beat)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && beats.length > 0 && (
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
      )}

      {/* Add Beat Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <FaDrum className="text-[#E100FF]" />
                Add Beat
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Beat Name *</label>
                <input
                  type="text"
                  value={newBeat.name}
                  onChange={e => setNewBeat({ ...newBeat, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF]"
                  placeholder="Enter beat name..."
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newBeat.description}
                  onChange={e => setNewBeat({ ...newBeat, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] resize-none"
                  placeholder="Enter beat description..."
                />
              </div>

            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBeat}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Beat Modal */}
      {showEditModal && editingBeat && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <FaDrum className="text-[#E100FF]" />
                Edit Beat
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Beat Name *</label>
                <input
                  type="text"
                  value={editingBeat.name}
                  onChange={e => setEditingBeat({ ...editingBeat, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF]"
                  placeholder="Enter beat name..."
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={editingBeat.description}
                  onChange={e => setEditingBeat({ ...editingBeat, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] resize-none"
                  placeholder="Enter beat description..."
                />
              </div>

            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBeat}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingBeat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Delete Beat</h2>
                <p className="text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-[#181F36] rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">Beat Details:</h3>
              <p className="text-gray-300 mb-1"><span className="text-gray-400">Name:</span> {deletingBeat.name}</p>
              <p className="text-gray-300"><span className="text-gray-400">Description:</span> {deletingBeat.description}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBeat}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Beat'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
