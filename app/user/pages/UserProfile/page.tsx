'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { 
    FaUser, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaCamera, FaSpinner,
    FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaLink,
    FaStripe, FaCheckCircle, FaExclamationCircle, FaExternalLinkAlt
} from 'react-icons/fa'
import { stripeConnectAPI } from '../../../utils/api'
import axios from 'axios'

const API_URL = 'http://localhost:3001';

// Stripe Connect Section Component
const StripeConnectSection = ({ userId, onStatusChange }: { userId: string; onStatusChange?: (status: any) => void }) => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        checkStripeStatus();
    }, [userId]);

    const checkStripeStatus = async () => {
        try {
            setLoading(true);
            const response = await stripeConnectAPI.getStatus(userId);
            setStatus(response);
            if (onStatusChange) onStatusChange(response);
        } catch (error) {
            console.error('Error checking Stripe status:', error);
            setStatus({ connected: false });
        } finally {
            setLoading(false);
        }
    };

    const handleConnectStripe = async () => {
        try {
            setActionLoading(true);
            
            if (!status?.connected) {
                await stripeConnectAPI.createAccount(userId);
            }
            
            const response = await stripeConnectAPI.getOnboardingLink(userId);
            
            if (response.success && response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error connecting Stripe:', error);
            alert('Failed to connect Stripe. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenDashboard = async () => {
        try {
            setActionLoading(true);
            const response = await stripeConnectAPI.getDashboardLink(userId);
            
            if (response.success && response.url) {
                window.open(response.url, '_blank');
            }
        } catch (error) {
            console.error('Error opening dashboard:', error);
            alert('Failed to open Stripe dashboard.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-white" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
                <FaStripe className="text-3xl text-[#635BFF]" />
                <h2 className="text-xl font-semibold text-white">Stripe Payouts</h2>
            </div>

            {!status?.connected ? (
                <div>
                    <p className="text-gray-300 mb-4">
                        Connect your Stripe account to receive payments directly when your tracks are sold.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                            <FaExclamationCircle className="text-yellow-400 mt-1 flex-shrink-0" />
                            <p className="text-yellow-200 text-sm">
                                You must connect a Stripe account before you can sell tracks. 
                                Earnings will be automatically transferred to your bank account.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleConnectStripe}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {actionLoading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>
                                <FaStripe className="text-xl" />
                                <span>Connect with Stripe</span>
                            </>
                        )}
                    </button>
                </div>
            ) : !status?.onboardingComplete ? (
                <div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                            <FaExclamationCircle className="text-orange-400 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-orange-200 font-medium">Onboarding Incomplete</p>
                                <p className="text-orange-200/80 text-sm mt-1">
                                    Please complete your Stripe account setup to start receiving payments.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleConnectStripe}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {actionLoading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <span>Complete Setup</span>
                        )}
                    </button>
                </div>
            ) : !status?.payoutsEnabled ? (
                <div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                            <FaSpinner className="text-blue-400 mt-1 animate-spin flex-shrink-0" />
                            <div>
                                <p className="text-blue-200 font-medium">Verification Pending</p>
                                <p className="text-blue-200/80 text-sm mt-1">
                                    Stripe is reviewing your account. This usually takes 1-2 business days.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenDashboard}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {actionLoading ? <FaSpinner className="animate-spin" /> : <span>View Stripe Dashboard</span>}
                    </button>
                </div>
            ) : (
                <div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                            <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-green-200 font-medium">Payouts Enabled</p>
                                <p className="text-green-200/80 text-sm mt-1">
                                    Your Stripe account is fully set up. Earnings will be automatically transferred to your bank.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenDashboard}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {actionLoading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>
                                <span>Open Stripe Dashboard</span>
                                <FaExternalLinkAlt className="text-sm" />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Fee Structure Info */}
            <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="text-white font-medium mb-3">Fee Structure</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                        <span>Platform Fee</span>
                        <span>15%</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                        <span>You Receive</span>
                        <span className="text-green-400 font-medium">85%</span>
                    </div>
                </div>
                <p className="text-gray-400 text-xs mt-3">
                    Example: If you sell a track for $100, you receive $85 directly to your bank account.
                </p>
            </div>
        </div>
    );
};

function UserProfile() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        displayName: '',
        email: '',
        location: '',
        country: '',
        biography: '',
        profilePicture: '',
        socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: '',
            linkedin: '',
            website: ''
        }
    });

    // Check for Stripe redirect
    useEffect(() => {
        const stripeStatus = searchParams.get('stripe');
        if (stripeStatus === 'success') {
            setMessage({ type: 'success', text: 'Stripe account connected successfully!' });
            setActiveTab('payments');
        } else if (stripeStatus === 'refresh') {
            setMessage({ type: 'error', text: 'Stripe setup was interrupted. Please try again.' });
            setActiveTab('payments');
        }
    }, [searchParams]);

    // Load user data
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/user/pages/SignIn');
            return;
        }
        
        const userInfo = JSON.parse(userData);
        setUser(userInfo);
        fetchUserProfile(userInfo.id);
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/users/${userId}`);
            
            if (response.data.success) {
                const userData = response.data.user;
                setFormData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    displayName: userData.displayName || '',
                    email: userData.email || '',
                    location: userData.location || '',
                    country: userData.country || '',
                    biography: userData.biography || '',
                    profilePicture: userData.profilePicture || '',
                    socialLinks: userData.socialLinks || {
                        facebook: '',
                        twitter: '',
                        instagram: '',
                        youtube: '',
                        linkedin: '',
                        website: ''
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialKey]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please upload a valid image file' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be less than 5MB' });
            return;
        }

        try {
            setUploadingImage(true);
            const uploadData = new FormData();
            uploadData.append('image', file);

            const response = await axios.post(`${API_URL}/api/upload-image`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    profilePicture: response.data.imageUrl
                }));
                setMessage({ type: 'success', text: 'Profile picture uploaded!' });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) return;

        try {
            setSaving(true);
            setMessage(null);

            const response = await axios.put(`${API_URL}/api/profile/${user.id}`, formData);

            if (response.data.success) {
                // Update localStorage
                const updatedUser = { ...user, ...response.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                
                // Dispatch event to update Navbar
                window.dispatchEvent(new Event('userProfileUpdated'));
                
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const countries = [
        'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
        'France', 'Japan', 'South Korea', 'Brazil', 'India', 'Other'
    ];

    if (loading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="container mx-auto px-4 py-8 pt-32">
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-4xl text-white" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            
            <div className="container mx-auto px-4 py-8 pt-32">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
                        <p className="text-gray-400 mt-1">Manage your profile and payment settings</p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`p-4 rounded-lg mb-6 ${
                            message.type === 'success' 
                                ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                                : 'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex space-x-4 mb-6 border-b border-white/20">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`pb-3 px-2 font-medium transition-colors ${
                                activeTab === 'profile'
                                    ? 'text-[#E100FF] border-b-2 border-[#E100FF]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`pb-3 px-2 font-medium transition-colors flex items-center space-x-2 ${
                                activeTab === 'payments'
                                    ? 'text-[#E100FF] border-b-2 border-[#E100FF]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <FaStripe />
                            <span>Payments</span>
                        </button>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Picture Section */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
                                            {formData.profilePicture ? (
                                                <img 
                                                    src={formData.profilePicture} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FaUser className="text-gray-400 text-3xl" />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-[#E100FF] rounded-full flex items-center justify-center hover:bg-[#c000dd] transition-colors"
                                        >
                                            {uploadingImage ? (
                                                <FaSpinner className="animate-spin text-white text-sm" />
                                            ) : (
                                                <FaCamera className="text-white text-sm" />
                                            )}
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Upload a new photo</p>
                                        <p className="text-gray-400 text-sm">JPG, PNG. Max 5MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Info Section */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Display Name / Username
                                        </label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="johndoe_beats"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Location / City
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="Los Angeles"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Country
                                        </label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                        >
                                            <option value="">Select country</option>
                                            {countries.map(country => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-white mb-1">
                                        Biography
                                    </label>
                                    <textarea
                                        name="biography"
                                        value={formData.biography}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>

                            {/* Social Links Section */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h2 className="text-xl font-semibold text-white mb-4">Social Links</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1 flex items-center">
                                            <FaFacebook className="mr-2 text-blue-500" /> Facebook
                                        </label>
                                        <input
                                            type="url"
                                            name="social_facebook"
                                            value={formData.socialLinks.facebook}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="https://facebook.com/username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1 flex items-center">
                                            <FaTwitter className="mr-2 text-sky-500" /> Twitter / X
                                        </label>
                                        <input
                                            type="url"
                                            name="social_twitter"
                                            value={formData.socialLinks.twitter}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="https://twitter.com/username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1 flex items-center">
                                            <FaInstagram className="mr-2 text-pink-500" /> Instagram
                                        </label>
                                        <input
                                            type="url"
                                            name="social_instagram"
                                            value={formData.socialLinks.instagram}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="https://instagram.com/username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1 flex items-center">
                                            <FaYoutube className="mr-2 text-red-500" /> YouTube
                                        </label>
                                        <input
                                            type="url"
                                            name="social_youtube"
                                            value={formData.socialLinks.youtube}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="https://youtube.com/@channel"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1 flex items-center">
                                            <FaLinkedin className="mr-2 text-blue-600" /> LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            name="social_linkedin"
                                            value={formData.socialLinks.linkedin}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1 flex items-center">
                                            <FaLink className="mr-2 text-gray-400" /> Website
                                        </label>
                                        <input
                                            type="url"
                                            name="social_website"
                                            value={formData.socialLinks.website}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                    saving
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-[#E100FF] text-white hover:bg-[#c000dd]'
                                }`}
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && user && (
                        <div className="space-y-6">
                            <StripeConnectSection userId={user.id} />
                            
                            {/* Additional Payment Info */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h2 className="text-xl font-semibold text-white mb-4">How Payments Work</h2>
                                <div className="space-y-4 text-gray-300">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-[#E100FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[#E100FF] font-bold text-sm">1</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Connect Stripe</p>
                                            <p className="text-sm text-gray-400">Link your bank account through Stripe's secure onboarding process.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-[#E100FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[#E100FF] font-bold text-sm">2</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Sell Your Tracks</p>
                                            <p className="text-sm text-gray-400">Upload and list your tracks on the marketplace.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-[#E100FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[#E100FF] font-bold text-sm">3</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Get Paid Automatically</p>
                                            <p className="text-sm text-gray-400">When someone buys your track, 85% is automatically transferred to your bank account within 2-7 business days.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default UserProfile;