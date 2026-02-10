"use client";
import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#081028]">
      {/* Desktop Sidebar: hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-72 h-full">
            <AdminSidebar onClose={() => setSidebarOpen(false)} showCloseButton />
          </div>
          <div 
            className="flex-1 bg-black bg-opacity-50" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-72 bg-[#081028]">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-8 overflow-auto bg-[#081028]">{children}</main>
      </div>
    </div>
  );
} 