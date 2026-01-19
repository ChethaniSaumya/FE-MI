'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import toast from '../../../components/Toast'
import { 
  FaPlay, 
  FaPause, 
  FaShoppingCart, 
  FaHeart,
  FaShare,
  FaDownload,
  FaCheck,
  FaMusic,
  FaClock,
  FaKey,
  FaDrum,
  FaUser
} from 'react-icons/fa'
import { MdMusicNote } from 'react-icons/md'

interface Track {
  id: string;
  trackName: string;
  trackImage: string;
  trackFile: string;
  trackPrice: number;
  personalPrice: number;
  commercialPrice: number;
  exclusivePrice: number;
  musician: string;
  musicianProfilePicture: string;
  bpm: number;
  trackKey: string;
  trackType: string;
  moodType: string;
  energyType: string;
  instrument: string;
  about: string;
  genreCategory: string[];
  playCount: number;
  salesCount: number;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    biography: string;
  };
}

interface LicenseType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMultiplier: number;
  rights: {
    commercialUse: boolean;
    monetization: boolean;
    distributionLimit: number;
    creditRequired: boolean;
    exclusive: boolean;
  };
}

const DEFAULT_LICENSES: LicenseType[] = [
  {
    id: 'personal',
    name: 'personal',
    displayName: 'Personal License',
    description: 'For personal, non-commercial use only',
    priceMultiplier: 1,
    rights: { commercialUse: false, monetization: false, distributionLimit: 1, creditRequired: true, exclusive: false }
  },
  {
    id: 'commercial',
    name: 'commercial',
    displayName: 'Commercial License',
    description: 'Full commercial rights, keep 100% royalties',
    priceMultiplier: 2.5,
    rights: { commercialUse: true, monetization: true, distributionLimit: 10000, creditRequired: false, exclusive: false }
  },
  {
    id: 'exclusive',
    name: 'exclusive',
    displayName: 'Exclusive License',
    description: 'Full ownership, track removed from marketplace',
    priceMultiplier: 10,
    rights: { commercialUse: true, monetization: true, distributionLimit: -1, creditRequired: false, exclusive: true }
  }
];

export default function TrackDetail() {
  const params = useParams();
  const router = useRouter();
  const trackId = params.id as string;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState<LicenseType[]>(DEFAULT_LICENSES);
  const [selectedLicense, setSelectedLicense] = useState<string>('personal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false); // NEW: Track if item is in cart

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check if track is already in cart
      checkIfInCart(parsedUser.id);
    }
    
    if (trackId) {
      fetchTrackDetails();
      fetchLicenseTypes();
    }
  }, [trackId]);

  // NEW: Check if track is already in user's cart
  const checkIfInCart = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${userId}`);
      const data = await response.json();
      if (data.success && data.cart?.items) {
        const inCart = data.cart.items.some((item: any) => item.track?.id === trackId);
        setIsInCart(inCart);
      }
    } catch (error) {
      console.error('Error checking cart:', error);
    }
  };

  const fetchTrackDetails = async () => {
    try {
      setLoading(true);
      // Try marketplace endpoint first
      let response = await fetch(`http://localhost:3001/api/marketplace/track/${trackId}`);
      let data = await response.json();

      if (!data.success) {
        // Fallback to regular tracks endpoint
        response = await fetch(`http://localhost:3001/api/tracks`);
        data = await response.json();
        if (data.success) {
          const foundTrack = data.tracks.find((t: any) => t.id === trackId);
          if (foundTrack) {
            setTrack({
              ...foundTrack,
              personalPrice: foundTrack.trackPrice,
              commercialPrice: foundTrack.trackPrice * 2.5,
              exclusivePrice: foundTrack.trackPrice * 10
            });
          }
        }
      } else {
        setTrack(data.track);
        if (data.licenseTypes) setLicenses(data.licenseTypes);
      }
    } catch (error) {
      console.error('Error fetching track:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLicenseTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/license-types');
      const data = await response.json();
      if (data.success && data.licenseTypes?.length > 0) {
        setLicenses(data.licenseTypes);
      }
    } catch (error) {
      console.error('Error fetching license types:', error);
    }
  };

  const getPrice = (licenseName: string): number => {
    if (!track) return 0;
    const basePrice = track.trackPrice || 0;
    
    switch (licenseName) {
      case 'personal':
        return track.personalPrice || basePrice;
      case 'commercial':
        return track.commercialPrice || basePrice * 2.5;
      case 'exclusive':
        return track.exclusivePrice || basePrice * 10;
      default:
        return basePrice;
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !track?.trackFile) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      fetch(`http://localhost:3001/api/tracks/${trackId}/play`, { method: 'POST' }).catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/user/pages/SignIn');
      return;
    }

    // Don't add if already in cart
    if (isInCart) {
      toast.info('This track is already in your cart');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch('http://localhost:3001/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          trackId: track?.id,
          licenseType: selectedLicense
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setIsInCart(true); // Mark as in cart
        toast.success('Added to cart!');
      } else {
        toast.error(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/user/pages/SignIn');
      return;
    }
    
    // Add to cart first (if not already), then go to cart
    if (!isInCart) {
      await handleAddToCart();
    }
    router.push('/user/pages/Cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081028]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E100FF]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-[#081028]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FaMusic className="text-gray-600 text-5xl mb-4" />
          <h2 className="text-white text-xl mb-2">Track Not Found</h2>
          <button onClick={() => router.push('/user/pages/Marketplace')} className="text-[#E100FF] hover:underline">
            Browse Marketplace
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#081028]">
      <Navbar />
      <audio 
        ref={audioRef} 
        src={track.trackFile}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Track Info */}
          <div className="lg:col-span-2">
            {/* Track Header */}
            <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl overflow-hidden border border-[#232B43] mb-6">
              <div className="flex flex-col md:flex-row">
                {/* Cover Image */}
                <div className="md:w-80 aspect-square relative flex-shrink-0">
                  <img 
                    src={track.trackImage || '/default-track.jpg'} 
                    alt={track.trackName}
                    className="w-full h-full object-cover"
                  />
                  {/* Play Button Overlay */}
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#E100FF] flex items-center justify-center">
                      {isPlaying ? <FaPause size={28} className="text-white" /> : <FaPlay size={28} className="text-white ml-2" />}
                    </div>
                  </button>
                </div>

                {/* Track Info */}
                <div className="flex-1 p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{track.trackName}</h1>
                  
                  <div className="flex items-center gap-3 mb-4">
                    {track.musicianProfilePicture && (
                      <img src={track.musicianProfilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="text-gray-400 text-sm">Creator</p>
                      <p className="text-white font-medium">{track.musician}</p>
                    </div>
                  </div>

                  {/* Track Meta */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {track.bpm && (
                      <div className="bg-[#0A1428] rounded-lg p-3">
                        <p className="text-gray-500 text-xs">BPM</p>
                        <p className="text-white font-semibold">{track.bpm}</p>
                      </div>
                    )}
                    {track.trackKey && (
                      <div className="bg-[#0A1428] rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Key</p>
                        <p className="text-white font-semibold">{track.trackKey}</p>
                      </div>
                    )}
                    {track.moodType && (
                      <div className="bg-[#0A1428] rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Mood</p>
                        <p className="text-white font-semibold">{track.moodType}</p>
                      </div>
                    )}
                    {track.trackType && (
                      <div className="bg-[#0A1428] rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Type</p>
                        <p className="text-white font-semibold">{track.trackType}</p>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaPlay size={12} /> {track.playCount || 0} plays
                    </span>
                    <span className="flex items-center gap-1">
                      <FaShoppingCart size={12} /> {track.salesCount || 0} sales
                    </span>
                  </div>
                </div>
              </div>

              {/* Audio Progress Bar */}
              <div className="px-6 pb-6">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm w-12">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E100FF]"
                  />
                  <span className="text-gray-400 text-sm w-12">{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            {track.about && (
              <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43]">
                <h2 className="text-xl font-bold text-white mb-4">About This Track</h2>
                <p className="text-gray-300 leading-relaxed">{track.about}</p>
              </div>
            )}
          </div>

          {/* Right Column - Purchase Options */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43] sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Choose License</h2>

              {/* License Options */}
              <div className="space-y-3 mb-6">
                {licenses.map((license) => {
                  const price = getPrice(license.name);
                  const isSelected = selectedLicense === license.name;
                  
                  return (
                    <button
                      key={license.id}
                      onClick={() => setSelectedLicense(license.name)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-[#E100FF] bg-[#E100FF]/10' 
                          : 'border-[#232B43] hover:border-[#E100FF]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{license.displayName}</span>
                        <span className="text-[#E100FF] font-bold">${price.toFixed(2)}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{license.description}</p>
                      
                      {/* Rights */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <FaCheck className={license.rights?.commercialUse ? 'text-green-400' : 'text-gray-600'} />
                          <span className={license.rights?.commercialUse ? 'text-gray-300' : 'text-gray-500'}>
                            Commercial use
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FaCheck className={license.rights?.monetization ? 'text-green-400' : 'text-gray-600'} />
                          <span className={license.rights?.monetization ? 'text-gray-300' : 'text-gray-500'}>
                            Monetization
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FaCheck className={license.rights?.exclusive ? 'text-green-400' : 'text-gray-600'} />
                          <span className={license.rights?.exclusive ? 'text-gray-300' : 'text-gray-500'}>
                            Exclusive rights
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Total */}
              <div className="border-t border-[#232B43] pt-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-bold text-xl">
                    ${getPrice(selectedLicense).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-[#E100FF] to-[#7C3AED] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || isInCart}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isInCart 
                      ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-not-allowed' 
                      : 'bg-[#232B43] hover:bg-[#232B43]/80 text-white disabled:opacity-50'
                  }`}
                >
                  {isInCart ? (
                    <>
                      <FaCheck />
                      Added to Cart
                    </>
                  ) : addingToCart ? (
                    'Adding...'
                  ) : (
                    <>
                      <FaShoppingCart />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Additional Actions 
              <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[#232B43]">
                <button className="p-3 bg-[#232B43] hover:bg-[#232B43]/80 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <FaHeart />
                </button>
                <button className="p-3 bg-[#232B43] hover:bg-[#232B43]/80 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <FaShare />
                </button>
              </div>*/}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}