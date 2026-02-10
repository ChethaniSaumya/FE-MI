'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FaMusic, FaImage, FaSpinner, FaCheck, FaTimes, FaPaypal, FaExclamationCircle } from 'react-icons/fa';
import { paypalAPI, genreAPI } from '../../../utils/api';

// PayPal Connect Banner Component
const PayPalConnectBanner = ({
    status,
    loading
}: {
    status: any;
    loading: boolean;
}) => {
    const router = useRouter();

    if (loading) return null;
    if (!status) return null;

    // Fully connected and ready
    if (status.connected && status.onboardingComplete) {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                    <FaCheck className="text-green-400 text-xl" />
                    <div>
                        <p className="text-green-400 font-medium">PayPal Connected</p>
                        <p className="text-green-400/70 text-sm">
                            Earnings will be sent to: <strong>{status.paypalEmail}</strong>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Not connected
    return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FaExclamationCircle className="text-yellow-400 text-xl" />
                    <div>
                        <p className="text-yellow-400 font-medium">PayPal Account Required</p>
                        <p className="text-yellow-400/70 text-sm">
                            You must connect your PayPal email before uploading tracks. Go to your profile settings to set it up.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/user/pages/UserProfile?tab=payments')}
                    className="px-4 py-2 bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap"
                >
                    <FaPaypal className="text-xl" />
                    <span>Connect PayPal</span>
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
    const genreDropdownRef = useRef<HTMLDivElement>(null);

    const [user, setUser] = useState<any>(null);
    const [paypalStatus, setPaypalStatus] = useState<any>(null);
    const [paypalLoading, setPaypalLoading] = useState(true);

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Genre selection state
    const [availableGenres, setAvailableGenres] = useState<{ id: string, name: string }[]>([]);
    const [genresLoading, setGenresLoading] = useState(false);
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const [genreSearchQuery, setGenreSearchQuery] = useState('');

    const trackKeyOptions = [
        "None", "Cm", "Dm", "Em", "Fm", "Gm", "Bm", "F♯m", "Am", "C♯m", "D♯m", "G♯m", "A♯m", "E♭m", "CM", "B♭m", "DM", "A♭m", "GM", "EM", "AM", "FM", "BM", "F♯M", "D♭m", "E♭M", "A♭M", "C♯M", "D♭M", "B♭M", "A♯M", "G♭M", "C♭M", "D♯M", "G♯M"
    ];

    const moodOptions = [
        "Bouncy", "Dark", "Energetic", "Soulful", "Inspiring", "Confident", "Sad", "Mellow", "Relaxed", "Calm", "Angry", "Happy", "Epic", "Accomplished", "Quirky", "Determined", "Crazy", "Loved", "Intense", "Powerful", "Dirty", "Lonely", "Depressed", "Hyper", "Flirty", "Grateful", "Rebellious", "Peaceful", "Evil", "Adored", "Gloomy", "Romantic", "Anxious", "Crunk", "Eccentric", "Neutral", "Exciting", "Dramatic", "Enraged", "Tense", "Majestic", "Annoyed", "Disappointed", "Lazy", "Silly", "Giddy", "Frantic", "Scared", "Scary", "Chill", "Bold", "Melancholy", "Seductive", "Dreamy", "Carefree", "Restless", "Mysterious", "Dancy", "Euphoric", "Rage", "Warm", "Optimistic", "Uplifting", "Sentimental", "Hopeful", "Cheerful", "Soothing", "Heartfelt", "Playful"
    ];

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
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Load genres from admin panel
    useEffect(() => {
        const loadGenres = async () => {
            try {
                setGenresLoading(true);
                const response = await genreAPI.getGenres();
                if (response.success) {
                    setAvailableGenres(response.genres.map((g: any) => ({
                        id: g.id,
                        name: g.name
                    })));
                }
            } catch (error) {
                console.error('Error loading genres:', error);
            } finally {
                setGenresLoading(false);
            }
        };

        loadGenres();
    }, []);

    // Check authentication and PayPal status
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/user/pages/SignIn');
            return;
        }
        const userInfo = JSON.parse(userData);
        setUser(userInfo);
        checkPayPalStatus(userInfo.id);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
                setShowGenreDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const checkPayPalStatus = async (userId: string) => {
        try {
            setPaypalLoading(true);
            const response = await paypalAPI.getStatus(userId);
            setPaypalStatus(response);
        } catch (error) {
            console.error('Error checking PayPal status:', error);
            setPaypalStatus({ connected: false, onboardingComplete: false });
        } finally {
            setPaypalLoading(false);
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

    // Genre selection handlers
    const handleGenreToggle = (genreId: string) => {
        setFormData(prev => ({
            ...prev,
            genreCategory: prev.genreCategory.includes(genreId)
                ? prev.genreCategory.filter(id => id !== genreId)
                : [...prev.genreCategory, genreId]
        }));
    };

    const handleRemoveGenre = (genreId: string) => {
        setFormData(prev => ({
            ...prev,
            genreCategory: prev.genreCategory.filter(id => id !== genreId)
        }));
    };

    const getGenreName = (genreId: string) => {
        const genre = availableGenres.find(g => g.id === genreId);
        return genre ? genre.name : genreId;
    };

    const filteredGenres = availableGenres.filter(genre =>
        genre.name.toLowerCase().includes(genreSearchQuery.toLowerCase())
    );

    // Fixed: accepts string or number, parses to number internally
    const calculateEarnings = (priceInput: string | number) => {
        const price = typeof priceInput === 'string' ? parseFloat(priceInput) || 0 : priceInput;
        const platformFee = price * 0.15;
        const paypalFee = price > 0 ? (price * 0.0349 + 0.49) : 0;
        const earnings = price - platformFee - paypalFee;
        return {
            price,
            platformFee,
            paypalFee,
            earnings: Math.max(0, earnings)
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!paypalStatus?.connected || !paypalStatus?.onboardingComplete) {
            setSubmitMessage({
                type: 'error',
                text: 'You must connect your PayPal account before uploading tracks.'
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

    if (paypalLoading) {
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

    const canUpload = paypalStatus?.connected && paypalStatus?.onboardingComplete;
    const isButtonDisabled = isLoading || uploadSuccess || !canUpload;

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

                    {/* PayPal Connect Banner */}
                    <PayPalConnectBanner
                        status={paypalStatus}
                        loading={paypalLoading}
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
                                        className={`border-2 border-dashed border-white/30 rounded-lg p-8 text-center transition-colors ${uploadSuccess ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[#E100FF]/50'}`}
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
                                        className={`border-2 border-dashed border-white/30 rounded-lg p-8 text-center transition-colors ${uploadSuccess ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[#E100FF]/50'}`}
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
                                            {trackKeyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
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
                                            {moodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
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

                                    {/* Genre Selection */}
                                    <div className="md:col-span-2 relative" ref={genreDropdownRef}>
                                        <label className="text-gray-300 text-sm mb-1 block">Genre</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => !uploadSuccess && setShowGenreDropdown(!showGenreDropdown)}
                                                disabled={uploadSuccess || genresLoading}
                                                className={`${inputClass} text-left flex items-center justify-between`}
                                            >
                                                <span className={formData.genreCategory.length > 0 ? 'text-white' : 'text-gray-400'}>
                                                    {genresLoading ? 'Loading genres...' :
                                                        formData.genreCategory.length > 0
                                                            ? `${formData.genreCategory.length} genre(s) selected`
                                                            : 'Select genres'}
                                                </span>
                                                <svg className={`w-5 h-5 transition-transform ${showGenreDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {showGenreDropdown && !uploadSuccess && (
                                                <div className="absolute z-[100] w-full mt-1 bg-[#1a1f35] border border-white/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                    <div className="p-2 border-b border-white/10 sticky top-0 bg-[#1a1f35] z-[101]">
                                                        <input
                                                            type="text"
                                                            placeholder="Search genres..."
                                                            value={genreSearchQuery}
                                                            onChange={(e) => setGenreSearchQuery(e.target.value)}
                                                            className="w-full bg-[#0f1425] border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E100FF]"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="p-2">
                                                        {filteredGenres.length > 0 ? (
                                                            filteredGenres.map((genre) => {
                                                                const isSelected = formData.genreCategory.includes(genre.id);
                                                                return (
                                                                    <div
                                                                        key={genre.id}
                                                                        onClick={() => handleGenreToggle(genre.id)}
                                                                        className="flex items-center px-3 py-2 hover:bg-white/10 rounded cursor-pointer transition-colors"
                                                                    >
                                                                        <div className="flex items-center justify-center w-5 h-5 mr-3">
                                                                            {isSelected && (
                                                                                <FaCheck className="text-[#E100FF] text-sm" />
                                                                            )}
                                                                        </div>
                                                                        <span className="text-white text-sm">{genre.name}</span>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="px-3 py-4 text-gray-400 text-sm text-center">
                                                                {genreSearchQuery ? 'No genres found' : 'No genres available'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {formData.genreCategory.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {formData.genreCategory.map((genreId) => (
                                                    <span
                                                        key={genreId}
                                                        className="inline-flex items-center px-3 py-1 bg-[#E100FF]/20 text-[#E100FF] rounded-full text-sm"
                                                    >
                                                        {getGenreName(genreId)}
                                                        {!uploadSuccess && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveGenre(genreId)}
                                                                className="ml-2 hover:text-white transition-colors"
                                                            >
                                                                <FaTimes className="text-xs" />
                                                            </button>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
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

                            {/* Pricing Section */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h3 className="text-white font-medium mb-2">Pricing</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Set your base price. Commercial and Exclusive prices are calculated automatically.
                                    Platform fee is {PLATFORM_FEE_PERCENT}% and PayPal processing fee (~3.49% + $0.49) is deducted from your earnings.
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
                                                    <span>PayPal Fee (~3.49% + $0.49)</span>
                                                    <span>-${calculateEarnings(formData.trackPrice).paypalFee.toFixed(2)}</span>
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
                                                    <span>PayPal Fee (~3.49% + $0.49)</span>
                                                    <span>-${calculateEarnings(formData.commercialPrice).paypalFee.toFixed(2)}</span>
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
                                                    <span>PayPal Fee (~3.49% + $0.49)</span>
                                                    <span>-${calculateEarnings(formData.exclusivePrice).paypalFee.toFixed(2)}</span>
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
                                <div className={`p-4 rounded-lg flex items-center space-x-2 ${submitMessage.type === 'success'
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
                                className={`w-full py-3 rounded-lg font-semibold transition-colors ${isButtonDisabled
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
                                    'Connect PayPal to Upload'
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