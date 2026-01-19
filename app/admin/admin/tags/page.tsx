"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaTags } from "react-icons/fa";
import { tagAPI } from "../../utils/api";

interface Tag {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', description: '', color: '#FF6B35' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 8;

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    try {
      setLoading(true);
      const response = await tagAPI.getTags();
      if (response.success) {
        setTags(response.tags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      setMessage('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(tags.length / pageSize);
  const paginatedTags = tags.slice((page - 1) * pageSize, page * pageSize);

  async function handleSaveTag() {
    if (!newTag.name.trim()) {
      setMessage('Please enter a tag name');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await tagAPI.createTag(newTag);
      if (response.success) {
        setMessage('Tag created successfully!');
        setShowAddModal(false);
        setNewTag({ name: '', description: '', color: '#FF6B35' });
        loadTags(); // Reload the list
      }
    } catch (error: any) {
      console.error('Error creating tag:', error);
      setMessage(error.response?.data?.message || 'Failed to create tag');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateTag() {
    if (!editingTag || !editingTag.name.trim()) {
      setMessage('Please enter a tag name');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await tagAPI.updateTag(editingTag.id, {
        name: editingTag.name,
        description: editingTag.description,
        color: editingTag.color
      });
      if (response.success) {
        setMessage('Tag updated successfully!');
        setShowEditModal(false);
        setEditingTag(null);
        loadTags(); // Reload the list
      }
    } catch (error: any) {
      console.error('Error updating tag:', error);
      setMessage(error.response?.data?.message || 'Failed to update tag');
    } finally {
      setIsSubmitting(false);
    }
  }

  const openDeleteModal = (tag: Tag) => {
    setDeletingTag(tag);
    setShowDeleteModal(true);
    setMessage(''); // Clear any existing messages when opening modal
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingTag(null);
    // Don't clear message here - let it display for success feedback
  };

  async function handleDeleteTag() {
    if (!deletingTag) return;
    
    setIsDeleting(true);
    try {
      const response = await tagAPI.deleteTag(deletingTag.id);
      if (response.success) {
        setMessage('Tag deleted successfully!');
        // Remove from local state
        setTags(prev => prev.filter(tag => tag.id !== deletingTag.id));
        closeDeleteModal();
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      setMessage('Failed to delete tag');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEditTag(tag: Tag) {
    setEditingTag({ ...tag });
    setShowEditModal(true);
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setShowEditModal(false);
    setNewTag({ name: '', description: '', color: '#FF6B35' });
    setEditingTag(null);
    setMessage('');
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Tags <span className="text-lg font-normal text-gray-400 ml-4">Category</span></h1>
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
            <FaPlus /> Add Tag
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && (
        <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xl bg-[#101936]">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-[#19213A] text-[#C7C7C7] text-left text-sm">
                <th className="px-6 py-4 font-semibold">Tag Name</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTags.map((tag, idx) => (
                <tr
                  key={tag.id}
                  className={
                    idx % 2 === 0
                      ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                      : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                  }
                >
                  <td className="px-6 py-4 font-medium">
                    {tag.name}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{tag.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tag.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tag.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-4 text-lg">
                    <button 
                      className="text-white hover:text-secondary transition-colors" 
                      title="Edit"
                      onClick={() => handleEditTag(tag)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-white hover:text-red-500 transition-colors" 
                      title="Delete"
                      onClick={() => openDeleteModal(tag)}
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
          {paginatedTags.map((tag) => (
            <div
              key={tag.id}
              className="bg-[#101936] rounded-xl p-4 shadow-lg border border-[#232B43]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTags className="text-[#FF6B35]" />
                    <h3 className="text-lg font-semibold text-white">{tag.name}</h3>
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-600"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{tag.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      tag.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tag.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-400">
                      {new Date(tag.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 text-lg ml-4">
                  <button 
                    className="text-white hover:text-secondary transition-colors p-1" 
                    title="Edit"
                    onClick={() => handleEditTag(tag)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="text-white hover:text-red-500 transition-colors p-1" 
                    title="Delete"
                    onClick={() => openDeleteModal(tag)}
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
      {!loading && tags.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-white gap-4">
          <span className="text-sm text-gray-400 text-center sm:text-left">
            Showing data {tags.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, tags.length)} of {tags.length} entries
          </span>
          <div className="flex gap-2 items-center">
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center ${page === 1 ? 'bg-[#232B43] text-gray-500' : 'bg-[#232B43] hover:bg-secondary hover:text-white'} transition-colors`}
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${page === num ? 'bg-secondary text-white' : 'bg-[#232B43] text-gray-300 hover:bg-secondary hover:text-white'} transition-colors`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center ${page === totalPages ? 'bg-[#232B43] text-gray-500' : 'bg-[#232B43] hover:bg-secondary hover:text-white'} transition-colors`}
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Add Tag Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Add Tag
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
                <label className="block text-gray-300 mb-2">Tag Name *</label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={e => setNewTag({ ...newTag, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#FF6B35]"
                  placeholder="Enter tag name..."
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newTag.description}
                  onChange={e => setNewTag({ ...newTag, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#FF6B35] resize-none"
                  placeholder="Enter tag description..."
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
                onClick={handleSaveTag}
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

      {/* Edit Tag Modal */}
      {showEditModal && editingTag && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <FaTags className="text-[#FF6B35]" />
                Edit Tag
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
                <label className="block text-gray-300 mb-2">Tag Name *</label>
                <input
                  type="text"
                  value={editingTag.name}
                  onChange={e => setEditingTag({ ...editingTag, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#FF6B35]"
                  placeholder="Enter tag name..."
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={editingTag.description}
                  onChange={e => setEditingTag({ ...editingTag, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#FF6B35] resize-none"
                  placeholder="Enter tag description..."
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
                onClick={handleUpdateTag}
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
      {showDeleteModal && deletingTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Delete Tag</h2>
                <p className="text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-[#181F36] rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">Tag Details:</h3>
              <p className="text-gray-300 mb-1"><span className="text-gray-400">Name:</span> {deletingTag.name}</p>
              <p className="text-gray-300"><span className="text-gray-400">Description:</span> {deletingTag.description}</p>
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
                onClick={handleDeleteTag}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Tag'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
