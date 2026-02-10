'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../utils/api';

type AdminNavbarProps = {
  onMenuClick: () => void;
};

const AdminNavbar = ({ onMenuClick }: AdminNavbarProps) => {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Museedle Admin',
          email: user.email || 'museedleadmin@gmail.com',
          role: user.role || 'admin'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserData({
          name: 'Museedle Admin',
          email: 'museedleadmin@gmail.com',
          role: 'admin'
        });
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    authAPI.logout();
    // Redirect to sign in
    router.push('/user/pages/SignIn');
  };

  return (
    <nav className="w-full bg-[#081028] border-b border-[#232B43] shadow-sm sticky top-0 z-30 min-w-0">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 mx-auto max-w-7xl">
        {/* Left side: Hamburger + Welcome text */}
        <div className="flex items-center min-w-0 flex-1">
          {/* Hamburger for mobile */}
          <button className="md:hidden text-white text-2xl mr-4 flex-shrink-0" onClick={onMenuClick}>
            &#9776;
          </button>
          {/* Welcome text - responsive */}
          <div className="text-white font-semibold min-w-0">
            <span className="hidden sm:inline text-xl">Welcome back, {userData?.name || 'Museedle Admin'}</span>
            <span className="sm:hidden text-lg">Welcome back</span>
          </div>
        </div>
        
        {/* Right side: User info + Profile image + Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Logout button for desktop */}
          <button
            onClick={handleLogout}
            className="hidden md:block px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
          
          {/* Show name/email only on md+ */}
          <div className="hidden md:block text-right">
            <div className="font-medium text-white truncate">{userData?.name || 'Museedle Admin'}</div>
            <div className="text-xs text-gray-400 truncate">{userData?.email || 'museedleadmin@gmail.com'}</div>
            <div className="text-xs text-[#E100FF] truncate">{userData?.role || 'admin'}</div>
          </div>
          
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-[#E100FF] flex-shrink-0 cursor-pointer">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            
            {/* Dropdown menu for mobile */}
            <div className="absolute right-0 mt-2 w-48 bg-[#101936] rounded-lg shadow-lg border border-[#232B43] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-4 border-b border-[#232B43] md:hidden">
                <div className="font-medium text-white">{userData?.name || 'Museedle Admin'}</div>
                <div className="text-xs text-gray-400">{userData?.email || 'museedleadmin@gmail.com'}</div>
                <div className="text-xs text-[#E100FF]">{userData?.role || 'admin'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#232B43] transition-colors flex items-center gap-2"
              >
                <span>Logout</span>
                <span className="ml-auto">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;