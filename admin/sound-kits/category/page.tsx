"use client";
import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaMusic } from 'react-icons/fa';
import { soundKitCategoryAPI } from '../../../utils/api';

interface SoundKitCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SoundKitCategoriesPage() {
  const [categories, setCategories] = useState<SoundKitCategory[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SoundKitCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#E100FF'
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<SoundKitCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await soundKitCategoryAPI.getCategories();
      if (response.success) {
        setCategories(response.categories);
        setPagination(prev => ({
          ...prev,
          totalItems: response.categories.length
        }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setMessage('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name.trim()) {
      setMessage('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('');

      const response = await soundKitCategoryAPI.createCategory(newCategory);
      
      if (response.success) {
        setMessage('Category created successfully!');
        setNewCategory({ name: '', description: '', color: '#00D4FF' });
        setShowModal(false);
        loadCategories();
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      setMessage(error.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      setMessage('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('');

      const response = await soundKitCategoryAPI.updateCategory(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description,
        color: editingCategory.color
      });
      
      if (response.success) {
        setMessage('Category updated successfully!');
        setEditingCategory(null);
        setShowModal(false);
        loadCategories();
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      setMessage(error.response?.data?.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setIsDeleting(true);
      setMessage('');
      
      console.log('Attempting to delete category with ID:', id);
      const response = await soundKitCategoryAPI.deleteCategory(id);
      console.log('Delete response:', response);
      
      if (response.success) {
        setMessage('Category deleted successfully!');
        setShowDeleteModal(false);
        setDeletingCategory(null);
        loadCategories();
      } else {
        setMessage(response.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      setMessage(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (category: SoundKitCategory) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingCategory(null);
    setMessage('');
  };

  const handleEditCategory = (category: SoundKitCategory) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', color: '#00D4FF' });
    setMessage('');
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedCategories = filteredCategories.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">
            Sound Kit Categories
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-secondary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <FaPlus />
            Add Category
          </button>
        </div>

        {/* Search and Message */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                             className="w-full bg-[#101936] text-white rounded-lg px-4 py-2 border border-[#232B43] focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && (
          <div className="hidden lg:block bg-[#101936] rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181F36]">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Category Name</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Description</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-gray-300 font-semibold">Created</th>
                    <th className="px-6 py-4 text-center text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232B43]">
                  {paginatedCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-[#181F36]/50 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{category.name}</td>
                      <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                        {category.description || 'No description'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          category.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        {!loading && (
          <div className="lg:hidden space-y-4">
            {paginatedCategories.map((category) => (
              <div key={category.id} className="bg-[#101936] rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{category.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  {category.description || 'No description'}
                </p>
                                 <div className="flex items-center justify-end">
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                     category.isActive 
                       ? 'bg-green-500/20 text-green-400' 
                       : 'bg-red-500/20 text-red-400'
                   }`}>
                     {category.isActive ? 'Active' : 'Inactive'}
                   </span>
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredCategories.length > pagination.itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-[#101936] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#181F36] transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-[#101936] text-white rounded-lg">
                Page {pagination.currentPage} of {Math.ceil(filteredCategories.length / pagination.itemsPerPage)}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage >= Math.ceil(filteredCategories.length / pagination.itemsPerPage)}
                className="px-4 py-2 bg-[#101936] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#181F36] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#101936] rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Category Name *</label>
                                     <input
                     type="text"
                     value={editingCategory ? editingCategory.name : newCategory.name}
                     onChange={(e) => {
                       if (editingCategory) {
                         setEditingCategory({ ...editingCategory, name: e.target.value });
                       } else {
                         setNewCategory({ ...newCategory, name: e.target.value });
                       }
                     }}
                     className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43] focus:border-primary focus:outline-none"
                     placeholder="Enter category name"
                   />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                                     <textarea
                     value={editingCategory ? editingCategory.description || '' : newCategory.description}
                     onChange={(e) => {
                       if (editingCategory) {
                         setEditingCategory({ ...editingCategory, description: e.target.value });
                       } else {
                         setNewCategory({ ...newCategory, description: e.target.value });
                       }
                     }}
                     className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43] focus:border-primary focus:outline-none"
                     placeholder="Enter description"
                     rows={3}
                   />
                </div>

                

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingCategory ? handleUpdateCategory : handleSaveCategory}
                    disabled={isSubmitting}
                                         className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                       isSubmitting
                         ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                         : 'bg-secondary text-white hover:bg-secondary/80'
                     }`}
                  >
                    {isSubmitting ? 'Saving...' : (editingCategory ? 'Update' : 'Save')}
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-2 rounded-lg bg-[#181F36] text-white font-semibold hover:bg-[#232B43] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#101936] rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Delete Category
                </h2>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTrash className="text-red-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Are you sure?
                  </h3>
                  <p className="text-gray-300">
                    You are about to delete the category <span className="font-semibold text-white">"{deletingCategory.name}"</span>. 
                    This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDeleteCategory(deletingCategory.id)}
                    disabled={isDeleting}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      isDeleting
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Category'}
                  </button>
                  <button
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="flex-1 py-3 rounded-lg bg-[#181F36] text-white font-semibold hover:bg-[#232B43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 