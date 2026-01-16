'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { FaCloudUploadAlt, FaImage, FaMusic, FaSpinner, FaStripe, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { stripeConnectAPI } from '../../../utils/api'

// Price Calculator Component
const PriceCalculator = ({ price, label = "Track Price" }: { price: number; label?: string }) => {
    const platformFeePercent = 15;
    const platformFee = Math.round(price * (platformFeePercent / 100) * 100) / 100;
    const creatorEarnings = Math.round((price - platformFee) * 100) / 100;

    if (price <= 0) return null;

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-2">
            <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white">${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee (15%)</span>
                    <span className="text-red-400">-${platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-1.5">
                    <div className="flex justify-between">
                        <span className="text-gray-300 font-medium">You Earn</span>
                        <span className="text-green-400 font-bold">${creatorEarnings.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    if (status?.connected && status?.payoutsEnabled) {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                    <FaCheckCircle className="text-green-400 text-xl" />
                    <div>
                        <p className="text-green-200 font-medium">Stripe Connected</p>
                        <p className="text-green-200/70 text-sm">You're ready to sell and receive payments!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start space-x-3">
                    <FaExclamationTriangle className="text-red-400 text-2xl mt-1" />
                    <div>
                        <p className="text-red-200 font-semibold text-lg">Stripe Account Required</p>
                        <p className="text-red-200/70 text-sm mt-1">
                            You must connect a Stripe account before uploading tracks. 
                            This allows you to receive payments directly to your bank account when your tracks are sold.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onConnect}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                    {loading ? (
                        <FaSpinner className="animate-spin" />
                    ) : (
                        <>
                            <FaStripe className="text-xl" />
                            <span>Connect Stripe</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

function Upload() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stripeStatus, setStripeStatus] = useState<any>(null);
    const [stripeLoading, setStripeLoading] = useState(true);
    const [connectLoading, setConnectLoading] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>('');
    
    const audioInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

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
        publish: 'Private',
        genreCategory: [] as string[],
        beatCategory: [] as string[],
        trackTags: [] as string[],
    });

    // Load user and check Stripe status
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
            
            // Create account if not exists
            if (!stripeStatus?.connected) {
                await stripeConnectAPI.createAccount(user.id);
            }
            
            // Get onboarding link
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

        // Auto-calculate commercial and exclusive prices based on base price
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check Stripe connection first
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

            const response = await fetch('http://localhost:3001/api/user/tracks', {
                method: 'POST',
                body: submitData
            });

            const result = await response.json();

            if (result.success) {
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

    // Show loading while checking Stripe status
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

                    {/* Upload Form - Disabled if Stripe not connected */}
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
                                        onClick={() => audioInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-[#E100FF]/50 transition-colors"
                                    >
                                        {audioPreview ? (
                                            <div>
                                                <FaCheckCircle className="mx-auto text-green-400 text-3xl mb-2" />
                                                <p className="text-white text-sm">{audioFile?.name}</p>
                                                <audio controls className="mt-3 w-full">
                                                    <source src={audioPreview} />
                                                </audio>
                                            </div>
                                        ) : (
                                            <div>
                                                <FaCloudUploadAlt className="mx-auto text-[#E100FF] text-4xl mb-2" />
                                                <p className="text-white">Click to upload audio</p>
                                                <p className="text-gray-400 text-sm">MP3, WAV up to 50MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={audioInputRef}
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleAudioChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                    <h3 className="text-white font-medium mb-4 flex items-center">
                                        <FaImage className="mr-2 text-[#7ED7FF]" />
                                        Cover Image
                                    </h3>
                                    <div 
                                        onClick={() => imageInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-[#7ED7FF]/50 transition-colors"
                                    >
                                        {imagePreview ? (
                                            <div>
                                                <img src={imagePreview} alt="Cover" className="mx-auto max-h-32 rounded-lg mb-2" />
                                                <p className="text-white text-sm">{imageFile?.name}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <FaImage className="mx-auto text-[#7ED7FF] text-4xl mb-2" />
                                                <p className="text-white">Click to upload cover</p>
                                                <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Track Details */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h3 className="text-white font-semibold mb-4">Track Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Track Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Track Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="trackName"
                                            value={formData.trackName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="Enter track name"
                                            required
                                        />
                                    </div>

                                    {/* Track Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Track Type
                                        </label>
                                        <select
                                            name="trackType"
                                            value={formData.trackType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                        >
                                            <option value="Beats">Beats</option>
                                            <option value="Instrumental">Instrumental</option>
                                            <option value="Loop">Loop</option>
                                            <option value="Sample">Sample</option>
                                        </select>
                                    </div>

                                    {/* BPM */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            BPM
                                        </label>
                                        <input
                                            type="number"
                                            name="bpm"
                                            value={formData.bpm}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                            placeholder="e.g. 120"
                                            min="1"
                                            max="300"
                                        />
                                    </div>

                                    {/* Key */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Key
                                        </label>
                                        <select
                                            name="trackKey"
                                            value={formData.trackKey}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                        >
                                            <option value="">Select key</option>
                                            <option value="C">C Major</option>
                                            <option value="C#">C# Major</option>
                                            <option value="D">D Major</option>
                                            <option value="D#">D# Major</option>
                                            <option value="E">E Major</option>
                                            <option value="F">F Major</option>
                                            <option value="F#">F# Major</option>
                                            <option value="G">G Major</option>
                                            <option value="G#">G# Major</option>
                                            <option value="A">A Major</option>
                                            <option value="A#">A# Major</option>
                                            <option value="B">B Major</option>
                                            <option value="Cm">C Minor</option>
                                            <option value="C#m">C# Minor</option>
                                            <option value="Dm">D Minor</option>
                                            <option value="D#m">D# Minor</option>
                                            <option value="Em">E Minor</option>
                                            <option value="Fm">F Minor</option>
                                            <option value="F#m">F# Minor</option>
                                            <option value="Gm">G Minor</option>
                                            <option value="G#m">G# Minor</option>
                                            <option value="Am">A Minor</option>
                                            <option value="A#m">A# Minor</option>
                                            <option value="Bm">B Minor</option>
                                        </select>
                                    </div>

                                    {/* Mood */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Mood
                                        </label>
                                        <select
                                            name="moodType"
                                            value={formData.moodType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                        >
                                            <option value="">Select mood</option>
                                            <option value="Happy">Happy</option>
                                            <option value="Sad">Sad</option>
                                            <option value="Energetic">Energetic</option>
                                            <option value="Chill">Chill</option>
                                            <option value="Dark">Dark</option>
                                            <option value="Uplifting">Uplifting</option>
                                            <option value="Aggressive">Aggressive</option>
                                            <option value="Romantic">Romantic</option>
                                        </select>
                                    </div>

                                    {/* Energy Level */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Energy Level
                                        </label>
                                        <select
                                            name="energyType"
                                            value={formData.energyType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-white mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                        placeholder="Describe your track..."
                                    />
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h3 className="text-white font-semibold mb-4">Pricing</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Set your base price. Commercial and Exclusive prices are calculated automatically.
                                    Platform fee is 15% - you receive 85% of each sale.
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Base Price (Personal License) */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Base Price (Personal) *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="trackPrice"
                                                value={formData.trackPrice}
                                                onChange={handleInputChange}
                                                className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                                placeholder="29.99"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <PriceCalculator 
                                            price={parseFloat(formData.trackPrice) || 0} 
                                            label="Personal License" 
                                        />
                                    </div>

                                    {/* Commercial Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Commercial Price (2.5x)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="commercialPrice"
                                                value={formData.commercialPrice}
                                                onChange={handleInputChange}
                                                className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                                placeholder="74.99"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <PriceCalculator 
                                            price={parseFloat(formData.commercialPrice) || 0} 
                                            label="Commercial License" 
                                        />
                                    </div>

                                    {/* Exclusive Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Exclusive Price (10x)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="exclusivePrice"
                                                value={formData.exclusivePrice}
                                                onChange={handleInputChange}
                                                className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E100FF]"
                                                placeholder="299.99"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <PriceCalculator 
                                            price={parseFloat(formData.exclusivePrice) || 0} 
                                            label="Exclusive License" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Publish Settings */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h3 className="text-white font-semibold mb-4">Visibility</h3>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="publish"
                                            value="Private"
                                            checked={formData.publish === 'Private'}
                                            onChange={handleInputChange}
                                            className="text-[#E100FF]"
                                        />
                                        <span className="text-white">Private (Draft)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="publish"
                                            value="Public"
                                            checked={formData.publish === 'Public'}
                                            onChange={handleInputChange}
                                            className="text-[#E100FF]"
                                        />
                                        <span className="text-white">Public (Listed for sale)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Message */}
                            {submitMessage && (
                                <div className={`p-4 rounded-lg ${
                                    submitMessage.type === 'success' 
                                        ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                                }`}>
                                    {submitMessage.text}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !canUpload}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                    isLoading || !canUpload
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-[#E100FF] text-white hover:bg-[#c000dd]'
                                }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        Uploading...
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