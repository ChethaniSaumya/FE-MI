"use client";
import React, { useState, useEffect, useRef } from 'react'

import { CgProfile } from "react-icons/cg";
import { RiArrowDropDownLine, RiPlayListLine, RiHeartLine, RiCheckLine, RiSettings3Line, RiLogoutBoxRLine } from "react-icons/ri";
import { FaUpload, FaMusic, FaShoppingCart, FaBook, FaChartLine, FaStore } from "react-icons/fa";
import logo from '../images/logo/logo.png'
import Music from '../images/Navbar/Music.svg'
import Sounds from '../images/Navbar/Person.svg'
import Musicians from '../images/Navbar/Sonometer.svg'
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';


import Bell from '../images/Navbar/Bell.svg'
import User from '../images/Navbar/User.svg'
import Heart from '../images/Navbar/Heart.svg'


function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Track');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [cartCount, setCartCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    const dropdownOptions = ['All', 'Track', 'Sound Kits', 'Musicians'];

    // Function to render icons
    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'RiPlayListLine':
                return <RiPlayListLine size={20} />;
            case 'RiHeartLine':
                return <RiHeartLine size={20} />;
            case 'RiCheckLine':
                return <RiCheckLine size={20} />;
            case 'RiSettings3Line':
                return <RiSettings3Line size={20} />;
            case 'RiLogoutBoxRLine':
                return <RiLogoutBoxRLine size={20} />;
            case 'FaUpload':
                return <FaUpload size={18} />;
            case 'FaMusic':
                return <FaMusic size={18} />;
            case 'FaShoppingCart':
                return <FaShoppingCart size={18} />;
            case 'FaBook':
                return <FaBook size={18} />;
            case 'FaChartLine':
                return <FaChartLine size={18} />;
            case 'FaStore':
                return <FaStore size={18} />;
            default:
                return <span>{iconName}</span>;
        }
    };

    // Load user data from localStorage
    useEffect(() => {
        const loadUserData = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const userInfo = JSON.parse(userData);
                setUser(userInfo);
                // Fetch cart count
                fetchCartCount(userInfo.id);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        };

        // Load initial data
        loadUserData();

        // Listen for storage changes (when user updates profile in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user') {
                loadUserData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events (when user updates profile in same tab)
        const handleUserUpdate = () => {
            loadUserData();
        };

        window.addEventListener('userProfileUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userProfileUpdated', handleUserUpdate);
        };
    }, []);

    // Fetch cart count
    const fetchCartCount = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/cart/${userId}`);
            const data = await response.json();
            if (data.success) {
                setCartCount(data.cart?.itemCount || 0);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    // Handle click outside to close dropdowns
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
                setIsDropdownOpen(false);
                setIsMobileMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setActiveDropdown(null);
        router.push('/user/pages/SignIn');
    };

    const iconDropdowns = {
        user: {
            profile: {
                username: user ? `${user.firstName} ${user.lastName}` : 'Guest User',
                status: 'FREE',
                wallet: '00.00 $'
            },
            sections: [
                {
                    title: 'Creator',
                    items: [
                        { name: 'Dashboard', icon: 'FaChartLine', href: '/user/pages/CreatorDashboard' },
                        { name: 'Upload Track', icon: 'FaUpload', href: '/user/pages/Upload' },
                        { name: 'My Tracks', icon: 'FaMusic', href: '/user/pages/MyTracks' },
                    ]
                },
                {
                    title: 'Buyer',
                    items: [
                        { name: 'Marketplace', icon: 'FaStore', href: '/user/pages/Marketplace' },
                        { name: 'My Library', icon: 'FaBook', href: '/user/pages/MyLibrary' },
                        { name: 'Cart', icon: 'FaShoppingCart', href: '/user/pages/Cart' },
                    ]
                },
                {
                    title: 'Settings',
                    items: [
                        { name: 'Account Setting', icon: 'RiSettings3Line', href: '/user/pages/UserProfile?edit=true' }
                    ]
                },
                {
                    title: 'Logout',
                    items: [
                        { name: 'Log out', icon: 'RiLogoutBoxRLine', href: '' }
                    ]
                }
            ]
        },
    };

    return (
        <div className='fixed top-0 left-0 right-0 z-100000 ' ref={dropdownRef}>
            <div className='containerpaddin container mx-auto  py-2 sm:py-4'>
                <nav className="bg-white/30 backdrop-blur-sm rounded-full px-4 sm:px-6 lg:px-10">
                    <div className="max-w-screen-xl flex items-center justify-between mx-auto p-1">

                        <a href="/user/pages/home" className="flex items-center space-x-3 rtl:space-x-reverse">
                            <img src={logo.src} className="h-8 min-w-[100px] object-contain" alt="Museedle Logo" />
                        </a>


                        {/* Desktop Navigation */}
                        <div className='hidden md:block bg-black/70 backdrop-blur-sm rounded-full border border-white/50'>
                            <div className="flex items-center justify-center py-2 md:py-2 lg:py-1 px-4 md:px- lg:px-8">
                                <ul className="font-roboto font-light-300 flex items-center space-x-3 md:space-x-2 lg:space-x-6">
                                    {/* Marketplace - Primary CTA */}
                                    <li className="flex items-center">
                                        <FaStore className="h-3 md:h-3 lg:h-4 mr-1 md:mr-1 lg:mr-2 text-[#E100FF]" />
                                        <a href="/user/pages/Marketplace" className={`block px-2 md:px-2 lg:px-2 rounded-sm hover:bg-red-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 hover:bg-gray-700 hover:text-white md:hover:bg-transparent text-sm md:text-[10px] lg:text-[12px] xl:text-base transition-colors duration-200 ${pathname === '/user/pages/Marketplace' ? 'text-primary font-semibold border-b-2 border-primary' : 'text-white'
                                            }`}>Marketplace</a>
                                    </li>
                                    <div className='h-4 md:h-4 lg:h-6 w-px bg-white' />
                                    
                                    {/* Upload - For Creators */}
                                    {user && (
                                        <>
                                            <li className="flex items-center">
                                                <FaUpload className="h-3 md:h-3 lg:h-4 mr-1 md:mr-1 lg:mr-2 text-[#7ED7FF]" />
                                                <a href="/user/pages/Upload" className={`block px-2 md:px-2 lg:px-2 rounded-sm hover:bg-red-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 hover:bg-gray-700 hover:text-white md:hover:bg-transparent text-sm md:text-[10px] lg:text-[12px] xl:text-base transition-colors duration-200 ${pathname === '/user/pages/Upload' ? 'text-primary font-semibold border-b-2 border-primary' : 'text-white'
                                                    }`}>Upload</a>
                                            </li>
                                            <div className='h-4 md:h-4 lg:h-6 w-px bg-white' />
                                            
                                            <li className="flex items-center">
                                                <FaChartLine className="h-3 md:h-3 lg:h-4 mr-1 md:mr-1 lg:mr-2 text-green-400" />
                                                <a href="/user/pages/CreatorDashboard" className={`block px-2 md:px-2 lg:px-2 rounded-sm hover:bg-red-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 hover:bg-gray-700 hover:text-white md:hover:bg-transparent text-sm md:text-[10px] lg:text-[12px] xl:text-base transition-colors duration-200 ${pathname === '/user/pages/CreatorDashboard' ? 'text-primary font-semibold border-b-2 border-primary' : 'text-white'
                                                    }`}>Dashboard</a>
                                            </li>
                                            <div className='h-4 md:h-4 lg:h-6 w-px bg-white' />
                                        </>
                                    )}

                                    <li className="flex items-center">
                                        <img src={Music.src} className="h-3 md:h-3 lg:h-4 mr-1 md:mr-1 lg:mr-2" alt="Track" />
                                        <a href="/user/pages/topcharts" className={`block px-2 md:px-2 lg:px-2 rounded-sm hover:bg-red-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 hover:bg-gray-700 hover:text-white md:hover:bg-transparent text-sm md:text-[10px] lg:text-[12px] xl:text-base transition-colors duration-200 ${pathname === '/user/pages/topcharts' ? 'text-primary font-semibold border-b-2 border-primary' : 'text-white'
                                            }`}>Track</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden flex items-center p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>


                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <>
                                    {/* Cart Icon */}
                                    <a 
                                        href="/user/pages/Cart" 
                                        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <FaShoppingCart className="text-xl" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-[#E100FF] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </a>

                                    {/* My Library Icon */}
                                    <a 
                                        href="/user/pages/MyLibrary" 
                                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="My Library"
                                    >
                                        <FaBook className="text-xl" />
                                    </a>

                                    {/* Profile Dropdown */}
                                    <div className="relative flex items-center space-x-2 text-white text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                        {user.profilePicture ? (
                                            <img 
                                                src={user.profilePicture} 
                                                alt="Profile" 
                                                className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                                            />
                                        ) : (
                                            <CgProfile className="text-white text-xl" />
                                        )}
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === 'welcome-profile' ? null : 'welcome-profile')}
                                            className="flex items-center hover:bg-white/10 rounded px-1 transition-colors"
                                        >
                                            <RiArrowDropDownLine className="text-white text-lg" />
                                        </button>
                                        <span className="hidden lg:inline">Welcome, <span className="text-primary font-bold">{user.firstName}</span>!</span>
                                        
                                        {activeDropdown === 'welcome-profile' && (
                                            <div className="absolute top-full right-0 mt-2 w-80 bg-black/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg z-100001 max-h-[80vh] overflow-hidden">
                                                {/* Profile Section */}
                                                <div className="p-4 border-b border-white/20">
                                                    <div
                                                        className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors"
                                                        onClick={() => {
                                                            setActiveDropdown(null);
                                                            window.location.href = '/user/pages/UserProfile';
                                                        }}
                                                    >
                                                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                                                            {user.profilePicture ? (
                                                                <img 
                                                                    src={user.profilePicture} 
                                                                    alt="Profile" 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <CgProfile className="text-white text-xl" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">{iconDropdowns.user.profile.username}</div>
                                                            <div className="text-gray-400 text-sm">{iconDropdowns.user.profile.status}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Sections */}
                                                <div className="py-2 overflow-y-auto max-h-[60vh]">
                                                    {iconDropdowns.user.sections.map((section, sectionIndex) => (
                                                        <div key={section.title}>
                                                            {sectionIndex > 0 && <div className="border-t border-white/20 my-2"></div>}
                                                            <div className="px-4 py-1 text-xs text-gray-500 uppercase">{section.title}</div>
                                                            {section.items.map((item) => (
                                                                <button
                                                                    key={item.name}
                                                                    onClick={() => {
                                                                        setActiveDropdown(null);
                                                                        if (item.name === 'Log out') {
                                                                            handleLogout();
                                                                        } else if (item.href) {
                                                                            router.push(item.href);
                                                                        }
                                                                    }}
                                                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-white/10 transition-colors text-white"
                                                                >
                                                                    {renderIcon(item.icon)}
                                                                    <span>{item.name}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <ul className="font-roboto font-light-300 flex items-center space-x-3 md:space-x-3 lg:space-x-3 xl:space-x-6">
                                    <li>
                                        <a href="/user/pages/SignUp" className="block px-2 md:px-2 lg:px-2 text-red-500 rounded-sm hover:bg-red-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 text-white md:hover:text-primary hover:bg-gray-700 hover:text-white md:hover:bg-transparent text-sm md:text-[10px] lg:text-[12px] xl:text-base">Sign up</a>
                                    </li>
                                    <div className='h-4 md:h-4 lg:h-6 w-px bg-white' />
                                    <li>
                                        <a href="/user/pages/SignIn" className="block py-1 md:py-1 lg:py-2 px-2 md:px-2 lg:px-2 text-white rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 text-white md:hover:text-primary hover:bg-gray-700 hover:text-white md:hover:bg-transparent text-sm md:text-[10px] lg:text-[12px] xl:text-base">Sign in</a>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                        <div className="space-y-4">
                            {/* Mobile Navigation Links */}
                            <div className="space-y-2">
                                {/* Primary Actions */}
                                <a href="/user/pages/Marketplace" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/Marketplace' ? 'text-primary font-semibold bg-white/10' : 'text-white'}`}>
                                    <FaStore className="h-4 text-[#E100FF]" />
                                    <span className="font-roboto font-light-300">Marketplace</span>
                                </a>
                                
                                {user && (
                                    <>
                                        <a href="/user/pages/Upload" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/Upload' ? 'text-primary font-semibold bg-white/10' : 'text-white'}`}>
                                            <FaUpload className="h-4 text-[#7ED7FF]" />
                                            <span className="font-roboto font-light-300">Upload Track</span>
                                        </a>
                                        <a href="/user/pages/CreatorDashboard" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/CreatorDashboard' ? 'text-primary font-semibold bg-white/10' : 'text-white'}`}>
                                            <FaChartLine className="h-4 text-green-400" />
                                            <span className="font-roboto font-light-300">Creator Dashboard</span>
                                        </a>
                                        <a href="/user/pages/MyTracks" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/MyTracks' ? 'text-primary font-semibold bg-white/10' : 'text-white'}`}>
                                            <FaMusic className="h-4 text-orange-400" />
                                            <span className="font-roboto font-light-300">My Tracks</span>
                                        </a>
                                        <a href="/user/pages/MyLibrary" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/MyLibrary' ? 'text-primary font-semibold bg-white/10' : 'text-white'}`}>
                                            <FaBook className="h-4 text-purple-400" />
                                            <span className="font-roboto font-light-300">My Library</span>
                                        </a>
                                        <a href="/user/pages/Cart" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/Cart' ? 'text-primary font-semibold bg-white/10' : 'text-white'}`}>
                                            <FaShoppingCart className="h-4 text-yellow-400" />
                                            <span className="font-roboto font-light-300">Cart {cartCount > 0 && `(${cartCount})`}</span>
                                        </a>
                                    </>
                                )}

                                <div className="border-t border-white/20 my-2"></div>

                                <a href="/user/pages/topcharts" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/topcharts' ? 'text-primary font-semibold' : 'text-white'
                                    }`}>
                                    <img src={Music.src} className="h-4" alt="Track" />
                                    <span className="font-roboto font-light-300">Track</span>
                                </a>
                                {/*<a href="/user/pages/SoundsKit" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/SoundsKit' ? 'text-primary font-semibold' : 'text-white'
                                    }`}>
                                    <img src={Musicians.src} className="h-4" alt="Sounds Kits" />
                                    <span className="font-roboto font-light-300">Sounds Kits</span>
                                </a>*/}
                                <a href="/user/pages/Musicians" className={`flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors ${pathname === '/user/pages/Musicians' ? 'text-primary font-semibold' : 'text-white'
                                    }`}>
                                    <img src={Sounds.src} className="h-4" alt="Musicians" />
                                    <span className="font-roboto font-light-300">Musicians</span>
                                </a>
                            </div>

                            <div className="border-t border-white/20 pt-4">
                                {user ? (
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-2 text-white text-lg mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                            {user.profilePicture ? (
                                                <img 
                                                    src={user.profilePicture} 
                                                    alt="Profile" 
                                                    className="w-6 h-6 rounded-full object-cover border-2 border-white/20"
                                                />
                                            ) : (
                                                <CgProfile className="text-white text-xl" />
                                            )}
                                            <span className="hidden lg:inline">Welcome, <span className="text-primary font-bold">{user.firstName}</span>!</span>
                                        </div>
                                        <div className="flex items-center justify-center space-x-4">
                                            <a 
                                                href="/user/pages/UserProfile"
                                                className="text-blue-400 font-roboto font-light-300 hover:text-blue-300"
                                            >
                                                Profile
                                            </a>
                                            <button
                                                onClick={handleLogout}
                                                className="text-red-400 font-roboto font-light-300 hover:text-red-300"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <a href="/user/pages/SignUp" className="text-red-500 font-roboto font-light-300">Sign up</a>
                                        <a href="/user/pages/SignIn" className="text-white font-roboto font-light-300">Sign in</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    )
}

export default Navbar