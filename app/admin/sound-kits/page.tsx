"use client";
import React, { useEffect, useState } from "react";

import { soundKitAPI, imageAPI, soundKitCategoryAPI, soundKitTagAPI } from "../../utils/api";

import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SoundKit {
  id?: string; // Supabase ID
  _id?: string; // MongoDB ID (for backward compatibility)
  kitName: string;
  kitId: string;
  description?: string;
  category?: string | string[]; // Can be single string or array of UUIDs
  price?: number;
  producer?: string;
  musician?: string;
  musicianProfilePicture?: string;
  kitType?: string;
  bpm?: number;
  key?: string;
  kitImage?: string;
  kitFile?: string;
  tags?: string | string[]; // Can be single string or array of UUIDs
  publish?: string;
  seoTitle?: string;
  metaKeyword?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SoundKitsPage() {
  const router = useRouter();
  const [soundKits, setSoundKits] = useState<SoundKit[]>([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedKit, setSelectedKit] = useState<SoundKit | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingKit, setEditingKit] = useState<SoundKit | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingKit, setDeletingKit] = useState<SoundKit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data for converting IDs to names
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [tags, setTags] = useState<Array<{id: string, name: string}>>([]);

  // Helper function to get sound kit ID (supports both Supabase and MongoDB)
  const getSoundKitId = (kit: SoundKit): string => {
    return kit.id || kit._id || '';
  };

  const pageSize = 8;

  // Helper function to get proper image URL
  const getImageUrl = (kitImage: string | null | undefined) => {
    console.log('Getting image URL for:', kitImage);
    
    if (!kitImage) return "/vercel.svg";
    
    // If it's already a full URL, return it
    if (kitImage.startsWith('http://') || kitImage.startsWith('https://')) {
      console.log('Returning full URL:', kitImage);
      return kitImage;
    }
    
    // If it's a GridFS file ID, construct the URL
    if (kitImage.length === 24) { // MongoDB ObjectId length
      const gridfsUrl = imageAPI.getImage(kitImage);
      console.log('Constructed GridFS URL:', gridfsUrl);
      return gridfsUrl;
    }
    
    // If it's a relative path or other format, return as is
    console.log('Returning as-is:', kitImage);
    return kitImage;
  };

  useEffect(() => {
    loadSoundKits();
    loadCategories();
    loadTags();
  }, []);

  const loadSoundKits = async () => {
    try {
      setLoading(true);
      const response = await soundKitAPI.getSoundKits();
      if (response.success) {
        console.log('Loaded sound kits:', response.soundKits);
        setSoundKits(response.soundKits);
      }
    } catch (error) {
      console.error('Error loading sound kits:', error);
    } finally {
      setLoading(false);
    }
  };

  async function loadCategories() {
    try {
      console.log('Loading sound kit categories...');
      const response = await soundKitCategoryAPI.getCategories();
      console.log('Sound kit categories response:', response);
      if (response.success) {
        console.log('Setting sound kit categories:', response.categories);
        setCategories(response.categories);
      } else {
        console.error('Failed to load sound kit categories:', response);
      }
    } catch (error) {
      console.error('Error loading sound kit categories:', error);
    }
  }

  async function loadTags() {
    try {
      console.log('Loading sound kit tags...');
      const response = await soundKitTagAPI.getTags();
      console.log('Sound kit tags response:', response);
      if (response.success) {
        console.log('Setting sound kit tags:', response.tags);
        setTags(response.tags);
      } else {
        console.error('Failed to load sound kit tags:', response);
      }
    } catch (error) {
      console.error('Error loading sound kit tags:', error);
    }
  }

  // Helper function to parse category/tag data (handles both arrays and JSON strings)
  const parseCategoryData = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [data];
      }
    }
    return [data];
  };

  // Helper functions to convert IDs to names
  const getCategoryName = (id: string) => {
    console.log('Looking for category ID:', id);
    console.log('Available categories:', categories);
    const category = categories.find(c => c.id === id);
    if (category) {
      console.log('Found category:', category);
      return category.name;
    }
    console.log('Category not found for ID:', id);
    // If not found, show a more user-friendly message
    return `Missing Category (${id.substring(0, 8)}...)`;
  };

  const getTagName = (id: string) => {
    console.log('Looking for tag ID:', id);
    console.log('Available tags:', tags);
    const tag = tags.find(t => t.id === id);
    if (tag) {
      console.log('Found tag:', tag);
      return tag.name;
    }
    console.log('Tag not found for ID:', id);
    // If not found, show a more user-friendly message
    return `Missing Tag (${id.substring(0, 8)}...)`;
  };

  const handleViewKit = (kit: any, editMode: boolean = false) => {
    setSelectedKit(kit);
    setShowViewModal(true);
    if (editMode) {
      setIsEditMode(true);
      setEditingKit({ ...kit });
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedKit(null);
    setIsEditMode(false);
    setEditingKit(null);
  };

  const handleEditInModal = () => {
    setIsEditMode(true);
    if (selectedKit) {
      setEditingKit({ ...selectedKit });
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingKit(null);
  };

  const handleSaveEdit = async () => {
    if (!editingKit) return;
    
    setIsSaving(true);
    try {
      const kitId = getSoundKitId(editingKit);
      if (!kitId) {
        console.error('Error: Sound kit ID not found');
        setIsSaving(false);
        return;
      }
      const response = await soundKitAPI.updateSoundKit(kitId, editingKit);
      
      if (response.success) {
        // Update the local state
        setSoundKits((prev: any[]) => prev.map(kit => 
          getSoundKitId(kit) === kitId ? editingKit : kit
        ));
        setSelectedKit(editingKit);
        setIsEditMode(false);
        setEditingKit(null);
      }
    } catch (error) {
      console.error('Error updating sound kit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editingKit) return;
    setEditingKit((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const openDeleteModal = (kit: SoundKit) => {
    setDeletingKit(kit);
    setShowDeleteModal(true);
  };

  const handleEditKit = (kit: SoundKit) => {
    // Store sound kit data in localStorage for editing
    localStorage.setItem('editSoundKitData', JSON.stringify(kit));
    // Navigate to add sound kit page
    router.push('/admin/sound-kits/add?mode=edit');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingKit(null);
  };

  const handleDeleteKit = async () => {
    if (!deletingKit) return;
    
    setIsDeleting(true);
    try {
      const kitId = getSoundKitId(deletingKit);
      console.log('Deleting sound kit with ID:', kitId);
      console.log('Sound kit object:', deletingKit);
      
      if (!kitId) {
        console.error('Error: Sound kit ID not found');
        setIsDeleting(false);
        return;
      }
      
      const response = await soundKitAPI.deleteSoundKit(kitId);
      
      if (response.success) {
        // Remove from local state
        setSoundKits(prev => prev.filter(kit => getSoundKitId(kit) !== kitId));
        closeDeleteModal();
      }
    } catch (error: any) {
      console.error('Error deleting sound kit:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter sound kits based on search term
  const filteredKits = soundKits.filter(kit =>
    kit.kitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.kitId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.producer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredKits.length / pageSize);
  const paginatedKits = filteredKits.slice((page - 1) * pageSize, page * pageSize);




  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#081028]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Sound Kits <span className="text-lg font-normal text-gray-400 ml-4">All Sound Kits</span></h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search sound kits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43]"
          />
          <Link
            href="/admin/sound-kits/add"
            className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-secondary/80 transition-colors justify-center"
          >
            <FaPlus />
            Add Sound Kit
          </Link>
        </div>
      </div>

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
              <th className="px-6 py-4 font-semibold">Image</th>
              <th className="px-6 py-4 font-semibold">Sound ID</th>
              <th className="px-6 py-4 font-semibold">Sound Name</th>
              <th className="px-6 py-4 font-semibold">Musician</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>

            {paginatedKits.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  {searchTerm ? 'No sound kits found matching your search' : 'No sound kits available'}

                </td>
              </tr>
            ) : (
              paginatedKits.map((kit, idx) => (
                <tr
                  key={getSoundKitId(kit) + '-' + idx}
                  className={
                    idx % 2 === 0
                      ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                      : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                  }
                >
                  <td className="px-6 py-4">
                    <img 
                      src={getImageUrl(kit.kitImage)} 
                      alt={kit.kitName} 
                      className="w-10 h-10 rounded-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = "/vercel.svg";
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">{kit.kitId}</td>
                  <td className="px-6 py-4">{kit.kitName}</td>
                  <td className="px-6 py-4">{kit.producer}</td>
                  <td className="px-6 py-4">${kit.price || 0}</td>
                  <td className="px-6 py-4 flex gap-4 text-lg">
                    <button 
                      onClick={() => handleViewKit(kit)}
                      className="text-white hover:text-[#7ED7FF] transition-colors" 
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => handleEditKit(kit)}
                      className="text-white hover:text-[#E100FF] transition-colors" 
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(kit)}
                      className="text-white hover:text-red-500 transition-colors" 
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      )}

      {/* Mobile Cards View */}

      {!loading && (
        <div className="md:hidden space-y-4">
          {paginatedKits.length === 0 ? (
            <div className="bg-[#101936] rounded-xl p-8 shadow-lg border border-[#232B43] text-center">
              <p className="text-gray-400">
                {searchTerm ? 'No sound kits found matching your search' : 'No sound kits available'}
              </p>

            </div>
          ) : (
            paginatedKits.map((kit, idx) => (
              <div
                key={getSoundKitId(kit) + '-' + idx}
                className="bg-[#101936] rounded-xl p-4 shadow-lg border border-[#232B43]"
              >
                <div className="flex items-start gap-4 mb-3">
                  <img 
                    src={getImageUrl(kit.kitImage)} 
                    alt={kit.kitName} 
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0" 
                    onError={(e) => {
                      e.currentTarget.src = "/vercel.svg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">{kit.kitName}</h3>
                    <p className="text-[#7ED7FF] text-sm mb-1">{kit.producer}</p>
                    <p className="text-gray-400 text-sm">ID: {kit.kitId}</p>
                    <p className="text-[#E100FF] font-semibold text-sm">${kit.price || 0}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-lg justify-end">
                  <button 
                    onClick={() => handleViewKit(kit)}
                    className="text-white hover:text-[#7ED7FF] transition-colors p-1" 
                    title="View"
                  >
                    <FaEye />
                  </button>
                  <button 
                    onClick={() => handleEditKit(kit)}
                    className="text-white hover:text-[#E100FF] transition-colors p-1" 
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(kit)}
                    className="text-white hover:text-red-500 transition-colors p-1" 
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-white gap-4">
        <span className="text-sm text-gray-400 text-center sm:text-left">
          Showing data {filteredKits.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredKits.length)} of {filteredKits.length} entries
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

      {/* View Sound Kit Modal */}

      {showViewModal && selectedKit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isEditMode ? 'Edit Sound Kit' : 'Sound Kit Details'}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Image and Basic Info */}
              <div className="space-y-6">
                {/* Kit Image */}
                <div>
                  <img 
                    src={getImageUrl(selectedKit.kitImage)} 
                    alt={selectedKit.kitName} 
                    className="w-48 h-48 object-cover rounded-xl border-2 border-[#232B43]"
                    onError={(e) => {
                      e.currentTarget.src = "/vercel.svg";
                    }}
                  />
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-[#232B43] pb-2">
                    Basic Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Kit Name:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editingKit?.kitName || ''}
                          onChange={(e) => handleInputChange('kitName', e.target.value)}
                          className="bg-[#181F36] text-white px-3 py-1 rounded border border-[#232B43] focus:border-[#E100FF] focus:outline-none text-sm"
                        />
                      ) : (
                        <span className="text-white font-medium">{selectedKit.kitName}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Kit ID:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editingKit?.kitId || ''}
                          onChange={(e) => handleInputChange('kitId', e.target.value)}
                          className="bg-[#181F36] text-white px-3 py-1 rounded border border-[#232B43] focus:border-[#E100FF] focus:outline-none text-sm"
                        />
                      ) : (
                        <span className="text-white font-medium">{selectedKit.kitId}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Producer:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editingKit?.producer || ''}
                          onChange={(e) => handleInputChange('producer', e.target.value)}
                          className="bg-[#181F36] text-white px-3 py-1 rounded border border-[#232B43] focus:border-[#E100FF] focus:outline-none text-sm"
                        />
                      ) : (
                        <span className="text-white font-medium">{selectedKit.producer || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Price:</span>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={editingKit?.price || 0}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          className="bg-[#181F36] text-white px-3 py-1 rounded border border-[#232B43] focus:border-[#E100FF] focus:outline-none text-sm w-24"
                        />
                      ) : (
                        <span className="text-[#E100FF] font-semibold">${selectedKit.price || 0}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Kit Type:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editingKit?.kitType || ''}
                          onChange={(e) => handleInputChange('kitType', e.target.value)}
                          className="bg-[#181F36] text-white px-3 py-1 rounded border border-[#232B43] focus:border-[#E100FF] focus:outline-none text-sm"
                        />
                      ) : (
                        <span className="text-white font-medium">{selectedKit.kitType || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">BPM:</span>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={editingKit?.bpm || ''}
                          onChange={(e) => handleInputChange('bpm', parseInt(e.target.value) || undefined)}
                          className="bg-[#181F36] text-white px-3 py-1 rounded border border-[#232B43] focus:border-[#E100FF] focus:outline-none text-sm w-20"
                        />
                      ) : (
                        <span className="text-white font-medium">{selectedKit.bpm || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Key:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editingKit?.key || ''}
                          onChange={(e) => handleInputChange('key', e.target.value)}
                          className="bg-[#181F36] text-white px-3 py-1 rounded border border-[#232B43] focus:border-[#E100FF] focus:outline-none text-sm"
                        />
                      ) : (
                        <span className="text-white font-medium">{selectedKit.key || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Details */}
              <div className="space-y-6">
                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-[#232B43] pb-2">
                    Description
                  </h3>
                  {isEditMode ? (
                    <textarea
                      value={editingKit?.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full bg-[#181F36] text-white px-3 py-2 rounded border border-[#232B43] focus:border-[#E100FF] focus:outline-none text-sm min-h-[100px] resize-none"
                      placeholder="Enter description..."
                    />
                  ) : (
                    <p className="text-gray-300 leading-relaxed">
                      {selectedKit.description || 'No description available'}
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-[#232B43] pb-2">
                    Categories
                  </h3>
                  {selectedKit.category ? (
                    <div className="flex flex-wrap gap-2">
                      {parseCategoryData(selectedKit.category).map((categoryId: string, index: number) => {
                        const category = categories.find(c => c.id === categoryId);
                        const isMissing = !category;
                        return (
                          <span 
                            key={index} 
                            className={`px-3 py-1 rounded-full text-sm ${
                              isMissing 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-[#232B43] text-white'
                            }`}
                          >
                            {getCategoryName(categoryId)}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400">No categories assigned</p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-[#232B43] pb-2">
                    Tags
                  </h3>
                  {selectedKit.tags ? (
                    <div className="flex flex-wrap gap-2">
                      {parseCategoryData(selectedKit.tags).map((tagId: string, index: number) => {
                        const tag = tags.find(t => t.id === tagId);
                        const isMissing = !tag;
                        return (
                          <span 
                            key={index} 
                            className={`px-3 py-1 rounded-full text-sm ${
                              isMissing 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-[#232B43] text-white'
                            }`}
                          >
                            {getTagName(tagId)}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400">No tags assigned</p>
                  )}
                </div>

                {/* SEO Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-[#232B43] pb-2">
                    SEO Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">SEO Title:</span>
                      <p className="text-white text-sm mt-1">{selectedKit.seoTitle || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Meta Keywords:</span>
                      <p className="text-white text-sm mt-1">{selectedKit.metaKeyword || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Meta Description:</span>
                      <p className="text-white text-sm mt-1">{selectedKit.metaDescription || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-[#232B43] pb-2">
                    Timestamps
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white text-sm">
                        {selectedKit.createdAt ? new Date(selectedKit.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Updated:</span>
                      <span className="text-white text-sm">
                        {selectedKit.updatedAt ? new Date(selectedKit.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#232B43]">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-[#232B43] text-white rounded-lg hover:bg-[#2a3447] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      isSaving
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-secondary text-white hover:bg-secondary/80'
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeViewModal}
                  className="px-6 py-2 bg-[#232B43] text-white rounded-lg hover:bg-[#2a3447] transition-colors"
                >
                  Close
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingKit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Sound Kit</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete <span className="text-white font-semibold">"{deletingKit.kitName}"</span>?
              </p>
              <div className="bg-[#181F36] rounded-lg p-4 border border-[#232B43]">
                <div className="flex items-center gap-3">
                  <img 
                    src={deletingKit.kitImage || "/vercel.svg"} 
                    alt={deletingKit.kitName} 
                    className="w-12 h-12 rounded-lg object-cover" 
                  />
                  <div>
                    <p className="text-white font-medium">{deletingKit.kitName}</p>
                    <p className="text-gray-400 text-sm">ID: {deletingKit.kitId}</p>
                    <p className="text-[#E100FF] text-sm">${deletingKit.price || 0}</p>
                  </div>
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

                onClick={handleDeleteKit}
                disabled={isDeleting}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isDeleting
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Sound Kit'}

              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 