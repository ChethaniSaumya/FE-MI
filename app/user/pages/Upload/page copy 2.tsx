'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FaMusic, FaImage, FaSpinner, FaCheck, FaTimes, FaStripe, FaExclamationCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { stripeConnectAPI } from '../../../utils/api';

// Stripe Connect Banner Component
const StripeConnectBanner = ({ 
    status, 
    onConnect, 
    loading 
}: { 
    status: any; 
    onConnect: () => void; 
    loading: boolean;
}) => {
    if (!status) return null;

    // Fully connected and ready
    if (status.connected && status.payoutsEnabled) {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                    <FaCheck className="text-green-400 text-xl" />
                    <div>
                        <p className="text-green-400 font-medium">Stripe Connected</p>
                        <p className="text-green-400/70 text-sm">You're ready to receive payments for your tracks!</p>
                    </div>
                </div>
            </div>
        );
    }

    // Connected but onboarding incomplete
    if (status.connected && !status.onboardingComplete) {
        return (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FaExclamationCircle className="text-orange-400 text-xl" />
                        <div>
                            <p className="text-orange-400 font-medium">Complete Stripe Setup</p>
                            <p className="text-orange-400/70 text-sm">Please complete your Stripe account setup to start receiving payments.</p>
                        </div>
                    </div>
                    <button
                        onClick={onConnect}
                        disabled={loading}
                        className="px-4 py-2 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaExternalLinkAlt />}
                        <span>Continue Setup</span>
                    </button>
                </div>
            </div>
        );
    }

    // Not connected at all
    return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FaExclamationCircle className="text-yellow-400 text-xl" />
                    <div>
                        <p className="text-yellow-400 font-medium">Stripe Account Required</p>
                        <p className="text-yellow-400/70 text-sm">You must connect a Stripe account before uploading tracks. This allows you to receive payments directly to your bank account when your tracks are sold.</p>
                    </div>
                </div>
                <button
                    onClick={onConnect}
                    disabled={loading}
                    className="px-4 py-2 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaStripe className="text-xl" />}
                    <span>Connect Stripe</span>
                </button>
            </div>
        </div>
    );
};

// Platform fee percentage
const PLATFORM_FEE_PERCENT = 15;

function Upload() {
    const router = useRouter();
    const audioInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    
    const [user, setUser] = useState<any>(null);
    const [stripeStatus, setStripeStatus] = useState<any>(null);
    const [stripeLoading, setStripeLoading] = useState(true);
    const [connectLoading, setConnectLoading] = useState(false);
    
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        trackName: '',
        trackType: 'Beats',
        bpm: '',
        trackKey: '',
        moodType: '',
        energyType: 'Medium',
        trackPrice: '',
        commercialPrice: '',
        exclusivePrice: '',
        about: '',
        publish: 'Public',
        genreCategory: [] as string[],
        beatCategory: [] as string[],
        trackTags: [] as string[]
    });

    const [isLoading, setIsLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Check authentication
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/user/pages/SignIn');
            return;
        }
        const userInfo = JSON.parse(userData);
        setUser(userInfo);
        checkStripeStatus(userInfo.id);
    }, []);

    const checkStripeStatus = async (userId: string) => {
        try {
            setStripeLoading(true);
            const response = await stripeConnectAPI.getStatus(userId);
            setStripeStatus(response);
        } catch (error) {
            console.error('Error checking Stripe status:', error);
            setStripeStatus({ connected: false });
        } finally {
            setStripeLoading(false);
        }
    };

    const handleConnectStripe = async () => {
        if (!user) return;
        
        try {
            setConnectLoading(true);
            
            if (!stripeStatus?.connected) {
                await stripeConnectAPI.createAccount(user.id);
            }
            
            const response = await stripeConnectAPI.getOnboardingLink(user.id);
            
            if (response.success && response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error connecting Stripe:', error);
            setSubmitMessage({
                type: 'error',
                text: 'Failed to connect Stripe. Please try again.'
            });
        } finally {
            setConnectLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'trackPrice') {
            const basePrice = parseFloat(value) || 0;
            setFormData(prev => ({
                ...prev,
                trackPrice: value,
                commercialPrice: (Math.round(basePrice * 2.5 * 100) / 100).toString(),
                exclusivePrice: (Math.round(basePrice * 10 * 100) / 100).toString()
            }));
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                setSubmitMessage({ type: 'error', text: 'Please upload a valid audio file (MP3, WAV)' });
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                setSubmitMessage({ type: 'error', text: 'Audio file must be less than 50MB' });
                return;
            }
            setAudioFile(file);
            setAudioPreview(URL.createObjectURL(file));
            setSubmitMessage(null);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setSubmitMessage({ type: 'error', text: 'Please upload a valid image file (PNG, JPG)' });
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setSubmitMessage({ type: 'error', text: 'Image file must be less than 10MB' });
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setSubmitMessage(null);
        }
    };

    // UPDATED: Calculate earnings with Stripe fee deduction
    const calculateEarnings = (price: string) => {
        const priceNum = parseFloat(price) || 0;
        
        // Platform fee: 15%
        const platformFee = (priceNum * PLATFORM_FEE_PERCENT) / 100;
        
        // Stripe fee: 2.9% + $0.30
        const stripeFee = (priceNum * 0.029) + 0.30;
        
        // Seller earnings = Price - Platform Fee - Stripe Fee
        const earnings = priceNum - platformFee - stripeFee;
        
        return {
            price: priceNum,
            platformFee: Math.round(platformFee * 100) / 100,
            stripeFee: Math.round(stripeFee * 100) / 100,
            earnings: Math.round(earnings * 100) / 100
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!stripeStatus?.connected || !stripeStatus?.payoutsEnabled) {
            setSubmitMessage({
                type: 'error',
                text: 'You must connect your Stripe account before uploading tracks.'
            });
            return;
        }

        if (!audioFile) {
            setSubmitMessage({ type: 'error', text: 'Please upload an audio file' });
            return;
        }

        if (!formData.trackName.trim()) {
            setSubmitMessage({ type: 'error', text: 'Please enter a track name' });
            return;
        }

        if (!formData.trackPrice || parseFloat(formData.trackPrice) <= 0) {
            setSubmitMessage({ type: 'error', text: 'Please enter a valid price' });
            return;
        }

        setIsLoading(true);
        setSubmitMessage(null);

        try {
            const submitData = new FormData();
            submitData.append('audio', audioFile);
            if (imageFile) {
                submitData.append('image', imageFile);
            }
            
            submitData.append('trackName', formData.trackName);
            submitData.append('trackType', formData.trackType);
            submitData.append('bpm', formData.bpm);
            submitData.append('trackKey', formData.trackKey);
            submitData.append('moodType', formData.moodType);
            submitData.append('energyType', formData.energyType);
            submitData.append('trackPrice', formData.trackPrice);
            submitData.append('commercialPrice', formData.commercialPrice);
            submitData.append('exclusivePrice', formData.exclusivePrice);
            submitData.append('about', formData.about);
            submitData.append('publish', formData.publish);
            submitData.append('genreCategory', JSON.stringify(formData.genreCategory));
            submitData.append('beatCategory', JSON.stringify(formData.beatCategory));
            submitData.append('trackTags', JSON.stringify(formData.trackTags));
            submitData.append('userId', user.id);

            const response = await fetch('http://localhost:3001/api/user-tracks', {
                method: 'POST',
                body: submitData
            });

            const result = await response.json();

            if (result.success) {
                setUploadSuccess(true);
                setSubmitMessage({
                    type: 'success',
                    text: 'Track uploaded successfully! Redirecting...'
                });
                
                setTimeout(() => {
                    router.push('/user/pages/MyTracks');
                }, 2000);
            } else {
                setSubmitMessage({
                    type: 'error',
                    text: result.message || 'Failed to upload track'
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setSubmitMessage({
                type: 'error',
                text: 'An error occurred while uploading. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (stripeLoading) {
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

    const canUpload = stripeStatus?.connected && stripeStatus?.payoutsEnabled;
    const isButtonDisabled = isLoading || uploadSuccess || !canUpload;

    // Common input class - dark blue background
    const inputClass = "w-full bg-[#1a1f35] border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#E100FF] disabled:opacity-50";
    const selectClass = "w-full bg-[#1a1f35] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E100FF] disabled:opacity-50";

    return (
        <div className="min-h-screen">
            <Navbar />
            
            <div className="container mx-auto px-4 py-8 pt-32">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white">Upload Track</h1>
                        <p className="text-gray-400 mt-1">Upload your track and start selling on Museedle</p>
                    </div>

                    {/* Stripe Connect Banner */}
                    <StripeConnectBanner 
                        status={stripeStatus}
                        onConnect={handleConnectStripe}
                        loading={connectLoading}
                    />

                    {/* Upload Form */}
                    <div className={`${!canUpload ? 'opacity-50 pointer-events-none' : ''}`}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* File Upload Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Audio Upload */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                    <h3 className="text-white font-medium mb-4 flex items-center">
                                        <FaMusic className="mr-2 text-[#E100FF]" />
                                        Audio File *
                                    </h3>
                                    <div 
                                        onClick={() => !uploadSuccess && audioInputRef.current?.click()}
                                        className={`border-2 border-dashed border-white/30 rounded-lg p-8 text-center transition-colors ${
                                            uploadSuccess ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[#E100FF]/50'
                                        }`}
                                    >
                                        {audioPreview ? (
                                            <div className="space-y-2">
                                                <FaCheck className="text-green-400 text-2xl mx-auto" />
                                                <p className="text-white text-sm">{audioFile?.name}</p>
                                                <audio src={audioPreview} controls className="w-full mt-2" />
                                            </div>
                                        ) : (
                                            <>
                                                <FaMusic className="text-4xl text-[#E100FF] mx-auto mb-2" />
                                                <p className="text-white">Click to upload audio</p>
                                                <p className="text-gray-400 text-sm">MP3, WAV up to 50MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={audioInputRef}
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleAudioChange}
                                        className="hidden"
                                        disabled={uploadSuccess}
                                    />
                                </div>

                                {/* Cover Image Upload */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                    <h3 className="text-white font-medium mb-4 flex items-center">
                                        <FaImage className="mr-2 text-[#E100FF]" />
                                        Cover Image
                                    </h3>
                                    <div 
                                        onClick={() => !uploadSuccess && imageInputRef.current?.click()}
                                        className={`border-2 border-dashed border-white/30 rounded-lg p-8 text-center transition-colors ${
                                            uploadSuccess ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[#E100FF]/50'
                                        }`}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Cover" className="max-h-32 mx-auto rounded" />
                                        ) : (
                                            <>
                                                <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                                                <p className="text-white">Click to upload cover</p>
                                                <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={uploadSuccess}
                                    />
                                </div>
                            </div>

                            {/* Track Details */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h3 className="text-white font-medium mb-4">Track Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Track Name */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Track Name *</label>
                                        <input
                                            type="text"
                                            name="trackName"
                                            value={formData.trackName}
                                            onChange={handleInputChange}
                                            placeholder="Enter track name"
                                            className={inputClass}
                                            required
                                            disabled={uploadSuccess}
                                        />
                                    </div>

                                    {/* Track Type */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Track Type</label>
                                        <select
                                            name="trackType"
                                            value={formData.trackType}
                                            onChange={handleInputChange}
                                            className={selectClass}
                                            disabled={uploadSuccess}
                                        >
                                            <option value="Beats">Beats</option>
                                            <option value="Loops">Loops</option>
                                            <option value="Samples">Samples</option>
                                            <option value="Full Track">Full Track</option>
                                        </select>
                                    </div>

                                    {/* BPM */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">BPM</label>
                                        <input
                                            type="number"
                                            name="bpm"
                                            value={formData.bpm}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 120"
                                            className={inputClass}
                                            disabled={uploadSuccess}
                                        />
                                    </div>

                                    {/* Key */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Key</label>
                                        <select
                                            name="trackKey"
                                            value={formData.trackKey}
                                            onChange={handleInputChange}
                                            className={selectClass}
                                            disabled={uploadSuccess}
                                        >
                                            <option value="">Select key</option>
                                            <option value="C">C</option>
                                            <option value="C#">C#</option>
                                            <option value="D">D</option>
                                            <option value="D#">D#</option>
                                            <option value="E">E</option>
                                            <option value="F">F</option>
                                            <option value="F#">F#</option>
                                            <option value="G">G</option>
                                            <option value="G#">G#</option>
                                            <option value="A">A</option>
                                            <option value="A#">A#</option>
                                            <option value="B">B</option>
                                        </select>
                                    </div>

                                    {/* Mood */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Mood</label>
                                        <select
                                            name="moodType"
                                            value={formData.moodType}
                                            onChange={handleInputChange}
                                            className={selectClass}
                                            disabled={uploadSuccess}
                                        >
                                            <option value="">Select mood</option>
                                            <option value="Happy">Happy</option>
                                            <option value="Sad">Sad</option>
                                            <option value="Energetic">Energetic</option>
                                            <option value="Chill">Chill</option>
                                            <option value="Dark">Dark</option>
                                            <option value="Uplifting">Uplifting</option>
                                        </select>
                                    </div>

                                    {/* Energy Level */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Energy Level</label>
                                        <select
                                            name="energyType"
                                            value={formData.energyType}
                                            onChange={handleInputChange}
                                            className={selectClass}
                                            disabled={uploadSuccess}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-4">
                                    <label className="text-gray-300 text-sm mb-1 block">Description</label>
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleInputChange}
                                        placeholder="Describe your track..."
                                        rows={3}
                                        className={`${inputClass} resize-none`}
                                        disabled={uploadSuccess}
                                    />
                                </div>
                            </div>

                            {/* Pricing Section - UPDATED */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h3 className="text-white font-medium mb-2">Pricing</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Set your base price. Commercial and Exclusive prices are calculated automatically. 
                                    Platform fee is {PLATFORM_FEE_PERCENT}% and Stripe processing fee (2.9% + $0.30) is deducted from your earnings.
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Personal License */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Base Price (Personal) *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="trackPrice"
                                                value={formData.trackPrice}
                                                onChange={handleInputChange}
                                                placeholder="20"
                                                min="1"
                                                step="0.01"
                                                className={`${inputClass} pl-8`}
                                                required
                                                disabled={uploadSuccess}
                                            />
                                        </div>
                                        {formData.trackPrice && (
                                            <div className="mt-2 text-sm space-y-1">
                                                <div className="flex justify-between text-gray-400">
                                                    <span>Personal License</span>
                                                    <span>${calculateEarnings(formData.trackPrice).price.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-red-400">
                                                    <span>Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                                                    <span>-${calculateEarnings(formData.trackPrice).platformFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-red-400">
                                                    <span>Stripe Fee (2.9% + $0.30)</span>
                                                    <span>-${calculateEarnings(formData.trackPrice).stripeFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-green-400 font-medium border-t border-white/10 pt-1 mt-1">
                                                    <span>You Earn</span>
                                                    <span>${calculateEarnings(formData.trackPrice).earnings.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Commercial License */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Commercial Price (2.5x)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="commercialPrice"
                                                value={formData.commercialPrice}
                                                readOnly
                                                className="w-full bg-[#0f1425] border border-white/10 rounded-lg pl-8 pr-4 py-2 text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        {formData.commercialPrice && (
                                            <div className="mt-2 text-sm space-y-1">
                                                <div className="flex justify-between text-gray-400">
                                                    <span>Commercial License</span>
                                                    <span>${calculateEarnings(formData.commercialPrice).price.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-red-400">
                                                    <span>Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                                                    <span>-${calculateEarnings(formData.commercialPrice).platformFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-red-400">
                                                    <span>Stripe Fee (2.9% + $0.30)</span>
                                                    <span>-${calculateEarnings(formData.commercialPrice).stripeFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-green-400 font-medium border-t border-white/10 pt-1 mt-1">
                                                    <span>You Earn</span>
                                                    <span>${calculateEarnings(formData.commercialPrice).earnings.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Exclusive License */}
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Exclusive Price (10x)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="exclusivePrice"
                                                value={formData.exclusivePrice}
                                                readOnly
                                                className="w-full bg-[#0f1425] border border-white/10 rounded-lg pl-8 pr-4 py-2 text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        {formData.exclusivePrice && (
                                            <div className="mt-2 text-sm space-y-1">
                                                <div className="flex justify-between text-gray-400">
                                                    <span>Exclusive License</span>
                                                    <span>${calculateEarnings(formData.exclusivePrice).price.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-red-400">
                                                    <span>Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                                                    <span>-${calculateEarnings(formData.exclusivePrice).platformFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-red-400">
                                                    <span>Stripe Fee (2.9% + $0.30)</span>
                                                    <span>-${calculateEarnings(formData.exclusivePrice).stripeFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-green-400 font-medium border-t border-white/10 pt-1 mt-1">
                                                    <span>You Earn</span>
                                                    <span>${calculateEarnings(formData.exclusivePrice).earnings.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Visibility */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h3 className="text-white font-medium mb-4">Visibility</h3>
                                <div className="flex items-center space-x-6">
                                    <label className={`flex items-center space-x-2 ${uploadSuccess ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                        <input
                                            type="radio"
                                            name="publish"
                                            value="Private"
                                            checked={formData.publish === 'Private'}
                                            onChange={handleInputChange}
                                            className="text-[#E100FF]"
                                            disabled={uploadSuccess}
                                        />
                                        <span className="text-white">Private (Draft)</span>
                                    </label>
                                    <label className={`flex items-center space-x-2 ${uploadSuccess ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                        <input
                                            type="radio"
                                            name="publish"
                                            value="Public"
                                            checked={formData.publish === 'Public'}
                                            onChange={handleInputChange}
                                            className="text-[#E100FF]"
                                            disabled={uploadSuccess}
                                        />
                                        <span className="text-white">Public (Listed for sale)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Message */}
                            {submitMessage && (
                                <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                                    submitMessage.type === 'success' 
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                    {submitMessage.type === 'success' ? <FaCheck /> : <FaTimes />}
                                    <span>{submitMessage.text}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isButtonDisabled}
                                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                    isButtonDisabled
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-[#E100FF] text-white hover:bg-[#c000dd]'
                                }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        Uploading...
                                    </span>
                                ) : uploadSuccess ? (
                                    <span className="flex items-center justify-center">
                                        <FaCheck className="mr-2" />
                                        Uploaded Successfully
                                    </span>
                                ) : !canUpload ? (
                                    'Connect Stripe to Upload'
                                ) : (
                                    'Upload Track'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Upload;