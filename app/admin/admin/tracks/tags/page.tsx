"use client";
import React, { useState } from "react";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { TagCategory, initialTags } from "./tagData";

export default function TrackTagsPage() {
  const [tags, setTags] = useState<TagCategory[]>(initialTags);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagCategory | null>(null);
  const [editTag, setEditTag] = useState({ name: '', description: '' });
  const [newTag, setNewTag] = useState({ name: '', description: '' });
  const pageSize = 8;

  const totalPages = Math.ceil(tags.length / pageSize);
  const paginatedTags = tags.slice((page - 1) * pageSize, page * pageSize);

  function handleSaveTag() {
    setTags([
      ...tags,
      { id: tags.length + 1, name: newTag.name, description: newTag.description },
    ]);
    setShowAddModal(false);
    setNewTag({ name: '', description: '' });
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setNewTag({ name: '', description: '' });
  }

  function handleViewTag(tag: TagCategory) {
    setSelectedTag(tag);
    setShowViewModal(true);
  }

  function handleCloseViewModal() {
    setShowViewModal(false);
    setSelectedTag(null);
  }

  function handleEditTag(tag: TagCategory) {
    setSelectedTag(tag);
    setEditTag({ name: tag.name, description: tag.description });
    setShowEditModal(true);
  }

  function handleSaveEditTag() {
    // Here you would typically update to your backend
    console.log('Updating tag:', selectedTag?.id, editTag);
    // Update the tag in the local state (simulate backend update)
    setTags(tags.map(tag => 
      tag.id === selectedTag?.id 
        ? { ...tag, name: editTag.name, description: editTag.description }
        : tag
    ));
    setShowEditModal(false);
    setSelectedTag(null);
    setEditTag({ name: '', description: '' });
  }

  function handleCloseEditModal() {
    setShowEditModal(false);
    setSelectedTag(null);
    setEditTag({ name: '', description: '' });
  }

  function handleDeleteTag(tag: TagCategory) {
    setSelectedTag(tag);
    setShowDeleteModal(true);
  }

  function handleConfirmDelete() {
    // Here you would typically delete from your backend
    console.log('Deleting tag:', selectedTag?.id);
    // Remove the tag from the local state (simulate backend delete)
    setTags(tags.filter(tag => tag.id !== selectedTag?.id));
    setShowDeleteModal(false);
    setSelectedTag(null);
  }

  function handleCloseDeleteModal() {
    setShowDeleteModal(false);
    setSelectedTag(null);
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#081028]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Track Management <span className="text-lg font-normal text-gray-400 ml-4">Tags Category</span></h1>
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
            <span className="text-xl">+</span> Add Tags
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
            {paginatedTags.map((tag, idx) => (
              <tr
                key={tag.id + '-' + idx}
                className={
                  idx % 2 === 0
                    ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                    : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                }
              >
                <td className="px-6 py-4">{tag.name}</td>
                <td className="px-6 py-4">{tag.description}</td>
                <td className="px-6 py-4 flex gap-4 text-lg">
                  <button 
                    className="text-white hover:text-[#7ED7FF] transition-colors" 
                    title="View"
                    onClick={() => handleViewTag(tag)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="text-white hover:text-[#E100FF] transition-colors" 
                    title="Edit"
                    onClick={() => handleEditTag(tag)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="text-white hover:text-red-500 transition-colors" 
                    title="Delete"
                    onClick={() => handleDeleteTag(tag)}
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
        {paginatedTags.map((tag, idx) => (
          <div
            key={tag.id + '-' + idx}
            className="bg-[#101936] rounded-xl p-4 shadow-lg border border-[#232B43]"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{tag.name}</h3>
                <p className="text-gray-400 text-sm">{tag.description}</p>
              </div>
              <div className="flex gap-3 text-lg ml-4">
                <button 
                  className="text-white hover:text-[#7ED7FF] transition-colors p-1" 
                  title="View"
                  onClick={() => handleViewTag(tag)}
                >
                  <FaEye />
                </button>
                <button 
                  className="text-white hover:text-[#E100FF] transition-colors p-1" 
                  title="Edit"
                  onClick={() => handleEditTag(tag)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="text-white hover:text-red-500 transition-colors p-1" 
                  title="Delete"
                  onClick={() => handleDeleteTag(tag)}
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
          Showing data {tags.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, tags.length)} of {tags.length} entries
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

      {/* Add Tag Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Add Tag Category</h2>
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
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF]"
                  placeholder="Enter tag category name..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newTag.description}
                  onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] resize-none"
                  placeholder="Enter tag category description..."
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
                onClick={handleSaveTag}
                className="flex-1 py-2 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-[#c800d6] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Tag Modal */}
      {showViewModal && selectedTag && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">View Tag Category Details</h2>
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
                  {selectedTag.name}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Description</label>
                <div className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43] min-h-[80px]">
                  {selectedTag.description}
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

      {/* Edit Tag Modal */}
      {showEditModal && selectedTag && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Tag Category</h2>
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
                  value={editTag.name}
                  onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF]"
                  placeholder="Enter tag category name..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={editTag.description}
                  onChange={(e) => setEditTag({ ...editTag, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] resize-none"
                  placeholder="Enter tag category description..."
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
                onClick={handleSaveEditTag}
                className="flex-1 py-2 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-[#c800d6] transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Tag Modal */}
      {showDeleteModal && selectedTag && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Delete Tag</h2>
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
                <p className="text-white text-lg mb-2">Are you sure you want to delete this tag category?</p>
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