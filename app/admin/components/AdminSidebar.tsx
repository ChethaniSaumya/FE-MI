"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaTachometerAlt, FaMusic, FaPlus, FaTags, FaDrum, FaUsers, FaUserPlus, FaUser, FaClipboardList,
  FaCreditCard, FaUserCog, FaBoxOpen, FaCogs, FaCut, FaFolderOpen, FaUserCircle, FaChevronDown, FaChevronRight, FaBars
} from 'react-icons/fa';

type AdminSidebarProps = {
  onClose?: () => void;
  showCloseButton?: boolean;
};

const sidebarConfig = [
  {
    label: 'Dashboard',
    icon: <FaTachometerAlt />,
    href: '/admin',
  },
  {
    label: 'Track Management',
    icon: <FaClipboardList />,
    subpages: [
      { label: 'All Tracks', icon: <FaMusic />, href: '/admin/tracks' },
      { label: 'Add Track', icon: <FaPlus />, href: '/admin/tracks/add' },
      { label: 'Genres Category', icon: <FaTags />, href: '/admin/genres' },
      { label: 'Beat Category', icon: <FaDrum />, href: '/admin/beats' },
      { label: 'Track Tags', icon: <FaTags />, href: '/admin/tags' },
    ],
  },
  {
    label: 'Sound Kits',
    icon: <FaCut />,
    subpages: [
      { label: 'All Sound Kits', icon: <FaFolderOpen />, href: '/admin/sound-kits' },
      { label: 'Add Sound Kit', icon: <FaPlus />, href: '/admin/sound-kits/add' },
      { label: 'Category', icon: <FaCogs />, href: '/admin/sound-kits/category' },
      { label: 'Sound Kit Tags', icon: <FaTags />, href: '/admin/sound-kits/tags' },
    ],
  },
  // {
  //   label: 'Customers',
  //   icon: <FaUsers />,
  //   subpages: [
  //     { label: 'All Customers', icon: <FaUsers />, href: '/admin/customers' },
  //     { label: 'Add Customers', icon: <FaUserPlus />, href: '/admin/customers/add' },
  //   ],
  // },
  {
    label: 'Users',
    icon: <FaUser />,
    subpages: [
      { label: 'All Users', icon: <FaUser />, href: '/admin/users' },
      { label: 'Add user', icon: <FaUserPlus />, href: '/admin/users/add' },
      // { label: 'User Roles', icon: <FaUserCog />, href: '/admin/users/roles' },
    ],
  },
  // {
  //   label: 'Orders',
  //   icon: <FaClipboardList />,
  //   href: '/admin/orders',
  // },
  // {
  //   label: 'Subscription',
  //   icon: <FaCreditCard />,
  //   href: '/admin/subscription',
  // },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose, showCloseButton }) => {
  // All sub-menus collapsed by default
  const [open, setOpen] = useState<{ [key: string]: boolean }>({
    'Track Management': false,
    'Sound Kits': false,
    // 'Customers': false,
    'Users': false,
  });
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const handleSection = (label: string) => {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-72 h-screen flex flex-col bg-[#081028] shadow-2xl fixed left-0 top-0 border-r border-[#232B43]">
      {/* Close button for mobile */}
      {showCloseButton && (
        <button
          className="absolute top-4 right-4 z-50 p-2 rounded-md bg-[#232B43] text-white md:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      )}
      
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center px-6 py-6">
          <span className="text-2xl sm:text-3xl font-bold">
            <span className="text-[#E100FF]">MUS</span>
            <span className="text-[#C7C7C7]">EEDLE</span>
            <span className="text-xs align-super">®</span>
          </span>
        </div>
      </div>

      {/* Navigation Section - Scrollable only when content exceeds screen height */}
      <nav className="flex-1 px-2 space-y-2 overflow-y-auto pb-4">
        {sidebarConfig.map((item) => (
          <div key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 font-semibold rounded-lg cursor-pointer transition-colors
                  ${isActive(item.href) ? 'text-[#E100FF]' : 'text-white'}
                  hover:bg-[#232B43]`}
                onClick={onClose}
              >
                <span className={`text-xl mr-3 ${isActive(item.href) ? 'text-[#E100FF]' : ''}`}>{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <div
                className={`flex items-center px-4 py-3 font-semibold rounded-lg cursor-pointer transition-colors
                  ${open[item.label] ? 'text-[#E100FF]' : 'text-white'}
                  justify-between hover:bg-[#232B43]`}
                onClick={() => handleSection(item.label)}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl`}>{item.icon}</span>
                  {item.label}
                </div>
                <span>
                  {open[item.label] ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </div>
            )}
            {item.subpages && open[item.label] && (
              <ul className="pl-8 py-1 space-y-1">
                {item.subpages.map((sub) => (
                  <li key={sub.label}>
                    <Link
                      href={sub.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors
                        ${isActive(sub.href)
                          ? 'bg-[#232B43] text-[#E100FF] border-l-4 border-[#E100FF]'
                          : 'text-white hover:bg-[#232B43] hover:text-[#E100FF]'}
                      `}
                      onClick={onClose}
                    >
                      <span className="text-lg">{sub.icon}</span>
                      {sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Fixed Footer Section */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-[#232B43]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <div className="font-semibold text-white">Museedle Admin</div>
            <div className="text-xs text-gray-400">museedleadmin@gmail.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar; 