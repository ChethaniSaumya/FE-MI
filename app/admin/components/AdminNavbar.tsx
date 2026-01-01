import React from 'react';

const user = {
  name: 'Museedle Admin',
  email: 'museedleadmin@gmail.com',
  image: 'https://randomuser.me/api/portraits/men/32.jpg',
};

type AdminNavbarProps = {
  onMenuClick: () => void;
};

const AdminNavbar = ({ onMenuClick }: AdminNavbarProps) => {
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
            <span className="hidden sm:inline text-xl">Welcome back, {user.name}</span>
            <span className="sm:hidden text-lg">Welcome back</span>
          </div>
        </div>
        
        {/* Right side: User info + Profile image */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Show name/email only on md+ */}
          <div className="hidden md:block text-right">
            <div className="font-medium text-white truncate">{user.name}</div>
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-[#E100FF] flex-shrink-0">
            <span className="text-white font-bold text-lg">M</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 