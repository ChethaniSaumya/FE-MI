"use client";
import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { getCustomers, Customer } from "./customer";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState({
    name: '',
    displayName: '',
    phone: '',
    email: ''
  });
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));
  const paginatedCustomers = customers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      // Simulate async fetch
      const data = await Promise.resolve(getCustomers());
      setCustomers(data);
      setLoading(false);
    }
    fetchCustomers();
  }, []);

  function handleViewCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  }

  function handleCloseViewModal() {
    setShowViewModal(false);
    setSelectedCustomer(null);
  }

  function handleEditCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setEditCustomer({
      name: customer.name,
      displayName: customer.displayName,
      phone: customer.phone,
      email: customer.email
    });
    setShowEditModal(true);
  }

  function handleSaveEditCustomer() {
    if (!selectedCustomer) return;
    
    console.log('Updating customer:', selectedCustomer.id, editCustomer);
    
    // Update the customer in the local state (simulate backend update)
    setCustomers(customers.map(customer => 
      customer.id === selectedCustomer.id 
        ? { 
            ...customer, 
            name: editCustomer.name,
            displayName: editCustomer.displayName,
            phone: editCustomer.phone,
            email: editCustomer.email
          }
        : customer
    ));
    
    setShowEditModal(false);
    setSelectedCustomer(null);
    setEditCustomer({ name: '', displayName: '', phone: '', email: '' });
  }

  function handleCloseEditModal() {
    setShowEditModal(false);
    setSelectedCustomer(null);
    setEditCustomer({ name: '', displayName: '', phone: '', email: '' });
  }

  function handleDeleteCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  }

  function handleConfirmDelete() {
    if (!selectedCustomer) return;
    
    console.log('Deleting customer:', selectedCustomer.id);
    
    // Remove the customer from the local state (simulate backend delete)
    setCustomers(customers.filter(customer => customer.id !== selectedCustomer.id));
    
    setShowDeleteModal(false);
    setSelectedCustomer(null);
  }

  function handleCloseDeleteModal() {
    setShowDeleteModal(false);
    setSelectedCustomer(null);
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#081028]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Customers <span className="text-lg font-normal text-gray-400 ml-4">All Customers</span></h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search for..."
              className="w-64 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43]"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xl bg-[#101936]">
        <table className="min-w-full text-white">
          <thead>
            <tr className="bg-[#19213A] text-[#C7C7C7] text-left text-sm">
              <th className="px-6 py-4 font-semibold">Image</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Display Name</th>
              <th className="px-6 py-4 font-semibold">Phone</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td>
              </tr>
            ) : paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No customers found.</td>
              </tr>
            ) : (
              paginatedCustomers.map((customer, idx) => (
                <tr
                  key={customer.id + '-' + idx}
                  className={
                    idx % 2 === 0
                      ? "bg-[#181F36] hover:bg-[#232B43] transition-colors"
                      : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                  }
                >
                  <td className="px-6 py-4">
                    <img src={customer.image} alt={customer.name} className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="px-6 py-4">{customer.name}</td>
                  <td className="px-6 py-4">{customer.displayName}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4 flex gap-4 text-lg">
                    <button 
                      className="text-white hover:text-[#7ED7FF] transition-colors" 
                      title="View"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="text-white hover:text-[#E100FF] transition-colors" 
                      title="Edit"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-white hover:text-red-500 transition-colors" 
                      title="Delete"
                      onClick={() => handleDeleteCustomer(customer)}
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

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : paginatedCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No customers found.</div>
        ) : (
          paginatedCustomers.map((customer, idx) => (
            <div
              key={customer.id + '-' + idx}
              className="bg-[#101936] rounded-xl p-4 shadow-lg border border-[#232B43]"
            >
              <div className="flex items-start gap-4 mb-3">
                <img 
                  src={customer.image} 
                  alt={customer.name} 
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">{customer.name}</h3>
                  <p className="text-[#7ED7FF] text-sm mb-1">{customer.displayName}</p>
                  <p className="text-gray-400 text-sm mb-1">{customer.phone}</p>
                  <p className="text-gray-400 text-sm truncate">{customer.email}</p>
                </div>
              </div>
              <div className="flex gap-3 text-lg justify-end">
                <button 
                  className="text-white hover:text-[#7ED7FF] transition-colors p-1" 
                  title="View"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <FaEye />
                </button>
                <button 
                  className="text-white hover:text-[#E100FF] transition-colors p-1" 
                  title="Edit"
                  onClick={() => handleEditCustomer(customer)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="text-white hover:text-red-500 transition-colors p-1" 
                  title="Delete"
                  onClick={() => handleDeleteCustomer(customer)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-white gap-4">
        <span className="text-sm text-gray-400 text-center sm:text-left">
          Showing data {customers.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, customers.length)} of {customers.length} entries
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

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">View Customer Details</h2>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={selectedCustomer.image} 
                  alt={selectedCustomer.name} 
                  className="w-20 h-20 rounded-xl object-cover border border-[#232B43]" 
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedCustomer.name}</h3>
                  <p className="text-[#7ED7FF] text-sm">{selectedCustomer.displayName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">Phone</label>
                  <div className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43]">
                    {selectedCustomer.phone}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">Email</label>
                  <div className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43]">
                    {selectedCustomer.email}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Display Name</label>
                <div className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43]">
                  {selectedCustomer.displayName}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">ID</label>
                <div className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43]">
                  {selectedCustomer.id}
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

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Customer</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={selectedCustomer.image} 
                  alt={selectedCustomer.name} 
                  className="w-20 h-20 rounded-xl object-cover border border-[#232B43]" 
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedCustomer.id}</h3>
                  <p className="text-[#7ED7FF] text-sm">Customer ID</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">Name</label>
                  <input
                    type="text"
                    value={editCustomer.name}
                    onChange={(e) => setEditCustomer({...editCustomer, name: e.target.value})}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43] focus:outline-none focus:border-[#7ED7FF]"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">Display Name</label>
                  <input
                    type="text"
                    value={editCustomer.displayName}
                    onChange={(e) => setEditCustomer({...editCustomer, displayName: e.target.value})}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43] focus:outline-none focus:border-[#7ED7FF]"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">Phone</label>
                  <input
                    type="text"
                    value={editCustomer.phone}
                    onChange={(e) => setEditCustomer({...editCustomer, phone: e.target.value})}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43] focus:outline-none focus:border-[#7ED7FF]"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">Email</label>
                  <input
                    type="email"
                    value={editCustomer.email}
                    onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 border border-[#232B43] focus:outline-none focus:border-[#7ED7FF]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseEditModal}
                className="py-2 px-6 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditCustomer}
                className="py-2 px-6 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-opacity-90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-[#00000020] flex items-center justify-center z-50 p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Delete Customer</h2>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4 flex justify-center">
                  <FaTrash />
                </div>
                <p className="text-gray-300 mb-4">
                  Are you sure you want to delete this customer?
                </p>
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
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
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