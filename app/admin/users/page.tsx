"use client";

import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { userAPI } from "../../utils/api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName?: string;
  location?: string;
  country?: string;
  biography?: string;
  profilePicture?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: string;
}


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const pageSize = 8;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load users from database
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getUsers();
      if (response.success) {
        setUsers(response.users);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // Get user's full name
  const getUserName = (user: User) => {
    return user.displayName || `${user.firstName} ${user.lastName}`;
  };

  // Get user's role (for now, defaulting to "User")
  const getUserRole = (user: User) => {
    // You can implement role logic here based on your requirements
    return "User";
  };

  // View user
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setMessage(null);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [field]: value });
    }
  };
// saith new change
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setIsSaving(true);
      setMessage(null);
      
      const response = await userAPI.updateUser(editingUser.id, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        displayName: editingUser.displayName,
        location: editingUser.location,
        country: editingUser.country,
        biography: editingUser.biography
      });
      
      if (response.success) {
        // Update local state with the response data
        setUsers(users.map(user => 
          user.id === editingUser.id ? response.user : user
        ));
        
        setMessage({ type: 'success', text: response.message || 'User updated successfully!' });
        setTimeout(() => {
          closeEditModal();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update user' });
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update user' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete user
  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingUser(null);
    setMessage(null);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setIsDeleting(true);
      setMessage(null);
      
      const response = await userAPI.deleteUser(deletingUser.id);
      
      if (response.success) {
        // Remove user from local state
        setUsers(users.filter(user => user.id !== deletingUser.id));
        
        setMessage({ type: 'success', text: response.message || 'User deleted successfully!' });
        setTimeout(() => {
          closeDeleteModal();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to delete user' });
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to delete user' 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081028] flex items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#081028] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#081028]">
      <div className="mx-4 md:mx-8 pt-6 md:pt-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Users <span className="text-lg font-normal text-gray-400 ml-4">All Users</span></h1>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43]"
          />
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xl bg-[#101936]">
          <table className="min-w-full text-white">
            <thead>
              <tr className="bg-[#19213A] text-[#C7C7C7] text-left text-sm">
                <th className="px-6 py-4 font-semibold">Image</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>

              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}

                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={
                      idx % 2 === 0
                        ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                        : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                    }
                  >
                    <td className="px-6 py-4">
                      <img src={user.profilePicture || "/vercel.svg"} alt={getUserName(user)} className="w-10 h-10 rounded-full object-cover" />
                    </td>
                    <td className="px-6 py-4">{getUserName(user)}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.displayName || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`}</td>
                    <td className="px-6 py-4">{getUserRole(user)}</td>
                    <td className="px-6 py-4 flex gap-4 text-lg">
                      <button 
                        className="hover:text-[#7ED7FF] transition-colors" 
                        title="View"
                        onClick={() => handleViewUser(user)}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="hover:text-[#E100FF] transition-colors" 
                        title="Edit"
                        onClick={() => handleEditUser(user)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="hover:text-red-500 transition-colors" 
                        title="Delete"
                        onClick={() => handleDeleteUser(user)}
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

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {paginatedUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          ) : (
            paginatedUsers.map((user, idx) => (
              <div
                key={user.id}
                className="bg-[#101936] rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePicture || "/vercel.svg"} alt={getUserName(user)} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="text-white font-semibold text-lg">{getUserName(user)}</h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="p-2 rounded-lg bg-[#19213A] hover:bg-[#7ED7FF] hover:text-black transition-colors" 
                      title="View"
                      onClick={() => handleViewUser(user)}
                    >
                      <FaEye className="text-white" />
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-[#19213A] hover:bg-[#E100FF] hover:text-black transition-colors" 
                      title="Edit"
                      onClick={() => handleEditUser(user)}
                    >
                      <FaEdit className="text-white" />
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-[#19213A] hover:bg-red-500 hover:text-black transition-colors" 
                      title="Delete"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <FaTrash className="text-white" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Username:</span>
                    <p className="text-white font-medium">{user.displayName || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Role:</span>
                    <p className="text-white font-medium">{getUserRole(user)}</p>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 mb-6 md:mb-8 text-white gap-4">
            <span className="text-sm text-gray-400 text-center md:text-left">
              Showing data {filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length} entries
            </span>
            <div className="flex gap-2 items-center justify-center">
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
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button onClick={closeViewModal} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={selectedUser.profilePicture || "/vercel.svg"} alt={getUserName(selectedUser)} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="text-white font-semibold text-lg">{getUserName(selectedUser)}</h3>
                  <p className="text-gray-400">{selectedUser.email}</p>

                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">First Name:</span>
                  <p className="text-white font-medium">{selectedUser.firstName}</p>
                </div>
                <div>
                  <span className="text-gray-400">Last Name:</span>
                  <p className="text-white font-medium">{selectedUser.lastName}</p>
                </div>
                <div>
                  <span className="text-gray-400">Display Name:</span>
                  <p className="text-white font-medium">{selectedUser.displayName || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <p className="text-white font-medium">{selectedUser.location || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Country:</span>
                  <p className="text-white font-medium">{selectedUser.country || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Role:</span>
                  <p className="text-white font-medium">{getUserRole(selectedUser)}</p>
                </div>
              </div>
              
              {selectedUser.biography && (
                <div>
                  <span className="text-gray-400 text-sm">Biography:</span>
                  <p className="text-white text-sm mt-1">{selectedUser.biography}</p>
                </div>
              )}
              
              <div>
                <span className="text-gray-400 text-sm">Joined:</span>
                <p className="text-white text-sm mt-1">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit User</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}>
                {message.text}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1 text-sm">First Name</label>
                <input
                  type="text"
                  value={editingUser.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Last Name</label>
                <input
                  type="text"
                  value={editingUser.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Display Name</label>
                <input
                  type="text"
                  value={editingUser.displayName || ''}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Location</label>
                <input
                  type="text"
                  value={editingUser.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Country</label>
                <input
                  type="text"
                  value={editingUser.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Biography</label>
                <textarea
                  value={editingUser.biography || ''}
                  onChange={(e) => handleInputChange('biography', e.target.value)}
                  rows={3}
                  className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 focus:outline-none border border-[#232B43] focus:border-[#E100FF] text-sm resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 py-2 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  isSaving 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-[#E100FF] text-white hover:bg-[#c800d6]'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

      )}

      {/* Delete User Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Delete User</h2>
              <button onClick={closeDeleteModal} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}>
                {message.text}
              </div>
            )}
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <img src={deletingUser.profilePicture || "/vercel.svg"} alt={getUserName(deletingUser)} className="w-16 h-16 rounded-full object-cover" />
              </div>
              <p className="text-white mb-2">Are you sure you want to delete this user?</p>
              <p className="text-gray-400 text-sm">{getUserName(deletingUser)} ({deletingUser.email})</p>
              <p className="text-red-400 text-sm mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}

                className="flex-1 py-2 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors"
              >
                Cancel
              </button>
              <button

                onClick={confirmDelete}
                disabled={isDeleting}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  isDeleting 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}

              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}