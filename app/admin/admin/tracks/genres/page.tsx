"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { genreAPI } from "../../../utils/api";
import { Genre } from "./genres";

export default function GenresCategoryPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<any | null>(null);
  const [editGenre, setEditGenre] = useState({ name: '', description: '' });
  const [newGenre, setNewGenre] = useState({ name: '', description: '' });
  const [deletingGenre, setDeletingGenre] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const pageSize = 8;

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const response = await genreAPI.getGenres();
      if (response.success) {
        setGenres(response.genres);
      } else {
        // Fallback to empty array if API fails
        setGenres([]);
      }
    } catch (error) {
      console.error('Error loading genres:', error);
      // Fallback to empty array if API fails
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(genres.length / pageSize);
  const paginatedGenres = genres.slice((page - 1) * pageSize, page * pageSize);

  function handleSaveGenre() {
    // Here you would typically save to your backend
    console.log('Saving new genre:', newGenre);
    setShowAddModal(false);
    setNewGenre({ name: '', description: '' });
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setNewGenre({ name: '', description: '' });
  }

  const handleViewGenre = (genre: any) => {
    setSelectedGenre(genre);
    setShowViewModal(true);
  };

  const handleEditGenre = (genre: any) => {
    setSelectedGenre(genre);
    setEditGenre({ name: genre.name, description: genre.description });
    setShowEditModal(true);
  };


  const openDeleteModal = (genre: any) => {
    setDeletingGenre(genre);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingGenre(null);
    setMessage('');
  };

  const handleDeleteGenre = async () => {
    if (!deletingGenre) return;
    
    setIsDeleting(true);
    try {
      const response = await genreAPI.deleteGenre(deletingGenre._id);
      
      if (response.success) {
        setMessage('Genre deleted successfully!');
        // Remove from local state
        setGenres(prev => prev.filter(genre => genre._id !== deletingGenre._id));
        closeDeleteModal();
      }
    } catch (error) {
      console.error('Error deleting genre:', error);
      setMessage('Failed to delete genre');
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#081028]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Track Management <span className="text-lg font-normal text-gray-400 ml-4">Genres Category</span></h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search for..."
            className="w-full sm:w-64 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43]"
          />
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white hover:bg-secondary/80 transition-colors"
          >
            <span className="text-xl">+</span> Add Category
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
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && (
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
            {paginatedGenres.map((genre, idx) => (
              <tr
                key={genre._id + '-' + idx}
                className={
                  idx % 2 === 0
                    ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                    : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                }
              >
                <td className="px-6 py-4">{genre.name}</td>
                <td className="px-6 py-4">{genre.description}</td>
                <td className="px-6 py-4 flex gap-4 text-lg">

                  <button 
                    onClick={() => handleViewGenre(genre)}
                    className="text-white hover:text-[#7ED7FF] transition-colors" 
                    title="View"
                  >
                    <FaEye />
                  </button>
                  <button 
                    onClick={() => handleEditGenre(genre)}
                    className="text-white hover:text-[#E100FF] transition-colors" 
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(genre)}
                    className="text-white hover:text-red-500 transition-colors" 
                    title="Delete"

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
        {paginatedGenres.map((genre, idx) => (
          <div
            key={genre._id + '-' + idx}
            className="bg-[#101936] rounded-xl p-4 shadow-lg border border-[#232B43]"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{genre.name}</h3>
                <p className="text-gray-400 text-sm">{genre.description}</p>
              </div>
              <div className="flex gap-3 text-lg ml-4">
                <button 
                  className="text-white hover:text-[#7ED7FF] transition-colors p-1" 
                  title="View"
                  onClick={() => handleViewGenre(genre)}
                >
                  <FaEye />
                </button>
                <button 
                  className="text-white hover:text-[#E100FF] transition-colors p-1" 
                  title="Edit"
                  onClick={() => handleEditGenre(genre)}
                >
                  <FaEdit />
                </button>
                <button 

                  onClick={() => openDeleteModal(genre)}
                  className="text-white hover:text-red-500 transition-colors p-1" 
                  title="Delete"

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
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-white gap-4">
        <span className="text-sm text-gray-400 text-center sm:text-left">
          Showing data {genres.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, genres.length)} of {genres.length} entries
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

      {/* Add Genre Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Add Genres Category</h2>
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
                  value={newGenre.name}
                  onChange={(e) => setNewGenre({ ...newGenre, name: e.target.value })}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF]"
                  placeholder="Enter genre name..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newGenre.description}
                  onChange={(e) => setNewGenre({ ...newGenre, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] resize-none"
                  placeholder="Enter genre description..."
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
                onClick={handleSaveGenre}
                className="flex-1 py-2 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-[#c800d6] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingGenre && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Genre</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete <span className="text-white font-semibold">"{deletingGenre.name}"</span>?
              </p>
              <div className="bg-[#181F36] rounded-lg p-4 border border-[#232B43]">
                <div>
                  <p className="text-white font-medium">{deletingGenre.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{deletingGenre.description}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-6 py-2 bg-[#232B43] text-white rounded-lg hover:bg-[#2a3447] transition-colors disabled:opacity-50"

              >
                Cancel
              </button>
              <button

                onClick={handleDeleteGenre}
                disabled={isDeleting}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isDeleting
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Genre'}

              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}