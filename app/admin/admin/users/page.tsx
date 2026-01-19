"use client";
import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaTimes, FaPlus, FaUserPlus, FaUserShield } from "react-icons/fa";
import { userAPI } from "../../utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";


interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  role: string;
  isAdmin: boolean;
  isCreator: boolean;
  isBuyer: boolean;
  profilePicture?: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 8;

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users whenever search term or role filter changes
  useEffect(() => {
    let filtered = users;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (roleFilter === 'admin') return user.isAdmin && user.role === 'admin';
        if (roleFilter === 'creator') return user.isCreator;
        if (roleFilter === 'user') return user.isBuyer && !user.isAdmin && !user.isCreator;
        return true;
      });
    }
    
    setFilteredUsers(filtered);
    setPage(1); // Reset to first page when filtering
  }, [searchTerm, roleFilter, users]);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await userAPI.getUsers();
      if (response.success) {
        setUsers(response.users);
        setFilteredUsers(response.users);
      } else {
        setMessage('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  const getRoleBadge = (user: User) => {
    if (user.isAdmin && user.role === 'admin') {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Admin</span>;
    }
    if (user.isCreator) {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Creator</span>;
    }
    if (user.isBuyer) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">User</span>;
    }
    return null;
  };

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  const handleEditUser = (user: User) => {
    // Store user data for editing (you'll need to create an edit user page)
    localStorage.setItem('editUserData', JSON.stringify(user));
    router.push(`/admin/users/edit?id=${user.id}`);
  };

  const openDeleteModal = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
    setMessage('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingUser(null);
    setMessage('');
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    
    setIsDeleting(true);
    try {
      const response = await userAPI.deleteUser(deletingUser.id);
      if (response.success) {
        setMessage('User deleted successfully!');
        // Remove from local state
        setUsers(prev => prev.filter(user => user.id !== deletingUser.id));
        setFilteredUsers(prev => prev.filter(user => user.id !== deletingUser.id));
        closeDeleteModal();
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setMessage(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#081028]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Users <span className="text-lg font-normal text-gray-400 ml-4">All Users</span></h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43] pr-10"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full sm:w-48 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white focus:outline-none border border-[#232B43]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="creator">Creator</option>
              <option value="user">Regular User</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/users/add"
              className="bg-secondary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-secondary/80 transition-colors justify-center"
            >
              <FaUserPlus />
              Add User
            </Link>
            <Link
              href="/admin/users/add?type=admin"
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-700 transition-colors justify-center"
            >
              <FaUserShield />
              Add Admin
            </Link>
          </div>
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

      {/* Search Results Info */}
      {(searchTerm || roleFilter !== 'all') && (
        <div className="mb-4 p-3 rounded-lg bg-[#232B43] text-sm text-gray-300">
          Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
          {roleFilter !== 'all' && ` with role "${roleFilter}"`}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {(searchTerm || roleFilter !== 'all') ? 'No users found matching your criteria.' : 'No users available.'}
          </div>
          {(searchTerm || roleFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
              }}
              className="text-[#E100FF] hover:text-[#7ED7FF] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-[#081028]">
          {/* Table for md+ screens */}
          <table className="min-w-full text-white hidden md:table">
            <thead>
              <tr className="bg-[#232B43] text-[#C7C7C7] text-left text-sm">
                <th className="px-6 py-4 font-semibold">Profile</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={
                    idx % 2 === 0
                      ? "bg-[#101936] hover:bg-[#232B43] transition-colors"
                      : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                  }
                >
                  <td className="px-6 py-4">
                    <div className="relative w-10 h-10">
                      <img 
                        src={user.profilePicture || "/vercel.svg"} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        className="w-10 h-10 rounded-full border-2 border-[#E100FF] bg-white object-cover" 
                        onError={(e) => {
                          e.currentTarget.src = "/vercel.svg";
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-[#7ED7FF]">{user.email}</td>
                  <td className="px-6 py-4 font-mono text-sm">{user.username || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user)}
                  </td>
                  <td className="px-6 py-4">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 flex gap-4 text-lg">
                    <button 
                      className="text-white hover:text-[#7ED7FF] transition-colors" 
                      title="View"
                      onClick={() => handleViewUser(user)}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="text-white hover:text-[#E100FF] transition-colors" 
                      title="Edit"
                      onClick={() => handleEditUser(user)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-white hover:text-red-500 transition-colors" 
                      title="Delete"
                      onClick={() => openDeleteModal(user)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Cards for mobile screens */}
          <div className="md:hidden flex flex-col gap-4 p-2">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="bg-[#101936] rounded-2xl shadow-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-4 mb-2">
                  <img 
                    src={user.profilePicture || "/vercel.svg"} 
                    alt={`${user.firstName} ${user.lastName}`} 
                    className="w-14 h-14 rounded-full border-2 border-[#E100FF] bg-white object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "/vercel.svg";
                    }}
                  />
                  <div>
                    <div className="font-bold text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-[#7ED7FF]">{user.email}</div>
                    <div className="mt-1">{getRoleBadge(user)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">Username: <span className="text-white font-mono">{user.username || 'N/A'}</span></div>
                <div className="text-sm text-gray-400">Phone: <span className="text-white">{user.phone || 'N/A'}</span></div>
                <div className="flex gap-4 mt-2">
                  <button 
                    className="text-white hover:text-[#7ED7FF] transition-colors" 
                    title="View"
                    onClick={() => handleViewUser(user)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="text-white hover:text-[#E100FF] transition-colors" 
                    title="Edit"
                    onClick={() => handleEditUser(user)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="text-white hover:text-red-500 transition-colors" 
                    title="Delete"
                    onClick={() => openDeleteModal(user)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-white">
          <span className="text-sm text-gray-400">
            Showing data {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length} entries
          </span>
          <div className="flex gap-2 items-center">
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center ${page === 1 ? 'bg-[#232B43] text-gray-500' : 'bg-[#232B43] hover:bg-[#E100FF] hover:text-white'} transition-colors`}
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${page === i + 1 ? 'bg-[#E100FF] text-white' : 'bg-[#232B43] text-gray-300 hover:bg-[#E100FF] hover:text-white'} transition-colors`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
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

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">User Details</h2>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <div className="flex justify-center md:justify-start">
                <img 
                  src={selectedUser.profilePicture || "/vercel.svg"} 
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`} 
                  className="w-48 h-48 rounded-lg border-2 border-[#E100FF] bg-white object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = "/vercel.svg";
                  }}
                />
              </div>

              {/* User Information */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <div className="flex gap-2 mb-2">
                    {getRoleBadge(selectedUser)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Username:</span>
                    <p className="text-white font-mono">{selectedUser.username || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <p className="text-white">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">User ID:</span>
                    <p className="text-white font-mono text-xs">{selectedUser.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-[#232B43] rounded-lg">
                    <span className="text-gray-400 block">Admin Access</span>
                    <span className={`font-semibold ${selectedUser.isAdmin ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedUser.isAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#232B43] rounded-lg">
                    <span className="text-gray-400 block">Creator</span>
                    <span className={`font-semibold ${selectedUser.isCreator ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedUser.isCreator ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#232B43] rounded-lg">
                    <span className="text-gray-400 block">Buyer</span>
                    <span className={`font-semibold ${selectedUser.isBuyer ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedUser.isBuyer ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Created: {new Date(selectedUser.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Delete User</h2>
                <p className="text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-[#181F36] rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">User Details:</h3>
              <p className="text-gray-300 mb-1"><span className="text-gray-400">Name:</span> {deletingUser.firstName} {deletingUser.lastName}</p>
              <p className="text-gray-300 mb-1"><span className="text-gray-400">Email:</span> {deletingUser.email}</p>
              <p className="text-gray-300"><span className="text-gray-400">Role:</span> {deletingUser.role}</p>
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
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}